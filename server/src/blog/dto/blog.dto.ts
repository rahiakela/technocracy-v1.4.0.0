import {IsArray, IsNotEmpty} from 'class-validator';

export class BlogDto {
    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly description: string;

    @IsNotEmpty()
    readonly content: string;

    @IsNotEmpty()
    image: string;

    profile: string;
    createdOn: Date;
    submittedOn: Date;
    publishedOn: Date;
    holdOnDate: Date;
    inactiveDate: Date;
    rejectedOn: Date;
    updatedOn: Date;
    status: string;
    readonly comments: string[];
    readonly likes: string[];
    @IsArray()
    readonly tags: string[];
}
