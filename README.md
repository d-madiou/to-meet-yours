
### MATCHING SYSTEM - VISUAL GUIDE & QUICK REFERENCE

┌─────────────────────────────────────────────────────────────────────────┐
│                     MATCHING SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND (React Native)          BACKEND (Django)
─────────────────────            ────────────────

┌─────────────────┐             ┌──────────────────┐
│  Feed Screen    │             │  FeedViewSet     │
│  (Swipe UI)     │────────────▶│  /api/feed/list/ │
└─────────────────┘             └──────────────────┘
        │                                 │
        │ User taps ❤️/❌                 │
        ▼                                 ▼
┌─────────────────┐             ┌──────────────────┐
│ matchingService │             │  DiscoveryView   │
│  .swipe()       │────────────▶│  /api/discovery/ │
└─────────────────┘             │  swipe/          │
        │                        └──────────────────┘
        │                                 │
        │ Is Mutual?                      │
        ▼                                 ▼
┌─────────────────┐             ┌──────────────────┐
│  Match Popup    │◀────────────│  Creates Match   │
│  "It's a Match!"│             │  if mutual       │
└─────────────────┘             └──────────────────┘
        │                                 │
        │ View Matches                    │
        ▼                                 ▼
┌─────────────────┐             ┌──────────────────┐
│ Matches Screen  │             │  MatchViewSet    │
│  (List View)    │◀────────────│  /api/matches/   │
└─────────────────┘             └──────────────────┘
*/


// ============================================================================
// FILE STRUCTURE - WHAT GOES WHERE
// ============================================================================

/*
📁 NEW FILES (Create These):
────────────────────────────

src/types/matching.types.ts
├─ SwipeAction              → Type for like/pass action
├─ SwipeResponse            → Response from swipe API
├─ Match                    → Match object with user info
└─ MatchListResponse        → Paginated match list

src/services/matching.service.ts
├─ swipe()                  → Send like/pass to backend
├─ getMatches()             → Fetch match list
└─ getMatchCount()          → Get total matches

app/(tabs)/matches.tsx
├─ MatchesScreen            → Main matches list screen
├─ Load matches on mount
├─ Show match cards
└─ Handle pull to refresh

components/matching/MatchPopup.tsx
├─ Modal popup component
├─ Shows "It's a Match!"
├─ Display matched user
└─ Actions: Message or Keep Swiping


📝 FILES TO UPDATE (Modify These):
───────────────────────────────────

screens/FeedScreen.tsx
├─ ADD: Import matchingService
├─ ADD: State for swiped users
├─ UPDATE: handleLike() to call API
├─ UPDATE: handlePass() to call API
└─ ADD: MatchPopup component

components/feed/FeedCard.tsx
├─ ADD: isProcessing prop
└─ UPDATE: Disable buttons when processing

app/(tabs)/_layout.tsx
└─ ADD: Matches tab configuration
*/


// ==============================================
// DATA FLOW - STEP BY STEP
// ==============================================

/*
SCENARIO 1: USER LIKES A PROFILE
═════════════════════════════════

Step 1: User Action
┌──────────────────────┐
│ User taps ❤️ button  │
│ on Profile Card      │
└──────────┬───────────┘
           │
           ▼
Step 2: Frontend Updates
┌──────────────────────┐
│ Add to swipedUsers   │
│ Set isProcessing     │
└──────────┬───────────┘
           │
           ▼
Step 3: API Call
┌──────────────────────┐
│ matchingService      │
│  .swipe('like',      │
│   user.id)           │
└──────────┬───────────┘
           │
           ▼
Step 4: Backend Processing
┌──────────────────────┐
│ Create SwipeAction   │
│ Check if mutual      │
│ Create Match if yes  │
└──────────┬───────────┘
           │
           ▼
Step 5: Response
┌──────────────────────┐
│ Return:              │
│ - is_mutual_match    │
│ - match data         │
└──────────┬───────────┘
           │
           ▼
Step 6: UI Update
┌──────────────────────┐
│ If mutual:           │
│  → Show popup        │
│ Else:                │
│  → Move to next      │
└──────────────────────┘


SCENARIO 2: VIEWING MATCHES
════════════════════════════

Step 1: Navigate to Matches Tab
┌──────────────────────┐
│ User taps Matches    │
│ tab                  │
└──────────┬───────────┘
           │
           ▼
Step 2: Load Data
┌──────────────────────┐
│ useEffect triggers   │
│ loadMatches()        │
└──────────┬───────────┘
           │
           ▼
Step 3: API Call
┌──────────────────────┐
│ matchingService      │
│  .getMatches(true)   │
└──────────┬───────────┘
           │
           ▼
Step 4: Backend Query
┌──────────────────────┐
│ Filter mutual        │
│ matches for user     │
│ Include user data    │
└──────────┬───────────┘
           │
           ▼
Step 5: Render List
┌──────────────────────┐
│ FlatList renders     │
│ match cards          │
│ Show photos, info    │
└──────────────────────┘
*/


