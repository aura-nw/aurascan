import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-terms-popup',
  templateUrl: './terms-popup.component.html',
  styleUrls: ['./terms-popup.component.scss']
})
export class TermsPopupComponent implements OnInit, OnDestroy {
  showPopup = false;
  private readonly TERMS_ACCEPTED_KEY = STORAGE_KEYS.TERMS_ACCEPTED || 'terms_accepted';
  private destroy$ = new Subject<void>();
  private termsAccepted$ = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    // Initialize with current localStorage value
    this.termsAccepted$.next(!!local.getItem<boolean>(this.TERMS_ACCEPTED_KEY));
  }

  ngOnInit(): void {
    // Listen to route changes
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.checkAndShowPopup(event.url);
      });

    // Listen for storage changes from other tabs
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter(event => event.key === this.TERMS_ACCEPTED_KEY),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const newValue = event.newValue === 'true';
        this.termsAccepted$.next(newValue);
        this.checkAndShowPopup(this.router.url);
      });

    // Check initial route
    this.checkAndShowPopup(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.termsAccepted$.complete();
  }

  private checkAndShowPopup(url: string): void {
    // Use cached value from BehaviorSubject
    const termsAccepted = this.termsAccepted$.value;
    // Don't show popup if terms already accepted or if on /terms page
    const isTermsPage = url.includes('/terms');
    this.showPopup = !termsAccepted && !isTermsPage;
  }

  acceptTerms(): void {
    local.setItem(this.TERMS_ACCEPTED_KEY, true);
    this.termsAccepted$.next(true);
    this.showPopup = false;
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
    this.showPopup = false;
  }

  closePopup(): void {
    this.showPopup = false;
  }
}
