import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  loading = false;
  serverError = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  get f() { return this.form.controls; }

  toggle() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.serverError = '';
    this.form.reset();
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';
    const { username, password } = this.form.value;
    const call$ = this.mode === 'login'
      ? this.auth.login(username!, password!)
      : this.auth.register(username!, password!);

    call$.subscribe({
      next: () => this.router.navigate(['/prompts']),
      error: (err) => {
        this.serverError = err?.error?.error || 'Something went wrong.';
        this.loading = false;
      },
    });
  }
}
