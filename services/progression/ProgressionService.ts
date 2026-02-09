/**
 * Progression Service
 * 
 * Handles player leveling, XP, and progression system.
 */

import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface PlayerProgression {
  level: number;
  xp: number;
  totalXP: number;
  title: string;
  xpToNextLevel: number;
  xpProgress: number; // Percentage (0-100)
}

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  rewards: string[];
  xpGained: number;
}

// XP rewards for different actions
export const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  WRONG_ANSWER: 2, // Small XP for trying
  SESSION_COMPLETE: 25,
  PERFECT_ACCURACY: 50, // 100% accuracy bonus
  HIGH_SCORE_BEATEN: 100,
  DAILY_STREAK: 20,
  FRIEND_CHALLENGE_WON: 75,
  FRIEND_CHALLENGE_LOST: 25,
};

// Level titles/ranks
const TITLES = [
  { minLevel: 1, maxLevel: 10, title: 'Beginner' },
  { minLevel: 11, maxLevel: 20, title: 'Apprentice' },
  { minLevel: 21, maxLevel: 30, title: 'Intermediate' },
  { minLevel: 31, maxLevel: 40, title: 'Advanced' },
  { minLevel: 41, maxLevel: 50, title: 'Expert' },
  { minLevel: 51, maxLevel: 75, title: 'Master' },
  { minLevel: 76, maxLevel: 99, title: 'Virtuoso' },
  { minLevel: 100, maxLevel: 100, title: 'Legend' },
];

class ProgressionService {
  /**
   * Calculate XP required for a specific level
   */
  getXPForLevel(level: number): number {
    if (level <= 10) return 100;
    if (level <= 25) return 200;
    if (level <= 50) return 500;
    return 1000;
  }

  /**
   * Calculate total XP required to reach a level
   */
  getTotalXPForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += this.getXPForLevel(i);
    }
    return total;
  }

  /**
   * Get title for a level
   */
  getTitleForLevel(level: number): string {
    const titleData = TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
    return titleData?.title || 'Beginner';
  }

  /**
   * Calculate level from total XP
   */
  calculateLevelFromXP(totalXP: number): { level: number; currentLevelXP: number } {
    let level = 1;
    let xpRemaining = totalXP;

    while (xpRemaining >= this.getXPForLevel(level) && level < 100) {
      xpRemaining -= this.getXPForLevel(level);
      level++;
    }

    return {
      level,
      currentLevelXP: xpRemaining,
    };
  }

  /**
   * Get player progression data
   */
  async getProgression(userId: string): Promise<PlayerProgression> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        // Return default progression for new users
        return {
          level: 1,
          xp: 0,
          totalXP: 0,
          title: 'Beginner',
          xpToNextLevel: 100,
          xpProgress: 0,
        };
      }

      const data = userDoc.data();
      const level = data.level || 1;
      const xp = data.xp || 0;
      const totalXP = data.totalXP || 0;
      const xpToNextLevel = this.getXPForLevel(level);
      const xpProgress = Math.round((xp / xpToNextLevel) * 100);

      return {
        level,
        xp,
        totalXP,
        title: this.getTitleForLevel(level),
        xpToNextLevel,
        xpProgress,
      };
    } catch (error) {
      console.error('[Progression] Error getting progression:', error);
      throw error;
    }
  }

  /**
   * Award XP to a player
   */
  async awardXP(userId: string, xpAmount: number, reason?: string): Promise<LevelUpResult> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Initialize progression for new user
        await setDoc(userRef, {
          level: 1,
          xp: xpAmount,
          totalXP: xpAmount,
        }, { merge: true });

        return {
          leveledUp: false,
          newLevel: 1,
          rewards: [],
          xpGained: xpAmount,
        };
      }

      const data = userDoc.data();
      const currentLevel = data.level || 1;
      const currentXP = data.xp || 0;
      const totalXP = (data.totalXP || 0) + xpAmount;

      // Calculate new XP and check for level up
      let newXP = currentXP + xpAmount;
      let newLevel = currentLevel;
      const rewards: string[] = [];
      let leveledUp = false;

      // Check for level ups (can level up multiple times)
      while (newXP >= this.getXPForLevel(newLevel) && newLevel < 100) {
        newXP -= this.getXPForLevel(newLevel);
        newLevel++;
        leveledUp = true;

        // Add level up rewards
        if (newLevel % 5 === 0) {
          rewards.push(`Milestone Level ${newLevel}!`);
        }
        if (newLevel === 10) rewards.push('Title: Apprentice');
        if (newLevel === 20) rewards.push('Title: Intermediate');
        if (newLevel === 30) rewards.push('Title: Advanced');
        if (newLevel === 40) rewards.push('Title: Expert');
        if (newLevel === 50) rewards.push('Title: Master');
        if (newLevel === 75) rewards.push('Title: Virtuoso');
        if (newLevel === 100) rewards.push('Title: Legend');
      }

      // Update user document
      await updateDoc(userRef, {
        level: newLevel,
        xp: newXP,
        totalXP: totalXP,
      });

      console.log(`[Progression] Awarded ${xpAmount} XP to user ${userId}${reason ? ` (${reason})` : ''}`);
      if (leveledUp) {
        console.log(`[Progression] User leveled up! New level: ${newLevel}`);
      }

      return {
        leveledUp,
        newLevel,
        rewards,
        xpGained: xpAmount,
      };
    } catch (error) {
      console.error('[Progression] Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Award XP for completing a practice session
   */
  async awardSessionXP(
    userId: string,
    score: number,
    totalQuestions: number,
    isNewHighScore: boolean
  ): Promise<LevelUpResult> {
    let totalXP = 0;

    // XP for correct answers
    totalXP += score * XP_REWARDS.CORRECT_ANSWER;

    // XP for wrong answers (participation)
    const wrongAnswers = totalQuestions - score;
    totalXP += wrongAnswers * XP_REWARDS.WRONG_ANSWER;

    // Session completion bonus
    totalXP += XP_REWARDS.SESSION_COMPLETE;

    // Perfect accuracy bonus
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    if (accuracy === 100) {
      totalXP += XP_REWARDS.PERFECT_ACCURACY;
    }

    // High score bonus
    if (isNewHighScore) {
      totalXP += XP_REWARDS.HIGH_SCORE_BEATEN;
    }

    return await this.awardXP(userId, totalXP, 'Practice session completed');
  }

  /**
   * Get leaderboard of highest level players
   */
  async getLevelLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    username: string;
    level: number;
    title: string;
  }>> {
    // TODO: Implement leaderboard query
    // This would require a Firestore query sorted by level
    return [];
  }
}

export const progressionService = new ProgressionService();
