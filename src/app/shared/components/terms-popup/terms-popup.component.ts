import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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

  constructor(private router: Router) {}

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

    // Check initial route
    this.checkAndShowPopup(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  private checkAndShowPopup(url: string): void {
    // Always check the latest value from localStorage
    const termsAccepted = local.getItem<boolean>(this.TERMS_ACCEPTED_KEY);
    // Don't show popup if terms already accepted or if on /terms page
    const isTermsPage = url.includes('/terms');
    this.showPopup = !termsAccepted && !isTermsPage;
  }

  acceptTerms(): void {
    local.setItem(this.TERMS_ACCEPTED_KEY, true);
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
