import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Profile} from '../model/profile.model';
import {ProfileDto} from '../dto/profile-dto';

@Injectable()
export class ProfileService {

    constructor(@InjectModel('Profile') private readonly profileModel: Model<Profile>) {}

    async getProfileByUserId(userId: string): Promise<Profile> {
        return await this.profileModel
            .findOne({user : userId})
            .exec();
    }

    async saveProfile(profileDto: ProfileDto): Promise<Profile> {
        return await new this.profileModel(profileDto).save();
    }

    async updateProfile(profileId: string, profileDto: ProfileDto): Promise<Profile> {
        return await this.profileModel
            .findOneAndUpdate(
                {  // query criteria
                   _id: profileId,
                },
                {  // data to update
                   profileDto,
                },
                {
                   new: true, // options: return updated one
                },
            );
    }

    async deleteProfile(profileId: string): Promise<any> {
        return await this.profileModel
            .findByIdAndRemove(profileId)
            .exec();
    }
}
