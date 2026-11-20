import { useState, useEffect } from 'react'
import { curriculum } from '../data/curriculum-index'
import styles from './NotesNotebook.module.css'

interface NoteItem {
  lessonId: string
  lessonTitle: string
  phaseId: string
  moduleId: string
  content: string
}

interface Props {
  onSelectLesson: (phaseId: string, moduleId: string, lessonId: string) => void
}

export function NotesNotebook({ onSelectLesson }: Props) {
  const [notes, setNotes] = useState<NoteItem[]>([])

  useEffect(() => {
    const loadedNotes: NoteItem[] = []
    for (const phase of curriculum) {
      for (const mod of phase.modules) {
        for (const lesson of mod.lessons) {
          const val = localStorage.getItem(`academy-notes-${lesson.id}`)
          if (val && val.trim().length > 0) {
            loadedNotes.push({
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              phaseId: phase.id,
              moduleId: mod.id,
              content: val,
            })
          }
        }
      }
    }
    setNotes(loadedNotes)
  }, [])

  const exportNotesAsMarkdown = () => {
    let md = '# DevOps Academy — Personal Engineering Notes\n\n'
    notes.forEach(n => {
      md += `## ${n.lessonTitle}\n\n${n.content}\n\n---\n\n`
    })
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devops-academy-notes-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ cat ~/.academy/notes/*</p>
        <h2>Personal Engineering Notes &amp; Revision</h2>
        <p className={styles.sub}>
          All technical notes taken during lessons across your DevOps and GitOps learning journey.
          Stored securely in your local browser storage.
        </p>
      </header>

      {notes.length > 0 && (
        <div className={styles.actions}>
          <button className={styles.btn} onClick={exportNotesAsMarkdown}>
            📥 Export All Notes (.md)
          </button>
        </div>
      )}

      {notes.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven't written any notes yet.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-dim)' }}>
            Open any lesson, click on the <strong>notes</strong> tab, and jot down insights or commands to see them here!
          </p>
        </div>
      ) : (
        <div className={styles.notesList}>
          {notes.map(n => (
            <div key={n.lessonId} className={styles.noteCard}>
              <div className={styles.noteHead}>
                <span
                  className={styles.lessonTitle}
                  onClick={() => onSelectLesson(n.phaseId, n.moduleId, n.lessonId)}
                >
                  {n.lessonTitle} ↗
                </span>
              </div>
              <div className={styles.noteContent}>{n.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
