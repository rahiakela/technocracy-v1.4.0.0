import { Document } from 'mongoose';
import {User} from '../../auth/model/user.model';

export interface Reply extends Document {
    readonly content: string;
    readonly repliedBy: User;
    readonly repliedOn: Date;
    readonly likes: string[];
}
