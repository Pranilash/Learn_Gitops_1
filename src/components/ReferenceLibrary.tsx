import { useState, useMemo } from 'react'
import { libraryReferences } from '../data/references'
import styles from './ReferenceLibrary.module.css'

export function ReferenceLibrary() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [search, setSearch] = useState('')

  const types = ['all', 'paper', 'specification', 'book', 'documentation', 'rfc']
  const priorities = ['all', 'required', 'recommended', 'advanced']

  const filtered = useMemo(() => {
    return libraryReferences.filter(r => {
      if (selectedType !== 'all' && r.type !== selectedType) return false
      if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const text = `${r.title} ${r.description} ${r.author || ''} ${r.tags.join(' ')}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [selectedType, selectedPriority, search])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ man library-references</p>
        <h2>Technical Documentation &amp; Research Library</h2>
        <p className={styles.sub}>
          Verified authoritative references: landmark systems engineering research papers (Google Borg, Omega),
          official CNCF specifications, SRE manuals, and foundational cloud-native literature.
        </p>
      </header>

      <input
        type="text"
        className={styles.searchBar}
        placeholder="Filter by title, author, topic, or tag (e.g. Borg, SRE, OCI)..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className={styles.filters}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '0.2rem' }}>Type:</span>
        {types.map(t => (
          <button
            key={t}
            className={`${styles.filterBtn} ${selectedType === t ? styles.active : ''}`}
            onClick={() => setSelectedType(t)}
          >
            {t}
          </button>
        ))}

        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center', marginLeft: '0.8rem', marginRight: '0.2rem' }}>Priority:</span>
        {priorities.map(p => (
          <button
            key={p}
            className={`${styles.filterBtn} ${selectedPriority === p ? styles.active : ''}`}
            onClick={() => setSelectedPriority(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((item, idx) => (
          <article key={idx} className={styles.card}>
            <div className={styles.cardTop}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.titleLink}>
                {item.title} ↗
              </a>
              <div className={styles.badges}>
                <span className={styles.typeBadge}>{item.type}</span>
                <span className={`${styles.priorityBadge} ${styles[item.priority]}`}>{item.priority}</span>
              </div>
            </div>

            <div className={styles.metaRow}>
              {item.author && <span>By <strong>{item.author}</strong></span>}
              {item.date && <span>• {item.date}</span>}
              <span>• Category: <strong>{item.category}</strong></span>
              <span>• Difficulty: <strong style={{ textTransform: 'capitalize' }}>{item.difficulty}</strong></span>
            </div>

            <p className={styles.desc}>{item.description}</p>

            <div className={styles.tags}>
              {item.tags.map((tag, tIdx) => (
                <span key={tIdx} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-dim)', padding: '2rem 0' }}>
            No references match your current filter criteria.
          </p>
        )}
      </div>
    </div>
  )
}
