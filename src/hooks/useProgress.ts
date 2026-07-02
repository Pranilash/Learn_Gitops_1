import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAllLessons } from '../data/curriculum'
import { exercises } from '../data/exercises'
import {
  achievements,
  rankForXp,
  XP_PER_LESSON,
  XP_PER_MISSION,
  type Achievement,
} from '../data/gamification'

const LESSON_KEY = 'gitops-learn-lessons'
const EXERCISE_KEY = 'gitops-learn-exercises'
const MISSION_KEY = 'gitops-learn-missions'
const STREAK_KEY = 'gitops-learn-streak'

interface StreakState {
  count: number
  lastVisit: string // YYYY-MM-DD
}

function loadSet(key: string): Set<string> {
  try {
    const stored = localStorage.getItem(key)
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

function loadStreak(): StreakState {
  try {
    const stored = localStorage.getItem(STREAK_KEY)
    const today = todayStr()
    if (!stored) return { count: 1, lastVisit: today }
    const prev = JSON.parse(stored) as StreakState
    const gap = daysBetween(prev.lastVisit, today)
    if (gap === 0) return prev
    if (gap === 1) return { count: prev.count + 1, lastVisit: today }
    return { count: 1, lastVisit: today } // streak broken
  } catch {
    return { count: 1, lastVisit: todayStr() }
  }
}

export function useProgress() {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => loadSet(LESSON_KEY))
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(() => loadSet(EXERCISE_KEY))
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => loadSet(MISSION_KEY))
  const [streak] = useState<StreakState>(() => loadStreak())

  useEffect(() => {
    localStorage.setItem(LESSON_KEY, JSON.stringify([...completedLessons]))
  }, [completedLessons])
  useEffect(() => {
    localStorage.setItem(EXERCISE_KEY, JSON.stringify([...completedExercises]))
  }, [completedExercises])
  useEffect(() => {
    localStorage.setItem(MISSION_KEY, JSON.stringify([...completedMissions]))
  }, [completedMissions])
  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
  }, [streak])

  const markComplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => (prev.has(lessonId) ? prev : new Set([...prev, lessonId])))
  }, [])
  const markExerciseComplete = useCallback((exerciseId: string) => {
    setCompletedExercises((prev) => (prev.has(exerciseId) ? prev : new Set([...prev, exerciseId])))
  }, [])
  const markMissionComplete = useCallback((missionId: string) => {
    setCompletedMissions((prev) => (prev.has(missionId) ? prev : new Set([...prev, missionId])))
  }, [])

  const isComplete = useCallback((id: string) => completedLessons.has(id), [completedLessons])
  const isExerciseComplete = useCallback((id: string) => completedExercises.has(id), [completedExercises])
  const isMissionComplete = useCallback((id: string) => completedMissions.has(id), [completedMissions])

  const resetProgress = useCallback(() => {
    setCompletedLessons(new Set())
    setCompletedExercises(new Set())
    setCompletedMissions(new Set())
  }, [])

  const totalLessons = getAllLessons().length
  const totalExercises = exercises.length

  const derived = useMemo(() => {
    const ctx = {
      lessons: completedLessons,
      exercises: completedExercises,
      missions: completedMissions,
      totalLessons,
      totalExercises,
      streak: streak.count,
    }
    const unlocked: Achievement[] = achievements.filter((a) => a.test(ctx))
    const unlockedIds = new Set(unlocked.map((a) => a.id))

    const exerciseXp = exercises
      .filter((e) => completedExercises.has(e.id))
      .reduce((sum, e) => sum + e.xp, 0)
    const achievementXp = unlocked.reduce((sum, a) => sum + a.xp, 0)
    const xp =
      completedLessons.size * XP_PER_LESSON +
      completedMissions.size * XP_PER_MISSION +
      exerciseXp +
      achievementXp

    const rankInfo = rankForXp(xp)

    const totalItems = totalLessons + totalExercises + 3 // +3 playground missions
    const totalDone = completedLessons.size + completedExercises.size + completedMissions.size
    const progressPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

    return { unlocked, unlockedIds, xp, rankInfo, progressPercent, totalItems, totalDone }
  }, [completedLessons, completedExercises, completedMissions, streak.count, totalLessons, totalExercises])

  return {
    // raw sets
    completedLessons,
    completedExercises,
    completedMissions,
    // marks
    markComplete,
    markExerciseComplete,
    markMissionComplete,
    // checks
    isComplete,
    isExerciseComplete,
    isMissionComplete,
    resetProgress,
    // counts
    totalLessons,
    totalExercises,
    lessonsDone: completedLessons.size,
    exercisesDone: completedExercises.size,
    missionsDone: completedMissions.size,
    // gamification
    xp: derived.xp,
    rank: derived.rankInfo.rank,
    level: derived.rankInfo.level,
    nextRank: derived.rankInfo.next,
    xpToNext: derived.rankInfo.toNext,
    rankProgress: derived.rankInfo.progress,
    unlockedAchievements: derived.unlocked,
    unlockedIds: derived.unlockedIds,
    streak: streak.count,
    progressPercent: derived.progressPercent,
    totalItems: derived.totalItems,
    totalDone: derived.totalDone,
  }
}
