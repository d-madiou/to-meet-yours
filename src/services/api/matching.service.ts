import { ENDPOINTS } from '@/src/api.config';
import {
  LikesResponse,
  SwipeAction,
  SwipeResponse
} from '@/src/types/matching.types';
import { apiService } from './api.service';

class MatchingService {
  /**
   * Record a swipe action (like or pass)
   */
  async swipe(action: 'like' | 'pass', targetUserId: string): Promise<SwipeResponse> {
    try {
      const data: SwipeAction = {
        action,
        target_user_uuid: targetUserId,
      };

      const response = await apiService.post<SwipeResponse>(
        ENDPOINTS.MATCHING.GET_DISCOVERY,
        data
      );

      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all likes (sent, received, and mutual matches)
   */
  async getAllLikes(): Promise<LikesResponse> {
    try {
      const response = await apiService.get<LikesResponse>(
        ENDPOINTS.MATCHING.GET_MATCHES
      );
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Accept a received like (respond to someone who liked you)
   */
  async acceptLike(matchId: string): Promise<SwipeResponse> {
    try {
      const response = await apiService.post<SwipeResponse>(
        `/matches/${matchId}/accept/`
      );
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reject a received like
   */
  async rejectLike(matchId: string): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        `/matches/${matchId}/reject/`
      );
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get match count
   */
  async getMatchCount(): Promise<{ total: number; mutual: number; pending: number }> {
    try {
      const response = await apiService.get<{
        total: number;
        mutual: number;
        pending: number;
      }>(ENDPOINTS.MATCHING.GET_MATCH_COUNT);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async blockUser(userId: string, reason?: string): Promise<any> {
  try {
    const response = await apiService.post('/matching/block/', {
      blocked_user_id: userId,
      reason: reason || '',
    });
    return response;
  } catch (error: any) {
    throw this.handleError(error);
  }
}

  private handleError(error: any): Error {
    if (error.response?.data) {
      return new Error(error.response.data.error || 'Matching operation failed');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const matchingService = new MatchingService();