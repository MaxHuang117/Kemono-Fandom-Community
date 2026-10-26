// max-hub/src/app/admin/news/components/lib/types/comment.ts
export interface Comment {
  id: string;
  message: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string | null;
  news_id?: number | null;
}