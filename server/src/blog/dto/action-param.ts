import {IsNotEmpty} from 'class-validator';

export class ActionParam {
    @IsNotEmpty({message: 'Fields[actionType] must be required'})
    actionType: string;
}
