import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { UserService } from 'src/app/core/services/user.service';
import { clearLocalData } from 'src/app/global/global';
import { EnvironmentService } from '../../../core/data-services/environment.service';

@Component({
  selector: 'app-authenticate-mail',
  templateUrl: './authenticate-mail.component.html',
  styleUrls: ['./authenticate-mail.component.scss'],
})
export class AuthenticateMailComponent implements OnDestroy {
  @ViewChild('offcanvasWallet') offcanvasWallet: ElementRef;
  @ViewChild('buttonDismiss') buttonDismiss: ElementRef<HTMLButtonElement>;
  @ViewChild('connectButton') connectButton: ElementRef<HTMLButtonElement>;

  chainId = this.envService.chainId;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
    tap((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    }),
  );

  destroy$ = new Subject<void>();

  userEmail = null;
  isMobileMatched = false;

  constructor(
    private envService: EnvironmentService,
    private layout: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.userEmail = user?.email;
    });
  }

  ngOnDestroy(): void {
    document.removeAllListeners('hide.bs.offcanvas');
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(): void {
    this.buttonDismiss.nativeElement.click();
  }

  disconnect(): void {
    // remove current fcm token
    this.notificationsService.deleteToken(this.notificationsService.currentFcmToken).subscribe(
      (res) => {},
      () => (this.notificationsService.currentFcmToken = null),
      () => (this.notificationsService.currentFcmToken = null),
    );

    // logout Google
    this.userEmail = null;
    clearLocalData();

    // check is screen profile
    if (this.route.snapshot['_routerState']?.url === '/profile') {
      this.router.navigate(['/']);
    }

    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  linkLogin() {
    this.router.navigate(['login']);
    if (this.router.navigated) {
      this.router.onSameUrlNavigation = 'reload';
    }
  }
}
