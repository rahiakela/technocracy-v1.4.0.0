import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ShareComponent} from './share/share.component';
import {ShareModule} from '@ngx-share/core';
import {HttpClientModule} from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {SafeHtmlPipe} from './pipe/html-sanitizer';
import {FromNowPipe} from './pipe/from-now.pipe';
import {CommentsComponent, ConfirmationDialog} from './comments/comments.component';
import { UserIconComponent } from './user-icon/user-icon.component';
import {EditorComponent} from './rich-text-editor/editor.component';
import {QuillModule} from 'ngx-quill';
import {SharedMaterial} from './shared-material.module';
import {AdSenseComponent} from './ad-sense/ad-sense.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ShareModule, // ref: https://github.com/MurhafSousli/ngx-sharebuttons/wiki/Share-Button-Directive
    FontAwesomeModule,
    QuillModule,
    SharedMaterial
  ],
  declarations: [
    ShareComponent,
    SafeHtmlPipe,
    FromNowPipe,
    CommentsComponent,
    UserIconComponent,
    EditorComponent,
    ConfirmationDialog,
    AdSenseComponent
  ],
  exports: [
    ShareComponent,
    SafeHtmlPipe,
    FromNowPipe,
    CommentsComponent,
    UserIconComponent,
    EditorComponent,
    AdSenseComponent
  ],
  entryComponents: [ConfirmationDialog]
})
export class SharedModule { }
