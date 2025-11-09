export interface SwipeAction {
  action: 'like' | 'pass';
  target_user_uuid: string;
}

export interface SwipeResponse {
  message: string;
  is_mutual_match: boolean;
  match?: {
    id: string;
    matched_user: {
      id: string;
      username: string;
      age: number | null;
      city: string;
      photo_url: string | null;
    };
    match_score: number;
    matched_at: string;
  };
}

export interface Match {
  id: string;
  matched_user: {
    id: string;
    username: string;
    age: number | null;
    city: string;
    country: string;
    photo_url: string | null;
  };
  match_score: number;
  is_mutual: boolean;
  status: 'pending' | 'matched' | 'rejected';  // NEW
  matched_at: string | null;
  created_at: string;
}

export interface MatchListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Match[];
}

// NEW: Separate types for sent and received likes
export interface SentLike {
  id: string;
  liked_user: {
    id: string;
    username: string;
    age: number | null;
    city: string;
    photo_url: string | null;
  };
  status: 'pending' | 'matched' | 'rejected';
  created_at: string;
}

export interface ReceivedLike {
  id: string;
  liker_user: {
    id: string;
    username: string;
    age: number | null;
    city: string;
    photo_url: string | null;
  };
  match_score: number;
  created_at: string;
}

export interface LikesResponse {
  sent_likes: SentLike[];
  received_likes: ReceivedLike[];
  mutual_matches: Match[];
}