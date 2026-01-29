# Requirements Document: Scoring System & Social Features

## Introduction

FretPro will implement a comprehensive scoring system that rewards accuracy, speed, and consistency. This system will enable competitive social features including leaderboards, friend challenges, and achievement tracking. The scoring system must be fair, motivating, and encourage skill improvement.

## Glossary

- **FretPro System**: The guitar practice application
- **User**: A person using FretPro to practice guitar
- **Practice Session**: A timed period where the user responds to practice commands
- **Practice Command**: An instruction to play a specific note on a specific string and fret
- **Response Time**: The duration between command issuance and note detection
- **Accuracy Score**: A measure of pitch correctness (cents deviation from target)
- **Speed Bonus**: Additional points awarded for fast, accurate responses
- **Streak**: Consecutive correct responses without errors
- **Session Score**: Total points earned during a single practice session
- **Leaderboard**: A ranked list of users based on various metrics
- **Friend**: Another user connected through the social system
- **Challenge**: A competitive practice session between users
- **Achievement**: A milestone or goal unlocked through practice

---

## Requirements

### Requirement 1: Basic Scoring System

**User Story:** As a user, I want to earn points for correct notes, so that I can track my improvement and feel motivated to practice.

#### Acceptance Criteria

1. WHEN a user plays a note correctly THEN the FretPro System SHALL award base points based on accuracy
2. WHEN a user plays a note within 5 cents of target pitch THEN the FretPro System SHALL award 100 base points
3. WHEN a user plays a note within 6-10 cents of target pitch THEN the FretPro System SHALL award 75 base points
4. WHEN a user plays a note within 11-20 cents of target pitch THEN the FretPro System SHALL award 50 base points
5. WHEN a user plays a note more than 20 cents off target THEN the FretPro System SHALL award 0 points

### Requirement 2: Speed Bonus System

**User Story:** As a user, I want to earn bonus points for playing notes quickly, so that I can improve my reaction time and fretboard knowledge.

#### Acceptance Criteria

1. WHEN a user responds within 2 seconds of command issuance THEN the FretPro System SHALL apply a 2x speed multiplier
2. WHEN a user responds within 2-4 seconds of command issuance THEN the FretPro System SHALL apply a 1.5x speed multiplier
3. WHEN a user responds within 4-6 seconds of command issuance THEN the FretPro System SHALL apply a 1x speed multiplier
4. WHEN a user responds after 6 seconds of command issuance THEN the FretPro System SHALL apply a 0.5x speed multiplier
5. WHEN calculating final points THEN the FretPro System SHALL multiply base points by the speed multiplier

### Requirement 3: Streak System

**User Story:** As a user, I want to build streaks of correct notes, so that I can earn bonus points and stay focused during practice.

#### Acceptance Criteria

1. WHEN a user plays a correct note THEN the FretPro System SHALL increment the current streak counter
2. WHEN a user plays an incorrect note THEN the FretPro System SHALL reset the streak counter to zero
3. WHEN a user achieves a streak of 5 correct notes THEN the FretPro System SHALL award a 500 point streak bonus
4. WHEN a user achieves a streak of 10 correct notes THEN the FretPro System SHALL award a 1500 point streak bonus
5. WHEN a user achieves a streak of 25 correct notes THEN the FretPro System SHALL award a 5000 point streak bonus
6. WHEN a user achieves a streak of 50 correct notes THEN the FretPro System SHALL award a 15000 point streak bonus

### Requirement 4: Session Statistics

**User Story:** As a user, I want to see detailed statistics after each practice session, so that I can understand my performance and identify areas for improvement.

#### Acceptance Criteria

1. WHEN a practice session ends THEN the FretPro System SHALL display total points earned
2. WHEN a practice session ends THEN the FretPro System SHALL display total commands attempted
3. WHEN a practice session ends THEN the FretPro System SHALL display accuracy percentage
4. WHEN a practice session ends THEN the FretPro System SHALL display average response time
5. WHEN a practice session ends THEN the FretPro System SHALL display longest streak achieved
6. WHEN a practice session ends THEN the FretPro System SHALL display breakdown of points by category (base, speed bonus, streak bonus)

### Requirement 5: Historical Performance Tracking

**User Story:** As a user, I want to view my practice history over time, so that I can see my progress and stay motivated.

#### Acceptance Criteria

1. WHEN a practice session completes THEN the FretPro System SHALL persist session data to the user's profile
2. WHEN a user views their profile THEN the FretPro System SHALL display total lifetime points
3. WHEN a user views their profile THEN the FretPro System SHALL display total practice time
4. WHEN a user views their profile THEN the FretPro System SHALL display average session score over the last 7 days
5. WHEN a user views their profile THEN the FretPro System SHALL display a graph of daily practice scores for the last 30 days

### Requirement 6: Leaderboard System

**User Story:** As a user, I want to see how I rank against other players, so that I can compete and stay motivated.

#### Acceptance Criteria

