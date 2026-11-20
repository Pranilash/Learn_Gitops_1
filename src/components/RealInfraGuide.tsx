import { useState } from 'react'
import { realInfraGuides } from '../data/realInfraGuides'
import styles from './RealInfraGuide.module.css'

export function RealInfraGuide() {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'macos' | 'linux'>('windows')

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ uname -s &amp;&amp; which docker kind kubectl</p>
        <h2>Real Local Infrastructure Setup Pathway</h2>
        <p className={styles.sub}>
          Transition from browser simulation to genuine engineering execution. Follow these guided pathways
          to install real Docker Engine, kind multi-node Kubernetes clusters, Helm, and Argo CD on your local machine.
        </p>
      </header>

      {/* OS Selector */}
      <div className={styles.osSelector}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '0.4rem' }}>Target OS:</span>
        <button
          className={`${styles.osBtn} ${selectedOS === 'windows' ? styles.active : ''}`}
          onClick={() => setSelectedOS('windows')}
        >
          🪟 Windows (WSL 2 / PowerShell)
        </button>
        <button
          className={`${styles.osBtn} ${selectedOS === 'macos' ? styles.active : ''}`}
          onClick={() => setSelectedOS('macos')}
        >
          🍎 macOS (Apple Silicon / Intel)
        </button>
        <button
          className={`${styles.osBtn} ${selectedOS === 'linux' ? styles.active : ''}`}
          onClick={() => setSelectedOS('linux')}
        >
          🐧 Linux (Ubuntu / Debian / Fedora)
        </button>
      </div>

      <div className={styles.guidesGrid}>
        {realInfraGuides.map(guide => {
          const platform = guide.platforms.find(p => p.os === selectedOS) || guide.platforms[0]

          return (
            <article key={guide.id} className={styles.guideCard}>
              <h3 className={styles.guideTitle}>{guide.title}</h3>
              <p className={styles.guideSummary}>{guide.summary}</p>

              <div className={styles.stepSection}>
                <h4 className={styles.stepHeading}>Step 1: Installation Steps</h4>
                <ul className={styles.stepList}>
                  {platform.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.stepSection}>
                <h4 className={styles.stepHeading}>Step 2: Terminal Commands</h4>
                <div className={styles.codeBlock}>
                  {platform.commands.map((cmd, i) => (
                    <div key={i}>$ {cmd}</div>
                  ))}
                </div>
              </div>

              {guide.scriptSnippet && (
                <div className={styles.stepSection}>
                  <h4 className={styles.stepHeading}>Configuration / Bootstrap Script: {guide.scriptSnippet.filename}</h4>
                  <div className={styles.codeBlock}>{guide.scriptSnippet.code}</div>
                </div>
              )}

              <div className={styles.verifySection}>
                <strong>✓ Verification Command:</strong>
                <code style={{ display: 'block', margin: '0.3rem 0', color: 'var(--green)' }}>
                  $ {guide.verificationCommand}
                </code>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  Expected output: {guide.expectedOutput}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
