import type { TerminalState } from '../../hooks/useTerminal'

export type ScenarioType = 'guided' | 'troubleshoot'
export type ScenarioCategory = 'docker' | 'kubernetes' | 'gitops' | 'argocd' | 'networking'
export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface ScenarioCheckpoint {
  id: string
  title: string
  description: string
  expectedOutcome: string
  hint: string
  checkState: (state: TerminalState) => { ok: boolean; message: string }
}

export interface ScenarioSolution {
  rootCause?: string
  fixSteps: string[]
  explanation: string
  manifests?: { name: string; language: string; content: string }[]
}

export interface RealWorldAlternative {
  prerequisites: string[]
  commands: string[]
  notes: string
}

export interface AcademyScenario {
  id: string
  title: string
  type: ScenarioType
  category: ScenarioCategory
  difficulty: ScenarioDifficulty
  estimatedMinutes: number
  summary: string
  contextDescription: string
  targetStateDescription: string
  initialFiles?: { path: string; content: string }[]
  instructions?: string[]
  checkpoints?: ScenarioCheckpoint[]
  setupEnvironment: (state: TerminalState) => void
  validateFinalState: (state: TerminalState) => {
    passed: boolean
    message: string
    details?: string[]
  }
  hints: string[]
  solution: ScenarioSolution
  realWorldAlternative: RealWorldAlternative
}
