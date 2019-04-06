import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Blog} from '../../shared/models/blog-model';
import {UtilService} from '../services/util.service';
import {Skill} from '../../shared/models/profile-model';
import {MetaService} from '../services/meta.service';

@Component({
  selector: 'tech-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  @Input()
  blogs: Blog[];
  @Input()
  searching = false;
  @Input()
  error = '';

  constructor(private utilService: UtilService, public metaService: MetaService) {

  }

  ngOnInit() {
    // if (this.blogs.length > 0) {
      this.setMetaData(this.blogs);
    // }
  }

  showSkillsWithHashTag(skills: Skill[]) {
    return this.utilService.getSkillWithHashTag(skills);
  }

  setMetaData(blogs: Blog[]) {
    const description = `Showing ${blogs.length} blogs.`;
    const title = 'Home';

    this.metaService.setMetaData({description, title});
  }
}
