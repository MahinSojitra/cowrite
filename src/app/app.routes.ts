import { Routes } from '@angular/router';
import { RedirectComponent } from './shared/components/redirect/redirect.component';

export const routes: Routes = [
  {
    path: '',
    component: RedirectComponent,
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/code-editor/code-editor.component').then(
        (m) => m.CodeEditorComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
