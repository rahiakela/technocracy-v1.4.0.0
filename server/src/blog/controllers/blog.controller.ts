import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {Blog} from '../model/blog.model';
import {BlogDto} from '../dto/blog.dto';
import {BlogService} from '../services/blog.service';
import {UserService} from '../../auth/services/user.service';
import {MailService} from '../../config/mail/mail.service';
import {MailType} from '../../config/mail/mail-type';
import {BlogIdParam} from '../dto/blog-id-param';
import {ProfileIdParam} from '../dto/profile-id-param';
import {ActionParam} from '../dto/action-param';
import {UserIdParam} from '../dto/user-id-param';

// load classifier and model
import * as BayesClassifier from 'bayes-classifier';
import {UtilsService} from '../../utils/utils.service';
import {ENV} from '../../config/environment-variables';
const classifierModel = '../../../blog-classifier-model.json';

/**
 * @class BlogController: Define blog related operation like fetching/saving/updating blog and blog related statistics etc.
 */
@Controller('api/blog')
export class BlogController {

    constructor(private readonly blogService: BlogService,
                private readonly userService: UserService,
                private readonly mailService: MailService,
                private readonly utilService: UtilsService) {}

    /**
     * Get the list of published blog.
     * @response: return json Blog[] array
     */
    @Get()
    async getAllPublishedBlog(@Query() query): Promise<Blog[]> {
        return await this.blogService.getAllPublishedBlog(query.page);
    }

    /**
     * Get a published blog using blog id.
     * @response: return json Blog object
     */
    @Get(':blogId')
    async getBlog(@Param('blogId') blogId: string): Promise<Blog> {
        if (blogId === undefined) {
            throw new BadRequestException(`Fields[blogId] must be required to fetch a blog.`);
        }
        return await this.blogService.getBlog(blogId);
    }

    /**
     * Get all blog written by author using profile id.
     * @response: return json Blog[] array
     */
    @Get('all/:writtenBy')
    @UseGuards(AuthGuard())
    async getBlogListWrittenByAuthor(@Param('writtenBy') profileParam: ProfileIdParam): Promise<Blog[]> {
        if (profileParam.writtenBy === undefined) {
            throw new BadRequestException(`Fields[writtenBy] must be required to fetch a blog.`);
        }
        return await this.blogService.getBlogListWrittenByAuthor(profileParam.writtenBy);
    }

    /**
     * Get all pending blog for review and approval by Admin.
     * @response: return json Blog[] array
     */
    @Get('all/pending/list')
    @UseGuards(AuthGuard())
    async getAllPendingBlogs(): Promise<Blog[]> {
        return await this.blogService.getAllPendingBlogs();
    }

