import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UserService} from '../../auth/services/user.service';
import {MailService} from '../../config/mail/mail.service';
import {UtilsService} from '../../utils/utils.service';
import {QuestionService} from '../services/question.service';
import {Question} from '../model/question.model';
import {QuestionDto} from '../dto/question.dto';
import {MailType} from '../../config/mail/mail-type';
import {ENV} from '../../config/environment-variables';

/**
 * @class QuestionController: Define question related operation like fetching/saving/updating question and question related statistics etc.
 */
@Controller('api/question')
export class QuestionController {

    constructor(private readonly questionService: QuestionService,
                private readonly userService: UserService,
                private readonly mailService: MailService,
                private readonly utilService: UtilsService) {}
    /**
     * Get the list of published question.
     * @response: return json Question[] array
     */
    @Get()
    async getAllPublishedQuestion(@Query() query): Promise<Question[]> {
       return await this.questionService.getAllPublishedQuestion(query.page);
    }

    /**
     * Get a published question using question id.
     * @response: return json question object
     */
    @Get(':questionId')
    async getQuestion(@Param('questionId') questionId: string): Promise<Question> {
        if (questionId === undefined) {
            throw new BadRequestException(`Fields[questionId] must be required to fetch a question.`);
        }
        return await this.questionService.getQuestion(questionId);
    }

    /**
     * Get all questions asked by user using user id.
     * @response: return json question[] array
     */
    @Get('all/:askedBy')
    @UseGuards(AuthGuard())
    async getQuestionListAskedByUser(@Param('askedBy') askedBy: string): Promise<Question[]> {
        if (askedBy === undefined) {
            throw new BadRequestException(`Fields[askedBy] must be required to fetch question list.`);
        }
        return await this.questionService.getQuestionListAskedByUser(askedBy);
    }

    /**
     * Get all pending questions for review and approval by Admin.
     * @response: return json question[] array
     */
    @Get('all/pending/list')
    @UseGuards(AuthGuard())
    async getAllPendingQuestions(): Promise<Question[]> {
        return await this.questionService.getAllPendingQuestions();
    }

