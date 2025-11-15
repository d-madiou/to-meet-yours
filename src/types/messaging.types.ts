export interface Conversation {
  id?: string;           // ADD this - some backends return 'id'
  uuid: string;          // Keep this
  other_user: {
    id?: string;         // ADD this
    uuid: string;        // Keep this
    username: string;
    photo_url: string | null;
  };
  latest_message: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_username: string;
  } | null;
  unread_count: number;
  created_at: string;
  last_message_at: string;
}

export interface Message {
  uuid: string;
  sender: {
    id: string;
    uuid: string;
    username: string;
    photo_url: string | null;
  };
  receiver: {
    id: string;
    uuid: string;
    username: string;
    photo_url: string | null;
  };
  content: string;
  coin_cost: number;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface MessageCostCheck {
  coin_cost: number;
  is_free: boolean;
  free_messages_remaining: number;
  free_messages_limit: number;
}

export interface CoinWallet {
  balance: number;
  total_earned: number;
  total_spent: number;
  total_purchased: number;
}

export interface SendMessageRequest {
  receiver_uuid: string;
  content: string;
}

export interface SendMessageResponse {
  message: string;
  data: Message;
  coin_cost: number;
  was_free: boolean;
}