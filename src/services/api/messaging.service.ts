import { ENDPOINTS } from '@/src/api.config';
import {
  CoinWallet,
  Conversation,
  Message,
  MessageCostCheck,
  SendMessageRequest,
  SendMessageResponse,
} from '@/src/types/messaging.types';
import { apiService } from './api.service';

class MessagingService {
  /**
   * Get list of conversations
   */
  async getConversations(): Promise<Conversation[]> {
  try {
    console.log('Fetching conversations from:', ENDPOINTS.MESSAGING.LIST_CONVERSATIONS);
    
    const response = await apiService.get<{ results: Conversation[] }>(
      ENDPOINTS.MESSAGING.LIST_CONVERSATIONS
    );
    
    console.log('Conversations response:', response);
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    
    return response.results || [];
  } catch (error: any) {
    console.error('Get conversations error:', error);
    throw this.handleError(error);
  }
}

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationUuid: string): Promise<Message[]> {
    try {
      const response = await apiService.get<{ results: Message[] }>(
        ENDPOINTS.MESSAGING.CONVERSATION_MESSAGES(conversationUuid)
      );
      return response.results || [];
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message
   */
  async sendMessage(receiverUuid: string, content: string): Promise<SendMessageResponse> {
  try {
    console.log('Sending message to:', receiverUuid);
    
    const data: SendMessageRequest = {
      receiver_uuid: receiverUuid,
      content: content.trim(),
    };

    const response = await apiService.post<SendMessageResponse>(
      ENDPOINTS.MESSAGING.SEND_MESSAGE,
      data
    );

    console.log('Send message response:', response);
    
    return response;
  } catch (error: any) {
    console.error('Send message error:', error);
    throw this.handleError(error);
  }
}

  async getConversationWithUser(userUuid: string): Promise<Conversation | null> {
  try {
    const conversations = await this.getConversations();
    
    // Try to find by UUID or ID
    const conversation = conversations.find(conv => {
      const otherUser = conv.other_user;
      return otherUser.uuid === userUuid || 
             otherUser.id === userUuid ||
             otherUser.uuid === String(userUuid) ||
             otherUser.id === String(userUuid);
    });
    
    return conversation || null;
  } catch (error: any) {
    console.error('Get conversation with user error:', error);
    return null;
  }
}

  /**
   * Check message cost before sending
   */
  async checkMessageCost(receiverUuid: string): Promise<MessageCostCheck> {
  try {
    // Validate UUID
    if (!receiverUuid || receiverUuid === 'undefined') {
      throw new Error('Invalid receiver UUID');
    }

    const response = await apiService.get<MessageCostCheck>(
      `${ENDPOINTS.MESSAGING.CHECK_COST}?receiver_uuid=${receiverUuid}`
    );
    return response;
  } catch (error: any) {
    console.error('Check message cost error:', error);
    // Return default values on error
    return {
      coin_cost: 0,
      is_free: true,
      free_messages_remaining: 3,
      free_messages_limit: 3,
    };
  }
}

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationUuid: string): Promise<void> {
    try {
      await apiService.post(ENDPOINTS.MESSAGING.MARK_READ(conversationUuid));
    } catch (error: any) {
      console.error('Mark as read error:', error);
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiService.get<{ unread_count: number }>(
        ENDPOINTS.MESSAGING.UNREAD_COUNT
      );
      return response.unread_count;
    } catch (error: any) {
      return 0;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<CoinWallet> {
    try {
      const response = await apiService.get<CoinWallet>(ENDPOINTS.WALLET.BALANCE);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.message) {
        return new Error(errorData.message);
      }
      if (typeof errorData === 'string') {
        return new Error(errorData);
      }
      return new Error('Messaging operation failed');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const messagingService = new MessagingService();