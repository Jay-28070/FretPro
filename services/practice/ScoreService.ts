/**
 * Score Service
 * 
 * Manages high scores for practice games.
 * Tracks personal bests and enables competitive features with friends.
 */

import { db } from '@/config/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

export type GameType = 'ear-training' | 'note-recognition';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameScore {
  userId: string;
  gameType: GameType;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timestamp: Date;
}

export interface HighScore {
  gameType: GameType;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  date: Date;
}

class ScoreService {
  /**
   * Save a game score and check if it's a new high score
   */
  async saveScore(
    userId: string,
    gameType: GameType,
    difficulty: Difficulty,
    score: number,
    totalQuestions: number
  ): Promise<{ isNewHighScore: boolean; previousBest: number }> {
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Get current high score
    const currentHighScore = await this.getHighScore(userId, gameType, difficulty);
    const isNewHighScore = !currentHighScore || score > currentHighScore.score;

    // Save the game session
    const gameScore: GameScore = {
      userId,
      gameType,
      difficulty,
      score,
      totalQuestions,
      accuracy,
      timestamp: new Date(),
    };

    await addDoc(collection(db, 'gameScores'), gameScore);

    // Update high score if needed
    if (isNewHighScore) {
      const highScoreRef = doc(db, 'highScores', `${userId}_${gameType}_${difficulty}`);
      await setDoc(highScoreRef, {
        userId,
        gameType,
        difficulty,
        score,
        accuracy,
        date: new Date(),
      });
    }

    return {
      isNewHighScore,
      previousBest: currentHighScore?.score || 0,
    };
  }

  /**
   * Get user's high score for a specific game and difficulty
   */
  async getHighScore(
    userId: string,
    gameType: GameType,
    difficulty: Difficulty
  ): Promise<HighScore | null> {
    try {
      const highScoreRef = doc(db, 'highScores', `${userId}_${gameType}_${difficulty}`);
      const highScoreDoc = await getDoc(highScoreRef);

      if (highScoreDoc.exists()) {
        const data = highScoreDoc.data();
        return {
          gameType: data.gameType,
          difficulty: data.difficulty,
          score: data.score,
          accuracy: data.accuracy,
          date: data.date.toDate(),
        };
      }

      // Document doesn't exist yet - this is normal for first-time players
      return null;
    } catch (error: any) {
      // Only log if it's not a "not found" error
      if (error?.code !== 'permission-denied') {
        console.error('Error getting high score:', error);
      }
      return null;
    }
  }

  /**
   * Get all high scores for a user
   */
  async getAllHighScores(userId: string): Promise<HighScore[]> {
    try {
      const q = query(
        collection(db, 'highScores'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          gameType: data.gameType,
          difficulty: data.difficulty,
          score: data.score,
          accuracy: data.accuracy,
          date: data.date.toDate(),
        };
      });
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        console.error('Error getting all high scores:', error);
      }
      return [];
    }
  }

  /**
   * Get leaderboard for a specific game and difficulty
   * Returns top scores from all users (for friends competition)
   */
  async getLeaderboard(
    gameType: GameType,
    difficulty: Difficulty,
    limit: number = 10
  ): Promise<Array<HighScore & { userName: string }>> {
    try {
      const q = query(
        collection(db, 'highScores'),
        where('gameType', '==', gameType),
        where('difficulty', '==', difficulty)
      );
      const querySnapshot = await getDocs(q);

      const scores = await Promise.all(
        querySnapshot.docs.map(async (scoreDoc) => {
          const data = scoreDoc.data();
          
          // Get user name
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userName = userDoc.exists() ? userDoc.data().displayName : 'Unknown';

          return {
            gameType: data.gameType,
            difficulty: data.difficulty,
            score: data.score,
            accuracy: data.accuracy,
            date: data.date.toDate(),
            userName,
          };
        })
      );

      // Sort by score descending
      return scores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get friend leaderboard (only friends' scores)
   */
  async getFriendLeaderboard(
    userId: string,
    gameType: GameType,
    difficulty: Difficulty
  ): Promise<Array<HighScore & { userName: string; userId: string }>> {
    try {
      // Get user's friends
      const userDoc = await getDoc(doc(db, 'users', userId));
      const friends = userDoc.exists() ? (userDoc.data().friends || []) : [];

      if (friends.length === 0) {
        return [];
      }

      // Get high scores for all friends
      const scores = await Promise.all(
        friends.map(async (friendId: string) => {
          const highScore = await this.getHighScore(friendId, gameType, difficulty);
          if (!highScore) return null;

          const friendDoc = await getDoc(doc(db, 'users', friendId));
          const userName = friendDoc.exists() ? friendDoc.data().displayName : 'Unknown';

          return {
            ...highScore,
            userName,
            userId: friendId,
          };
        })
      );

      // Filter out nulls and sort by score
      return scores
        .filter((score): score is HighScore & { userName: string; userId: string } => score !== null)
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting friend leaderboard:', error);
      return [];
    }
  }
}

export const scoreService = new ScoreService();
