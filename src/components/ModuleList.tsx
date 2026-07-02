import { modules } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'
import styles from './ModuleList.module.css'

interface ModuleListProps {
  onSelectLesson: (moduleId: string, lessonId: string) => void
}

export function ModuleList({ onSelectLesson }: ModuleListProps) {
  const { isComplete } = useProgress()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ ls -R curriculum/</p>
        <h2>Modules</h2>
        <p className={styles.sub}>Beginner → Advanced. Each lesson grants 50 XP. Green check = completed.</p>
      </header>

      {modules.map((module, mi) => {
        const done = module.lessons.filter((l) => isComplete(l.id)).length
        return (
          <section key={module.id} className={styles.module}>
            <div className={styles.moduleHead}>
              <span className={styles.moduleIcon}>{module.icon}</span>
              <div className={styles.moduleMeta}>
                <h3>
                  <span className={styles.moduleN}>{String(mi).padStart(2, '0')}</span> {module.title}
                  <span className={`${styles.lvl} ${styles[module.level]}`}>{module.level}</span>
                </h3>
                <p>{module.description}</p>
              </div>
              <span className={styles.moduleProgress}>
                {done}/{module.lessons.length}
              </span>
            </div>

            <div className={styles.lessons}>
              {module.lessons.map((lesson, li) => {
                const complete = isComplete(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    className={`${styles.lesson} ${complete ? styles.done : ''}`}
                    onClick={() => onSelectLesson(module.id, lesson.id)}
                  >
                    <span className={styles.check}>{complete ? '✓' : `${li + 1}`}</span>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                    <span className={styles.lessonSummary}>{lesson.summary}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
