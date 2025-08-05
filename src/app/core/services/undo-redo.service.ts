import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UndoRedoState {
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {
  private readonly maxHistorySize = 50;
  private undoStack: UndoRedoState[] = [];
  private redoStack: UndoRedoState[] = [];
  private currentState: string | null = null; // null means uninitialized

  private canUndoSubject = new BehaviorSubject<boolean>(false);
  private canRedoSubject = new BehaviorSubject<boolean>(false);

  // Observable streams for components to subscribe to
  public canUndo$: Observable<boolean> = this.canUndoSubject.asObservable();
  public canRedo$: Observable<boolean> = this.canRedoSubject.asObservable();

  /**
   * Record a new state change
   * @param state The current state to record
   */
  recordChange(state: string): void {
    // Don't record if the state hasn't actually changed
    if (state === this.currentState) {
      return;
    }

    // Save current state to undo stack (if we have been initialized)
    if (this.currentState !== null) {
      const stateToSave: UndoRedoState = {
        content: this.currentState,
        timestamp: new Date()
      };

      this.undoStack.push(stateToSave);

      // Limit history size to prevent memory issues
      if (this.undoStack.length > this.maxHistorySize) {
        this.undoStack.shift();
      }
    }

    // Update current state
    this.currentState = state;

    // Clear redo stack since we're creating a new branch
    this.redoStack = [];

    this.updateCanUndoRedo();
  }

  /**
   * Undo the last change
   * @returns The previous state, or null if no undo is possible
   */
  undo(): string | null {
    if (this.undoStack.length === 0) {
      return null;
    }

    // Save current state to redo stack
    const currentStateToSave: UndoRedoState = {
      content: this.currentState!,
      timestamp: new Date()
    };
    this.redoStack.push(currentStateToSave);

    // Get previous state from undo stack
    const previousState = this.undoStack.pop()!;
    this.currentState = previousState.content;

    this.updateCanUndoRedo();
    return this.currentState;
  }

  /**
   * Redo the last undone change
   * @returns The next state, or null if no redo is possible
   */
  redo(): string | null {
    if (this.redoStack.length === 0) {
      return null;
    }

    // Save current state back to undo stack
    const currentStateToSave: UndoRedoState = {
      content: this.currentState!,
      timestamp: new Date()
    };
    this.undoStack.push(currentStateToSave);

    // Get next state from redo stack
    const nextState = this.redoStack.pop()!;
    this.currentState = nextState.content;

    this.updateCanUndoRedo();
    return this.currentState;
  }

  /**
   * Get the current state
   */
  getCurrentState(): string {
    return this.currentState || '';
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
    this.updateCanUndoRedo();
  }

  /**
   * Initialize the service with an initial state
   * @param initialState The initial state to start with
   */
  initialize(initialState: string): void {
    this.clear();
    this.currentState = initialState;
    this.updateCanUndoRedo();
  }

  /**
   * Get the size of the undo stack
   */
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Get the size of the redo stack
   */
  getRedoStackSize(): number {
    return this.redoStack.length;
  }

  private updateCanUndoRedo(): void {
    this.canUndoSubject.next(this.canUndo());
    this.canRedoSubject.next(this.canRedo());
  }
}