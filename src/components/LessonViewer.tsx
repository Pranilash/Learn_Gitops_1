import type { Lesson, Module } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'
import styles from './LessonViewer.module.css'

interface LessonViewerProps {
  module: Module
  lesson: Lesson
  lessonIndex: number
  lessonTotal: number
  onBack: () => void
  onNext?: () => void
  hasNext: boolean
  onOpenLab?: () => void
}

export function LessonViewer({
  module,
  lesson,
  lessonIndex,
  lessonTotal,
  onBack,
  onNext,
  hasNext,
  onOpenLab,
}: LessonViewerProps) {
  const { isComplete, markComplete } = useProgress()
  const complete = isComplete(lesson.id)

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={onBack}>
        ← cd ../{module.title.toLowerCase().replace(/\s+/g, '-')}
      </button>

      <header className={styles.header}>
        <span className={styles.moduleTag}>
          {module.icon} {module.title} · lesson {lessonIndex + 1}/{lessonTotal}
        </span>
        <h2>{lesson.title}</h2>
        <p className={styles.summary}>{lesson.summary}</p>
      </header>

      <div className={styles.content}>
        {lesson.content.map((paragraph, i) => {
          if (paragraph.startsWith('```')) {
            const code = paragraph.replace(/```\w*\n?/, '').replace(/```\s*$/, '').trim()
            return (
              <pre key={i}>
                <code>{code}</code>
              </pre>
            )
          }
          return <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(paragraph) }} />
        })}
      </div>

      {lesson.commands && lesson.commands.length > 0 && (
        <section className={styles.section}>
          <h3># commands in this lesson</h3>
          <div className={styles.commands}>
            {lesson.commands.map((cmd, i) => (
              <div key={i} className={styles.commandCard}>
                <code className={styles.command}>$ {cmd.command}</code>
                <p>{cmd.description}</p>
                <pre>
                  <code>{cmd.example}</code>
                </pre>
                {cmd.gitEquivalent && <span className={styles.gitEq}>git brain: {cmd.gitEquivalent}</span>}
                <span className={styles.when}>when: {cmd.whenToUse}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {lesson.exercise && (
        <section className={styles.exercise}>
          <h3>▸ try it yourself</h3>
          <p>{lesson.exercise}</p>
          {onOpenLab && (
            <button className={styles.labLink} onClick={onOpenLab}>
              open code-lab →
            </button>
          )}
        </section>
      )}

      <section className={styles.takeaways}>
        <h3># key takeaways</h3>
        <ul>
          {lesson.keyTakeaways.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <footer className={styles.footer}>
        {!complete ? (
          <button className={styles.completeBtn} onClick={() => markComplete(lesson.id)}>
            ✓ mark complete (+50 XP)
          </button>
        ) : (
          <span className={styles.done}>✓ completed · +50 XP banked</span>
        )}
        {hasNext && onNext && (
          <button className={styles.nextBtn} onClick={onNext}>
            next lesson →
          </button>
        )}
      </footer>
    </div>
  )
}

/** minimal inline rendering: **bold** and `code`. Input is trusted curriculum data. */
function renderInline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+?)`/g, '<code class="inlineCode">$1</code>')
}