    /**
     * Save blog against profile id and action type.
     * @response: return json of new saved blog object
     */
    @Post(':writtenBy/:actionType')
    @UseGuards(AuthGuard())
    async saveBlog(@Param('profileId') profileParam: ProfileIdParam, @Param('actionType') actionParam: ActionParam, @Body() blogDto: BlogDto): Promise<Blog> {
        if (profileParam.writtenBy === undefined || actionParam.actionType === undefined || blogDto.title === undefined || blogDto.content === undefined) {
            throw new BadRequestException(`Fields[profileId,actionType,blogDto.title,blogDto.content] must be required to save a blog.`);
        }

        const mailOptions = new Map<string, any>();

        // save the blog then send mail notification to editors
        return await this.blogService.saveBlog(profileParam.writtenBy, actionParam.actionType, blogDto)
            .then(savedBlog => {
                // don't send mail if the blog is saved just as draft
                if (actionParam.actionType === 'post') {
                    mailOptions.set('blog', savedBlog);
                    // send new blog post mail notification to editors
                    this.mailService.sendMail(MailType.POST_BLOG, mailOptions.set('recipient', ENV.ADMIN_MAIL_ID));
                }
                return Promise.resolve(savedBlog);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Modify blog status against blog id and action.
     * @response: return json of updated Blog object
     */
    @Put(':blogId/:actionType')
    @UseGuards(AuthGuard())
    async modifyBlog(@Param('blogId') blogParam: BlogIdParam, @Param('actionType') actionParam: ActionParam): Promise<Blog> {
        if (blogParam.blogId === undefined || actionParam.actionType === undefined) {
            throw new BadRequestException(`Fields[blogId,actionType] must be required to save a blog.`);
        }

        const mailOptions = new Map<string, any>();

        // update the blog then send mail notification
        return await this.blogService.modifyBlog(blogParam.blogId, actionParam.actionType)
           .then((updatedBlog: any) => {
               mailOptions.set('blog', updatedBlog);
               // send blog mail notification to user/subscriber according to action type
               switch (actionParam.actionType) {
                   case 'published':
                       // get filtered users who has subscribed to mail notification
                       this.userService.fetchAllUsers()
                           .then(users => {
                               users.forEach((user: any) => {
                                   if (user._id.toString() !== updatedBlog.toString()) {
                                       // don't send this notification to the profile who has written this blog
                                       this.mailService.sendMail(MailType.PUBLISHED_BLOG, mailOptions.set('recipient', this.utilService.getUserEmail(user)));
                                   }
                               });
                           })
                           .catch(err => Promise.reject(err));
                       // send blog published mail notification to all subscribers
                       this.userService.fetchSubscribedUsers()
                           .then(subscriptions => {
                               subscriptions.forEach(sub => {
                                   this.mailService.sendMail(MailType.PUBLISHED_BLOG, mailOptions.set('recipient', sub.email));
                               });
                           })
                           .catch(err => Promise.reject(err));
                       break;
                   case 'pending':
                       // send new blog post mail notification to editors
                       this.mailService.sendMail(MailType.POST_BLOG, mailOptions.set('recipient', process.env.ADMIN_MAIL_ID));
                       break;
                   case 'on_hold':
                       // send blog on hold mail notification to author
                       this.mailService.sendMail(MailType.ON_HOLD_BLOG, mailOptions.set('recipient', updatedBlog.profile.user));
                       break;
                   case 'rejected':
                       // send blog reject mail notification to author
                       this.mailService.sendMail(MailType.REJECTED_BLOG, mailOptions.set('recipient', updatedBlog.profile.user));
                       break;
               }
               return Promise.resolve(updatedBlog);
           })
           .catch(err => Promise.reject(err));
    }

    /**
     * Edit or Update blog against blog id with latest technologies content.
     * @response: return json of updated blog object
     */
    @Put(':blogId')
    @UseGuards(AuthGuard())
    async editBlog(@Param('blogId') blogParam: BlogIdParam, @Body() blogDto: BlogDto): Promise<Blog> {
        if (blogParam.blogId === undefined || blogDto.title === undefined || blogDto.content === undefined) {
            throw new BadRequestException(`Fields[blogId,blogDto.title,blogDto.content] must be required to edit a blog.`);
        }
        return await this.blogService.editBlog(blogParam.blogId, blogDto);
    }

    /**
     * Delete blog against blog id and make status 'inactive'.
     * @response: return json of deleted blog object
     */
    @Delete(':blogId')
    @UseGuards(AuthGuard())
    async deleteBlog(@Param('blogId') blogParam: BlogIdParam): Promise<Blog> {
        if (blogParam.blogId === undefined) {
            throw new BadRequestException(`Fields[blogId] must be required to delete a blog.`);
        }
        return await this.blogService.deleteBlog(blogParam.blogId);
    }

    /**
     * Get total blog written by author against profile id for statistics.
     * @response: return json of total blog count
     */
    @Get('statistics/:writtenBy')
    @UseGuards(AuthGuard())
    async getTotalBlogStatistics(@Param('writtenBy') profileParam: ProfileIdParam): Promise<number> {
        if (profileParam.writtenBy === undefined) {
            throw new BadRequestException(`Fields[writtenBy] must be required to get blog statistics.`);
        }
        return await this.blogService.getTotalBlogStatistics(profileParam.writtenBy);
    }

    /**
     * Get total pending blog statistics for admin approval.
     * @response: return json of total pending blog count
     */
    @Get('statistics/all/pending')
    @UseGuards(AuthGuard())
    async getTotalPendingBlogStatistics(): Promise<number> {
        return await this.blogService.getTotalPendingBlogStatistics();
    }

    /**
     * Save blog's like against user id and blog id.
     * @response: return json blog object
     */
    @Get(':blogId/like/:likedBy')
    @UseGuards(AuthGuard())
    async saveBlogLike(@Param('blogId') blogParam: BlogIdParam, @Param('likedBy') userParam: UserIdParam): Promise<Blog> {
        if (blogParam.blogId === undefined || userParam.likedBy === undefined) {
            throw new BadRequestException(`Fields[blogId,likedBy] must be required to save a blog's like.`);
        }
        // load blog and then save like if the user does not like this blog already
        return await this.blogService
            .getBlog(blogParam.blogId)
            .then((blog: any) => {
                const savedLikedByUser = blog.likes.filter(like => like === userParam.likedBy);
                // if user does not like this blog then update user's like otherwise not
                if (savedLikedByUser.length === 0) {
                  return this.blogService.saveBlogLike(blogParam.blogId, userParam.likedBy);
                } else {
                    return Promise.resolve(blog);
                }
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Search blog against query term.
     * @response: return json blog array
     */
    @Get('search/:query')
    async searchBlog(@Param('query') query): Promise<Blog[]> {
        if (query === undefined) {
            throw new BadRequestException(`Fields[query] must be required to search blog.`);
        }
        // query blog against query term and search limit
        return await this.blogService.searchBlog(query, 100);
    }

    /**
     * Get related blog after classifying it using machine learning model by passing blog title and then query the classified term.
     * @response: return json blog array
     */
    @Get('predict/:terms')
    async getRelatedBlog(@Param('terms') terms: string): Promise<Blog[]> {
        if (terms === undefined) {
            throw new BadRequestException(`Fields[terms] must be required to predict blog.`);
        }

        // restore classifier from model
        const blogClassifier = new BayesClassifier();
        const storedClassifier = require(classifierModel);
        blogClassifier.restore(storedClassifier);

        // predict the term by calling classify method of classifier
        const predictedTerm = blogClassifier.classify(terms);

        // query related blog using predicted term
        return await this.blogService.searchBlog(predictedTerm, 20);
    }
}
