import { useState, useCallback } from 'react'
import type { AcademyLesson, AcademyModule, AcademyPhase, QuizQuestion } from '../data/types'
import { useProgress } from '../hooks/useProgress'
import { AcademyTerminal } from './AcademyTerminal'
import styles from './AcademyLessonViewer.module.css'

interface Props {
  phase: AcademyPhase
  module: AcademyModule
  lesson: AcademyLesson
  lessonIndex: number
  onBack: () => void
  onNext?: () => void
  hasNext: boolean
}

type TabId = 'content' | 'terminal' | 'quiz' | 'notes' | 'references'

function renderMarkdown(md: string): string {
  // Simple markdown-to-HTML renderer for lesson content
  let html = md
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Paragraphs (lines that aren't already wrapped)
  html = html.replace(/^(?!<[hupob]|<li|<blockquote|<pre)(.+)$/gm, '<p>$1</p>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '')

  return html
}

function QuizCard({ question, onCorrect }: { question: QuizQuestion; onCorrect: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const isCorrect = selected === question.correctAnswer

  const handleCheck = () => {
    if (!selected) return
    setChecked(true)
    if (selected === question.correctAnswer) {
      onCorrect()
    }
  }

  return (
    <div className={styles.quizCard}>
      <div className={styles.quizQuestion}>{question.question}</div>
      {question.options && (
        <div className={styles.quizOptions}>
          {question.options.map((opt, i) => {
            let optClass = styles.quizOption
            if (checked && opt === question.correctAnswer) optClass += ` ${styles.correct}`
            else if (checked && opt === selected && !isCorrect) optClass += ` ${styles.wrong}`
            else if (!checked && opt === selected) optClass += ` ${styles.selected}`

            return (
              <button
                key={i}
                className={optClass}
                onClick={() => !checked && setSelected(opt)}
                disabled={checked}
              >
                <span>{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            )
          })}
        </div>
      )}
      {!checked && (
        <button className={styles.quizCheckBtn} onClick={handleCheck} disabled={!selected}>
          ▸ check answer
        </button>
      )}
      {checked && (
        <div className={styles.quizExplanation}>
          <strong>{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
          {question.explanation}
          {isCorrect && <span className={styles.quizXp}> +{question.xp} XP</span>}
        </div>
      )}
    </div>
  )
}

export function AcademyLessonViewer({
  phase,
  module: mod,
  lesson,
  lessonIndex,
  onBack,
  onNext,
  hasNext,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('content')
  const { isComplete, markComplete } = useProgress()
  const complete = isComplete(lesson.id)

  // Notes state
  const notesKey = `academy-notes-${lesson.id}`
  const [noteText, setNoteText] = useState(() => localStorage.getItem(notesKey) || '')
  const [noteSaved, setNoteSaved] = useState(true)

  const saveNote = useCallback(() => {
    localStorage.setItem(notesKey, noteText)
    setNoteSaved(true)
  }, [notesKey, noteText])

  const quizCount = lesson.quiz?.length || 0
  const cmdCount = lesson.commands?.length || 0
  const refCount = lesson.references?.length || 0

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'content', label: 'lesson' },
    { id: 'terminal', label: 'terminal' },
    { id: 'quiz', label: 'quiz', count: quizCount },
    { id: 'notes', label: 'notes' },
    { id: 'references', label: 'refs', count: refCount },
  ]

  // Terminal quick commands based on lesson commands
  const terminalQuickCmds = lesson.commands?.slice(0, 5).map(c => c.command) || [
    'help', 'ls', 'pwd', 'kubectl get pods',
  ]

  return (
    <div className={styles.container}>
      {/* Back button */}
      <button className={styles.back} onClick={onBack}>
        ← cd ../{mod.title.toLowerCase().replace(/\s+/g, '-')}
      </button>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <span className={styles.phaseTag} style={{ background: `${phase.color}22`, color: phase.color, border: `1px solid ${phase.color}44` }}>
            {phase.icon} Phase {phase.number}
          </span>
          <span>›</span>
          <span>{mod.title}</span>
          <span>›</span>
          <span>Lesson {lessonIndex + 1}/{mod.lessons.length}</span>
        </div>
        <h1 className={styles.title}>{lesson.title}</h1>
        <p className={styles.summary}>{lesson.summary}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>⏱ {lesson.estimatedMinutes} min</span>
          <span className={`${styles.metaItem} ${styles.levelTag} ${styles[lesson.difficulty]}`}>
            {lesson.difficulty}
          </span>
          {cmdCount > 0 && <span className={styles.metaItem}>⌨ {cmdCount} commands</span>}
          {quizCount > 0 && <span className={styles.metaItem}>📝 {quizCount} quiz questions</span>}
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className={styles.tabBadge}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div>
          {/* Learning Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className={styles.objectives}>
              <h3># learning objectives</h3>
              <ul className={styles.objectiveList}>
                {lesson.objectives.map((obj, i) => (
                  <li key={i}>
                    <span>{obj.text}</span>
                    <span className={styles.skillTag}>{obj.skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Content Sections */}
          <div className={styles.content}>
            {lesson.sections.map((section, i) => (
              <div key={i}>
                <h2>
                  {section.title}
                  {section.level && (
                    <span className={`${styles.levelTag} ${styles[section.level]}`}>
                      {section.level}
                    </span>
                  )}
                </h2>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }} />
              </div>
            ))}
          </div>

          {/* Commands */}
          {lesson.commands && lesson.commands.length > 0 && (
            <section>
              <h2 className={styles.content}>
                <span style={{ color: 'var(--green-soft)' }}># commands in this lesson</span>
              </h2>
              <div className={styles.commands}>
                {lesson.commands.map((cmd, i) => (
                  <div key={i} className={styles.commandCard}>
                    <code>$ {cmd.command}</code>
                    <p>{cmd.description}</p>
                    <pre><code>{cmd.example}</code></pre>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      <strong>When:</strong> {cmd.whenToUse}
                    </p>
                    {cmd.commonMistakes && cmd.commonMistakes.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {cmd.commonMistakes.map((m, j) => (
                          <div key={j} className={`${styles.infoCard} ${styles.mistake}`}>
                            <span className={styles.infoIcon}>⚠</span> {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Common Mistakes */}
          {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
            <section style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: 'var(--amber)', fontSize: '0.95rem' }}>⚠ common mistakes</h3>
              <div className={styles.infoCards}>
                {lesson.commonMistakes.map((m, i) => (
                  <div key={i} className={`${styles.infoCard} ${styles.mistake}`}>
                    <span className={styles.infoIcon}>✗</span> {m}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Best Practices */}
          {lesson.bestPractices && lesson.bestPractices.length > 0 && (
            <section style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'var(--green-soft)', fontSize: '0.95rem' }}>✓ best practices</h3>
              <div className={styles.infoCards}>
                {lesson.bestPractices.map((bp, i) => (
                  <div key={i} className={`${styles.infoCard} ${styles.bestPractice}`}>
                    <span className={styles.infoIcon}>✓</span> {bp}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Security Considerations */}
          {lesson.securityConsiderations && lesson.securityConsiderations.length > 0 && (
            <section style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'var(--red)', fontSize: '0.95rem' }}>🔒 security</h3>
              <div className={styles.infoCards}>
                {lesson.securityConsiderations.map((sc, i) => (
                  <div key={i} className={`${styles.infoCard} ${styles.mistake}`}>
                    <span className={styles.infoIcon}>🔒</span> {sc}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key Takeaways */}
          <div className={styles.takeaways}>
            <h3># key takeaways</h3>
            <ul>
              {lesson.keyTakeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Interview Questions */}
          {lesson.interviewQuestions && lesson.interviewQuestions.length > 0 && (
            <section style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'var(--cyan)', fontSize: '0.95rem' }}>💬 interview questions</h3>
              <div className={styles.infoCards}>
                {lesson.interviewQuestions.map((q, i) => (
                  <div key={i} className={`${styles.infoCard} ${styles.interview}`}>
                    <span className={styles.infoIcon}>Q{i + 1}.</span> {q}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className={styles.terminalTab}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.8rem' }}>
            Practice commands from this lesson. This is a simulated environment — safe to experiment.
          </p>
          <AcademyTerminal quickCommands={terminalQuickCmds} fullHeight />
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className={styles.quizSection}>
          {lesson.quiz && lesson.quiz.length > 0 ? (
            lesson.quiz.map((q) => (
              <QuizCard key={q.id} question={q} onCorrect={() => {}} />
            ))
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>No quiz questions for this lesson yet.</p>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className={styles.noteEditor}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Your personal notes for this lesson (saved in your browser).
          </p>
          <textarea
            className={styles.noteTextarea}
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value)
              setNoteSaved(false)
            }}
            placeholder="Type your notes here... Markdown is supported."
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className={styles.noteSaveBtn} onClick={saveNote}>
              {noteSaved ? '✓ saved' : '▸ save notes'}
            </button>
            {!noteSaved && <span style={{ fontSize: '0.72rem', color: 'var(--amber)' }}>unsaved changes</span>}
          </div>
        </div>
      )}

      {activeTab === 'references' && (
        <div className={styles.references}>
          {lesson.references && lesson.references.length > 0 ? (
            lesson.references.map((ref, i) => (
              <div key={i} className={styles.refCard}>
                <span className={styles.refType}>{ref.type}</span>
                <div className={styles.refBody}>
                  <a href={ref.url} target="_blank" rel="noopener" className={styles.refTitle}>
                    {ref.title} ↗
                  </a>
                  {ref.author && <span className={styles.refDesc}>{ref.author}{ref.date ? ` · ${ref.date}` : ''}</span>}
                  <span className={styles.refDesc}>{ref.description}</span>
                </div>
                <span className={`${styles.refPriority} ${styles[ref.priority]}`}>{ref.priority}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>No references for this lesson yet.</p>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        {!complete ? (
          <button className={styles.completeBtn} onClick={() => markComplete(lesson.id)}>
            ✓ mark complete (+50 XP)
          </button>
        ) : (
          <span className={styles.doneLabel}>✓ completed · +50 XP banked</span>
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
