import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {MediaMatcher} from '@angular/cdk/layout';
import {Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import * as RootStoreState from '../../../root-store/root-state';
import { AuthSelectors } from '../../../root-store/auth-store';
import {AuthActions} from '../../../root-store/auth-store';
import {BlogActions} from '../../../root-store/blog-store';
import {User} from '../../../shared/models/user-model';
import {Router} from '@angular/router';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CookieService} from 'ngx-cookie';

@Component({
  selector: 'tech-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  user$: Observable<User>;

  authenticatedUser: User;

  mobileQuery: MediaQueryList;

  isMobileView = false;
  subscriptionMedia: Subscription;

  width;
  height;
  mode = 'side';
  open = 'true';

  private _mobileQueryListener: () => void;

  constructor(iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              private changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              private store$: Store<RootStoreState.State>,
              public dialog: MatDialog,
              private cookieService: CookieService,
              public router: Router,
              public mediaObserver: MediaObserver) {
    iconRegistry.addSvgIcon(
      'technocracy',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/technocracy.svg')
    );

    // mobile device detection
    this.mobileQuery = media.matchMedia('(max-width: 200px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    // fetch logged in user from store
    this.user$ = this.store$.pipe(select(AuthSelectors.selectAuthenticatedUser));

    // ref: https://github.com/angular/material2/issues/1130
    // https://github.com/angular/flex-layout/wiki/ObservableMedia
    // Subscribe to the 'MediaChange' to responsively change the boolean that will control the state of the sidenav
    this.isMobileView = (this.mediaObserver.isActive('xs') || this.mediaObserver.isActive('sm'));
    this.subscriptionMedia = this.mediaObserver.media$.subscribe((change: MediaChange) => {
      this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
      console.log(this.isMobileView);
    });

    this.user$.subscribe(user => this.authenticatedUser = user);

    // open subscription dialog after 30 seconds if the visiting user's info is not present into cookies
    setTimeout(() => {
      const userCookies = this.cookieService.get('TECH_U_SUB');
      if (!userCookies) {
        this.openDialog();
      }
    }, 30000);
  }

  search(query: string) {
    this.store$.dispatch(new BlogActions.SearchBlog({query}));
    // if the user searching blog then forward him/her to home page
    this.router.navigate(['/home']);
  }

  signOut(event) {
    this.store$.dispatch(new AuthActions.SignOut({user: null, authenticated: false}));
    this.router.navigate(['/home']);
  }

  clearUserCache() {
    localStorage.removeItem('user');
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.subscriptionMedia.unsubscribe();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(email => {
      if (email) {
        // dispatch subscribe action by passing payload
        this.store$.dispatch(new AuthActions.SubscribeEmailNotification({email: email}));
        // set the visiting user's info into cookies with 2 days expiry date
        const expireDate: Date = new Date();
        this.cookieService.put('TECH_U_SUB', email, {
          expires: expireDate.setDate(expireDate.getDate() + 2).toString()
        });
      }
    });
  }
}

@Component({
  selector: 'tech-subscription-dialog',
  templateUrl: '../../subscription/popup/subscription-dialog.html',
  styleUrls: ['../../subscription/popup/subscription-dialog.scss']
})
export class SubscriptionDialogComponent {

  email = new FormControl('', [Validators.required, Validators.email]);
  subscribeForm = new FormGroup({email: this.email});

  constructor(public dialogRef: MatDialogRef<SubscriptionDialogComponent>) {}

  getEmailErrorMessage() {
    return this.email.hasError('required') ? 'Please provide your email id' :
      this.email.hasError('email') ? 'Email id must contain @ character' :
        '';
  }

}
