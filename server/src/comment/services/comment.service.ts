import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Comment} from '../model/comment.model';
import {Reply} from '../model/reply.model';
import {CommentDto} from '../dto/comment.dto';
import {ReplyDto} from '../dto/reply.dto';

@Injectable()
export class CommentService {

    constructor(@InjectModel('Comment') private readonly commentModel: Model<Comment>,
                @InjectModel('Reply') private readonly replyModel: Model<Reply>) {}

    async getCommentById(commentId: string): Promise<Comment> {
        return await this.commentModel
            .findById(commentId)
            .populate('commentedBy') // populate User instance who has commented
            .populate({
                // populate Replys instance
                path: 'replies',
                component: 'Reply',
                populate: {
                    // populate user who has replied
                    path: 'repliedBy',
                    component: 'User',
                },
            })
            .exec();
    }

    async saveComment(userId: string, cmtDto: CommentDto): Promise<Comment> {
        // Create a new comment instance and set its properties
        const commentDto = {
            content: cmtDto.content,
            commentedBy: userId,
            notification: cmtDto.notification,
        };

        // Save this comment to MongoDB and populate with user
        return await new this.commentModel(commentDto)
            .save()
            .populate('commentedBy')
            .exec();
    }

    async updateComment(actionId: string, contentToUpdate: string): Promise<Comment> {
        return await this.commentModel
            .findOneAndUpdate(
                {_id: actionId},
                {content: contentToUpdate},
                {new: true},
            )
            .populate('commentedBy'); // populate User instance who has commented
    }

    async updateReply(actionId: string, contentToUpdate: string): Promise<Reply> {
        return await this.replyModel
            .findOneAndUpdate(
                {_id: actionId},
                {content: contentToUpdate},
                {new: true},
            )
            .populate('repliedBy'); // populate User instance who has replied
    }

    async deleteComment(commentId: string): Promise<any> {
        return await this.commentModel
            .find({_id: commentId})
            .remove()
            .then((data) => {
                return Promise.resolve({isDeleted: data.ok});
            })
            .catch(err => Promise.reject(err));
    }

    async getReplyById(replyId: string): Promise<Reply> {
        return await this.replyModel
            .findById(replyId)
            .populate('repliedBy') // populate User instance who has replied
            .exec();
    }

    async saveReply(repDto: ReplyDto): Promise<Comment> {
        // Create a new reply and set its properties
        const replyDto = {
            content: repDto.content,
            repliedBy: repDto.repliedBy,
        };
        // Save this reply to MongoDB
        return await new this.replyModel(replyDto)
            .save();
    }

    async updateCommentWithReplyId(commentId: string, replyId: string): Promise<Comment> {
        return await this.commentModel
            .findOneAndUpdate(
                {_id: commentId},
                {$push: {replies: {$each: replyId}}},
                {new: true},
            )
            .populate('commentedBy')    // populate User instance who has commented
            .populate({                 // populate Replys instance
                path: 'replies',
                component: 'Reply',
                populate: {             // populate user who has replied
                    path: 'repliedBy',
                    component: 'User',
                },
            });
    }

    async deleteReply(replyId: string): Promise<any> {
        return await this.replyModel
            .find({_id: replyId})
            .remove()
            .then((data) => {
                return Promise.resolve({isDeleted: data.ok});
            })
            .catch(err => Promise.reject(err));
    }

    async updateCommentWithLikeId(commentId: string, likedBy: string): Promise<Comment> {
        return await this.commentModel
            .findOneAndUpdate(
                {_id: commentId},
                {$push: {likes: {$each: [likedBy]}}},
                {new: true},
            )
            .populate('commentedBy')    // populate User instance
            .populate({         // populate Reply instance
                path: 'replies',
                component: 'Reply',
                populate: {     // populate user who has replied
                    path: 'repliedBy',
                    component: 'User',
                },
            });
    }

    async updateReplyWithLikeId(replyId: string, likedBy: string): Promise<Comment> {
        return await this.replyModel
            .findOneAndUpdate(
                {_id: replyId},
                {$push: {likes: {$each: [likedBy]}}},
                {new: true },
            )
            .populate('repliedBy'); // populate User instance who has replied
    }
}
