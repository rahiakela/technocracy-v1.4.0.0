import {IsNotEmpty} from 'class-validator';

export class SocialUserDto {
    @IsNotEmpty()
    readonly provider: string;

    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly name: string;

    @IsNotEmpty()
    readonly uid: string;

    readonly image: string;
    readonly token: string;
}
