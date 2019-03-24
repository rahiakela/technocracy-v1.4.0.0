import { Document } from 'mongoose';

export interface Subscription extends Document {
    readonly email: string;
    readonly ipAddress: string;
    readonly city: string;
    readonly country: string;
    readonly notification: string;
    readonly subscribedOn: Date;
}
