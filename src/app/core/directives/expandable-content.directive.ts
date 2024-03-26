import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appExpandable], appExpandable',
})
export class ExpandableContentDirective implements OnChanges {
  @Input() appExpandable: string;
  @Input() maxCharVisible: number = 100;

  private actionButton: HTMLElement;

  isMore = false;
  suffixText = '...';

  constructor(
    private elRef: ElementRef<HTMLElement>,
    private rendder2: Renderer2,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updateContent();
  }

  updateContent() {
    if (this.appExpandable?.length > this.maxCharVisible) {
      const text = this.isMore
        ? this.appExpandable
        : this.appExpandable.slice(0, this.maxCharVisible) + this.suffixText;

      this.elRef.nativeElement.innerHTML = text;

      const button = this.getButton();
      this.elRef.nativeElement.append(button);
    }
  }

  updateButton() {
    this.isMore = !this.isMore;
    this.updateContent();

    if (this.isMore) {
      this.actionButton.classList.add('expanded');
      this.actionButton.textContent = 'See Less';
    } else {
      this.actionButton.textContent = 'See More';
      this.actionButton.classList.remove('expanded');
    }
  }

  getButton() {
    if (this.actionButton) {
      return this.actionButton;
    }

    const button: HTMLElement = this.rendder2.createElement('span');
    button.classList.add('expandable-button');
    button.textContent = this.isMore ? 'See Less' : 'See More';
    button.onclick = this.updateButton.bind(this);

    this.actionButton = button;

    return this.actionButton;
  }
}
