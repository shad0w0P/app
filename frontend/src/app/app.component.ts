import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <a routerLink="/prompts" class="nav-brand">
        <span class="brand-icon">⚡</span> Prompt Library
      </a>
      <div class="nav-links">
        <a routerLink="/prompts" class="nav-link">Browse</a>
        <ng-container *ngIf="auth.loggedIn$ | async; else loggedOut">
          <a routerLink="/prompts/new" class="nav-link btn-primary">+ New Prompt</a>
          <span class="nav-user">{{ auth.username }}</span>
          <button class="nav-link btn-ghost" (click)="auth.logout()">Logout</button>
        </ng-container>
        <ng-template #loggedOut>
          <a routerLink="/auth/login" class="nav-link btn-primary">Login</a>
        </ng-template>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
