import { Document } from 'mongoose';

export interface Blog extends Document {
    readonly title: string;
    readonly description: string;
    readonly content: string;
    readonly profile: string;
    readonly createdOn: Date;
    readonly submittedOn: Date;
    readonly publishedOn: Date;
    readonly holdOnDate: Date;
    readonly inactiveDate: Date;
    readonly rejectedOn: Date;
    readonly updatedOn: Date;
    readonly image: string;
    readonly status: string;
    readonly comments: string[];
    readonly likes: string[];
    readonly tags: string[];
}
