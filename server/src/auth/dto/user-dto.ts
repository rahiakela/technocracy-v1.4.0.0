import {Profile} from '../../profile/model/profile.model';

export class UserDto {
    subscription: string;
    role: string;
    hash: string;
    salt: string;
    jwtToken: string;
    profile: Profile;
    local: Local;
    facebook: Facebook;
    google: Google;
    twitter: any;
    linkedin: any;
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