// ============================================
// API ENDPOINTS QUICK REFERENCE
// ============================================

/*
┌────────────────────────────────────────────────────────────────────┐
│ ENDPOINT                    │ METHOD │ PURPOSE                     │
├────────────────────────────────────────────────────────────────────┤
│ /api/feed/list/             │ GET    │ Get users to swipe on       │
│ /api/discovery/swipe/       │ POST   │ Record like/pass action     │
│ /api/matches/               │ GET    │ Get list of matches         │
│ /api/matches/count/         │ GET    │ Get match counts            │
└────────────────────────────────────────────────────────────────────┘

REQUEST EXAMPLES:
─────────────────

1. Swipe Like:
POST /api/discovery/swipe/
{
  "action": "like",
  "target_user_id": "uuid-here"
}

Response (No Match):
{
  "message": "Successfully liked profile",
  "is_mutual_match": false
}

Response (Mutual Match):
{
  "message": "Successfully liked profile",
  "is_mutual_match": true,
  "match": {
    "id": "match-uuid",
    "matched_user": {
      "id": "user-uuid",
      "username": "john_doe",
      "age": 28,
      "city": "Conakry",
      "photo_url": "http://..."
    },
    "match_score": 85,
    "matched_at": "2024-01-15T10:30:00Z"
  }
}


2. Get Matches:
GET /api/matches/?only_mutual=true

Response:
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "match-uuid",
      "matched_user": {...},
      "match_score": 85,
      "is_mutual": true,
      "matched_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T09:15:00Z"
    },
    ...
  ]
}


3. Get Match Count:
GET /api/matches/count/

Response:
{
  "total": 10,
  "mutual": 5
}
*/


// ============================================
// STATE MANAGEMENT - WHAT STATE TO TRACK
// =============================================

/*
FEED SCREEN STATE:
──────────────────
*/
const [users, setUsers] = useState<FeedUser[]>([]);              // All feed users
const [loading, setLoading] = useState(true);                    // Initial load
const [refreshing, setRefreshing] = useState(false);             // Pull refresh
const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set()); // Already swiped
const [currentIndex, setCurrentIndex] = useState(0);             // Current position
const [isProcessing, setIsProcessing] = useState(false);         // During swipe
const [showMatchPopup, setShowMatchPopup] = useState(false);     // Match popup
const [matchedUser, setMatchedUser] = useState<any>(null);       // Matched user data

/*
MATCHES SCREEN STATE:
─────────────────────
*/
const [matches, setMatches] = useState<Match[]>([]);             // Match list
const [loading, setLoading] = useState(true);                    // Initial load
const [refreshing, setRefreshing] = useState(false);             // Pull refresh
const [matchCount, setMatchCount] = useState({                   // Match counts
  total: 0,
  mutual: 0
});


// ============================================================================
// COMPONENT PROPS - WHAT DATA FLOWS WHERE
// ============================================================================

