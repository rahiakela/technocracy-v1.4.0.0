import {IsNotEmpty} from 'class-validator';

export class CommentReplyDto {
    @IsNotEmpty()
    readonly content: string;

    @IsNotEmpty()
    readonly actionType: string;
}
