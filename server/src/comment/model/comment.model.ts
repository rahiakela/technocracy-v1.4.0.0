import { Document } from 'mongoose';
import {User} from '../../auth/model/user.model';
import {Reply} from './reply.model';

export interface Comment extends Document {
    readonly content: string;
    readonly commentedBy: User;
    readonly commentedOn: string;
    readonly likes: string[];
    readonly replies: Reply;
    readonly notification: string;
}
