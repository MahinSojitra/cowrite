import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user has a saved theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkTheme.next(savedTheme === 'dark');
        this.applyTheme(savedTheme === 'dark');
      }
    }
  }

  toggleTheme() {
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    this.applyTheme(newTheme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
  }

  private applyTheme(isDark: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('dark-theme', isDark);
    }
  }
}
