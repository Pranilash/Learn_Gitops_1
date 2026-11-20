import type { AcademyPhase } from './types'

// Phase 0
import { phase0 } from './phases/phase0'
// Phase 1
import { phase1 } from './phases/phase1'
// Phase 2
import { phase2 } from './phases/phase2'
// Phase 3
import { phase3 } from './phases/phase3'
// Phase 4
import { phase4 } from './phases/phase4'
// Phase 5
import { phase5 } from './phases/phase5'
// Phase 6
import { phase6 } from './phases/phase6'
// Phase 7
import { phase7 } from './phases/phase7'
// Phase 8
import { phase8 } from './phases/phase8'

export const curriculum: AcademyPhase[] = [
  phase0,
  phase1,
  phase2,
  phase3,
  phase4,
  phase5,
  phase6,
  phase7,
  phase8,
]

export function getPhase(phaseId: string): AcademyPhase | undefined {
  return curriculum.find(p => p.id === phaseId)
}

export function getModule(phaseId: string, moduleId: string) {
  const phase = getPhase(phaseId)
  if (!phase) return undefined
  return phase.modules.find(m => m.id === moduleId)
}

export function getLesson(phaseId: string, moduleId: string, lessonId: string) {
  const mod = getModule(phaseId, moduleId)
  if (!mod) return undefined
  return mod.lessons.find(l => l.id === lessonId)
}

export function getAllLessonsFlat() {
  return curriculum.flatMap(phase =>
    phase.modules.flatMap(mod =>
      mod.lessons.map(lesson => ({
        phase,
        module: mod,
        lesson,
      }))
    )
  )
}

export function getTotalLessonCount(): number {
  return curriculum.reduce(
    (sum, phase) =>
      sum + phase.modules.reduce(
        (mSum, mod) => mSum + mod.lessons.length, 0
      ),
    0
  )
}

export function getPhaseStats(phaseId: string) {
  const phase = getPhase(phaseId)
  if (!phase) return { modules: 0, lessons: 0, hours: 0 }
  const lessons = phase.modules.reduce((s, m) => s + m.lessons.length, 0)
  const hours = phase.modules.reduce((s, m) => s + m.estimatedHours, 0)
  return { modules: phase.modules.length, lessons, hours }
}
