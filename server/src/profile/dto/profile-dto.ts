export class ProfileDto {
    title: string;
    description: string;
    address: string;
    city: string;
    country: string;
    portfolio: Portfolio;
    employments: Employments[];
    experiences: Experiences[];
    skills: Skills[];
    degrees: Degrees[];
    certifications: Certifications[];
    user: any;
}

export interface Portfolio {
    dob: Date;
    gender: string;
    phone: number;
    email: string;
    mobile: number;
    socialLink: {
        facebook: string ;
        twitter: string ;
        google: string ;
        linkedin: string ;
    };
}

export interface Employments {
    company: string;
    designation: string;
    industry: string;
    role: string;
    fromDate: Date;
    toDate: Date;
    achievement: string;
    currentEmployer: boolean;
}

export interface Experiences {
    project: string;
    fromDate: Date;
    toDate: Date;
    description: string;
}

export interface Skills {
    skill: string;
    experience: number;
    lastUsed: number;
    experienceLevel: string;
}

export interface Degrees {
    qualification: string;
    passingDate: Date;
    university: string;
    specialization: string;
}

export interface Certifications {
    certification: string;
    issuedBy: string;
    issuedDate: Date;
    lifetimeValidity: boolean;
}
