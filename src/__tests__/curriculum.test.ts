import { describe, it, expect } from 'vitest'
import { curriculum, getTotalLessonCount, getPhase, getModule, getLesson } from '../data/curriculum-index'

describe('Curriculum Data Integrity', () => {
  it('contains all 9 progressive engineering phases', () => {
    expect(curriculum).toHaveLength(9)
    for (let i = 0; i <= 8; i++) {
      const phase = curriculum.find(p => p.number === i)
      expect(phase, `Phase ${i} must exist`).toBeDefined()
      expect(phase?.id).toBe(`phase${i}`)
      expect(phase?.title).toBeTruthy()
      expect(phase?.modules.length).toBeGreaterThan(0)
    }
  })

  it('contains over 50 comprehensive engineering lessons', () => {
    const total = getTotalLessonCount()
    expect(total).toBeGreaterThanOrEqual(50)
  })

  it('validates every lesson contains required pedagogical sections', () => {
    for (const phase of curriculum) {
      for (const mod of phase.modules) {
        expect(mod.id).toBeTruthy()
        expect(mod.title).toBeTruthy()
        expect(mod.lessons.length).toBeGreaterThan(0)

        for (const lesson of mod.lessons) {
          expect(lesson.id, `Lesson ID in ${mod.title}`).toBeTruthy()
          expect(lesson.title).toBeTruthy()
          expect(lesson.summary).toBeTruthy()
          expect(lesson.estimatedMinutes).toBeGreaterThan(0)
          expect(lesson.sections.length, `Sections in ${lesson.title}`).toBeGreaterThanOrEqual(1)
          expect(lesson.keyTakeaways.length, `Key takeaways in ${lesson.title}`).toBeGreaterThanOrEqual(2)

          // Verify section content is substantial (not empty or trivial)
          for (const s of lesson.sections) {
            expect(s.title).toBeTruthy()
            expect(s.content.length).toBeGreaterThan(20)
          }
        }
      }
    }
  })

  it('verifies Phase 6 (Argo CD & GitOps) is the central deep curriculum phase', () => {
    const phase6 = getPhase('phase6')
    expect(phase6).toBeDefined()
    expect(phase6?.title).toContain('Argo CD')
    expect(phase6?.modules.length).toBeGreaterThanOrEqual(4)

    const totalPhase6Lessons = phase6?.modules.reduce((s, m) => s + m.lessons.length, 0) || 0
    expect(totalPhase6Lessons).toBeGreaterThanOrEqual(10)
  })

  it('supports retrieval helper functions', () => {
    const p0 = getPhase('phase0')
    expect(p0).toBeDefined()
    expect(p0?.number).toBe(0)

    const mod = getModule('phase0', p0!.modules[0].id)
    expect(mod).toBeDefined()

    const firstLesson = mod!.lessons[0]
    const l = getLesson('phase0', mod!.id, firstLesson.id)
    expect(l).toBeDefined()
    expect(l?.id).toBe(firstLesson.id)
  })
})
