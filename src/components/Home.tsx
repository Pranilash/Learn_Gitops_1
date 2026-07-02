import { useEffect, useState } from 'react'
import { modules } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'
import styles from './Home.module.css'

interface HomeProps {
  onNavigate: (view: string) => void
  onSelectLesson: (moduleId: string, lessonId: string) => void
}

const bootLines = [
  '$ ./gitops-learn --init',
  'booting reconciliation engine...........[ ok ]',
  'mounting curriculum: 6 modules / 23 lessons.[ ok ]',
  'loading code-lab: 8 yaml exercises........[ ok ]',
  'starting playgrounds: reconcile|dag|term..[ ok ]',
  'restoring progress from localStorage......[ ok ]',
  '',
  'welcome, operator. git is the source of truth.',
]

export function Home({ onNavigate, onSelectLesson }: HomeProps) {
  const { rank, level, xp, streak, progressPercent, lessonsDone, totalLessons, exercisesDone, totalExercises, unlockedAchievements } =
    useProgress()
  const [bootDone, setBootDone] = useState(() => sessionStorage.getItem('gitops-booted') === '1')
  const [visibleLines, setVisibleLines] = useState(bootDone ? bootLines.length : 0)

  useEffect(() => {
    if (bootDone) return
    if (visibleLines >= bootLines.length) {
      sessionStorage.setItem('gitops-booted', '1')
      const t = setTimeout(() => setBootDone(true), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 260)
    return () => clearTimeout(t)
  }, [visibleLines, bootDone])

  const skipBoot = () => {
    sessionStorage.setItem('gitops-booted', '1')
    setBootDone(true)
  }

  if (!bootDone) {
    return (
      <div className={styles.boot} onClick={skipBoot}>
        <div className={styles.bootInner}>
          {bootLines.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={styles.bootLine}>
              {line.includes('[ ok ]') ? (
                <>
                  {line.replace('[ ok ]', '')}
                  <span className={styles.ok}>[ ok ]</span>
                </>
              ) : (
                line || '\u00a0'
              )}
            </div>
          ))}
          <span className="cursor-blink" />
        </div>
        <span className={styles.skip}>click to skip →</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.kicker}>$ whoami</p>
          <h1>
            Learn <span className={styles.accent}>GitOps</span> from scratch
          </h1>
          <p className={styles.tagline}>
            You already know Git. GitOps is that same brain applied to running software: Git is the source of
            truth, and a control loop makes reality match it. Interactive, gamified, terminal-native.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.primary} onClick={() => onSelectLesson('foundations', 'what-is-gitops')}>
              ▸ start lesson 01
            </button>
            <button className={styles.secondary} onClick={() => onNavigate('reconcile')}>
              open reconcile playground
            </button>
          </div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <span>~/profile</span>
            <span className={styles.streakTag}>🔥 {streak}d streak</span>
          </div>
          <div className={styles.rankBig}>
            <span className={styles.rankBigIcon}>{rank.icon}</span>
            <div>
              <div className={styles.rankBigName}>{rank.name}</div>
              <div className={styles.rankBigSub}>level {level} · {xp} XP</div>
            </div>
          </div>
          <div className={styles.statGrid}>
            <div><span className={styles.statNum}>{lessonsDone}/{totalLessons}</span><span className={styles.statLbl}>lessons</span></div>
            <div><span className={styles.statNum}>{exercisesDone}/{totalExercises}</span><span className={styles.statLbl}>labs</span></div>
            <div><span className={styles.statNum}>{unlockedAchievements.length}</span><span className={styles.statLbl}>badges</span></div>
            <div><span className={styles.statNum}>{progressPercent}%</span><span className={styles.statLbl}>complete</span></div>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.h2}># recommended path</h2>
        <div className={styles.path}>
          <button className={styles.pathStep} onClick={() => onSelectLesson('foundations', 'what-is-gitops')}>
            <span className={styles.pathN}>01</span>
            <div><strong>Foundations</strong><span>Reconciliation loop, declarative vs imperative</span></div>
          </button>
          <button className={styles.pathStep} onClick={() => onNavigate('reconcile')}>
            <span className={styles.pathN}>02</span>
            <div><strong>Reconcile Playground</strong><span>Cause drift, watch self-heal — feel the loop</span></div>
          </button>
          <button className={styles.pathStep} onClick={() => onNavigate('lab')}>
            <span className={styles.pathN}>03</span>
            <div><strong>Code Lab</strong><span>Write real Deployment & Argo CD YAML</span></div>
          </button>
          <button className={styles.pathStep} onClick={() => onSelectLesson('argocd', 'argocd-architecture')}>
            <span className={styles.pathN}>04</span>
            <div><strong>Argo CD</strong><span>The controller your team actually runs</span></div>
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}># modules</h2>
        <div className={styles.modGrid}>
          {modules.map((m) => (
            <button key={m.id} className={styles.modCard} onClick={() => onSelectLesson(m.id, m.lessons[0].id)}>
              <span className={styles.modIcon}>{m.icon}</span>
              <div className={styles.modBody}>
                <div className={styles.modTitleRow}>
                  <strong>{m.title}</strong>
                  <span className={`${styles.lvl} ${styles[m.level]}`}>{m.level}</span>
                </div>
                <span className={styles.modDesc}>{m.description}</span>
                <span className={styles.modMeta}>{m.lessons.length} lessons</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}># you already know this (DSA → GitOps)</h2>
        <div className={styles.dsaGrid}>
          <div className={styles.dsaCard}><span className={styles.dsaK}>while-loop</span><span className={styles.dsaV}>reconciliation loop</span></div>
          <div className={styles.dsaCard}><span className={styles.dsaK}>graph / DAG</span><span className={styles.dsaV}>sync waves, CI pipeline</span></div>
          <div className={styles.dsaCard}><span className={styles.dsaK}>tree</span><span className={styles.dsaV}>config repo, app-of-apps</span></div>
          <div className={styles.dsaCard}><span className={styles.dsaK}>inheritance</span><span className={styles.dsaV}>kustomize base + overlay</span></div>
          <div className={styles.dsaCard}><span className={styles.dsaK}>git revert</span><span className={styles.dsaV}>production rollback</span></div>
          <div className={styles.dsaCard}><span className={styles.dsaK}>idempotency</span><span className={styles.dsaV}>declarative apply</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}># playgrounds</h2>
        <div className={styles.playGrid}>
          <button className={styles.playCard} onClick={() => onNavigate('reconcile')}>
            <span className={styles.playIcon}>🛰️</span>
            <h3>Reconcile Loop</h3>
            <p>Edit Git, break the cluster, watch the loop converge & self-heal.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('pipeline')}>
            <span className={styles.playIcon}>🔁</span>
            <h3>Pipeline DAG</h3>
            <p>Step through commit → CI → image → Argo sync → live pods.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('terminal')}>
            <span className={styles.playIcon}>⌨️</span>
            <h3>Terminal Sim</h3>
            <p>Run git / kubectl / argocd commands against a fake cluster.</p>
          </button>
        </div>
      </section>
    </div>
  )
}
