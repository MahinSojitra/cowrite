import { TestBed } from '@angular/core/testing';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
  let service: UndoRedoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UndoRedoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should start with no undo/redo capability', () => {
      expect(service.canUndo()).toBeFalse();
      expect(service.canRedo()).toBeFalse();
      expect(service.getCurrentState()).toBe('');
    });

    it('should initialize with a state', () => {
      const initialState = 'initial content';
      service.initialize(initialState);
      
      expect(service.getCurrentState()).toBe(initialState);
      expect(service.canUndo()).toBeFalse();
      expect(service.canRedo()).toBeFalse();
    });
  });

  describe('recordChange', () => {
    it('should record the first change', () => {
      service.recordChange('first change');
      expect(service.getCurrentState()).toBe('first change');
      expect(service.canUndo()).toBeFalse(); // No previous state to undo to
    });

    it('should record subsequent changes and enable undo', () => {
      service.recordChange('first change');
      service.recordChange('second change');
      
      expect(service.getCurrentState()).toBe('second change');
      expect(service.canUndo()).toBeTrue();
      expect(service.canRedo()).toBeFalse();
    });

    it('should not record identical consecutive states', () => {
      service.recordChange('same content');
      service.recordChange('same content');
      
      expect(service.getUndoStackSize()).toBe(0);
      expect(service.canUndo()).toBeFalse();
    });

    it('should clear redo stack when new change is recorded', () => {
      service.recordChange('state 1');
      service.recordChange('state 2');
      service.undo(); // This puts 'state 2' in redo stack
      
      expect(service.canRedo()).toBeTrue();
      
      service.recordChange('state 3'); // This should clear redo stack
      
      expect(service.canRedo()).toBeFalse();
      expect(service.getRedoStackSize()).toBe(0);
    });
  });

  describe('undo functionality', () => {
    it('should return null when no undo is possible', () => {
      const result = service.undo();
      expect(result).toBeNull();
    });

    it('should undo to previous state', () => {
      service.recordChange('state 1');
      service.recordChange('state 2');
      
      const undoResult = service.undo();
      
      expect(undoResult).toBe('state 1');
      expect(service.getCurrentState()).toBe('state 1');
      expect(service.canRedo()).toBeTrue();
    });

    it('should handle multiple undos', () => {
      service.recordChange('state 1');
      service.recordChange('state 2');
      service.recordChange('state 3');
      
      expect(service.undo()).toBe('state 2');
      expect(service.undo()).toBe('state 1');
      expect(service.canUndo()).toBeFalse();
      
      const noMoreUndo = service.undo();
      expect(noMoreUndo).toBeNull();
    });
  });

  describe('redo functionality', () => {
    it('should return null when no redo is possible', () => {
      const result = service.redo();
      expect(result).toBeNull();
    });

    it('should redo previously undone change', () => {
      service.recordChange('state 1');
      service.recordChange('state 2');
      service.undo();
      
      const redoResult = service.redo();
      
      expect(redoResult).toBe('state 2');
      expect(service.getCurrentState()).toBe('state 2');
      expect(service.canRedo()).toBeFalse();
    });

    it('should handle multiple redos', () => {
      service.recordChange('state 1');
      service.recordChange('state 2');
      service.recordChange('state 3');
      
      service.undo(); // Now at state 2
      service.undo(); // Now at state 1
      
      expect(service.redo()).toBe('state 2');
      expect(service.redo()).toBe('state 3');
      expect(service.canRedo()).toBeFalse();
      
      const noMoreRedo = service.redo();
      expect(noMoreRedo).toBeNull();
    });
  });

  describe('combined undo/redo operations', () => {
    it('should handle complex undo/redo sequence', () => {
      service.recordChange('A');
      service.recordChange('B');
      service.recordChange('C');
      
      // Undo twice
      expect(service.undo()).toBe('B');
      expect(service.undo()).toBe('A');
      
      // Redo once
      expect(service.redo()).toBe('B');
      
      // Add new change (should clear redo stack)
      service.recordChange('D');
      expect(service.canRedo()).toBeFalse();
      expect(service.getCurrentState()).toBe('D');
      
      // Should be able to undo to B
      expect(service.undo()).toBe('B');
      expect(service.undo()).toBe('A');
    });
  });

  describe('observables', () => {
    it('should emit can undo/redo changes', (done) => {
      let canUndoEmissions: boolean[] = [];
      let canRedoEmissions: boolean[] = [];
      
      service.canUndo$.subscribe(canUndo => canUndoEmissions.push(canUndo));
      service.canRedo$.subscribe(canRedo => canRedoEmissions.push(canRedo));
      
      // Initial state should be false for both
      expect(canUndoEmissions[0]).toBeFalse();
      expect(canRedoEmissions[0]).toBeFalse();
      
      // Add first change - still no undo capability
      service.recordChange('state 1');
      
      setTimeout(() => {
        // Add second change - now we can undo
        service.recordChange('state 2');
        
        setTimeout(() => {
          expect(canUndoEmissions).toContain(true);
          expect(canRedoEmissions.every(val => val === false)).toBeTrue();
          
          // Undo - now we can redo
          service.undo();
          
          setTimeout(() => {
            expect(canRedoEmissions).toContain(true);
            done();
          }, 10);
        }, 10);
      }, 10);
    });
  });

  describe('clear functionality', () => {
    it('should clear all history and reset state', () => {
      service.initialize('initial');
      service.recordChange('state 1');
      service.recordChange('state 2');
      service.undo();
      
      expect(service.canUndo()).toBeTrue();
      expect(service.canRedo()).toBeTrue();
      
      service.clear();
      
      expect(service.canUndo()).toBeFalse();
      expect(service.canRedo()).toBeFalse();
      expect(service.getCurrentState()).toBe('');
      expect(service.getUndoStackSize()).toBe(0);
      expect(service.getRedoStackSize()).toBe(0);
    });
  });

  describe('history size limits', () => {
    it('should limit undo stack size', () => {
      // Record more than maxHistorySize changes
      for (let i = 0; i < 55; i++) {
        service.recordChange(`state ${i}`);
      }
      
      // Should not exceed the limit (50)
      expect(service.getUndoStackSize()).toBeLessThanOrEqual(50);
      expect(service.getCurrentState()).toBe('state 54');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string states', () => {
      service.initialize('');
      service.recordChange('non-empty');
      service.recordChange('');
      
      expect(service.getCurrentState()).toBe('');
      expect(service.canUndo()).toBeTrue();
      
      expect(service.undo()).toBe('non-empty');
      expect(service.undo()).toBe('');
    });

    it('should handle whitespace-only changes', () => {
      service.initialize('');
      service.recordChange(' ');
      service.recordChange('  ');
      service.recordChange('\t');
      
      expect(service.getCurrentState()).toBe('\t');
      expect(service.canUndo()).toBeTrue();
      
      expect(service.undo()).toBe('  ');
      expect(service.undo()).toBe(' ');
      expect(service.undo()).toBe('');
    });
  });
});