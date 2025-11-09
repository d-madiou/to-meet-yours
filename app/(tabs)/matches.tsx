import MatchPopup from '@/components/matching/MatchPopup';
import { Colors } from '@/constants/theme';
import { matchingService } from '@/src/services/api/matching.service';
import { Match, ReceivedLike, SentLike } from '@/src/types/matching.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type TabType = 'received' | 'sent' | 'mutual';

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [sentLikes, setSentLikes] = useState<SentLike[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<ReceivedLike[]>([]);
  const [mutualMatches, setMutualMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Match popup state
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  useEffect(() => {
    loadAllLikes();
  }, []);

  const loadAllLikes = async () => {
    try {
      const response = await matchingService.getAllLikes();
      setSentLikes(response.sent_likes);
      setReceivedLikes(response.received_likes);
      setMutualMatches(response.mutual_matches);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllLikes();
    setRefreshing(false);
  };

  const handleAcceptLike = async (like: ReceivedLike) => {
    setProcessingId(like.id);
    try {
      const response = await matchingService.acceptLike(like.id);
      
      if (response.is_mutual_match) {
        // Show match popup
        setMatchedUser(like.liker_user);
        setShowMatchPopup(true);
      }
      
      // Reload likes
      await loadAllLikes();
      setActiveTab('mutual'); // Switch to mutual tab
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectLike = async (like: ReceivedLike) => {
    Alert.alert(
      'Reject Like',
      `Are you sure you want to reject ${like.liker_user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(like.id);
            try {
              await matchingService.rejectLike(like.id);
              await loadAllLikes();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'pending':
      default:
        return Colors.dark.placeholder;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
      default:
        return 'time';
    }
  };

  // Render sent like card
  const renderSentLike = ({ item }: { item: SentLike }) => (
    <View style={styles.matchCard}>
      <View style={styles.photoContainer}>
        {item.liked_user.photo_url ? (
          <Image source={{ uri: item.liked_user.photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Ionicons name="person" size={40} color={Colors.dark.placeholder} />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {item.liked_user.username}
        </Text>
        {item.liked_user.age && (
          <Text style={styles.age}>{item.liked_user.age} years old</Text>
        )}
        {item.liked_user.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.dark.placeholder} />
            <Text style={styles.location} numberOfLines={1}>
              {item.liked_user.city}
            </Text>
          </View>
        )}
        <Text style={styles.matchDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Ionicons name={getStatusIcon(item.status)} size={16} color="#fff" />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  // Render received like card
  const renderReceivedLike = ({ item }: { item: ReceivedLike }) => (
    <View style={styles.matchCard}>
      <View style={styles.photoContainer}>
        {item.liker_user.photo_url ? (
          <Image source={{ uri: item.liker_user.photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Ionicons name="person" size={40} color={Colors.dark.placeholder} />
          </View>
        )}
        {/* Match Score Badge */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.match_score}%</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {item.liker_user.username}
        </Text>
        {item.liker_user.age && (
          <Text style={styles.age}>{item.liker_user.age} years old</Text>
        )}
        {item.liker_user.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.dark.placeholder} />
            <Text style={styles.location} numberOfLines={1}>
              {item.liker_user.city}
            </Text>
          </View>
        )}
        <Text style={styles.likeText}>Liked you!</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={() => handleAcceptLike(item)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="heart" size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleRejectLike(item)}
          disabled={processingId === item.id}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render mutual match card
  const renderMutualMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => {
        Alert.alert(
          item.matched_user.username,
          `Match Score: ${item.match_score}%`,
          [
            {
              text: 'Send Message',
              onPress: () => {
                Alert.alert('Coming Soon', 'Messaging feature');
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }}
    >
      <View style={styles.photoContainer}>
        {item.matched_user.photo_url ? (
          <Image source={{ uri: item.matched_user.photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Ionicons name="person" size={40} color={Colors.dark.placeholder} />
          </View>
        )}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.match_score}%</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {item.matched_user.username}
        </Text>
        {item.matched_user.age && (
          <Text style={styles.age}>{item.matched_user.age} years old</Text>
        )}
        {item.matched_user.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.dark.placeholder} />
            <Text style={styles.location} numberOfLines={1}>
              {item.matched_user.city}
            </Text>
          </View>
        )}
        {item.matched_at && (
          <Text style={styles.matchDate}>
            Matched: {new Date(item.matched_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={24} color={Colors.dark.placeholder} />
    </TouchableOpacity>
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'received':
        return receivedLikes;
      case 'sent':
        return sentLikes;
      case 'mutual':
        return mutualMatches;
      default:
        return [];
    }
  };

  // Empty state
  const renderEmptyState = () => {
    let message = '';
    let subtitle = '';

    switch (activeTab) {
      case 'received':
        message = 'No likes received yet';
        subtitle = 'Keep your profile updated to get more likes!';
        break;
      case 'sent':
        message = 'No likes sent yet';
        subtitle = 'Start swiping to find your match!';
        break;
      case 'mutual':
        message = 'No matches yet';
        subtitle = 'Like someone back to create a match!';
        break;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color={Colors.dark.placeholder} />
        <Text style={styles.emptyTitle}>{message}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.emptyButtonText}>Start Swiping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received ({receivedLikes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent ({sentLikes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'mutual' && styles.activeTab]}
          onPress={() => setActiveTab('mutual')}
        >
          <Text style={[styles.tabText, activeTab === 'mutual' && styles.activeTabText]}>
            Matched ({mutualMatches.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {/* Received Likes List */}
        {activeTab === 'received' && (
          <FlatList
            data={receivedLikes}
            keyExtractor={(item) => item.id}
            renderItem={renderReceivedLike}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.primary}
              />
            }
          />
        )}

        {/* Sent Likes List */}
        {activeTab === 'sent' && (
          <FlatList
            data={sentLikes}
            keyExtractor={(item) => item.id}
            renderItem={renderSentLike}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.primary}
              />
            }
          />
        )}

        {/* Mutual Matches List */}
        {activeTab === 'mutual' && (
          <FlatList
            data={mutualMatches}
            keyExtractor={(item) => item.id}
            renderItem={renderMutualMatch}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.dark.primary}
              />
            }
          />
        )}
      </View>

      {/* Match Popup */}
      <MatchPopup
        visible={showMatchPopup}
        matchedUser={matchedUser || { username: '', photo_url: null }}
        onClose={() => setShowMatchPopup(false)}
        onSendMessage={() => {
          setShowMatchPopup(false);
          Alert.alert('Coming Soon', 'Messaging feature');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.dark.inputBackground,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.dark.primary,
  },
  tabText: {
    fontSize: 13,
    color: Colors.dark.placeholder,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  placeholderPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.dark.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark.inputBackground,
  },
  scoreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  age: {
    fontSize: 13,
    color: Colors.dark.placeholder,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.dark.placeholder,
  },
  matchDate: {
    fontSize: 11,
    color: Colors.dark.placeholder,
    marginTop: 2,
  },
  likeText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.placeholder,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});