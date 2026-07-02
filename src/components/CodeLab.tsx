import { useState } from 'react'
import { exercises, type Exercise } from '../data/exercises'
import { useProgress } from '../hooks/useProgress'
import { LiveDiagram } from './LiveDiagram'
import styles from './CodeLab.module.css'

interface CodeLabProps {
  initialExerciseId?: string
}

const difficultyColor: Record<string, string> = {
  easy: 'var(--green)',
  medium: 'var(--amber)',
  hard: 'var(--magenta)',
}

export function CodeLab({ initialExerciseId }: CodeLabProps) {
  const firstId = initialExerciseId ?? exercises[0].id
  const [selectedId, setSelectedId] = useState(firstId)
  const [code, setCode] = useState(() => exercises.find((e) => e.id === firstId)!.starterCode)
  const [hintIndex, setHintIndex] = useState(-1)
  const [result, setResult] = useState<{ passed: boolean; feedback: string[] } | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const { markExerciseComplete, isExerciseComplete } = useProgress()

  const exercise = exercises.find((e) => e.id === selectedId)
  if (!exercise) return <p>Exercise not found.</p>

  const selectExercise = (ex: Exercise) => {
    setSelectedId(ex.id)
    setCode(ex.starterCode)
    setHintIndex(-1)
    setResult(null)
    setShowSolution(false)
  }

  const runCheck = () => {
    const res = exercise.validate(code)
    setResult(res)
    if (res.passed) markExerciseComplete(exercise.id)
  }

  const revealSolution = () => {
    setShowSolution(true)
    setCode(exercise.solution)
    setResult(null)
  }

  const diagram = exercise.getDiagram(code)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ vim {exercise.filename}</p>
        <h2>Code Lab</h2>
        <p className={styles.sub}>Write real GitOps YAML. Run the check to earn XP. The diagram updates live as you type.</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.list}>
          <h3># exercises</h3>
          {exercises.map((ex) => (
            <button
              key={ex.id}
              className={`${styles.exBtn} ${selectedId === ex.id ? styles.active : ''} ${isExerciseComplete(ex.id) ? styles.done : ''}`}
              onClick={() => selectExercise(ex)}
            >
              <span className={styles.exTitle}>
                {isExerciseComplete(ex.id) ? '✓ ' : ''}
                {ex.title}
              </span>
              <span className={styles.exMeta}>
                <span style={{ color: difficultyColor[ex.difficulty] }}>{ex.difficulty}</span> · {ex.xp} XP
              </span>
            </button>
          ))}
        </aside>

        <div className={styles.workspace}>
          <div className={styles.problem}>
            <div className={styles.badges}>
              <span className={styles.badge} style={{ borderColor: difficultyColor[exercise.difficulty], color: difficultyColor[exercise.difficulty] }}>
                {exercise.difficulty}
              </span>
              <span className={styles.badge}>{exercise.category}</span>
              <span className={styles.conceptBadge}>{exercise.concept}</span>
              <span className={styles.xpBadge}>+{exercise.xp} XP</span>
            </div>
            <h3>{exercise.title}</h3>
            <p className={styles.analogy}>{exercise.analogy}</p>
            <pre className={styles.problemText}>{exercise.problem}</pre>
          </div>

          <div className={styles.editorRow}>
            <div className={styles.editorPane}>
              <div className={styles.editorHead}>
                <span className={styles.fname}>{exercise.filename}</span>
                <div className={styles.editorActions}>
                  <button onClick={() => { setCode(exercise.starterCode); setResult(null); setShowSolution(false) }}>reset</button>
                  <button className={styles.checkBtn} onClick={runCheck}>▸ run check</button>
                </div>
              </div>
              <div className={styles.editorBody}>
                <textarea
                  className={styles.editor}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setResult(null)
                    setShowSolution(false)
                  }}
                  spellCheck={false}
                />
              </div>
            </div>

            <LiveDiagram nodes={diagram} concept={exercise.concept} />
          </div>

          <div className={styles.toolbar}>
            <button
              className={styles.hintBtn}
              onClick={() => setHintIndex((i) => Math.min(i + 1, exercise.hints.length - 1))}
              disabled={hintIndex >= exercise.hints.length - 1}
            >
              hint ({hintIndex + 1}/{exercise.hints.length})
            </button>
            <button className={styles.solutionBtn} onClick={revealSolution}>show solution</button>
          </div>

          {hintIndex >= 0 && (
            <div className={styles.hintBox}>
              <strong>hint {hintIndex + 1}:</strong> {exercise.hints[hintIndex]}
            </div>
          )}

          {result && (
            <div className={`${styles.result} ${result.passed ? styles.passed : styles.failed}`}>
              {result.passed && <p className={styles.passHead}>✓ PASSED · +{exercise.xp} XP</p>}
              {result.feedback.map((f, i) => (
                <p key={i}>{result.passed ? '  ' : '✗ '}{f}</p>
              ))}
            </div>
          )}

          {showSolution && (
            <p className={styles.solutionNote}>
              Solution loaded. Read why each field matters, then reset and type it from memory to lock it in.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
