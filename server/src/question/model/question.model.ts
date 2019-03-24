import { Document } from 'mongoose';

export interface Question extends Document {
    readonly title: string;
    readonly content: string;
    readonly askedBy: string;
    readonly createdOn: Date;
    readonly submittedOn: Date;
    readonly publishedOn: Date;
    readonly updatedOn: Date;
    readonly status: string;
    readonly comments: string[];
    readonly likes: string[];
    readonly tags: string[];
    readonly voteUp: string[];
    readonly voteDown: string[];
}
