import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromptService } from '../../../core/services/prompt.service';
import { Prompt, Tag } from '../../../shared/models/models';

@Component({
  selector: 'app-prompt-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './prompt-list.component.html',
})
export class PromptListComponent implements OnInit {
  prompts: Prompt[] = [];
  tags: Tag[] = [];
  selectedTag = '';
  loading = true;
  error = '';

  constructor(private promptService: PromptService) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadPrompts();
  }

  loadTags(): void {
    this.promptService.getTags().subscribe({ next: t => (this.tags = t) });
  }

  loadPrompts(): void {
    this.loading = true;
    this.error = '';
    this.promptService.getAll(this.selectedTag || undefined).subscribe({
      next: p => { this.prompts = p; this.loading = false; },
      error: () => { this.error = 'Failed to load prompts.'; this.loading = false; },
    });
  }

  onTagFilter(tag: string): void {
    this.selectedTag = this.selectedTag === tag ? '' : tag;
    this.loadPrompts();
  }

  complexityLabel(n: number): string {
    if (n <= 3) return 'low';
    if (n <= 6) return 'medium';
    return 'high';
  }

  trackById(_: number, p: Prompt) { return p.id; }
}