    /**
     * Save question against user id and action type.
     * @response: return json of new saved question object
     */
    @Post(':askedBy/:actionType')
    @UseGuards(AuthGuard())
    async saveQuestion(@Param('askedBy') askedBy: string, @Param('actionType') actionType: string, @Body() questionDto: QuestionDto): Promise<Question> {
        if (askedBy === undefined || actionType === undefined || questionDto.title === undefined || questionDto.content === undefined) {
            throw new BadRequestException(`Fields[askedBy,actionType,title,content] must be required to save a question.`);
        }

        const mailOptions = new Map<string, any>();

        // save the question then send mail notification to editors
        return await this.questionService.saveQuestion(askedBy, actionType, questionDto)
            .then((savedQuestion: any) => {
                // don't send mail if the question is saved just as draft
                if (actionType === 'post') {
                    // send new question post mail notification to editors
                    this.mailService.sendMail(MailType.POST_QUESTION, mailOptions.set('recipient', ENV.ADMIN_MAIL_ID));
                }
                return Promise.resolve(savedQuestion);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Modify question status against question id and action.
     * @response: return json of updated question object
     */
    @Put(':questionId/:actionType')
    @UseGuards(AuthGuard())
    async modifyQuestion(@Param('questionId') questionId: string, @Param('actionType') actionType: string): Promise<Question> {
        if (questionId === undefined || actionType === undefined) {
            throw new BadRequestException(`Fields[askedBy,actionType] must be required to update a question.`);
        }

        const mailOptions = new Map<string, any>();

        return await this.questionService.modifyQuestion(questionId, actionType)
            .then((updatedQuestion: any) => {
                mailOptions.set('question', updatedQuestion);
                // send question mail notification to user/subscriber according to action type
                switch (actionType) {
                    case 'published':
                        // send mail notification to user who has subscribed
                        this.userService.fetchAllUsers()
                            .then((users: any) => {
                                users.forEach(user => {
                                    // don't send this notification to the user who has asked the question
                                    if (user._id.toString() !== updatedQuestion.askedBy._id.toString()) {
                                        mailOptions.set('user', user);
                                        this.mailService.sendMail(MailType.PUBLISHED_QUESTION, mailOptions.set('recipient', this.utilService.getUserName(user)));
                                    }
                                });
                            });
                        // send blog published mail notification to all subscribers
                        this.userService.fetchSubscribedUsers()
                            .then((subs: any) => {
                                subs.forEach(sub => {
                                    this.mailService.sendMail(MailType.PUBLISHED_QUESTION, mailOptions.set('recipient', sub.email));
                                });
                            });
                        break;
                    case 'pending':
                        // send new question post mail notification to editors
                        this.mailService.sendMail(MailType.POST_QUESTION, mailOptions.set('recipient', ENV.ADMIN_MAIL_ID));
                        break;
                    case 'on_hold':
                        this.mailService.sendMail(MailType.ON_HOLD_QUESTION, mailOptions.set('recipient', updatedQuestion.askedBy));
                        break;
                    case 'rejected':
                        this.mailService.sendMail(MailType.REJECTED_QUESTION, mailOptions.set('recipient', updatedQuestion.askedBy));
                        break;
                }
                return Promise.resolve(updatedQuestion);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Edit question against question id.
     * @response: return json of updated question object
     */
    @Put(':questionId')
    @UseGuards(AuthGuard())
    async editQuestion(@Param('questionId') questionId: string, @Body() questionDto: QuestionDto): Promise<Question> {
        if (questionId === undefined || questionDto.title === undefined || questionDto.content === undefined) {
            throw new BadRequestException(`Fields[questionId,title,content] must be required to edit a question.`);
        }
        return await this.questionService.editQuestion(questionId, questionDto);
    }

    /**
     * Discard question against question id and make status 'inactive'.
     * @response: return json of updated question object
     */
    @Delete(':questionId')
    @UseGuards(AuthGuard())
    async deleteQuestion(@Param('questionId') questionId: string): Promise<Question> {
        if (questionId === undefined) {
            throw new BadRequestException(`Fields[questionId] must be required to delete a question.`);
        }
        return await this.questionService.deleteQuestion(questionId);
    }

    /**
     * Get total question asked by user against user id for statistics.
     * @response: return json of total question count
     */
    @Get('statistics/:askedBy')
    @UseGuards(AuthGuard())
    async getPublishedQuestionStatistics(@Param('askedBy') askedBy: string): Promise<any> {
        if (askedBy === undefined) {
            throw new BadRequestException(`Fields[askedBy] must be required to get question statistics.`);
        }
        return await this.questionService.getPublishedQuestionStatistics(askedBy);
    }

    /**
     * Get total pending question asked by user against user id for statistics.
     * @response: return json of total pending question count
     */
    @Get('statistics/all/pending')
    @UseGuards(AuthGuard())
    async getPendingQuestionStatistics(): Promise<any> {
        return await this.questionService.getPendingQuestionStatistics();
    }

    /**
     * Save question's like against user id and question id.
     * @response: return json of updated question object
     */
    @Get(':questionId/like/:likedBy')
    @UseGuards(AuthGuard())
    async saveLike(@Param('questionId') questionId: string, @Param('likedBy') likedBy: string): Promise<Question> {
        if (questionId === undefined || likedBy === undefined) {
            throw new BadRequestException(`Fields[questionId, likedBy] must be required to save question like.`);
        }
        // check if the user liked this question earlier or not
        return await this.questionService.getQuestion(questionId)
            .then((question: any) => {
                const savedLikedByUser = question.likes.filter(like => like === likedBy);
                // if user does not like this question then update database otherwise not
                if (savedLikedByUser.length === 0) {
                    // return updated question
                    return Promise.resolve(this.questionService.saveLike(questionId, likedBy));
                } else {
                    // return un-updated question
                    return Promise.resolve(question);
                }
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Save question's vote up against user id and question id.
     * @response: return json of updated question object
     */
    @Get(':questionId/voteup/:votedBy')
    @UseGuards(AuthGuard())
    async voteUp(@Param('questionId') questionId: string, @Param('votedBy') votedBy: string): Promise<Question> {
        if (questionId === undefined || votedBy === undefined) {
            throw new BadRequestException(`Fields[questionId, votedBy] must be required to save question like.`);
        }
        // check if the user vote up this question earlier or not
        return await this.questionService.getQuestion(questionId)
            .then((question: any) => {
                const savedVotedUpByUser = question.voteUp.filter(votedUpBy => votedUpBy === votedBy);
                // if user does not vote up this question then update database otherwise not
                if (savedVotedUpByUser.length === 0) {
                    return Promise.resolve(this.questionService.saveVoteUp(questionId, votedBy));
                } else {
                    return Promise.resolve(question);
                }
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Save question's vote down against user id and question id.
     * @response: return json of updated question object
     */
    @Get(':questionId/votedown/:votedBy')
    @UseGuards(AuthGuard())
    async voteDown(@Param('questionId') questionId: string, @Param('votedBy') votedBy: string): Promise<Question> {
        if (questionId === undefined || votedBy === undefined) {
            throw new BadRequestException(`Fields[questionId, votedBy] must be required to save question like.`);
        }
        // check if the user voted down this question earlier or not
        return await this.questionService.getQuestion(questionId)
            .then((question: any) => {
                const savedVoteDownByUser = question.voteDown.filter(voteDownBy => voteDownBy === votedBy);
                // if user does not vote down this question then update database otherwise not
                if (savedVoteDownByUser.length === 0) {
                    return Promise.resolve(this.questionService.saveVoteDown(questionId, votedBy));
                } else {
                    return Promise.resolve(question);
                }
            })
            .catch(err => Promise.reject(err));
    }
}
