import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {CustomLogger} from '../../config/log/custom-logger';
import {UserService} from '../../auth/services/user.service';
import {MailService} from '../../config/mail/mail.service';
import {CommentService} from '../services/comment.service';
import {BlogService} from '../../blog/services/blog.service';
import {QuestionService} from '../../question/services/question.service';
import {MailType} from '../../config/mail/mail-type';
import {Blog} from '../../blog/model/blog.model';
import {Question} from '../../question/model/question.model';
import {Comment} from '../model/comment.model';
import {Reply} from '../model/reply.model';
import {CommentDto} from '../dto/comment.dto';
import {CommentReplyDto} from '../dto/comment-reply.dto';
import {ReplyDto} from '../dto/reply.dto';

/**
 * @class CommentController: Define blog or question's comment and its reply related operation like fetching/saving/updating comment and reply and its like related operation etc.
 */
@Controller('api/comment')
export class CommentController {

    constructor(private readonly commentService: CommentService,
                private readonly blogService: BlogService,
                private readonly questionService: QuestionService,
                private readonly userService: UserService,
                private readonly mailService: MailService,
                private logger: CustomLogger) {

    }

    /**
     * Save blog's comment against user id and blog id and send comment mail notification to the users who accept comment mail notification.
     * @response: return json of updated blog with newly added comment
     */
    @UseGuards(AuthGuard())
    @Post('blog/:blogId/:commentedBy')
    async saveBlogComment(@Param('blogId') blogId: string, @Param('commentedBy') commentedBy: string, @Body() contentDto: CommentDto): Promise<Blog> {
        if (blogId === undefined || commentedBy === undefined || contentDto.content === undefined) {
            throw new BadRequestException(`Fields[blogId, commentedBy, content] must be required to save blog comment.`);
        }

        const mailOptions = new Map<string, any>();

        // load user instance from database
        return await this.userService.findUserById(commentedBy)
            .then((user: any) => {
                mailOptions.set('user', user);
                // Save this comment to MongoDB
                return this.commentService.saveComment(commentedBy, contentDto)
                    .then((savedComment: any) => {
                        mailOptions.set('comment', savedComment);
                        // update Blog with comment id
                        return this.blogService.updateBlogWithCommentId(blogId, savedComment._id)
                            .then((updatedBlog: any) => {
                                mailOptions.set('blog', updatedBlog);
                                // send comment mail notification to the users who accept comment mail notification
                                const recipientSet = new Set(); // we used set for uniqueness so that notification should be sent only once
                                updatedBlog.comments.forEach(comment => {
                                    // filter the user who has accepted to mail notification
                                    if (comment.notification) {
                                        // don't send this notification to the user who is commenting
                                        if (comment.commentedBy._id.toString() !== mailOptions.get('user')._id.toString()) {
                                            // adding recipient to set for uniqueness so that the mail notification should be sent to every user only one time
                                            recipientSet.add(comment.commentedBy);
                                        }
                                    }
                                });
                                // now send mail notification to every user
                                recipientSet.forEach(recipient => {
                                    this.mailService.sendMail(MailType.BLOG_COMMENT, mailOptions.set('recipient', recipient));
                                });
                                // returns updated blog with comment list
                                return Promise.resolve(updatedBlog);
                            })
                            .catch(err => Promise.reject(err));
                    })
                    .catch(err => Promise.reject(err));
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Save question's comment against user id and question id and send comment mail notification to the users who accept comment mail notification.
     * @response: return json of updated question with newly added comment
     */
    @UseGuards(AuthGuard())
    @Post('question/:questionId/:commentedBy')
    async saveQuestionComment(@Param('questionId') questionId: string, @Param('commentedBy') commentedBy: string, @Body() contentDto: CommentDto): Promise<Question> {
        if (questionId === undefined || commentedBy === undefined || contentDto.content === undefined) {
            throw new BadRequestException(`Fields[questionId, commentedBy, content] must be required to save question comment.`);
        }

        const mailOptions = new Map<string, any>();

        // load user instance from database
        return await this.userService.findUserById(commentedBy)
            .then((user: any) => {
                mailOptions.set('user', user);
                // Save this comment to MongoDB
                return this.commentService.saveComment(commentedBy, contentDto)
                    .then((savedComment: any) => {
                        mailOptions.set('comment', savedComment);
                        // update question with comment id
                        return this.questionService.updateQuestionWithCommentId(questionId, savedComment._id)
                            .then((updatedQuestion: any) => {
                                mailOptions.set('question', updatedQuestion);
                                const recipientSet = new Set();
                                updatedQuestion.comments.forEach(comment => {
                                    // filter the user who has accepted to mail notification
                                    if (comment.notification) {
                                        // don't send this notification to the user who is commenting
                                        if (comment.commentedBy != null && comment.commentedBy._id.toString() !== mailOptions.get('user')._id.toString()) {
                                            // adding recipient to set for uniqueness so that the mail notification should be sent to every user only one time
                                            recipientSet.add(comment.commentedBy);
                                        }
                                    }
                                });
                                // now send mail notification to every user
                                recipientSet.forEach(recipient => {
                                    this.mailService.sendMail(MailType.QUESTION_COMMENT, mailOptions.set('recipient', recipient));
                                });
                                // returns updated question with comment list
                                return Promise.resolve(null);
                            })
                            .catch(err => Promise.reject(err));
                    })
                    .catch(err => Promise.reject(err));
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Edit comment and reply against comment id, reply id and action type.
     * @response: return json of updated comment or reply
     */
    @UseGuards(AuthGuard())
    @Put(':actionId')
    async editCommentAndReply(@Param('actionId') actionId: string, @Body() cmtRepDto: CommentReplyDto): Promise<any> {
        if (actionId === undefined || cmtRepDto.content === undefined || cmtRepDto.actionType === undefined) {
            throw new BadRequestException(`Fields[actionId, content, actionType] must be required to save comment and reply.`);
        }

        // update comment and reply based on action type
        if (cmtRepDto.actionType === 'comment') {
            return await this.commentService.updateComment(actionId, cmtRepDto.content);
        }
        if (cmtRepDto.actionType === 'reply') {
            return await this.commentService.updateReply(actionId, cmtRepDto.content);
        }
    }

    /**
     * Delete comment instance against comment id.
     * @response: return json of isDeleted boolean
     */
    @UseGuards(AuthGuard())
    @Delete(':commentId')
    async deleteComment(@Param('commentId') commentId: string): Promise<any> {
        if (commentId === undefined) {
            throw new BadRequestException(`Fields[commentId] must be required to delete comment.`);
        }
        // delete comment from database
        return await this.commentService.deleteComment(commentId);
    }

    /**
     * Save comment's reply against user id and comment id for blog or question and send mail notification to the users who replied to the comment.
     */
    @UseGuards(AuthGuard())
    @Post('reply')
    async saveReply(@Body() replyDto: ReplyDto): Promise<Comment> {
        if (replyDto.replyType === undefined || replyDto.repliedId === undefined || replyDto.commentId === undefined || replyDto.repliedBy === undefined || replyDto.content === undefined) {
            throw new BadRequestException(`Fields[replyType, repliedId, repliedId, comment id and reply content] must be required to save reply.`);
        }

        const mailOptions = new Map<string, any>();
        return await this.commentService.saveReply(replyDto)
            .then((reply: any) => {
                mailOptions.set('reply', reply);
                return reply._id;
            })
            .then(repliedId => {
                return this.commentService.updateCommentWithReplyId(replyDto.commentId, repliedId);
            })
            .then((updatedComment: any) => {
                mailOptions.set('comment', updatedComment);
                // send comment's reply mail notification to the users who accept comment mail notification
                replyDto.replyType === 'blog' ? this.sendBlogCommentNotification(replyDto.repliedId, replyDto.repliedBy, mailOptions) : this.sendQuestionCommentNotification(replyDto.repliedId, mailOptions);
                return Promise.resolve(updatedComment);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Delete comment's reply instance against reply id.
     * @response: return json of isDeleted boolean
     */
    @UseGuards(AuthGuard())
    @Delete('reply/:replyId')
    async deleteReply(@Param('replyId') replyId: string): Promise<any> {
        if (replyId === undefined) {
            throw new BadRequestException(`Fields[replyId] must be required to delete reply.`);
        }
        // delete reply from database
        return await this.commentService.deleteReply(replyId);
    }

    /**
     * Save comment's like against user id and comment id.
     * @param(commentId): comment id for which need to save the like
     * @param(likedBy): user id who has liked
     * @response: return json of updated comment with newly added likes
     */
    @UseGuards(AuthGuard())
    @Get('like/:commentId/:likedBy')
    async saveCommentLike(@Param('commentId') commentId: string, @Param('likedBy') likedBy: string): Promise<Comment> {
        if (likedBy === undefined || commentId === undefined) {
            throw new BadRequestException(`Fields[likedBy, commentId] must be required to save comment's like.`);
        }

        // check if the user liked this comment earlier or not
        return await this.commentService.getCommentById(commentId)
            .then((comment: any) => {
                const savedLikedByUser = comment.likes.filter(like => like === likedBy);
                // if user does not like this comment then update database otherwise not
                if (savedLikedByUser.length === 0) {
                    return this.commentService.updateCommentWithLikeId(commentId, likedBy);
                } else {
                   return Promise.resolve(comment);
                }
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Save reply's like against user id and reply id.
     * @param(replyId): reply id for which need to save the like
     * @param(likedBy): user id who has liked
     * @response: return json of updated reply with newly added likes
     */
    @UseGuards(AuthGuard())
    @Get('reply/:replyId/like/:likedBy')
    async saveReplyLike(@Param('replyId') replyId: string, @Param('likedBy') likedBy: string): Promise<Reply> {
        if (likedBy === undefined || replyId === undefined) {
            throw new BadRequestException(`Fields[likedBy, replyId] must be required to save reply's like.`);
        }

        // check if the user liked this blog earlier or not
        return await this.commentService.getReplyById(replyId)
            .then((reply: any) => {
                const savedLikedBy = reply.likes.filter(like => like === likedBy);
                // if user does not like this blog then update database otherwise not
                if (savedLikedBy.length === 0) {
                    return this.commentService.updateReplyWithLikeId(replyId, likedBy);
                } else {
                    return Promise.resolve(reply);
                }
            })
            .catch(err => Promise.reject(err));
    }

    private async sendBlogCommentNotification(blogId: string, repliedBy: string, mailOptions: Map<string, any>) {
        this.userService.findUserById(repliedBy)
            .then(user => {
               return mailOptions.set('user', user);
            })
            .then(mailOption => {
                return this.blogService.getBlog(blogId);
            })
            .then((blog: any) => {
                mailOptions.set('blog', blog);
                const recipientSet = new Set();
                blog.comments.forEach(comment => {
                    // filter the user who has accepted to mail notification
                    if (comment.notification) {
                        // don't send this notification to the user who is commenting
                        if (comment.commentedBy._id.toString() !== mailOptions.get('user')._id.toString()) {
                            // adding recipient to set for uniqueness so that the mail notification should be sent to every user only one time
                            recipientSet.add(comment.commentedBy);
                        }
                    }
                });
                // now send mail notification to every user
                recipientSet.forEach(recipient => {
                    this.mailService.sendMail(MailType.BLOG_COMMENT, mailOptions.set('recipient', recipient));
                });
            })
            .catch(err => this.logger.log(`Error has occurred while sending blog's comment notification: \n${err}`));
    }

    private async sendQuestionCommentNotification(questionId: string, mailOptions: Map<string, any>) {
        this.questionService.getQuestion(questionId)
            .then((question: any) => {
                mailOptions.set('question', question);
                const recipientSet = new Set();
                question.comments.forEach(comment => {
                    // filter the user who has accepted to mail notification
                    if (comment.notification) {
                        // don't send this notification to the user who is commenting
                        if (comment.commentedBy != null && comment.commentedBy._id.toString() !== mailOptions.get('user')._id.toString()) {
                            // adding recipient to set for uniqueness so that the mail notification should be sent to every user only one time
                            recipientSet.add(comment.commentedBy);
                        }
                    }
                });
                // now send mail notification to every user
                recipientSet.forEach(recipient => {
                    this.mailService.sendMail(MailType.QUESTION_COMMENT, mailOptions.set('recipient', recipient));
                });
            })
            .catch(err => this.logger.log(`Error has occurred while sending question's comment notification: \\n${err}`));
    }
}
