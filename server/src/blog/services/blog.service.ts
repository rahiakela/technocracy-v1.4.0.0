import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Blog} from '../model/blog.model';
import {BlogDto} from '../dto/blog.dto';

@Injectable()
export class BlogService {

    constructor(@InjectModel('Blog') private readonly blogModel: Model<Blog>) {}

    async getAllPublishedBlog(page: number): Promise<Blog[]> {
        const pageCount = page > 0 ? page : 0;
        const perPage = 100;

        // query only published blog in publishedOn descending order with pagination
        return await this.blogModel
            .find({})
            .where('status').equals('published')
            .limit(perPage)
            // .skip(perPage * pageCount)
            .sort('-publishedOn')
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: { path: 'user', component: 'User'},
            })
            .populate({
                // populate User instance who commented
                path: 'comments',
                populate: { path: 'commentedBy', component: 'User' },
            })
            .populate({
                // populate Replys instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {
                        // populate user who has replied
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            })
            .exec();
    }

    async getBlog(blogId: string): Promise<Blog> {

        // query only published blog
        return await this.blogModel
            .findById(blogId)
            .where('status')
            .equals('published')
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: { path: 'user', component: 'User' },
            })
            .populate({
                // populate User instance
                path: 'comments',
                populate: { path: 'commentedBy', component: 'User' },
            })
            .populate({
                // populate Replys instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {
                        // populate user who has replied
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            })
            .exec();
    }

    async getBlogListWrittenByAuthor(writtenBy: string): Promise<Blog[]> {
        // query all blog of author based on profile id
        return await this.blogModel
            .find({profile: writtenBy})
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: { path: 'user', component: 'User' },
            })
            .exec();
    }

    async getAllPendingBlogs(): Promise<Blog[]> {
        // query all pending blog
        return await this.blogModel
            .find({})
            .where('status').equals('pending')
            .sort('-createdOn')
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: { path: 'user', component: 'User'},
            })
            .exec();
    }

    async saveBlog(profileId: string, action: string, blogDto: BlogDto): Promise<Blog> {

        // prepare status and date type accordingly to action type
        if (action === 'post') {
            // Create a new pending blog instance and set its properties
            blogDto.status = 'pending';
            blogDto.submittedOn = new Date();
            blogDto.profile = profileId;
        } else {
            // Create a new draft blog instance and set its properties
            blogDto.status = 'draft';
            blogDto.createdOn = new Date();
            blogDto.profile = profileId;
        }

        // Save this blog to MongoDB and populate with profile
        return await new this.blogModel(blogDto)
            .save()
            .populate({
                path: 'profile',
                populate: {
                    path: 'user',
                    component: 'User',
                },
            })
            .exec();
    }

    async modifyBlog(blogId: string, actionType: string): Promise<Blog> {
        const blogDto = new BlogDto();

        // prepare status and date type accordingly to action type
        switch (actionType) {
            case 'pending':
                blogDto.status = 'pending';
                blogDto.updatedOn = new Date();
                break;
            case 'on_hold':
                blogDto.status = 'on_hold';
                blogDto.holdOnDate = new Date();
                break;
            case 'rejected':
                blogDto.status = 'rejected';
                blogDto.rejectedOn = new Date();
                break;
            case 'published':
                blogDto.status = 'published';
                blogDto.publishedOn = new Date();
                break;
        }

        // find and update blog with id and populate with profile
        return await this.blogModel
            .findOneAndUpdate(
                {
                    _id: blogId,    // query criteria
                },
                blogDto,            // data to update
                {
                    new: true,      // options: return updated one
                },
            )
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: { path: 'user', component: 'User' },
            }).
            exec();
    }

    async editBlog(blogId: string, blogDto: BlogDto): Promise<Blog> {
        return await this.blogModel
            .findOneAndUpdate(
                { _id: blogId },    // query criteria
                {                   // data to update
                    title: blogDto.title,
                    content: blogDto.content,
                    tags: blogDto.tags,
                    updatedOn: Date.now(),
                },
                { new: true },   // options: return updated one
            )
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: {
                    path: 'user',
                    component: 'User',
                },
            })
            .exec();
    }

    async deleteBlog(blogId: string): Promise<Blog> {
        return await this.blogModel
            .findOneAndUpdate(
                { _id: blogId },    // query criteria
                { status: 'inactive', inactiveDate: Date.now() }, // update data
                { new: true },   // options: return updated one
            )
            .exec();
    }

    async getTotalBlogStatistics(writtenBy: string): Promise<number> {
        // get count of all blog based on profile id
        return await this.blogModel
            .count({ profile: writtenBy })
            .exec();
    }

    async getTotalPendingBlogStatistics(): Promise<number> {
        // get count of all pending blog
        return await this.blogModel
            .count({ status: 'pending' })
            .exec();
    }

    async saveBlogLike(blogId: string, likedBy: string): Promise<Blog> {
        return await this.blogModel
            .findOneAndUpdate(
                {_id: blogId},    // query criteria
                {$push: {likes: {$each: [likedBy]}}}, // data to update
                {new: true},   // options: return updated one
            )
            .populate({
                // populate profile instance with user
                path: 'profile',
                populate: { path: 'user', component: 'User' },
            })
            .populate({
                // populate User instance
                path: 'comments',
                populate: { path: 'commentedBy', component: 'User' },
            })
            .populate({
                // populate Replys instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {
                        // populate user who has replied
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            });
    }

    async searchBlog(term: string, limit: number): Promise<Blog[]> {
        // query only published blog in publishedOn descending order with pagination
        return await this.blogModel
            .find({ $text: { $search: term } })
            .where('status')
            .equals('published')
            .limit(limit)
            .skip(0)
            .sort('-publishedOn')
            .populate({
                // populate profile instance with profile
                path: 'profile',
                populate: {
                    path: 'user',
                    component: 'User',
                },
            })
            .populate({
                // populate comment list instance
                path: 'comments',
                populate: {
                    // populate User instance
                    path: 'commentedBy',
                    component: 'User',
                },
            })
            .populate({
                path: 'comments',
                populate: {
                    // populate Replys instance
                    path: 'replies',
                    component: 'Reply',
                    populate: {
                        // populate user who has reply
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            })
            .exec();
    }

    async updateBlogWithCommentId(blogId: string, commentId: string): Promise<Blog> {
        return await this.blogModel
            .findOneAndUpdate(
                {_id: blogId},
                {$push: {comments: {$each: commentId}}},
                {new: true},
            )
            .populate('profile')  // load profile instance
            .populate({           // populate User instance
                path: 'comments',
                populate: { path: 'commentedBy', component: 'User' },
            })
            .populate({           // populate Reply instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {   // populate user who has replied
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            });
    }
}
