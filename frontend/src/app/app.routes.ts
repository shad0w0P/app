import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'prompts', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'prompts',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/prompts/list/prompt-list.component').then(m => m.PromptListComponent),
      },
      {
        path: 'new',
        canActivate: [authGuard],
        loadComponent: () => import('./features/prompts/form/prompt-form.component').then(m => m.PromptFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/prompts/detail/prompt-detail.component').then(m => m.PromptDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'prompts' },
];
