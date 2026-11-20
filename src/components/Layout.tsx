import type { ReactNode } from 'react'
import { useProgress } from '../hooks/useProgress'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
  currentView: string
  onNavigate: (view: string) => void
}

const navGroups: { label: string; items: { id: string; label: string }[] }[] = [
  {
    label: 'learn',
    items: [
      { id: 'home', label: 'dashboard' },
      { id: 'curriculum', label: 'curriculum' },
      { id: 'capstones', label: 'capstones' },
      { id: 'search', label: 'search' },
      { id: 'commands', label: 'commands' },
      { id: 'references', label: 'references' },
      { id: 'realinfra', label: 'real-infra-guide' },
    ],
  },
  {
    label: 'practice',
    items: [
      { id: 'workspace', label: 'vscode-workspace' },
      { id: 'argolab', label: 'argo-gitops-lab' },
      { id: 'troubleshoot', label: 'k8s-troubleshoot' },
      { id: 'terminal', label: 'terminal-sim' },
      { id: 'lab', label: 'code-lab' },
      { id: 'reconcile', label: 'reconcile-loop' },
      { id: 'pipeline', label: 'pipeline-dag' },
    ],
  },
  {
    label: 'profile',
    items: [
      { id: 'competency', label: 'competency-matrix' },
      { id: 'notes', label: 'my-notes' },
      { id: 'achievements', label: 'achievements' },
    ],
  },
]

function isActiveNav(itemId: string, currentView: string): boolean {
  if (itemId === currentView) return true
  if (itemId === 'workspace' && (currentView === 'workspace' || currentView.startsWith('scenario:'))) return true
  if (itemId === 'curriculum' && currentView.startsWith('academy:')) return true
  if (itemId === 'lab' && currentView.startsWith('lab:')) return true
  return false
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { rank, level, xp, xpToNext, nextRank, rankProgress, streak, progressPercent } = useProgress()

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.chrome}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
          <span className={styles.chromeTitle}>devops://academy</span>
        </div>

        <button className={styles.brand} onClick={() => onNavigate('home')}>
          <span className={styles.prompt}>$</span>
          <span className={styles.brandText}>devops-academy</span>
          <span className="cursor-blink" />
        </button>

        <nav className={styles.nav}>
          {navGroups.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <span className={styles.navGroupLabel}># {group.label}</span>
              {group.items.map((item) => {
                const active = isActiveNav(item.id, currentView)
                return (
                  <button
                    key={item.id}
                    className={`${styles.navItem} ${active ? styles.active : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={styles.navArrow}>{active ? '▸' : ' '}</span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className={styles.profile}>
          <div className={styles.rankRow}>
            <span className={styles.rankIcon}>{rank.icon}</span>
            <div className={styles.rankText}>
              <span className={styles.rankName}>{rank.name}</span>
              <span className={styles.rankLvl}>lvl {level} · {xp} XP</span>
            </div>
            <span className={styles.streak} title="day streak">🔥{streak}</span>
          </div>

          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${rankProgress}%` }} />
          </div>
          <span className={styles.xpHint}>
            {nextRank ? `${xpToNext} XP → ${nextRank.name}` : 'max rank reached'}
          </span>

          <div className={styles.totalRow}>
            <span>overall</span>
            <span>{progressPercent}%</span>
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  )
}
