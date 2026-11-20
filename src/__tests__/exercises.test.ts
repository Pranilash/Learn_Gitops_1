import { describe, it, expect } from 'vitest'
import { exercises } from '../data/exercises'

describe('CodeLab Interactive YAML Exercises', () => {
  it('contains at least 12 structured YAML challenges', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(12)
  })

  it('validates that every exercise solution passes its own validator', () => {
    for (const ex of exercises) {
      expect(ex.id).toBeTruthy()
      expect(ex.title).toBeTruthy()
      expect(ex.starterCode).toBeTruthy()
      expect(ex.solution).toBeTruthy()
      expect(ex.hints.length).toBeGreaterThanOrEqual(1)

      const result = ex.validate(ex.solution)
      expect(
        result.passed,
        `Exercise "${ex.id}" (${ex.title}) solution must pass validation. Feedback: ${result.feedback.join('; ')}`
      ).toBe(true)
    }
  })

  it('verifies that starter code does not pass validation (requires learner input)', () => {
    for (const ex of exercises) {
      const result = ex.validate(ex.starterCode)
      expect(
        result.passed,
        `Exercise "${ex.id}" starter code should NOT pass validation without learner changes`
      ).toBe(false)
      expect(result.feedback.length).toBeGreaterThan(0)
    }
  })

  it('generates live diagram nodes for both starter code and solution without throwing', () => {
    for (const ex of exercises) {
      const starterNodes = ex.getDiagram(ex.starterCode)
      expect(Array.isArray(starterNodes)).toBe(true)

      const solutionNodes = ex.getDiagram(ex.solution)
      expect(Array.isArray(solutionNodes)).toBe(true)
      expect(solutionNodes.length).toBeGreaterThan(0)
    }
  })
})
