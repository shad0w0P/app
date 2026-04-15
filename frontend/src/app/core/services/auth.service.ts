import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN = 'pl_token';
  private USER  = 'pl_user';
  private _loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this._loggedIn$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get username(): string { return localStorage.getItem(this.USER) ?? ''; }
  get token(): string    { return localStorage.getItem(this.TOKEN) ?? ''; }
  hasToken(): boolean    { return !!localStorage.getItem(this.TOKEN); }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login/`, { username, password })
      .pipe(tap(r => this._store(r)));
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/`, { username, password })
      .pipe(tap(r => this._store(r)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN);
    localStorage.removeItem(this.USER);
    this._loggedIn$.next(false);
    this.router.navigate(['/auth/login']);
  }

  private _store(r: AuthResponse): void {
    localStorage.setItem(this.TOKEN, r.token);
    localStorage.setItem(this.USER, r.username);
    this._loggedIn$.next(true);
  }
}
