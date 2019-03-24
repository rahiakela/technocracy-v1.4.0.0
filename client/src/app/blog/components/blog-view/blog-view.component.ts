import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output, SimpleChange, SimpleChanges,
  ViewChild
} from '@angular/core';
import {Blog} from '../../../shared/models/blog-model';
import {UtilService} from '../../../core/services/util.service';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {MetaService} from '../../../core/services/meta.service';

@Component({
  selector: 'tech-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogViewComponent implements OnInit, OnChanges {

  @ViewChild('richTextEditor')
  richTextEditor: ElementRef;

  @Input()
  blog: Blog;

  @Output()
  onBlogActionTriggered = new EventEmitter<any>();

  blogContent = {
    action: '',
    blogId: '',
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
    this.setMetaData(this.blog);
  }

  ngOnChanges(changes: SimpleChanges) {
    // select blog using blog id
    const blog: SimpleChange = changes.blog;
    // console.log('prev value: ', blog.previousValue);
    // console.log('got name: ', blog.currentValue);
    this.blog = blog.currentValue;
  }

  like() {
    // redirect to login page if the user is not logged in
    if (!this.utilService.isAuthenticated()) {
      this.router.navigate(['/login'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    this.onBlogActionTriggered.emit({
      action: 'like',
      content: '',
      notification: this.notification
    });

    // reset blog content to default state
    this.resetBlogContent();
  }

  addComment() {

    // redirect to login page if the user is not logged in
    if (!this.utilService.isAuthenticated()) {
      this.router.navigate(['/login'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    // comment content to blog content object
    Object.assign(this.blogContent, {
      content: this.editorContent,
      notification: this.notification
    });

    // if the action type is empty then it is for comment
    if (this.blogContent.action === '') {
      Object.assign(this.blogContent, {action: 'comment'});
    }

    this.onBlogActionTriggered.emit(this.blogContent);
    // reset blog content to default state
    this.resetBlogContent();
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

    // assign comment output to blog content object and emit the event if the action is not for comment's reply
    Object.assign(this.blogContent, value);
    this.onBlogActionTriggered.emit(this.blogContent);
  }

  resetBlogContent() {
    this.blogContent = {
      action: '',
      blogId: '',
      commentId: '',
      replyId: '',
      content: '',
      notification: false
    };
  }

  formatDate(submitDate: Date) {
    return moment(submitDate).format('LLL');
  }

  setMetaData(blog: Blog) {
    if (blog) {
      const URL = `https://www.tecknocracy.com/blog/${blog._id}`;
      const publishedOn = blog.publishedOn === null ? '' : moment(blog.publishedOn, 'YYYYMMDDHHmmss').toString();
      const updatedOn = blog.updatedOn === null ? '' : moment(blog.updatedOn, 'YYYYMMDDHHmmss').toString();

      this.metaService.setMetaData({
        title: blog.title,
        description: blog.description,
        image: blog.image,
        URL: URL,
        publishedOn: publishedOn,
        updatedOn: updatedOn,
        tags: blog.tags
      });
    }
  }
}
