import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SelectOption} from '../portfolio/portfolio.component';
import {MediaMatcher} from '@angular/cdk/layout';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {Observable, Subscription} from 'rxjs';
import {User} from '../../../../shared/models/user-model';
import {map, startWith} from 'rxjs/operators';
import {JsonLoadService} from '../../../../core/services/json-load.service';

@Component({
  selector: 'tech-employment',
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmploymentComponent implements OnInit, OnDestroy {

  company = new FormControl('', [Validators.minLength(3)]);
  designation = new FormControl();
  industry = new FormControl();
  role = new FormControl();
  fromDate = new FormControl();
  toDate = new FormControl();
  achievement = new FormControl();
  currentEmployer = new FormControl();

  employmentForm = new FormGroup({
    companyName: this.company,
    designation: this.designation,
    industry: this.industry,
    role: this.role,
    fromDate: this.fromDate,
    toDate: this.toDate,
    achievement: this.achievement,
    currentEmployer: this.currentEmployer
  });

  @Input()
  user: User;
  @Input()
  loading: boolean;
  @Input()
  loaded: boolean;
  @Input()
  error: any;
  @Output()
  onProfileActionTriggered = new EventEmitter<any>();


  /*designations: SelectOption[] = [
    {label: 'Software Engineer', value: 'Software Engineer'},
    {label: 'Sr. Software Engineer', value: 'Sr. Software Engineer'}
  ];*/

  industries: SelectOption[] = [
    {label: 'IT/Computer Software', value: 'IT/Computer Software'},
    {label: 'IT/Computer Hardware', value: 'IT/Computer Hardware'}
  ];

  roles: SelectOption[] = [
    {label: 'Software Programmer', value: 'Software Programmer'},
    {label: 'Software Support', value: 'Software Support'}
  ];

  action: string;
  editable = false;

  employments: Employment[] = [];

  companies: Company[] = [];
  filteredCompanies: Observable<Company[]>;

  designations: Designation[] = [];
  filteredDesignations: Observable<Designation[]>;

  // grid responsive settings
  breakpoint: number;
  mobileQuery: MediaQueryList;
  isMobileView = false;
  subscriptionMedia: Subscription;
  private _mobileQueryListener: () => void;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              public mediaObserver: MediaObserver,
              private jsonService: JsonLoadService) {
    // mobile device detection
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.isMobileView = (this.mediaObserver.isActive('xs') || this.mediaObserver.isActive('sm'));
    this.subscriptionMedia = this.mediaObserver.media$.subscribe((change: MediaChange) => {
      this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
      if (change.mqAlias === 'xs' || change.mqAlias === 'sm') {
        this.breakpoint = this.isMobileView ? 1 : 2;
      }
    });
    this.breakpoint = this.isMobileView ? 1 : 2;

    // populate form with values
    // this.populateFormValues();

    // load companies data from json file
    this.jsonService.loadCompanies()
      .subscribe(companies => {
        this.companies = companies;
      });

    // filter companies
   this.filteredCompanies = this.company.valueChanges
      .pipe(
        startWith(''),
        map(company => company ? this._filterCompanies(company) : this.companies.slice(0, 5))
      );

   // load designations data from json file
    this.jsonService.loadDesignations()
      .subscribe(designations => {
        this.designations = designations;
      });

    // filter designation
     this.filteredDesignations = this.designation.valueChanges
       .pipe(
         startWith(''),
         map(designation => designation ? this._filterDesignations(designation) : this.designations.slice(0, 5))
       );
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 414) ? 1 : 2;
  }

  showForm(employment?: Employment) {
    this.editable = true;
    // if the user click on edit option then populate the form with data
    if (employment) {
      this.company.setValue(employment.company);
      this.designation.setValue(employment.designation);
      this.industry.setValue(employment.industry);
      this.role.setValue(employment.role);
      this.fromDate.setValue(employment.fromDate);
      this.toDate.setValue(employment.toDate);
      this.achievement.setValue(employment.achievement);
    } else {
      this.clear();
    }
  }

  hideForm() {
    this.editable = false;
  }

  addMore() {
    this.employments.push({
      company: this.company.value,
      designation: this.designation.value,
      industry: this.industry.value,
      role: this.role.value,
      fromDate: this.fromDate.value,
      toDate: this.toDate.value,
      achievement: this.achievement.value,
      currentEmployer: this.currentEmployer.value || false
    });
    this.clear();
  }

  save() {
    this.action = 'save';

    if (this.company.value !== '') {
      this.addMore();
    }

    this.onProfileActionTriggered.emit({
      action: 'employment',
      employments: this.employments
    });

    // clear the employments array
    this.employments.length = 0;
  }

  clear() {
    this.company.setValue('');
    this.designation.setValue('');
    this.industry.setValue('');
    this.role.setValue('');
    this.fromDate.setValue('');
    this.toDate.setValue('');
    this.achievement.setValue('');
  }

  enableActionButton(): boolean {
    return !this.company.valid || !this.company.dirty;
  }

  showSuccessMessage(): string {
    if (this.loaded && this.action === 'save') {
      return 'Your employment details has been saved.';
    }
  }

  getCompanyNameErrorMessage() {
    return this.company.hasError('minlength') ? 'Your company name must be at least 3 character long' : '';
  }

  private _filterCompanies(value: string): Company[] {
    const filterValue = value.toLowerCase();
    return this.companies.filter(company => company.name.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterDesignations(value: string): Designation[] {
    const filterValue = value.toLowerCase();
    return this.designations.filter(designations => designations.name.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnDestroy() {
    this.changeDetectorRef.detach();
    this.subscriptionMedia.unsubscribe();
  }

 }

export interface SelectOption {
  label: string;
  value: string;
}

export interface Employment {
  company: string;
  designation: string;
  industry: string;
  role: string;
  fromDate: Date;
  toDate: Date;
  achievement: string;
  currentEmployer: boolean;
}

export interface Company {
  name: string;
}
export interface Designation {
  name: string;
}
