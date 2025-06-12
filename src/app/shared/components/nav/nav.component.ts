import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  @Input() code!: string;
  isCopied = false;
  isDarkTheme$;
  isAnimating = false;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  copyToClipboard(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    });
  }

  toggleTheme(): void {
    this.isAnimating = true;
    this.themeService.toggleTheme();
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }
}
