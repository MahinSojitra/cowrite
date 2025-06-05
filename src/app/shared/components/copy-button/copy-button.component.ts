import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-copy-button',
  imports: [],
  templateUrl: './copy-button.component.html',
  styleUrl: './copy-button.component.scss',
})
export class CopyButtonComponent {
  @Input() textToCopy = '';
  @Input() isLoading: boolean = false;

  icon = 'bi-clipboard';
  text = 'Copy';

  copy(): void {
    navigator.clipboard
      .writeText(this.textToCopy)
      .then(() => {
        this.icon = 'bi-clipboard-check-fill animate-bounce';
        this.text = 'Copied!';
        setTimeout(() => {
          this.icon = 'bi-clipboard';
          this.text = 'Copy';
        }, 2000);
      })
      .catch(console.error);
  }
}
