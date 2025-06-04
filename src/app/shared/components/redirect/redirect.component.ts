import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  template: '',
})
export class RedirectComponent {
  constructor(private router: Router) {
    const newId = this.generateSessionId(16);
    this.router.navigateByUrl(`/${newId}`);
  }

  private generateSessionId(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(
      { length: length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }
}
