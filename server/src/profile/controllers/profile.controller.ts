import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {ProfileService} from '../services/profile.service';
import {Profile} from '../model/profile.model';
import {ProfileDto} from '../dto/profile-dto';
import {UserService} from '../../auth/services/user.service';

/**
 * @class ProfileController: Define user profile related operation like fetching/saving/updating/deleting profile etc.
 */
@Controller('api/profile')
export class ProfileController {

    constructor(private readonly profileService: ProfileService,
                private readonly userService: UserService) {}

    /**
     * Get profile against user id.
     * @response: return json of profile
     */
    @Get(':userId')
    async getProfile(@Param('userId') userId: string): Promise<Profile> {
        if (userId === undefined) {
            throw new BadRequestException(`Fields[userId] must be required to fetch profile.`);
        }
        return await this.profileService.getProfileByUserId(userId);
    }

    /**
     * Save profile by updating user id.
     * @response: return json of newly added profile
     */
    @UseGuards(AuthGuard())
    @Post(':userId')
    async saveProfile(@Param('userId') userId: string, @Body() profileDto: ProfileDto): Promise<Profile> {
        if (userId === undefined) {
            throw new BadRequestException(`Fields[userId] must be required to save profile.`);
        }
        // Save this Profile to MongoDB
        return await this.profileService.saveProfile(profileDto)
            .then((profile: any) => {
                // update user with profile id
                const updatedUser = this.userService.updateUserWithProfileId(userId, profile._id);
                profile.user = updatedUser;
                return Promise.resolve(profile);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Update profile by profile id.
     * @response: return json of updated profile
     */
    @Put(':profileId')
    async updateProfile(@Param('profileId') profileId: string, @Body() profileDto: ProfileDto): Promise<Profile> {
        if (profileId === undefined) {
            throw new BadRequestException(`Fields[profileId] must be required to update profile.`);
        }
        return await this.profileService.updateProfile(profileId, profileDto);
    }

    /**
     * Delete profile using by profile id.
     * @response: return json of deleted message
     */
    @Delete(':profileId')
    async deleteProfile(@Param('profileId') profileId: string): Promise<any> {
        if (profileId === undefined) {
            throw new BadRequestException(`Fields[profileId] must be required to delete profile.`);
        }
        return await this.profileService.deleteProfile(profileId);
    }
}
