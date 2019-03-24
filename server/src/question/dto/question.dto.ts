import {IsArray, IsNotEmpty} from 'class-validator';

export class QuestionDto {
    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly content: string;

    @IsArray()
    readonly tags: string[];
}
