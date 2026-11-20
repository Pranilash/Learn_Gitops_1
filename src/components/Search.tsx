import { useMemo, useState } from 'react'
import { curriculum } from '../data/curriculum-index'
import styles from './Search.module.css'

interface SearchResult {
  type: 'lesson' | 'module' | 'phase'
  title: string
  path: string
  summary: string
  phaseId: string
  moduleId: string
  lessonId?: string
}

interface Props {
  onSelectLesson: (phaseId: string, moduleId: string, lessonId: string) => void
}

export function Search({ onSelectLesson }: Props) {
  const [query, setQuery] = useState('')

  const allItems = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = []
    for (const phase of curriculum) {
      items.push({
        type: 'phase',
        title: `Phase ${phase.number}: ${phase.title}`,
        path: `Phase ${phase.number}`,
        summary: phase.description,
        phaseId: phase.id,
        moduleId: phase.modules[0]?.id || '',
      })
      for (const mod of phase.modules) {
        items.push({
          type: 'module',
          title: mod.title,
          path: `Phase ${phase.number} › ${mod.title}`,
          summary: mod.description,
          phaseId: phase.id,
          moduleId: mod.id,
        })
        for (const lesson of mod.lessons) {
          // Search through lesson content too
          const contentText = lesson.sections?.map(s => s.title + ' ' + s.content).join(' ') || ''
          const commandText = lesson.commands?.map(c => c.command + ' ' + c.description).join(' ') || ''

          items.push({
            type: 'lesson',
            title: lesson.title,
            path: `Phase ${phase.number} › ${mod.title} › ${lesson.title}`,
            summary: lesson.summary + ' ' + contentText.substring(0, 200) + ' ' + commandText,
            phaseId: phase.id,
            moduleId: mod.id,
            lessonId: lesson.id,
          })
        }
      }
    }
    return items
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allItems
      .filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
      )
      .slice(0, 30)
  }, [query, allItems])

  return (
    <div className={styles.container}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>$</span>
        <input
          className={styles.searchInput}
          placeholder="grep -r 'kubernetes' curriculum/..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {query.trim() && (
        <p className={styles.count}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
      )}

      <div className={styles.results}>
        {results.map((r, i) => (
          <button
            key={i}
            className={styles.result}
            onClick={() => {
              if (r.lessonId) {
                onSelectLesson(r.phaseId, r.moduleId, r.lessonId)
              } else {
                // Navigate to first lesson of module
                const phase = curriculum.find(p => p.id === r.phaseId)
                const mod = phase?.modules.find(m => m.id === r.moduleId)
                if (mod?.lessons[0]) {
                  onSelectLesson(r.phaseId, r.moduleId, mod.lessons[0].id)
                }
              }
            }}
          >
            <span className={styles.resultType}>{r.type}</span>
            <div className={styles.resultBody}>
              <span className={styles.resultTitle}>{r.title}</span>
              <span className={styles.resultPath}>{r.path}</span>
              <span className={styles.resultSummary}>{r.summary.substring(0, 150)}</span>
            </div>
          </button>
        ))}
        {query.trim() && results.length === 0 && (
          <p className={styles.empty}>No results for "{query}"</p>
        )}
      </div>

      {!query.trim() && (
        <p className={styles.empty}>
          Search across all lessons, modules, commands, concepts, and content.
        </p>
      )}
    </div>
  )
}
