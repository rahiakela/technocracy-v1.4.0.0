import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output, SimpleChange, SimpleChanges,
  ViewChild
} from '@angular/core';
import {Question} from '../../../shared/models/question-model';
import {UtilService} from '../../../core/services/util.service';
import {User} from '../../../shared/models/user-model';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {Skill} from '../../../shared/models/profile-model';
import {MetaService} from '../../../core/services/meta.service';

@Component({
  selector: 'tech-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionViewComponent implements OnInit, OnChanges {

  @ViewChild('richTextEditor')
  richTextEditor: ElementRef;

  @Input()
  question: Question;

  @Output()
  onQuestionActionTriggered = new EventEmitter<any>();

  questionContent = {
    action: '',
    questionId: '',
    commentId: '',
    replyId: '',
    content: '',
    notification: false
  };

  editorContent: string;

  contentToUpdate: string;
  notification: boolean;

  constructor(public utilService: UtilService,
              public router: Router,
              private metaService: MetaService) {

  }

  ngOnInit() {
    // add meta tag into page header
    this.setMetaData(this.question);
  }

  ngOnChanges(changes: SimpleChanges) {
    // select question using question id
    const question: SimpleChange = changes.question;
    // console.log('prev value: ', question.previousValue);
    // console.log('got name: ', question.currentValue);
    this.question = question.currentValue;
  }

  like() {
    // redirect to login page if the user is not logged in
    if (!this.utilService.isAuthenticated()) {
      this.router.navigate(['/login'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    this.onQuestionActionTriggered.emit({
      action: 'like',
      content: '',
      notification: this.notification
    });

    // reset question content to default state
    this.resetQuestionContent();
  }

  addComment() {

    // redirect to login page if the user is not logged in
    if (!this.utilService.isAuthenticated()) {
      this.router.navigate(['/login'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    // comment content to question content object
    Object.assign(this.questionContent, {
      content: this.editorContent,
      notification: this.notification
    });

    // if the action type is empty then it is for comment
    if (this.questionContent.action === '') {
      Object.assign(this.questionContent, {action: 'comment'});
    }

    this.onQuestionActionTriggered.emit(this.questionContent);
    // reset question content to default state
    this.resetQuestionContent();
  }

  editorContentHandler(value: any) {
    this.editorContent = this.utilService.encodeHtml(value);
  }

  commentActionHandler(value: any) {
    // redirect to login page if the user is not logged in
    if (!this.utilService.isAuthenticated()) {
      this.router.navigate(['/login'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    // scroll to comment editor and set focus on if triggered action is reply
    if (value !== undefined && value.action === 'reply') {
      this.richTextEditor.nativeElement.scrollIntoView();
    }

    // check comment or reply edit action and pass content to editor
    if (value.action === 'comment-edit' || value.action === 'reply-edit') {
      this.richTextEditor.nativeElement.scrollIntoView();
      this.contentToUpdate = value.content;
    }

    // assign comment output to question content object and emit the event if the action is not for comment's reply
    Object.assign(this.questionContent, value);
    this.onQuestionActionTriggered.emit(this.questionContent);
  }

  showSkillsWithHashTag(tags: Skill[]) {
    return tags !== null ? this.utilService.getSkillWithHashTag(tags) : '';
  }

  getUserName(user: User): string {
    return user != null ? this.utilService.getUserName(user) : '';
  }

  resetQuestionContent() {
    this.questionContent = {
      action: '',
      questionId: '',
      commentId: '',
      replyId: '',
      content: '',
      notification: false
    };
  }

  setMetaData(question: Question) {
    if (question) {
      const url = `https://www.tecknocracy.com/question/${question._id}`;
      const publishedOn = question.publishedOn === null ? '' : moment(question.publishedOn, 'YYYYMMDDHHmmss').toString();
      const updatedOn = question.updatedOn === null ? '' : moment(question.updatedOn, 'YYYYMMDDHHmmss').toString();

      this.metaService.setMetaData({
        title: question.title,
        description: question.title,
        URL: url,
        publishedOn: publishedOn,
        updatedOn: updatedOn,
        tags: question.tags
      });

    }
  }
}
