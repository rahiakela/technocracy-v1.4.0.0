import {IsNotEmpty} from 'class-validator';

export class UserIdParam {
    @IsNotEmpty({message: 'Fields[likedBy] must be required'})
    likedBy: string;
}
