import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {User} from '../model/user.model';
import {Subscription} from '../model/mail-subscription';
import {UserDto} from '../dto/user-dto';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private readonly userModel: Model<User>,
                @InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>) {}

    async findUserById(email: string): Promise<User> {
        // find the user into database using email
        return await this.userModel
            .findOne({'local.email': email})
            .populate('profile')
            .exec();
    }

    async findUserByEmail(id: string): Promise<User> {
        // find the user into database using id
        return await this.userModel
            .findById(id)
            .populate('profile')
            .exec();
    }

    async findGoogleUser(uid: string): Promise<User> {
        // find the user into database using email
        return await this.userModel
            .findOne({'google.uid': uid})
            .populate('profile')
            .exec();
    }

    async findGoogleUserByEmail(email: string): Promise<User> {
        // find google user into database using email
        return await this.userModel
            .findOne({'google.email': email})
            .populate('profile')
            .exec();
    }

    async findFacebookUser(uid: string): Promise<User> {
        // find the user into database using email
        return await this.userModel
            .findOne({'facebook.uid': uid})
            .populate('profile')
            .exec();
    }

    async findFacebookUserByEmail(email: string): Promise<User> {
        // find facebook user into database using email
        return await this.userModel
            .findOne({'facebook.email': email})
            .populate('profile')
            .exec();
    }

    async fetchAllUsers(): Promise<User[]> {
        // filter the user who has subscribed to mail notification
        return await this.userModel
            .find({})
            .where('subscription')
            .equals('Y')
            .exec();
    }

    async fetchSubscribedUsers(): Promise<Subscription[]> {
        return await this.subscriptionModel
            .find({})
            .where('notification')
            .equals('Y')
            .exec();
    }

    async persist(user: any): Promise<User> {
        // Save this user to MongoDB
        return await new this.userModel(user).save();
    }

    async findUserByToken(token: string): Promise<User> {
        // find the user into database using token
        return await this.userModel
            .findOne({'local.activateToken.token' : token})
            .exec();
    }

    async findSubscriptionByEmail(email: string): Promise<User> {
        // find the subscription into database using email
        return await this.subscriptionModel
            .findOne({email})
            .exec();
    }

    async activateUser(user: any): Promise<User> {
        // update this user to MongoDB
        return await new this.userModel(user)
            .findOneAndUpdate(
                {  // query criteria
                    _id: user._id,
                },
                {  // data to update
                    'local.active': 'Y',
                    'local.activatedOn': new Date(),
                },
                {
                    new: true, // options: return updated one
                },
            );
    }

    async updateToken(user: any, token: any): Promise<User> {
        // update this user to MongoDB
        return await new this.userModel(user)
            .findOneAndUpdate(
                {  // query criteria
                    _id: user._id,
                },
                {  // data to update
                    'local.activateToken': token,
                },
                {
                    new: true, // options: return updated one
                },
            );
    }

    async updateEmail(user: any, email: string, token: any): Promise<User> {
        // update the email to MongoDB
        return await new this.userModel(user)
            .findOneAndUpdate(
                {  // query criteria
                    _id: user._id,
                },
                {  // data to update
                    'local.email': email,
                    'local.activateToken': token,
                },
                {
                    new: true, // options: return updated one
                },
            );
    }

    async updatePassword(user: any, salt: string, hash: string): Promise<User> {
        // update the hash and salt to MongoDB
        return await new this.userModel(user)
            .findOneAndUpdate(
                {  // query criteria
                    _id: user._id,
                },
                {  // data to update
                    salt,
                    hash,
                },
                {
                    new: true, // options: return updated one
                },
            );
    }

    async updateUserSubscription(user: any, isSubscribed: string): Promise<User> {
        // update registered subscription to MongoDB
        return await new this.userModel(user)
            .findOneAndUpdate(
                {  // query criteria
                    _id: user._id,
                },
                {  // data to update
                    subscription: isSubscribed,
                },
                {
                    new: true, // options: return updated one
                },
            );
    }

    async saveAnonymousSubscription(sub: any): Promise<Subscription> {
        // save anonymous subscription to MongoDB
        return await new this.subscriptionModel(sub).save();
    }

    async updateAnonymousSubscription(sub: any, isSubscribed: string): Promise<Subscription> {
        // update anonymous subscription to MongoDB
        return await new this.subscriptionModel(sub)
            .findOneAndUpdate(
                {  // query criteria
                    _id: sub._id,
                },
                {  // data to update
                    notification: isSubscribed,
                },
                {
                    new: true, // options: return updated one
                },
            );
    }

    async updateUserWithProfileId(userId: string, profileId: string): Promise<User> {
        return await new this.userModel
            .findOneAndUpdate(
                {  // query criteria
                   _id: userId,
                },
                {  // data to update
                   profile: profileId,
                },
                {
                   new: true, // options: return updated one
                },
            );
    }

    async updateUser(userId: string, userDto: UserDto): Promise<User> {
        // update the email to MongoDB
        return await this.userModel
            .findOneAndUpdate(
                {  // query criteria
                    _id: userId,
                },
                {  // data to update
                    userDto,
                },
                {
                    new: true, // options: return updated one
                },
            )
            .populate('profile')   // populate profile instance
            .exec();
    }
}
