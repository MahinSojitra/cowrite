import { Routes } from '@angular/router';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { RedirectComponent } from './shared/components/redirect/redirect.component';

export const routes: Routes = [
  {
    path: '',
    component: RedirectComponent,
  },
  {
    path: ':id',
    component: CodeEditorComponent,
  },
  {
    path: '**',
    component: RedirectComponent,
  },
];