1. WHEN a user views the leaderboard THEN the FretPro System SHALL display the top 100 users by total lifetime points
2. WHEN a user views the leaderboard THEN the FretPro System SHALL display the top 100 users by highest single session score
3. WHEN a user views the leaderboard THEN the FretPro System SHALL display the top 100 users by longest streak
4. WHEN a user views the leaderboard THEN the FretPro System SHALL display the user's current rank
5. WHEN a user views the leaderboard THEN the FretPro System SHALL update rankings in real-time as sessions complete
6. WHEN displaying leaderboard entries THEN the FretPro System SHALL show username, rank, score, and profile picture

### Requirement 7: Friend System

**User Story:** As a user, I want to add friends and see their scores, so that I can compete with people I know.

#### Acceptance Criteria

1. WHEN a user searches for another user by username THEN the FretPro System SHALL display matching user profiles
2. WHEN a user sends a friend request THEN the FretPro System SHALL notify the recipient
3. WHEN a user accepts a friend request THEN the FretPro System SHALL add both users to each other's friend list
4. WHEN a user views their friends list THEN the FretPro System SHALL display each friend's recent scores and activity
5. WHEN a user views a friend's profile THEN the FretPro System SHALL display that friend's statistics and achievements

### Requirement 8: Challenge System

**User Story:** As a user, I want to challenge friends to practice sessions, so that we can compete directly and make practice more fun.

#### Acceptance Criteria

1. WHEN a user creates a challenge THEN the FretPro System SHALL allow selection of challenge type (timed, fixed commands, specific difficulty)
2. WHEN a user sends a challenge to a friend THEN the FretPro System SHALL notify the friend
3. WHEN both users complete the challenge THEN the FretPro System SHALL compare scores and declare a winner
4. WHEN a challenge completes THEN the FretPro System SHALL display both users' scores side-by-side
5. WHEN a challenge completes THEN the FretPro System SHALL update win/loss records for both users

### Requirement 9: Achievement System

**User Story:** As a user, I want to unlock achievements for reaching milestones, so that I have long-term goals to work toward.

#### Acceptance Criteria

1. WHEN a user reaches 1000 total points THEN the FretPro System SHALL unlock the "Getting Started" achievement
2. WHEN a user reaches 10000 total points THEN the FretPro System SHALL unlock the "Dedicated Learner" achievement
3. WHEN a user achieves a 25-note streak THEN the FretPro System SHALL unlock the "Streak Master" achievement
4. WHEN a user completes 100 practice sessions THEN the FretPro System SHALL unlock the "Century Club" achievement
5. WHEN a user achieves 100% accuracy in a 20+ command session THEN the FretPro System SHALL unlock the "Perfect Practice" achievement
6. WHEN an achievement is unlocked THEN the FretPro System SHALL display a celebration animation and notification

### Requirement 10: Data Persistence and Sync

**User Story:** As a user, I want my scores and progress to sync across devices, so that I can practice anywhere and maintain my progress.

#### Acceptance Criteria

1. WHEN a practice session completes THEN the FretPro System SHALL upload session data to the cloud backend
2. WHEN a user logs in on a new device THEN the FretPro System SHALL download and restore all historical data
3. WHEN network connectivity is unavailable THEN the FretPro System SHALL queue session data for upload when connection is restored
4. WHEN data conflicts occur THEN the FretPro System SHALL merge data using the most recent timestamp
5. WHEN syncing data THEN the FretPro System SHALL encrypt all user data in transit and at rest

---

## Future Considerations

### Phase 4 Enhancements (Not Required Yet)

- **Practice Modes:** Different scoring rules for different practice modes (speed drills, accuracy focus, sight reading)
- **Tournaments:** Scheduled competitive events with prizes
- **Guilds/Teams:** Group-based competition and collaboration
- **Coaching:** Ability for advanced users to mentor beginners
- **Custom Challenges:** User-created challenge templates
- **Video Replays:** Record and share practice sessions
- **AI Difficulty Adjustment:** Automatically adjust command difficulty based on performance

---

## Technical Notes

### Scoring Formula

```
Final Points = (Base Points × Speed Multiplier) + Streak Bonus

Where:
- Base Points: 0-100 based on pitch accuracy
- Speed Multiplier: 0.5x - 2x based on response time
- Streak Bonus: 0, 500, 1500, 5000, or 15000 based on streak milestone
```

### Data Storage Requirements

- Session data must be stored locally and synced to cloud
- Leaderboards must update in near real-time (< 5 second delay)
- Historical data must be retained indefinitely
- User privacy settings must allow opting out of leaderboards

### Performance Requirements

- Score calculation must complete within 100ms
- Leaderboard queries must return within 500ms
- Friend list must load within 1 second
- Achievement checks must not impact practice session performance

---

## Dependencies

- **Phase 2 (Pitch Detection):** Required for accurate scoring
- **Phase 3 (Authentication):** Required for user accounts and social features
- **Backend API:** Required for data persistence and leaderboards
- **Push Notifications:** Required for friend requests and challenges

---

## Success Metrics

- 70%+ of users engage with leaderboards weekly
- Average session length increases by 30% after social features launch
- 50%+ of users add at least one friend
- 40%+ of users complete at least one challenge
- User retention increases by 25% after scoring system launch
