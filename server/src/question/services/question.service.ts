import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Question} from '../model/question.model';
import {QuestionDto} from '../dto/question.dto';

@Injectable()
export class QuestionService {

    constructor(@InjectModel('Question') private readonly questionModel: Model<Question>) {}

    async getAllPublishedQuestion(page: number): Promise<Question[]> {
        const pageCount = page > 0 ? page : 0;
        const perPage = 100;

        // query only published question in publishedOn descending order with pagination
        return await this.questionModel
            .find({})
            .where('status').equals('published')
            .limit(perPage)
            .skip(perPage * pageCount)
            .sort('-publishedOn')
            .populate('askedBy')   // populate user instance
            .populate({            // populate User instance who commented
                path: 'comments',
                populate: {
                    path: 'commentedBy',
                    component: 'User',
                },
            })
            .populate({          // populate Replys instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {               // populate user who has reply
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            })
            .exec();
    }

    async getQuestion(questionId: string): Promise<Question> {
        // query only published question
        return await this.questionModel
            .findById(questionId)
            .where('status').equals('published')
            .populate('askedBy')   // load user instance
            .populate({            // populate User instance who commented
                path: 'comments',
                populate: {
                    path: 'commentedBy',
                    component: 'User',
                },
            })
            .populate({                  // populate Replys instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {            // populate user who has reply
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            })
            .exec();
    }

    async getQuestionListAskedByUser(askedBy: string): Promise<Question[]> {
        // query all questions based on user who asked
        return await this.questionModel
            .find({askedBy})
            .populate('askedBy') // populate user instance
            .exec();
    }

    async getAllPendingQuestions(): Promise<Question[]> {
        // query all pending question
        return await this.questionModel
            .find({status: 'pending'})
            .sort('-createdOn')
            .populate('askedBy')    // populate user instance
            .exec();
    }

    async saveQuestion(askedBy: string, action: string, qDto: QuestionDto): Promise<Question> {
        let questionDto = {};
        // prepare status and date type accordingly to action type
        if (action === 'post') {
            // Create a new pending question instance and set its properties
            questionDto = {
                title: qDto.title,
                content: qDto.content,
                tags: qDto.tags,
                status: 'pending',
                submittedOn: new Date(),
                askedBy,
            };
        } else {
            // Create a new draft question instance and set its properties
            questionDto = {
                title: qDto.title,
                content: qDto.content,
                tags: qDto.tags,
                status: 'draft',
                createdOn: new Date(),
                askedBy,
            };
        }
        // Save this question to MongoDB and populate with user
        return await new this.questionModel(questionDto)
            .save()
            .populate('askedBy')
            .exec();

    }

    async modifyQuestion(questionId: string, action: string): Promise<Question> {
        let questionDto = {};
        // prepare status and date type accordingly to action type
        switch (action) {
            case 'pending':
                questionDto = {status: 'pending', updatedOn: new Date()};
                break;
            case 'on_hold':
                questionDto = {status: 'on_hold', holdOnDate: new Date()};
                break;
            case 'rejected':
                questionDto = {status: 'rejected', rejectedOn: new Date()};
                break;
            case 'published':
                questionDto = {status: 'published', publishedOn: new Date()};
                break;
        }

        // find and update question with id and populate with user who asked it
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId},       // query criteria
                questionDto,             // data to update
                {new: true},             // options: return updated one
            )
            .populate('askedBy')
            .exec();
    }

    async editQuestion(questionId: string, questionDto: QuestionDto): Promise<Question> {
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId},   // query criteria
                {                    // data to update
                    title: questionDto.title,
                    content: questionDto.content,
                    tags: questionDto.tags,
                    status: 'pending',
                    updatedOn: new Date()},
                { new: true},  // options: return updated one
            )
            .populate('askedBy')
            .exec();
    }

    async deleteQuestion(questionId: string): Promise<Question> {
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId},  // query criteria
                {                   // update data
                    status: 'inactive',
                    inactiveDate: new Date()},
                { new: true },   // options: return updated one
            );
    }

    async getPublishedQuestionStatistics(askedBy: string): Promise<any> {
        // get count of all question based on user id
        return await this.questionModel
            .count({askedBy})
            .exec();
    }

    async getPendingQuestionStatistics(): Promise<any> {
        // get count of all pending question
        return await this.questionModel
            .count({status: 'pending'})
            .exec();
    }

    async saveLike(questionId: string, likedBy: string): Promise<Question> {
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId}, // query criteria
                {$push: {likes: {$each: [likedBy]}}}, // data to update
                {new: true},       // options: return updated one
            )
            .populate('askedBy')   // load user instance
            .populate({            // populate User instance who commented
                path: 'comments',
                populate: {
                    path: 'commentedBy',
                    component: 'User',
                },
            })
            .populate({                   // populate replies instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {            // populate user who has reply
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            });
    }

    async saveVoteUp(questionId: string, votedBy: string): Promise<Question> {
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId},                      // query criteria
                {$push: {voteUp: {$each: [votedBy]}}},  // data to update
                {new: true},                            // options: return updated one
            )
            .populate('askedBy')   // load user instance
            .populate({            // populate User instance who commented
                path: 'comments',
                populate: {
                    path: 'commentedBy',
                    component: 'User',
                },
            })
            .populate({                   // populate replies instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {            // populate user who has reply
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            });
    }

    async saveVoteDown(questionId: string, votedBy: string): Promise<Question> {
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId},                      // query criteria
                {$push: {voteDown: {$each: [votedBy]}}},  // data to update
                {new: true},                            // options: return updated one
            )
            .populate('askedBy')   // load user instance
            .populate({            // populate User instance who commented
                path: 'comments',
                populate: {
                    path: 'commentedBy',
                    component: 'User',
                },
            })
            .populate({                   // populate replies instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {            // populate user who has reply
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            });
    }

    async updateQuestionWithCommentId(questionId: string, commentId: string): Promise<Question> {
        return await this.questionModel
            .findOneAndUpdate(
                {_id: questionId},
                {$push: {comments: {$each: commentId}}},
                {new: true},
            )
            .populate('askedBy')    // load user instance
            .populate({             // populate User instance
                path: 'comments',
                populate: { path: 'commentedBy', component: 'User' },
            })
            .populate({             // populate Reply instance
                path: 'comments',
                populate: {
                    path: 'replies',
                    component: 'Reply',
                    populate: {     // populate user who has replied
                        path: 'repliedBy',
                        component: 'User',
                    },
                },
            });
    }
}
