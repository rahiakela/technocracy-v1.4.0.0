import {IsNotEmpty} from 'class-validator';

export class ReplyDto {
    @IsNotEmpty()
    readonly content: string;

    @IsNotEmpty()
    readonly replyType: string;

    @IsNotEmpty()
    readonly repliedId: string;

    @IsNotEmpty()
    readonly commentId: string;

    @IsNotEmpty()
    readonly repliedBy: string;
}
