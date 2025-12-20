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

// Cloud Sync Types
export interface UserBookmark {
  id: string;
  user_id: string;
  manhwa_id: string;
  title: string;
  image: string | null;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingProgressDB {
  id: string;
  user_id: string;
  manhwa_id: string;
  manhwa_title: string;
  manhwa_image: string | null;
  last_chapter_id: string;
  last_chapter_title: string | null;
  chapters_read: string[];
  chapter_progress: Record<string, number>;
  total_chapters: number | null;
  provider: string;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncMetadata {
  id: string;
  user_id: string;
  last_bookmarks_sync: string | null;
  last_progress_sync: string | null;
  device_id: string | null;
  created_at: string;
  updated_at: string;
}

// Local storage compatible types
export interface LocalBookmark {
  id: string;
  title: string;
  image: string;
  addedAt: number;
}

export interface LocalReadingHistory {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
  lastChapterId: string;
  lastChapterTitle: string;
  timestamp: number;
  chaptersRead: string[];
  chapterProgress: Record<string, number>;
  totalChapters?: number;
}

// Custom Lists Types
export interface CustomList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  user_id: string;
  manhwa_id: string;
  title: string;
  image: string | null;
  notes: string | null;
  sort_order: number;
  added_at: string;
}

// Local versions of list types
export interface LocalList {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface LocalListItem {
  id: string;
  listId: string;
  manhwaId: string;
  title: string;
  image?: string;
  notes?: string;
  sortOrder?: number;
  addedAt: number;
}

// Default list configurations
export const DEFAULT_LISTS = [
  { name: 'Reading', description: 'Currently reading', icon: 'book-open', color: 'blue' },
  {
    name: 'Plan to Read',
    description: 'Want to read later',
    icon: 'clock',
    color: 'purple',
  },
  {
    name: 'Completed',
    description: 'Finished reading',
    icon: 'check-circle',
    color: 'green',
  },
  {
    name: 'On Hold',
    description: 'Paused for now',
    icon: 'pause-circle',
    color: 'yellow',
  },
  { name: 'Dropped', description: 'Stopped reading', icon: 'x-circle', color: 'red' },
  { name: 'Favorites', description: 'My favorite series', icon: 'heart', color: 'pink' },
] as const;
