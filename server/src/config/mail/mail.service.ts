import {Injectable} from '@nestjs/common';
import {MailType} from './mail-type';
import * as nodemailer from 'nodemailer';
import {BlogSaveMailTemplate} from './template/blog-save-template';
import {BlogOnHoldMailTemplate} from './template/blog-onhold-template';
import {BlogRejectedMailTemplate} from './template/blog-rejected-template';
import {BlogPublishMailTemplate} from './template/blog-publish-template';
import {QuestionPostMailTemplate} from './template/question-post-template';
import {QuestionOnHoldMailTemplate} from './template/question-onhold-template';
import {QuestionRejectedMailTemplate} from './template/question-rejected-template';
import {QuestionPublishMailTemplate} from './template/question-publish-template';
import {CommentMailTemplate} from './template/comment-template';
import {WelcomeMailTemplate} from './template/welcome-template';
import {MailActivateTemplate} from './template/mail-activate-template';
import {PasswordResetTemplate} from './template/password-reset-template';
import {SubscribedMailTemplate} from './template/subscribed-template';
import {ProdErrorTemplate} from './template/prod-error-template';
import {UtilsService} from '../../utils/utils.service';
import {CustomLogger} from '../log/custom-logger';
import {ENV} from '../environment-variables';

@Injectable()
export class MailService {

