import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PromptService } from '../../../core/services/prompt.service';
import { Tag } from '../../../shared/models/models';

function complexityRange(ctrl: AbstractControl) {
  const v = Number(ctrl.value);
  return v >= 1 && v <= 10 ? null : { range: true };
}

@Component({
  selector: 'app-prompt-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './prompt-form.component.html',
})
export class PromptFormComponent implements OnInit {
  availableTags: Tag[] = [];
  selectedTags: string[] = [];
  loading = false;
  serverError = '';

  form = this.fb.group({
    title:      ['', [Validators.required, Validators.minLength(3)]],
    content:    ['', [Validators.required, Validators.minLength(20)]],
    complexity: [5,  [Validators.required, complexityRange]],
    newTag:     [''],
  });

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.promptService.getTags().subscribe({ next: t => (this.availableTags = t) });
  }

  get f() { return this.form.controls; }

  /** Safe getter — avoids "possibly null" in templates */
  get complexityValue(): number {
    return Number(this.form.get('complexity')?.value ?? 5);
  }

  get complexityClass(): string {
    const v = this.complexityValue;
    if (v <= 3) return 'badge-low';
    if (v <= 6) return 'badge-medium';
    return 'badge-high';
  }

  toggleTag(name: string): void {
    const i = this.selectedTags.indexOf(name);
    i === -1 ? this.selectedTags.push(name) : this.selectedTags.splice(i, 1);
  }

  addCustomTag(): void {
    const raw = (this.form.value.newTag ?? '').trim().toLowerCase();
    if (raw && !this.selectedTags.includes(raw)) this.selectedTags.push(raw);
    this.form.patchValue({ newTag: '' });
  }

  removeTag(name: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== name);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';
    const { title, content, complexity } = this.form.value;
    this.promptService.create({
      title: title!,
      content: content!,
      complexity: Number(complexity),
      tags: this.selectedTags,
    }).subscribe({
      next: p => this.router.navigate(['/prompts', p.id]),
      error: err => {
        const e = err?.error;
        this.serverError = e?.error || Object.values(e?.errors ?? {}).join(' ') || 'Failed to create prompt.';
        this.loading = false;
      },
    });
  }
}
