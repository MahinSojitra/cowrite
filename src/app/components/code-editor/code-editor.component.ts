import {
  Component,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../../core/services/socket.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FancyDatePipe } from '../../core/pipes/fancy-date.pipe';
import { NavComponent } from '../../shared/components/nav/nav.component';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [FormsModule, CommonModule, FancyDatePipe, NavComponent],
  templateUrl: './code-editor.component.html',
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  code = '';
  sessionId = 'new';
  lastModified: Date | null = null;
  private syncSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.routeSubscription = this.route.paramMap.subscribe((params) => {
        const newSessionId = params.get('id') || 'new';
        if (newSessionId !== this.sessionId) {
          this.sessionId = newSessionId;
          this.socketService.connect(environment.webSocketUrl);
          this.socketService.joinRoom(this.sessionId);

          this.syncSubscription?.unsubscribe();
          this.syncSubscription = this.socketService
            .onSync()
            .subscribe((data) => {
              if (data.content !== this.code) {
                this.code = data.content;
                this.lastModified = data.lastModified;
              }
            });
        }
      });
    }
  }

  onCodeChange(): void {
    this.socketService.syncContent(this.code);
  }

  ngOnDestroy(): void {
    this.syncSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.socketService.disconnect();
  }
}
