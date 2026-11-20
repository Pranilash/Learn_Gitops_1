import { useState, useEffect } from 'react'
import { argoLabs, type ArgoLab } from '../data/argoLabs'
import styles from './ArgoCDLab.module.css'

const STORAGE_KEY = 'academy-completed-argolabs'

export function ArgoCDLab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLab, setSelectedLab] = useState<ArgoLab>(argoLabs[0])
  const [completedLabs, setCompletedLabs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLabs))
  }, [completedLabs])

  const categories = [
    { id: 'all', label: 'All 20 Labs' },
    { id: 'core', label: 'Core Setup' },
    { id: 'reconciliation', label: 'Reconciliation & Drift' },
    { id: 'config-management', label: 'Helm & Kustomize' },
    { id: 'advanced', label: 'Waves & Hooks' },
    { id: 'production', label: 'Production GitOps' },
  ]

  const filteredLabs = argoLabs.filter(l => {
    if (selectedCategory === 'all') return true
    return l.category === selectedCategory
  })

  const toggleLabCompleted = (labId: string) => {
    setCompletedLabs(prev => ({
      ...prev,
      [labId]: !prev[labId],
    }))
  }

  const completedCount = Object.values(completedLabs).filter(Boolean).length

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ argocd lab --full-course</p>
        <h2>Argo CD &amp; GitOps Engineering Laboratory</h2>
        <p className={styles.sub}>
          Twenty comprehensive hands-on GitOps laboratories covering installation, drift detection,
          self-healing, pruning, Helm &amp; Kustomize rendering, sync waves, PreSync migration hooks,
          App-of-Apps, ApplicationSets, and multi-cluster fleet management.
        </p>
        <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Labs Mastered: <strong style={{ color: 'var(--green)' }}>{completedCount} / {argoLabs.length}</strong>
        </div>
      </header>

      {/* Category Filter */}
      <div className={styles.categoryBar}>
        {categories.map(c => (
          <button
            key={c.id}
            className={`${styles.catBtn} ${selectedCategory === c.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Lab List */}
        <aside className={styles.labList}>
          {filteredLabs.map(lab => {
            const isDone = !!completedLabs[lab.id]
            const isActive = selectedLab.id === lab.id
            return (
              <button
                key={lab.id}
                className={`${styles.labItem} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
                onClick={() => setSelectedLab(lab)}
              >
                <div className={styles.labItemTop}>
                  <span>LAB #{lab.number}</span>
                  <span style={{ textTransform: 'uppercase' }}>{lab.category}</span>
                </div>
                <span className={styles.labItemTitle}>
                  {isDone ? '✓ ' : ''}{lab.title}
                </span>
              </button>
            )
          })}
        </aside>

        {/* Selected Lab Details */}
        <main className={styles.labDetail}>
          <div className={styles.labHeader}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
              Laboratory #{selectedLab.number} • Category: {selectedLab.category}
            </div>
            <h3 className={styles.labTitle}>{selectedLab.title}</h3>
          </div>

          <div className={styles.objectiveBox}>
            <strong>🎯 Learning Objective:</strong> {selectedLab.objective}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <strong>Prerequisites:</strong> {selectedLab.prerequisites.join(' • ')}
          </div>

          <h4 className={styles.sectionTitle}>📋 Step-by-Step Instructions</h4>
          <ol className={styles.stepList}>
            {selectedLab.instructions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>

          {selectedLab.yamlFiles.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>📄 Declarative Manifests</h4>
              {selectedLab.yamlFiles.map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>{f.filename} — {f.description}</div>
                  <div className={styles.yamlBox}>{f.content}</div>
                </div>
              ))}
            </div>
          )}

          <h4 className={styles.sectionTitle}>⌨️ CLI Execution &amp; Expected Output</h4>
          {selectedLab.commands.map((cmd, i) => (
            <div key={i} className={styles.cmdCard}>
              <code className={styles.cmdCode}>$ {cmd.command}</code>
              <p className={styles.cmdExp}>{cmd.explanation}</p>
              <div className={styles.cmdOut}>{cmd.expectedOutput}</div>
            </div>
          ))}

          <div className={styles.internalBox}>
            <strong style={{ color: 'var(--cyan)', display: 'block', marginBottom: '0.3rem' }}>
              ⚙️ Under the Hood: What Argo CD Does Internally
            </strong>
            {selectedLab.internalMechanism}
          </div>

          <div className={styles.verifyBar}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Validation Target:</span>
              <code style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>$ {selectedLab.validationCheck.verificationCommand}</code>
            </div>
            <button
              className={styles.verifyBtn}
              onClick={() => toggleLabCompleted(selectedLab.id)}
            >
              {completedLabs[selectedLab.id] ? '✓ Mark as Incomplete' : '✓ Mark Lab as Mastered (+XP)'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
