import {
  Component,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../../core/services/socket.service';
import { UndoRedoService } from '../../core/services/undo-redo.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FancyDatePipe } from '../../core/pipes/fancy-date.pipe';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CopyButtonComponent } from '../../shared/components/copy-button/copy-button.component';
import { DownloadButtonComponent } from '../../shared/components/download-button/download-button.component';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    FancyDatePipe,
    NavComponent,
    FooterComponent,
    CopyButtonComponent,
    DownloadButtonComponent,
  ],
  templateUrl: './code-editor.component.html',
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  code = '';
  sessionId = 'new';
  lastModified: Date | null = null;

  isSyncing = false;
  isSaving = false;

  // Undo/Redo state
  canUndo = false;
  canRedo = false;

  private saveTimeout?: any;
  private undoRedoTimeout?: any;
  private syncSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private canUndoSubscription?: Subscription;
  private canRedoSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private undoRedoService: UndoRedoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Initialize undo/redo service
    this.undoRedoService.initialize(this.code);

    // Subscribe to undo/redo capabilities
    this.canUndoSubscription = this.undoRedoService.canUndo$.subscribe(
      canUndo => this.canUndo = canUndo
    );
    this.canRedoSubscription = this.undoRedoService.canRedo$.subscribe(
      canRedo => this.canRedo = canRedo
    );

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const newSessionId = params.get('id') || 'new';

      if (newSessionId !== this.sessionId) {
        this.sessionId = newSessionId;
        this.isSyncing = true;

        this.socketService.connect(environment.webSocketUrl);
        this.socketService.joinRoom(this.sessionId);

        // Set a timeout to stop syncing if connection fails
        setTimeout(() => {
          if (this.isSyncing) {
            console.log('Socket connection timeout, continuing without sync');
            this.isSyncing = false;
            this.undoRedoService.initialize(this.code);
          }
        }, 5000);

        this.syncSubscription?.unsubscribe();
        this.syncSubscription = this.socketService
          .onSync()
          .subscribe((data) => {
            this.code = data.content;
            this.lastModified = new Date(data.lastModified);

            // Initialize undo/redo with the synced content
            this.undoRedoService.initialize(this.code);

            this.isSyncing = false;
          });
      }
    });
  }

  onCodeChange(): void {
    this.lastModified = new Date();
    this.isSaving = true;

    // Clear existing timeout to debounce undo/redo recording
    clearTimeout(this.undoRedoTimeout);
    this.undoRedoTimeout = setTimeout(() => {
      this.undoRedoService.recordChange(this.code);
    }, 1000); // Record undo state after 1 second of no changes

    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.socketService.syncContent(this.code);
      this.isSaving = false;
    }, 500);
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        this.redo();
      }
    }
  }

  undo(): void {
    const previousState = this.undoRedoService.undo();
    if (previousState !== null) {
      this.code = previousState;
      this.onCodeChange();
    }
  }

  redo(): void {
    const nextState = this.undoRedoService.redo();
    if (nextState !== null) {
      this.code = nextState;
      this.onCodeChange();
    }
  }

  ngOnDestroy(): void {
    this.syncSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.canUndoSubscription?.unsubscribe();
    this.canRedoSubscription?.unsubscribe();
    this.socketService.disconnect();
    clearTimeout(this.saveTimeout);
    clearTimeout(this.undoRedoTimeout);
  }
}
