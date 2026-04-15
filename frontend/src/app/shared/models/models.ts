export interface Tag { id: number; name: string; }

export interface Prompt {
  id: number;
  title: string;
  content: string;
  complexity: number;
  tags: Tag[];
  created_at: string;
  view_count?: number;
}

export interface AuthResponse { token: string; username: string; }
