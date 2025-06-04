import { Routes } from '@angular/router';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { generateSessionId } from './core/utils/session.utils';

export const routes: Routes = [
  {
    path: '',
    redirectTo: generateSessionId(),
    pathMatch: 'full',
  },
  {
    path: ':id',
    component: CodeEditorComponent,
  },
  {
    path: '**',
    redirectTo: generateSessionId(),
  },
];
