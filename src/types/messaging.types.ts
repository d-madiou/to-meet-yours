export interface BaseUser {
  id?: string;
  uuid: string;
  username: string;
  photo_url: string | null;
}

export interface Conversation {
  id?: string;           // ADD this - some backends return 'id'
  uuid: string;          // Keep this
  other_user: BaseUser;  // Reusing BaseUser type
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
  delivered: any;
  uuid: string;
  sender: BaseUser;      // Reusing BaseUser type
  receiver: BaseUser;    // Reusing BaseUser type
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
  total_messages_sent_today?: number;  
  paid_messages_sent_today?: number; 
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
  // NOTE: message_cost_check should be a property, not a method, typically.
  // The original implementation was: message_cost_check(message_cost_check: any): unknown;
  // I am assuming the property name used in the service file is `message_cost_check` and it returns the object:
  message_cost_check: MessageCostCheck; 
  message: string;
  data: Message;
  coin_cost: number;
  was_free: boolean;
}