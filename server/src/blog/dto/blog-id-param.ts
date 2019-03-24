import {IsNotEmpty} from 'class-validator';

export class BlogIdParam {
    @IsNotEmpty({message: 'Fields[blogId] must be required'})
    blogId: string;
}
