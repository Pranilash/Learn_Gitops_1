import { useState } from 'react'
import { curriculum } from '../data/curriculum-index'
import { useProgress } from '../hooks/useProgress'
import styles from './CurriculumExplorer.module.css'

interface Props {
  onSelectLesson: (phaseId: string, moduleId: string, lessonId: string) => void
}

export function CurriculumExplorer({ onSelectLesson }: Props) {
  const { isComplete } = useProgress()
  const [openPhases, setOpenPhases] = useState<Set<string>>(() => new Set([curriculum[0]?.id]))

  const togglePhase = (phaseId: string) => {
    setOpenPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ ls -R curriculum/</p>
        <h2>Curriculum Explorer</h2>
        <p className={styles.sub}>
          9 phases · {curriculum.reduce((s, p) => s + p.modules.length, 0)} modules · {curriculum.reduce((s, p) => s + p.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0)} lessons.
          Green check = completed. Each lesson grants 50 XP.
        </p>
      </header>

      <div className={styles.phases}>
        {curriculum.map(phase => {
          const isOpen = openPhases.has(phase.id)
          const allLessons = phase.modules.flatMap(m => m.lessons)
          const doneLessons = allLessons.filter(l => isComplete(l.id)).length
          const totalLessons = allLessons.length
          const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0

          return (
            <div key={phase.id} className={styles.phase}>
              <button className={styles.phaseHeader} onClick={() => togglePhase(phase.id)}>
                <span className={styles.phaseIcon}>{phase.icon}</span>
                <div className={styles.phaseInfo}>
                  <div className={styles.phaseTitle}>
                    <span
                      className={styles.phaseNumber}
                      style={{
                        background: `${phase.color}22`,
                        color: phase.color,
                        border: `1px solid ${phase.color}44`,
                      }}
                    >
                      Phase {phase.number}
                    </span>
                    {phase.title}
                  </div>
                  <span className={styles.phaseSubtitle}>{phase.subtitle}</span>
                  <div className={styles.phaseMeta}>
                    <span>{phase.modules.length} modules</span>
                    <span>{totalLessons} lessons</span>
                    <span className={`${styles.lvl} ${styles[phase.difficulty]}`}>{phase.difficulty}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${progress}%`,
                        background: phase.color === 'var(--cyan)' ? '#36d6e7' :
                                   phase.color === 'var(--git)' ? '#f05032' :
                                   phase.color === 'var(--blue)' ? '#5fa8ff' :
                                   phase.color === 'var(--amber)' ? '#ffb000' :
                                   phase.color === 'var(--k8s)' ? '#326ce5' :
                                   phase.color === 'var(--argo)' ? '#ef7b4d' :
                                   phase.color === 'var(--magenta)' ? '#ff5fa2' :
                                   phase.color === 'var(--red)' ? '#ff5f56' :
                                   '#4af626',
                      }}
                    />
                  </div>
                </div>
                <div className={styles.phaseProgress}>
                  <span className={styles.phaseProgressNum}>{doneLessons}/{totalLessons}</span>
                  <span className={styles.phaseProgressLabel}>lessons</span>
                </div>
                <span className={`${styles.phaseArrow} ${isOpen ? styles.open : ''}`}>▸</span>
              </button>

              {isOpen && (
                <div className={styles.modules}>
                  {phase.modules.map(mod => {
                    const modDone = mod.lessons.filter(l => isComplete(l.id)).length
                    return (
                      <div key={mod.id} className={styles.module}>
                        <div className={styles.moduleHeader}>
                          <span className={styles.moduleIcon}>{mod.icon || '◇'}</span>
                          <span className={styles.moduleTitle}>{mod.title}</span>
                          <span className={styles.moduleMeta}>{mod.lessons.length} lessons · ~{mod.estimatedHours}h</span>
                          <span className={styles.moduleProgress}>{modDone}/{mod.lessons.length}</span>
                        </div>
                        <div className={styles.lessons}>
                          {mod.lessons.map((lesson, li) => {
                            const done = isComplete(lesson.id)
                            return (
                              <button
                                key={lesson.id}
                                className={`${styles.lesson} ${done ? styles.done : ''}`}
                                onClick={() => onSelectLesson(phase.id, mod.id, lesson.id)}
                              >
                                <span className={styles.check}>{done ? '✓' : li + 1}</span>
                                <span className={styles.lessonTitle}>{lesson.title}</span>
                                <div className={styles.lessonMeta}>
                                  <span className={styles.lessonTime}>{lesson.estimatedMinutes}m</span>
                                  <span className={`${styles.lvl} ${styles[lesson.difficulty]}`}>
                                    {lesson.difficulty}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
