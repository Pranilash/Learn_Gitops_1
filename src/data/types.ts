// ─── Core Academy Data Types ────────────────────────────────────────────────

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface LearningObjective {
  text: string
  skill: string // short skill tag
}

export interface CommandRef {
  command: string
  description: string
  flags?: { flag: string; description: string }[]
  example: string
  output?: string
  whenToUse: string
  commonMistakes?: string[]
  relatedCommands?: string[]
}

export interface CodeExample {
  language: string
  filename?: string
  code: string
  explanation?: string
  highlights?: number[] // line numbers to highlight
}

export interface DiagramData {
  type: 'architecture' | 'flow' | 'comparison' | 'network' | 'sequence'
  title: string
  description?: string
  /** SVG-based diagram as an HTML string or a set of nodes */
  content: string
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'command-prediction' | 'yaml-fix' | 'scenario' | 'fill-blank' | 'ordering'
  question: string
  context?: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  difficulty: DifficultyLevel
  xp: number
}

export interface TroubleshootingScenario {
  symptom: string
  cause: string
  diagnosis: string[]
  solution: string
  prevention: string
}

export interface Reference {
  title: string
  url: string
  type: 'documentation' | 'paper' | 'specification' | 'blog' | 'tutorial' | 'book' | 'rfc'
  author?: string
  date?: string
  description: string
  difficulty: DifficultyLevel
  priority: 'required' | 'recommended' | 'advanced'
}

export interface TerminalLab {
  id: string
  title: string
  description: string
  environment: string // terminal environment preset
  objectives: string[]
  steps: {
    instruction: string
    hint?: string
    expectedCommand?: string
    expectedOutput?: string
  }[]
  resetState?: Record<string, unknown>
}

/** A single comprehensive lesson */
export interface AcademyLesson {
  id: string
  title: string
  summary: string
  estimatedMinutes: number
  difficulty: DifficultyLevel
  prerequisites?: string[] // lesson IDs

  // Content structure
  objectives: LearningObjective[]
  
  /** Main lesson content as markdown sections */
  sections: LessonSection[]

  // Interactive elements
  commands?: CommandRef[]
  codeExamples?: CodeExample[]
  diagrams?: DiagramData[]
  terminalLab?: TerminalLab
  
  // Assessment
  quiz?: QuizQuestion[]
  troubleshooting?: TroubleshootingScenario[]
  
  // Challenge
  exercise?: string
  exerciseId?: string // links to CodeLab exercise
  
  // Takeaways
  keyTakeaways: string[]
  bestPractices?: string[]
  securityConsiderations?: string[]
  commonMistakes?: string[]
  interviewQuestions?: string[]
  
  // References
  references?: Reference[]
  
  // Navigation
  connectsTo?: string[] // related lesson IDs
}

export interface LessonSection {
  title: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  content: string // markdown
}

/** A module is a grouping of related lessons within a phase */
export interface AcademyModule {
  id: string
  title: string
  description: string
  icon: string
  difficulty: DifficultyLevel
  estimatedHours: number
  lessons: AcademyLesson[]
}

/** A phase is the top-level curriculum grouping */
export interface AcademyPhase {
  id: string
  number: number
  title: string
  subtitle: string
  description: string
  icon: string
  difficulty: DifficultyLevel
  color: string // CSS color for phase theming
  modules: AcademyModule[]
}

/** Overall curriculum structure */
export interface Curriculum {
  phases: AcademyPhase[]
}

// ─── Terminal Types ─────────────────────────────────────────────────────────

export interface VirtualFile {
  name: string
  type: 'file' | 'directory' | 'symlink'
  content?: string
  permissions: string  // e.g., 'rwxr-xr-x'
  owner: string
  group: string
  size: number
  modified: Date
  children?: Record<string, VirtualFile>
}

export interface TerminalEnvironment {
  id: string
  name: string
  prompt: string
  filesystem: VirtualFile
  env: Record<string, string>
  cwd: string
  tools: string[]  // which command sets are available
  labId?: string
}

export interface TerminalLine {
  text: string
  kind: 'input' | 'output' | 'success' | 'error' | 'warning' | 'info' | 'dim'
  timestamp?: number
}

// ─── Notes Types ────────────────────────────────────────────────────────────

export interface Note {
  id: string
  lessonId?: string
  phaseId?: string
  title: string
  content: string // markdown
  tags: string[]
  isBookmark: boolean
  createdAt: string
  updatedAt: string
}

// ─── Capstone Types ─────────────────────────────────────────────────────────

export interface CapstoneProject {
  id: string
  number: number
  title: string
  description: string
  difficulty: DifficultyLevel
  estimatedHours: number
  prerequisites: string[] // phase IDs
  objectives: string[]
  milestones: {
    title: string
    description: string
    tasks: string[]
    verification: string
  }[]
  repositoryStructure: string // tree-style display
  architecture?: DiagramData
  resources: Reference[]
  acceptanceCriteria: string[]
  executionGuide: {
    step: string
    command?: string
    explanation: string
  }[]
  troubleshooting: {
    issue: string
    resolution: string
  }[]
  cleanupInstructions: string[]
  portfolioDeliverables: string[]
}

// ─── Backward Compatibility ─────────────────────────────────────────────────
// These types bridge the old curriculum.ts types with the new system

export type Level = DifficultyLevel

export interface Command {
  command: string
  description: string
  example: string
  gitEquivalent?: string
  whenToUse: string
}

export interface Lesson {
  id: string
  title: string
  summary: string
  content: string[]
  commands?: Command[]
  keyTakeaways: string[]
  exercise?: string
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  level: Level
  lessons: Lesson[]
}
