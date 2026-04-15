import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PromptService } from '../../../core/services/prompt.service';
import { Prompt } from '../../../shared/models/models';

@Component({
  selector: 'app-prompt-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './prompt-detail.component.html',
})
export class PromptDetailComponent implements OnInit {
  prompt: Prompt | null = null;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private promptService: PromptService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.promptService.getOne(id).subscribe({
      next: p => { this.prompt = p; this.loading = false; },
      error: () => { this.error = 'Prompt not found.'; this.loading = false; },
    });
  }

  complexityLabel(n: number): string {
    if (n <= 3) return 'low';
    if (n <= 6) return 'medium';
    return 'high';
  }

  get complexityBar(): number[] {
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }

  copyContent(): void {
    if (this.prompt) {
      navigator.clipboard.writeText(this.prompt.content);
    }
  }
}