/*
FeedCard Props:
───────────────
*/
interface FeedCardProps {
  user: FeedUser;                    // User data to display
  onLike?: () => void;               // Like button handler
  onPass?: () => void;               // Pass button handler
  onMessage?: () => void;            // Message button (future)
  onProfile?: () => void;            // View profile (future)
  isProcessing?: boolean;            // Disable during API call
}

/*
MatchPopup Props:
─────────────────
*/
interface MatchPopupProps {
  visible: boolean;                           // Show/hide modal
  matchedUser: {                              // User info
    username: string;
    photo_url: string | null;
  };
  onClose: () => void;                        // Close button
  onSendMessage: () => void;                  // Send message button
}


// ============================================================================
// ERROR HANDLING STRATEGY
// ============================================================================

/*
1. Network Errors:
──────────────────
*/
try {
  await matchingService.swipe('like', userId);
} catch (error: any) {
  // Revert UI state
  setSwipedUsers(prev => {
    const newSet = new Set(prev);
    newSet.delete(userId);
    return newSet;
  });
  // Show user-friendly message
  Alert.alert('Connection Error', 'Please check your internet connection');
}

/*
2. API Errors:
──────────────
*/
// Service layer handles error parsing
private handleError(error: any): Error {
  if (error.response?.data?.error) {
    return new Error(error.response.data.error);
  }
  return new Error('Something went wrong');
}

/*
3. Optimistic Updates:
──────────────────────
*/
// Update UI immediately
setSwipedUsers(prev => new Set([...prev, userId]));

// Make API call
const response = await matchingService.swipe('like', userId);

// If fails, revert UI
// (handled in catch block)


// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

/*
1. Use Set for O(1) lookups:
────────────────────────────
*/
const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());

// Fast check:
if (swipedUsers.has(userId)) {
  // Already swiped
}

/*
2. Filter users efficiently:
────────────────────────────
*/
const availableUsers = users.filter(u => !swipedUsers.has(u.id));

/*
3. Disable buttons during processing:
──────────────────────────────────────
*/
<TouchableOpacity
  disabled={isProcessing}
  onPress={handleLike}
>

/*
4. FlatList for large lists:
────────────────────────────
*/
<FlatList
  data={matches}
  renderItem={renderMatch}
  // Only renders visible items
/>

/*
5. Image caching:
─────────────────
*/
// React Native automatically caches images
<Image source={{ uri: photoUrl }} />


// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
□ Like Action
  ├─ User disappears from feed
  ├─ API call succeeds
  ├─ SwipeAction saved in DB
  └─ Next user appears

□ Pass Action
  ├─ User disappears from feed
  ├─ API call succeeds
  ├─ SwipeAction saved with action='pass'
  └─ Next user appears

□ Mutual Match
  ├─ Popup appears
  ├─ Shows correct user info
  ├─ Can close popup
  ├─ Can send message (shows alert)
  └─ Match appears in Matches tab

□ Matches Screen
  ├─ Loads on tab click
  ├─ Shows mutual matches only
  ├─ Displays match score
  ├─ Shows user photos/info
  ├─ Pull to refresh works
  └─ Empty state when no matches

□ Error Handling
  ├─ Network error shows alert
  ├─ UI reverts on error
  ├─ Buttons disabled during processing
  └─ User can retry

□ Edge Cases
  ├─ No internet connection
  ├─ User deletes account
  ├─ Run out of users to swipe
  └─ Rapid button tapping
*/


// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/*
BEFORE DEPLOYING:
─────────────────
□ Test on iOS simulator
□ Test on Android emulator
□ Test on physical device
□ Test with slow network
□ Test offline behavior
□ Verify all animations smooth
□ Check memory usage
□ Test with 100+ matches
□ Verify images load correctly
□ Test pull to refresh
□ Check error messages
□ Verify navigation flow
□ Test match popup
□ Verify API calls work
□ Check loading states

PRODUCTION CONSIDERATIONS:
──────────────────────────
□ Add analytics tracking
□ Add error logging (Sentry)
□ Implement retry logic
□ Add offline queue
□ Optimize images
□ Add loading skeletons
□ Implement pagination
□ Add search functionality
□ Add filters
□ Implement notifications
*/