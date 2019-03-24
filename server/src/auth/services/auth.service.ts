import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {UserService} from './user.service';
import {JwtPayload} from '../model/user-payload';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

    async signIn(id: string, email: string, name: string): Promise<string> {
        const user: JwtPayload = {id, name, email};

        return this.jwtService.sign(user);
    }

    /*async validateUser(payload: JwtPayload): Promise<any> {
        return await this.userService.findOneByEmail(payload.email);
    }*/
}