    constructor(private utilService: UtilsService,
                private logger: CustomLogger,
                private blogSaveMailTemplate: BlogSaveMailTemplate,
                private blogOnHoldMailTemplate: BlogOnHoldMailTemplate,
                private blogRejectedMailTemplate: BlogRejectedMailTemplate,
                private blogPublishMailTemplate: BlogPublishMailTemplate,
                private questionPostMailTemplate: QuestionPostMailTemplate,
                private questionOnHoldMailTemplate: QuestionOnHoldMailTemplate,
                private questionRejectedMailTemplate: QuestionRejectedMailTemplate,
                private questionPublishMailTemplate: QuestionPublishMailTemplate,
                private commentMailTemplate: CommentMailTemplate,
                private welcomeMailTemplate: WelcomeMailTemplate,
                private mailActivateTemplate: MailActivateTemplate,
                private passwordResetTemplate: PasswordResetTemplate,
                private subscribedMailTemplate: SubscribedMailTemplate,
                private prodErrorTemplate: ProdErrorTemplate) {}
    /**
     * Send mail notification to user based on mail type
     * @param mailType {any} The mail type to send mail notification accordingly.
     * @param mailOption {Map<string, any>} The map that contains user, profile, blog, question and comment object accordingly to mail type.
     * @response: return void
     * Reference:
     * 1-http://javascript.tutorialhorizon.com/2015/07/02/send-email-node-js-express/
     * 2-https://stackoverflow.com/questions/4113701/sending-emails-in-node-js
     * 3-https://stackoverflow.com/questions/19877246/nodemailer-with-gmail-and-nodejs
     */
    public sendMail(mailType: MailType, mailOption?: Map<string, any>) {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: ENV.MAIL_HOST, // use smtp host
            service: ENV.MAIL_SERVICE, // use mail service
            auth: {
                // use sender credentials
                user: ENV.ADMIN_MAIL_ID,
                pass: ENV.ADMIN_MAIL_SECRET,
            },
        });

        const recipient = mailOption.get('recipient');
        let htmlContent = '';
        let fromContent = '';
        let toMailId = mailOption.get('recipient');
        // change subject line
        let subjectLine = 'Welcome to Technocracy Blog/Question Forum!';

        // identify which template need to send
        switch (mailType) {
            case MailType.POST_BLOG:
                htmlContent = this.blogSaveMailTemplate.getSaveBlogMailTemplate(mailOption.get('blog'));
                fromContent = 'Technocracy Blog <editors@tecknocracy.com>';
                subjectLine = `[New Blog Post] ${mailOption.get('blog').title}`;
                toMailId = recipient;
                break;
            case MailType.ON_HOLD_BLOG:
                htmlContent = this.blogOnHoldMailTemplate.getOnHoldBlogMailTemplate(mailOption.get('blog'), recipient, mailOption.get('blog').profile.name);
                fromContent = 'Technocracy Blog <editors@tecknocracy.com>';
                subjectLine = `[Blog On Hold] ${mailOption.get('blog').title}`;
                toMailId = this.utilService.getUserEmail(recipient);
                break;
            case MailType.REJECTED_BLOG:
                htmlContent = this.blogRejectedMailTemplate.getRejectedBlogMailTemplate(mailOption.get('blog'), recipient, mailOption.get('blog').profile.name);
                fromContent = 'Technocracy Blog <editors@tecknocracy.com>';
                subjectLine = `[Blog Rejected] ${mailOption.get('blog').title}`;
                toMailId = this.utilService.getUserEmail(recipient);
                break;
            case MailType.PUBLISHED_BLOG:
                htmlContent = this.blogPublishMailTemplate.getBlogPublishMailTemplate(mailOption.get('blog'), mailOption.get('recipient'));
                fromContent = 'Technocracy Blog <editors@tecknocracy.com>';
                subjectLine = mailOption.get('blog').title;
                toMailId = mailOption.get('recipient');
                break;
            case MailType.POST_QUESTION:
                htmlContent = this.questionPostMailTemplate.getQuestionPostMailTemplate(mailOption.get('question'), this.utilService.getUserName(mailOption.get('user')));
                fromContent = 'Technocracy Question <editors@tecknocracy.com>';
                subjectLine = '[New post] ' + mailOption.get('question').title;
                toMailId = 'editors@tecknocracy.com';
                break;
            case MailType.ON_HOLD_QUESTION:
                htmlContent = this.questionOnHoldMailTemplate.getQuestionOnHoldMailTemplate(mailOption.get('question'), recipient, this.utilService.getUserName(mailOption.get('recipient')));
                fromContent = 'Technocracy Question <editors@tecknocracy.com>';
                subjectLine = `[Question On Hold] ${mailOption.get('question').title}`;
                toMailId = this.utilService.getUserEmail(recipient);
                break;
            case MailType.REJECTED_QUESTION:
                htmlContent = this.questionRejectedMailTemplate.getQuestionRejectedMailTemplate(mailOption.get('question'), recipient, this.utilService.getUserName(mailOption.get('recipient')));
                fromContent = 'Technocracy Question <editors@tecknocracy.com>';
                subjectLine = `[Question Rejected] ${mailOption.get('question').title}`;
                toMailId = this.utilService.getUserEmail(recipient);
                break;
            case MailType.PUBLISHED_QUESTION:
                htmlContent = this.questionPublishMailTemplate.getQuestionPublishMailTemplate(mailOption.get('question'), mailOption.get('recipient'), mailOption.get('user'), this.utilService.getUserName(mailOption.get('question').askedBy));
                fromContent = 'Technocracy Question <editors@tecknocracy.com>';
                subjectLine = mailOption.get('question').title;
                toMailId = this.utilService.getUserEmail(recipient);
                break;
            case MailType.BLOG_COMMENT:
                htmlContent = this.commentMailTemplate.getCommentMailTemplate(mailOption, this.utilService.getUserEmail(mailOption.get('recipient')), 'blog');
                fromContent = 'Technocracy Blog <editors@tecknocracy.com>';
                subjectLine = '[New comment] ' + mailOption.get('blog').title;
                toMailId = recipient;
                break;
            case MailType.QUESTION_COMMENT:
                htmlContent = this.commentMailTemplate.getCommentMailTemplate(mailOption, this.utilService.getUserEmail(mailOption.get('recipient')), 'question');
                fromContent = 'Technocracy Question <editors@tecknocracy.com>';
                subjectLine = '[New comment] ' + mailOption.get('question').title;
                toMailId = recipient;
                break;
            case MailType.WELCOME_MAIL:
                fromContent = 'Technocracy Forum <editors@tecknocracy.com>';
                htmlContent = this.welcomeMailTemplate.getWelcomeMailTemplate(recipient);
                break;
            case MailType.ACTIVATE_MAIL:
                fromContent = 'Technocracy Forum <editors@tecknocracy.com>';
                htmlContent = this.mailActivateTemplate.getMailActivateTemplate(mailOption.get('recipient'), mailOption.get('activateToken'));
                subjectLine = '[Technocracy Forum] Verify your mail id to activate  your account';
                break;
            case MailType.PWD_RESET_MAIL:
                fromContent = 'Technocracy Forum <editors@tecknocracy.com>';
                htmlContent = this.passwordResetTemplate.getPasswordResetTemplate(mailOption.get('username'), mailOption.get('recipient'), mailOption.get('activateToken'));
                subjectLine = '[Technocracy Forum] Reset your Technocracy account password';
                break;
            case MailType.SUBSCRIBED:
                fromContent = 'Technocracy Forum <editors@tecknocracy.com>';
                htmlContent = this.subscribedMailTemplate.getSubscribedMailTemplate(recipient);
                break;
            case MailType.ERROR_NOTIFICATION:
                fromContent = 'Technocracy Production Error <editors@tecknocracy.com>';
                subjectLine = 'Technocracy Production Error!';
                htmlContent = this.prodErrorTemplate.getProdErrorTemplate(recipient, mailOption);
                break;
        }

        // setup email data with unicode symbols
        const mailOptions = {
            from: fromContent,  // sender address
            to: toMailId,       // list of receivers
            subject: subjectLine,   // Subject line is blog's title
            html: htmlContent,  // html body
        };

        // send mail with defined transport object
        transporter
            .sendMail(mailOptions)
            .then((response: any) => {
                // this.logger.log(`Mail has been sent to ${response.accepted[0]}`);
            })
            .catch(err => err); // this.logger.error('An error occured while sending mail notification', err.stack)

        // close the transporter
        transporter.close();
    }
}
