import { Document } from 'mongoose';

export interface Profile extends Document {
    readonly title: string;
    readonly description: string;
    readonly address: string;
    readonly city: string;
    readonly country: string;
    readonly portfolio: any;
    readonly employments: any[];
    readonly experiences: any[];
    readonly skills: any[];
    readonly degrees: any[];
    readonly certifications: any[];
    readonly user: any;
}
