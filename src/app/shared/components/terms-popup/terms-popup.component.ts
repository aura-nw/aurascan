import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-terms-popup',
  templateUrl: './terms-popup.component.html',
  styleUrls: ['./terms-popup.component.scss']
})
export class TermsPopupComponent implements OnInit {
  showPopup = false;
  private readonly TERMS_ACCEPTED_KEY = STORAGE_KEYS.TERMS_ACCEPTED || 'terms_accepted';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user has already accepted terms
    const termsAccepted = local.getItem<boolean>(this.TERMS_ACCEPTED_KEY);
    
    // Listen to route changes
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkAndShowPopup(event.url, termsAccepted);
      });

    // Check initial route
    this.checkAndShowPopup(this.router.url, termsAccepted);
  }

  private checkAndShowPopup(url: string, termsAccepted: boolean): void {
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
