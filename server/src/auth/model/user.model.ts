import { Document } from 'mongoose';
import {Profile} from '../../profile/model/profile.model';

export interface User extends Document {
    readonly subscription: string;
    readonly role: string;
    readonly hash: string;
    readonly salt: string;
    readonly jwtToken: string;
    readonly profile: Profile;
    readonly local: Local;
    readonly facebook: Facebook;
    readonly google: Google;
    readonly twitter: any;
    readonly linkedin: any;
}

export interface Local {
    email?: string;
    name?: string;
    password?: string;
    salt?: string;
    hash?: string;
    image?: string;
    lastLogin?: Date;
    createdOn?: Date;
    active?: string;
    activatedOn?: Date;
    activateToken?: ActivateToken;
}

export interface Facebook {
    email?: string;
    name?: string;
    uid?: string;
    image?: string;
    token?: string;
    provider?: string;
    lastLogin?: Date;
    createdOn?: Date;
}

export interface Google {
    email?: string;
    name?: string;
    uid?: string;
    image?: string;
    token?: string;
    provider?: string;
    lastLogin?: Date;
    createdOn?: Date;
}

export interface ActivateToken {
    token?: string;
    expires?: Date;
}
