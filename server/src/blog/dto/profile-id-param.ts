import {IsNotEmpty} from 'class-validator';

export class ProfileIdParam {
    @IsNotEmpty({message: 'Fields[writtenBy] must be required'})
    writtenBy: string;
}
