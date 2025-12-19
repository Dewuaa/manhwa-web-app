export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          chapters_read: number;
          level: number;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          chapters_read?: number;
          level?: number;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          chapters_read?: number;
          level?: number;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          manhwa_id: string;
          chapter_id: string | null;
          content: string;
          parent_id: string | null;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          manhwa_id: string;
          chapter_id?: string | null;
          content: string;
          parent_id?: string | null;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          manhwa_id?: string;
          chapter_id?: string | null;
          content?: string;
          parent_id?: string | null;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          user_id: string;
          comment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          comment_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          comment_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentLike = Database['public']['Tables']['comment_likes']['Row'];

export interface CommentWithProfile extends Comment {
  profiles: Profile | null;
  replies?: CommentWithProfile[];
  liked_by_user?: boolean;
}
