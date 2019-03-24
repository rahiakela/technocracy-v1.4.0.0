import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import * as crypto from 'crypto';

export const UserSchema = new mongoose.Schema({
    subscription: { type: String, required: true, default: 'N' },
    role: { type: String, required: true, default: 'user' }, // admin, author and user
    hash: { type: String },
    salt: { type: String },
    jwtToken: { type: String },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
    local: {
        email: { type: String, unique: true },
        name: { type: String },
        image: { type: String },
        lastLogin: { type: Date, required: false, default: Date.now()},
        createdOn: { type: Date, required: true, default: Date.now() },
        active: { type: String, required: true, default: 'N' },
        activatedOn: { type: Date },
        activateToken: {
            token: { type: String },
            expires: { type: Date },
        },
    },
    facebook: {
        uid: { type: String, unique: true },
        token: { type: String },
        email: { type: String, unique: true },
        name: { type: String },
        image: { type: String },
        lastLogin: { type: Date, required: true, default: Date.now() },
        createdOn: { type: Date, required: true, default: Date.now() },
    },
    google: {
        uid: { type: String, unique: true },
        token: { type: String },
        email: { type: String, unique: true },
        name: { type: String },
        image: { type: String },
        lastLogin: { type: Date, required: true, default: Date.now() },
        createdOn: { type: Date, required: true, default: Date.now() },
    },
    twitter: {
        uid: { type: String, unique: true },
        token: { type: String },
        email: { type: String, unique: true },
        name: { type: String },
        image: { type: String },
        lastLogin: { type: Date, required: true, default: Date.now() },
        createdOn: { type: Date, required: true, default: Date.now() },
    },
    linkedin: {
        uid: { type: String, unique: true },
        token: { type: String },
        email: { type: String, unique: true },
        name: { type: String },
        image: { type: String },
        lastLogin: { type: Date, required: true, default: Date.now() },
        createdOn: { type: Date, required: true, default: Date.now() },
    },
});

UserSchema.methods.setPassword = (password: string) => {
    this.salt = crypto.randomBytes(16).toString('hex'); // Create a random string for salt
    this.hash = crypto.pbkdf2Sync(password, this.salt, 100000, 64, 'sha512'); // Create encrypted hash
};

UserSchema.methods.validPassword = (password: string, user: any) => {
    const newHash = crypto
        .pbkdf2Sync(password, user.salt, 100000, 512, 'sha512')
        .toString('hex');
    return user.hash === newHash;
};
