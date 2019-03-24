import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    GoneException,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
    UnprocessableEntityException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {UserService} from '../services/user.service';
import {AuthService} from '../services/auth.service';
import {MailService} from '../../config/mail/mail.service';
import {UtilsService} from '../../utils/utils.service';
import {User} from '../model/user.model';
import {LoginDto} from '../dto/login-dto';
import {CreateUserDto} from '../dto/create-user-dto';
import {UserDto} from '../dto/user-dto';
import {MailType} from '../../config/mail/mail-type';
import {SocialUserDto} from '../dto/social-user-dto';

/**
 * @class AuthController: Define authentication related operation like login, register and password reset etc.
 */
@Controller('api/auth')
export class AuthController {

    constructor(private readonly userService: UserService,
                private readonly authService: AuthService,
                private readonly mailService: MailService,
                private readonly utilService: UtilsService) {}

    /**
     *  Login the user by verifying email and password if the user account is activated
     * @response: return json of user with JWT token by removing salt and hash
     */
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<User> {
        if (loginDto.email === undefined || loginDto.password === undefined) {
            throw new BadRequestException(`Fields[email,password] must be required to login.`);
        }

        // find the user into database and then verify password
        return await this.userService.findUserByEmail(loginDto.email)
            .then((user: any) => {
                if (user === null) {
                  throw new NotFoundException('The supplied email id is not available.');
                }

                // if the user found then verify password
                // Call validPassword method, passing supplied password
                if (!user.validPassword(loginDto.password, user)) {
                    throw new ForbiddenException('The supplied password is not valid.');
                }

                // check user account active or not, Otherwise throw account is not active error
                if (user.local.active === 'N') {
                    throw new ForbiddenException('Account is not activated, please verify your email id.');
                }

                // if password is valid and returned a user instance, then generate and send a JWT token
                const token = this.authService.signIn(user._id, user.local.email, user.local.name);
                user.jwtToken = token;
                user.salt = '';
                user.hash = '';
                return Promise.resolve(user);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Register the user by saving into database and send mail activation code to verify mail id.
     * @response: return json of saved user
     */
    @Post('register')
    async register(@Body() regDto: CreateUserDto): Promise<User> {
        if (regDto.email === undefined || regDto.password === undefined || regDto.username === undefined) {
            throw new BadRequestException(`Fields[email,password and username] must be required to registration.`);
        }

        const mailOptions = new Map<string, any>();

        // find the user existence into database
        return await this.userService.findUserByEmail(regDto.email)
            .then((user: any) => {
                if (user != null) {
                    throw new ConflictException('A account with this email id is already exists.');
                }

                // set recipient mail id for email verification
                mailOptions.set('recipient', regDto.email);

                // generate password encryption
                const salt = crypto.randomBytes(16).toString('hex');  // Create a random string for salt
                const hash = crypto.pbkdf2Sync(regDto.password, salt, 100000, 512, 'sha512').toString('hex'); // Create encrypted hash

                // generate account activation token
                const activateToken = this.utilService.generateMailActivateToken();
                mailOptions.set('activateToken', activateToken);

                // Create a new user instance and set its properties
                const userDto = {
                    'local.name': regDto.username,
                    'local.email': regDto.email,
                    'local.activateToken': activateToken,
                    'local.createdOn': new Date(),
                    'local.active': 'N',
                    'hash': hash,
                    'salt': salt,
                };

                // Save new user to MongoDB
                return this.userService.persist(userDto)
                    .then((savedUser: any) => {
                        // send mail id verification code to user
                        if (savedUser) {
                            this.mailService.sendMail(MailType.ACTIVATE_MAIL, mailOptions);
                        }
                        // remove hash and salt value from saved user
                        savedUser.hash = '';
                        savedUser.salt = '';
                        return Promise.resolve(savedUser);
                    })
                    .catch(err => Promise.reject(err));
            })
            .catch(err => Promise.reject(err));
    }

    /**
     *  Save/Update the user information if they login with social networking account like Google and Facebook.
     * @response: return json of saved or updated user with JWT token
     */
    @Post('social/user')
    async saveSocialUser(@Body() socialUserDto: SocialUserDto): Promise<User> {
        if (socialUserDto.email === undefined || socialUserDto.name === undefined || socialUserDto.uid === undefined || socialUserDto.provider === undefined) {
            throw new BadRequestException(`Fields[email,name,uid and provider] must be required to save social user profile.`);
        }

        const mailOptions = new Map<string, any>();

        if (socialUserDto.provider === 'GOOGLE') {
            return await this.userService.findGoogleUser(socialUserDto.uid)
                .then((user: any) => {
                    if (user) { // if user found then return this user
                        // generate and send a JWT token
                        const generateToken = this.authService.signIn(user._id, user.google.email, user.google.name);
                        user.jwtToken = generateToken;
                        return Promise.resolve(user);
                    } else { //  if not found then create new google user
                        //  Create a new google user instance and set its properties
                        const userDto = new UserDto();
                        userDto.google.name = socialUserDto.name;
                        userDto.google.email = socialUserDto.email;
                        userDto.google.uid = socialUserDto.uid;
                        userDto.google.image = socialUserDto.image;
                        userDto.google.token = socialUserDto.token;
                        userDto.google.createdOn = new Date();
                        userDto.google.lastLogin = new Date();

                        // Save this google user to MongoDB
                        this.userService.persist(userDto)
                            .then((savedUser: any) => {
                                // generate and send a JWT token
                                const generateToken = this.authService.signIn(savedUser._id, savedUser.google.email, savedUser.google.name);
                                savedUser.jwtToken = generateToken;
                                // send welcome mail to user
                                this.mailService.sendMail(MailType.WELCOME_MAIL, mailOptions.set('recipient', savedUser.google.email));
                                return Promise.resolve(savedUser);
                            })
                            .catch(err => Promise.reject(err));
                    }
                })
                .catch(err => Promise.reject(err));
        }

        if (socialUserDto.provider === 'FACEBOOK') {
            return await this.userService.findFacebookUser(socialUserDto.uid)
                .then((user: any) => {
                    if (user) { // if user found then return this user
                        // generate and send a JWT token
                        const generateToken = this.authService.signIn(user._id, user.facebook.email, user.facebook.name);
                        user.jwtToken = generateToken;
                        return Promise.resolve(user);
                    } else { //  if not found then create new google user
                        //  Create a new facebook user instance and set its properties
                        const userDto = new UserDto();
                        userDto.facebook.name = socialUserDto.name;
                        userDto.facebook.email = socialUserDto.email;
                        userDto.facebook.uid = socialUserDto.uid;
                        userDto.facebook.image = socialUserDto.image;
                        userDto.facebook.token = socialUserDto.token;
                        userDto.facebook.createdOn = new Date();
                        userDto.facebook.lastLogin = new Date();

                        // Save this facebook user to MongoDB
                        this.userService.persist(userDto)
                            .then((savedUser: any) => {
                                // generate and send a JWT token
                                const generateToken = this.authService.signIn(savedUser._id, savedUser.facebook.email, savedUser.facebook.name);
                                savedUser.jwtToken = generateToken;
                                // send welcome mail to user
                                this.mailService.sendMail(MailType.WELCOME_MAIL, mailOptions.set('recipient', savedUser.facebook.email));
                                return Promise.resolve(savedUser);
                            })
                            .catch(err => Promise.reject(err));
                    }
                })
                .catch(err => Promise.reject(err));
        }
    }

    /**
     * Activate the user account by checking the expiry time of token and send welcome mail to the user.
     * @response: return json of updated user with JWT token otherwise respective message
     */
    @Get('activate/:token')
    async activateAccount(@Param('token') token: string): Promise<User> {
        if (token === undefined) {
            throw new BadRequestException(`Fields[token] must be required to activate email account.`);
        }

        const mailOptions = new Map<string, any>();

        return await this.userService.findUserByToken(token)
            .then((user: any) => {
                if (user === null) {
                    throw new NotFoundException('The account activation code is not available.');
                }
                if (user.local.active === 'Y') {
                    throw new UnprocessableEntityException('The account is already activated.');
                }

                // if user found then check its expiry time
                const expires = new Date(user.local.activateToken.expires);
                const expiredHours = this.utilService.getExpiredTime(new Date(Date.now()), expires);
                // expiry time must be within 24 hours
                if (expiredHours > 24) {
                    throw new GoneException('The account activation code has been expired.');
                }

                // update user instance
                return this.userService.activateUser(user)
                    .then((updatedUser: any) => {
                        // if user instance saved then generate and send a JWT token
                        updatedUser.jwtToken = user.generateJWT(user._id, user.local.email, user.local.name);
                        // return the user after removing salt, hash
                        updatedUser.salt = '';
                        updatedUser.hash = '';
                        // send welcome mail to user
                        this.mailService.sendMail(MailType.WELCOME_MAIL, mailOptions.set('recipient', user.local.email));
                        return Promise.resolve(updatedUser);
                    });
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Resend the activation code to the user for verify mail id again.
     * @response: return json of status message
     */
    @Put('reverify')
    async reverifyEmail(@Body() email: string): Promise<any> {
        if (email === undefined) {
            throw new BadRequestException(`Fields[email] must be required to re-verify email account.`);
        }

        const mailOptions = new Map<string, any>();

        return await this.userService.findUserByEmail(email)
            .then((user: any) => {
                const verifyToken = this.utilService.generateMailActivateToken();
                mailOptions.set('activateToken', verifyToken);

                // update user instance
                return this.userService.updateToken(user, verifyToken)
                    .then((updatedUser: any) => {
                        // send mail id verification mail to user
                        this.mailService.sendMail(MailType.ACTIVATE_MAIL, mailOptions.set('recipient', email));
                        return Promise.resolve({verified: true});
                    })
                    .catch(err => Promise.reject(err));
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Update the mail id of user by replacing old mail id and send activation code to the user for verify mail id again.
     * @response: return json of status message
     */
    @Put('email/update')
    async updateEmail(@Body() mails: any): Promise<any> {
        if (mails.newEmail === undefined || mails.oldEmail) {
            throw new BadRequestException(`Fields[new and old email] must be required to update email account.`);
        }

        const oldEmail = mails.oldEmail;
        const newEmail = mails.newEmail;
        const mailOptions = new Map<string, any>();

        return await this.userService.findUserByEmail(oldEmail)
            .then((user: any) => {
                // if user found then update old mail id with new one
                if (user) {
                    const verifyToken = this.utilService.generateMailActivateToken();
                    mailOptions.set('activateToken', verifyToken);

                    // update user instance
                    return this.userService.updateEmail(user, newEmail, verifyToken)
                        .then((updatedUser: any) => {
                            // send mail id verification code to user
                            this.mailService.sendMail(MailType.ACTIVATE_MAIL, mailOptions.set('recipient', newEmail));
                            return Promise.resolve({updated: true});
                        })
                        .catch(err => Promise.reject(err));
                }
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Send the password reset code to the user mail account.
     * @response: return json of status message
     */
    @Put('forgot/pass')
    async forgotPassword(@Body() email: string): Promise<any> {
        if (email === undefined) {
            throw new BadRequestException(`Fields[email] must be required to reset password.`);
        }

        const mailOptions = new Map<string, any>();

        return await this.userService.findUserByEmail(email)
            .then((user: any) => {
                if (user == null) {
                    throw new NotFoundException('The specified email address is not available.');
                }
                mailOptions.set('recipient', email);
                const verifyToken = this.utilService.generateMailActivateToken();
                mailOptions.set('activateToken', verifyToken);

                return this.userService.updateToken(user, email)
                    .then((updatedUser: any) => {
                        mailOptions.set('username', updatedUser.local.name);
                        // send mail id verification mail to user
                        this.mailService.sendMail(MailType.PWD_RESET_MAIL, mailOptions.set('recipient', email));
                        return Promise.resolve({user: updatedUser, mailSent: true});
                    })
                    .catch(err => Promise.reject(err));
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Reset the user account password using token.
     * @response: return json of status message
     */
    @Put('reset/pass')
    async resetPassword(@Body() pwdDto: any): Promise<any> {
        const password = pwdDto.password;
        const token = pwdDto.token;

        if (password === undefined || token === undefined) {
            throw new BadRequestException(`Fields[password and token] must be required to reset password.`);
        }

        const mailOptions = new Map<string, any>();

        return await this.userService.findUserByToken(token)
            .then((user: any) => {
                if (user === null) {
                    throw new NotFoundException('The given password reset code is not available.');
                }
                // if user found then check the token expiry time
                const expires = new Date(user.local.activateToken.expires);
                const expiredHours = this.utilService.getExpiredTime(new Date(Date.now()), expires);
                // expiry time must be within 24 hours
                if (expiredHours > 24) {
                    throw new GoneException('The password reset code has been expired.');
                }

                // generate password encryption
                const salt = crypto.randomBytes(16).toString('hex');  // Create a random string for salt
                const hash = crypto.pbkdf2Sync(password, salt, 100000, 512, 'sha512').toString('hex'); // Create encrypted hash

                return this.userService.updatePassword(user, salt, hash)
                    .then((updatedUser: any) => {
                        return Promise.resolve({resetPass: true});
                    })
                    .catch(err => Promise.reject(err));
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Update profile's image using by profile id and user instance.
     * @response: return json of updated user
     */
    @Put(':userId/image')
    async updateProfileImage(@Param('userId') userId: string, @Body() userDto: UserDto): Promise<User> {
        if (userId === undefined) {
            throw new BadRequestException(`Fields[userId] must be required to update user profile image.`);
        }
        // update user with id and populate with profile
        return await this.userService.updateUser(userId, userDto)
            .then((user: any) => {
                // remove hash and salt value
                user.salt = '';
                user.hash = '';
                return Promise.resolve(user);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     *  Save/Update the user subscription information if they are already registered
     *  otherwise add his subscription information in subscription document.
     * @response: return json of saved or updated user
     */
    @Put('subscribe')
    async subscribe(@Body() subDto: any): Promise<any> {
        if (subDto.email === undefined) {
            throw new BadRequestException(`Fields[email] must be required to subscribe.`);
        }

        const email = subDto.email;
        const isSubscribed = subDto.isSubscribed;

        // search user in database against mail id
        return await this.userService.findUserByEmail(email)
            .then((localUser: any) => {
                // if the user found using email in local sub document
                if (localUser.length > 0) {
                    return this.updateSubscription(localUser, isSubscribed);
                } else { // search user using email in google sub document
                    return this.userService.findGoogleUserByEmail(email)
                        .then((gUser: any) => {
                            if (gUser.length > 0) {
                                return this.updateSubscription(gUser, isSubscribed);
                            } else { // search user using email in facebook sub document
                                return this.userService.findFacebookUserByEmail(email)
                                    .then((fbUser: any) => {
                                        if (fbUser.length > 0) {
                                            return this.updateSubscription(fbUser, isSubscribed);
                                        } else {
                                            // otherwise save anonymous user subscription
                                            return this.userService.findSubscriptionByEmail(email)
                                                .then((sub: any) => {
                                                    // if anonymous user subscription exists
                                                    if (sub.length > 0) {
                                                        // then update anonymous user subscription
                                                        return this.userService.updateAnonymousSubscription(sub, isSubscribed)
                                                            .then(data => Promise.resolve({subscribed: true}));
                                                    } else {
                                                        // otherwise save anonymous user subscription
                                                        const subscription = {
                                                            email,
                                                            notification: isSubscribed,
                                                        };
                                                        return this.userService.saveAnonymousSubscription(subscription)
                                                            .then(data => {
                                                                // send welcome subscription mail to user
                                                                this.mailService.sendMail(MailType.SUBSCRIBED, new Map<string, any>().set('recipient', email));
                                                                return Promise.resolve({subscribed: true});
                                                            });
                                                    }
                                                });
                                        }
                                    });
                            }
                        });
                }
            });
    }

    updateSubscription(user: any, isSubscribed): Promise<any> {
        return this.userService.updateUserSubscription(user, isSubscribed)
            .then((updatedUser: any) => {
                const mailOptions = new Map<string, any>();
                // send welcome subscription mail to user
                this.mailService.sendMail(MailType.SUBSCRIBED, mailOptions.set('recipient', updatedUser.email));
                return Promise.resolve(updatedUser);
            }).catch(err => Promise.reject(err));
    }
}
