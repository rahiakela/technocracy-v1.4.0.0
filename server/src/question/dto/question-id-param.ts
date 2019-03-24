import {IsNotEmpty} from 'class-validator';

export class QuestionIdParam {
    @IsNotEmpty({message: 'Fields[questionId] must be required'})
    questionId: string;
}
