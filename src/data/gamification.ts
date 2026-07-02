export const XP_PER_LESSON = 50
export const XP_PER_MISSION = 75

export interface Rank {
  name: string
  minXp: number
  icon: string
}

/** Career ladder — your title levels up with XP. */
export const ranks: Rank[] = [
  { name: 'Intern', minXp: 0, icon: '○' },
  { name: 'Junior Operator', minXp: 200, icon: '◔' },
  { name: 'Operator', minXp: 500, icon: '◑' },
  { name: 'SRE', minXp: 1000, icon: '◕' },
  { name: 'Platform Engineer', minXp: 1700, icon: '●' },
  { name: 'GitOps Architect', minXp: 2600, icon: '◆' },
]

export function rankForXp(xp: number): { rank: Rank; level: number; next?: Rank; toNext: number; progress: number } {
  let level = 0
  for (let i = 0; i < ranks.length; i++) {
    if (xp >= ranks[i].minXp) level = i
  }
  const rank = ranks[level]
  const next = ranks[level + 1]
  const toNext = next ? next.minXp - xp : 0
  const span = next ? next.minXp - rank.minXp : 1
  const progress = next ? Math.round(((xp - rank.minXp) / span) * 100) : 100
  return { rank, level, next, toNext, progress }
}

export interface AchievementContext {
  lessons: Set<string>
  exercises: Set<string>
  missions: Set<string>
  totalLessons: number
  totalExercises: number
  streak: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xp: number
  test: (c: AchievementContext) => boolean
}

/** Badges. Unlock = bonus XP + a trophy on the Achievements screen. */
export const achievements: Achievement[] = [
  { id: 'first-commit', name: 'First Commit', description: 'Complete your first lesson.', icon: '🌱', xp: 20, test: (c) => c.lessons.size >= 1 },
  { id: 'first-apply', name: 'kubectl apply', description: 'Solve your first lab exercise.', icon: '⚙️', xp: 30, test: (c) => c.exercises.size >= 1 },
  { id: 'yaml-wrangler', name: 'YAML Wrangler', description: 'Solve 3 lab exercises.', icon: '📜', xp: 50, test: (c) => c.exercises.size >= 3 },
  { id: 'drift-hunter', name: 'Drift Hunter', description: 'Self-heal drift in the Reconcile playground.', icon: '🛰️', xp: 60, test: (c) => c.missions.has('self-heal') },
  { id: 'pipeline-runner', name: 'Pipeline Runner', description: 'Run the full GitOps pipeline DAG.', icon: '🔁', xp: 60, test: (c) => c.missions.has('pipeline') },
  { id: 'terminal-hacker', name: 'Terminal Hacker', description: 'Complete a mission in the GitOps terminal.', icon: '⌨️', xp: 60, test: (c) => c.missions.has('terminal') },
  { id: 'streak-3', name: 'On a Roll', description: 'Show up 3 days in a row.', icon: '🔥', xp: 40, test: (c) => c.streak >= 3 },
  { id: 'lab-master', name: 'Lab Master', description: 'Solve every lab exercise.', icon: '🧪', xp: 120, test: (c) => c.exercises.size >= c.totalExercises && c.totalExercises > 0 },
  { id: 'scholar', name: 'Scholar', description: 'Complete every lesson.', icon: '🎓', xp: 120, test: (c) => c.lessons.size >= c.totalLessons && c.totalLessons > 0 },
  {
    id: 'gitops-architect',
    name: 'GitOps Architect',
    description: '100% — every lesson, lab, and mission.',
    icon: '🏆',
    xp: 200,
    test: (c) =>
      c.lessons.size >= c.totalLessons &&
      c.exercises.size >= c.totalExercises &&
      c.missions.size >= 3 &&
      c.totalLessons > 0,
  },
]
