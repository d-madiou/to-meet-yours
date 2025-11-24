export interface Story {
  id: number;
  user_username: string;
  user_photo: string | null;
  story_type: 'image' | 'video' | 'text';
  media_url: string | null;
  text_content: string;
  background_color: string;
  caption: string;
  duration: number;
  view_count: number;
  is_expired: boolean;
  time_remaining: number;
  is_viewed: boolean;
  created_at: string;
  expires_at: string;
}

export interface UserStories {
  user_id: string;
  username: string;
  user_photo: string | null;
  has_unviewed: boolean;
  story_count: number;
  stories: Story[];
}

export interface StoriesResponse {
  count: number;
  results: UserStories[];
}

export interface StoryViewer {
  viewer_username: string;
  viewer_photo: string | null;
  viewed_at: string;
}