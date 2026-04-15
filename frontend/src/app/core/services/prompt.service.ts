import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prompt, Tag } from '../../shared/models/models';

export interface CreatePromptDto {
  title: string; content: string; complexity: number; tags: string[];
}

@Injectable({ providedIn: 'root' })
export class PromptService {
  private base = `${environment.apiUrl}/prompts`;
  constructor(private http: HttpClient) {}

  getAll(tag?: string): Observable<Prompt[]> {
    let params = new HttpParams();
    if (tag) params = params.set('tag', tag);
    return this.http.get<Prompt[]>(`${this.base}/`, { params });
  }

  getOne(id: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.base}/${id}/`);
  }

  create(dto: CreatePromptDto): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.base}/`, dto);
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.base}/tags/`);
  }
}
