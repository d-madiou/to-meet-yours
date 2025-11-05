import { FeedResponse } from "@/src/types/feed.types";
import { apiService } from "./api.service";

class FeedService {
  /**
   * Get feed of potential matches
   */
  async getFeed(limit: number = 20): Promise<FeedResponse> {
    try {
      const response = await apiService.get<FeedResponse>(
        `/feed/?limit=${limit}`
      );
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      return new Error(error.response.data.message || 'Failed to load feed');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const feedService = new FeedService();
