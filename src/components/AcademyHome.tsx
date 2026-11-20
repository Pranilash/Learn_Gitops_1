import { useEffect, useState } from 'react'
import { curriculum, getTotalLessonCount } from '../data/curriculum-index'
import { useProgress } from '../hooks/useProgress'
import styles from './AcademyHome.module.css'

interface Props {
  onNavigate: (view: string) => void
  onSelectLesson: (phaseId: string, moduleId: string, lessonId: string) => void
}

const bootLines = [
  '$ ./devops-academy --init',
  'booting curriculum engine...................[ ok ]',
  'mounting phases: 9 phases / 40+ modules....[ ok ]',
  'loading code-lab: YAML exercises............[ ok ]',
  'starting terminal simulator.................[ ok ]',
  'loading playgrounds: reconcile|dag|term....[ ok ]',
  'restoring progress from localStorage.......[ ok ]',
  '',
  'welcome, operator. your journey from MERN to GitOps starts here.',
]

export function AcademyHome({ onNavigate, onSelectLesson }: Props) {
  const {
    rank, level, xp, streak, progressPercent,
    lessonsDone, totalLessons: _tl, exercisesDone, totalExercises,
    unlockedAchievements, missionsDone,
  } = useProgress()

  const totalLessons = getTotalLessonCount() || _tl

  const [bootDone, setBootDone] = useState(() => sessionStorage.getItem('academy-booted') === '1')
  const [visibleLines, setVisibleLines] = useState(bootDone ? bootLines.length : 0)

  useEffect(() => {
    if (bootDone) return
    if (visibleLines >= bootLines.length) {
      sessionStorage.setItem('academy-booted', '1')
      const t = setTimeout(() => setBootDone(true), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleLines(v => v + 1), 200)
    return () => clearTimeout(t)
  }, [visibleLines, bootDone])

  const skipBoot = () => {
    sessionStorage.setItem('academy-booted', '1')
    setBootDone(true)
  }

  if (!bootDone) {
    return (
      <div style={{ padding: '3rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }} onClick={skipBoot}>
        {bootLines.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: line.includes('[ ok ]') ? 'var(--green)' : 'var(--text)', marginBottom: '0.2rem' }}>
            {line.includes('[ ok ]') ? (
              <>{line.replace('[ ok ]', '')}<span style={{ color: 'var(--green)' }}>[ ok ]</span></>
            ) : line || '\u00a0'}
          </div>
        ))}
        <span className="cursor-blink" />
        <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>click to skip →</div>
      </div>
    )
  }

  // Find the first incomplete lesson for "continue learning"
  let nextLesson: { phaseId: string; moduleId: string; lessonId: string; title: string } | null = null
  for (const phase of curriculum) {
    for (const mod of phase.modules) {
      for (const lesson of mod.lessons) {
        if (!nextLesson) {
          nextLesson = { phaseId: phase.id, moduleId: mod.id, lessonId: lesson.id, title: lesson.title }
        }
      }
    }
  }

  return (
    <div className={styles.container}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.kicker}>$ whoami</p>
          <h1 className={styles.heroTitle}>
            DevOps, Kubernetes &amp; <span className={styles.accent}>GitOps</span> Academy
          </h1>
          <p className={styles.tagline}>
            From MERN developer to GitOps engineer. 9 phases, 100+ lessons, interactive terminal,
            hands-on labs, quizzes, and capstone projects. Transform your local app into a
            production-grade, GitOps-managed Kubernetes platform.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.primary} onClick={() => onNavigate('workspace')}>
              ⚡ launch vs code workspace
            </button>
            {nextLesson && (
              <button
                className={styles.secondary}
                onClick={() => onSelectLesson(nextLesson!.phaseId, nextLesson!.moduleId, nextLesson!.lessonId)}
              >
                ▸ {lessonsDone > 0 ? 'continue learning' : 'start phase 0'}
              </button>
            )}
            <button className={styles.secondary} onClick={() => onNavigate('curriculum')}>
              browse curriculum
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

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum}>9</span>
          <span className={styles.quickStatLabel}>phases</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum}>{curriculum.reduce((s, p) => s + p.modules.length, 0)}</span>
          <span className={styles.quickStatLabel}>modules</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum}>{totalLessons}</span>
          <span className={styles.quickStatLabel}>lessons</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum}>{totalExercises}</span>
          <span className={styles.quickStatLabel}>labs</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum}>{missionsDone}/3</span>
          <span className={styles.quickStatLabel}>missions</span>
        </div>
      </div>

      {/* Learning Roadmap */}
      <section className={styles.section}>
        <h2 className={styles.h2}># learning roadmap</h2>
        <div className={styles.roadmap}>
          {curriculum.map(phase => {
            const lessons = phase.modules.flatMap(m => m.lessons)
            const totalHours = phase.modules.reduce((s, m) => s + m.estimatedHours, 0)
            return (
              <button
                key={phase.id}
                className={styles.roadmapItem}
                onClick={() => {
                  const firstMod = phase.modules[0]
                  const firstLesson = firstMod?.lessons[0]
                  if (firstLesson) onSelectLesson(phase.id, firstMod.id, firstLesson.id)
                }}
              >
                <span
                  className={styles.roadmapN}
                  style={{
                    background: `${phase.color}22`,
                    color: phase.color,
                    border: `1px solid ${phase.color}44`,
                  }}
                >
                  {phase.number}
                </span>
                <span className={styles.roadmapIcon}>{phase.icon}</span>
                <div className={styles.roadmapBody}>
                  <strong>{phase.title}</strong>
                  <span>{phase.subtitle}</span>
                </div>
                <div className={styles.roadmapMeta}>
                  <span className={styles.roadmapCount}>{lessons.length} lessons</span>
                  <span className={styles.roadmapLabel}>~{totalHours}h</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Playgrounds */}
      <section className={styles.section}>
        <h2 className={styles.h2}># interactive engineering laboratories</h2>
        <div className={styles.playGrid}>
          <button className={styles.playCard} onClick={() => onNavigate('workspace')}>
            <span className={styles.playIcon}>⚡</span>
            <h3>VS Code Learning Workspace</h3>
            <p>Killercoda-style guided labs and SadServers-style troubleshooting challenges with resizable editor, VFS, and integrated terminal.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('argolab')}>
            <span className={styles.playIcon}>🎯</span>
            <h3>Argo CD GitOps Lab</h3>
            <p>20 practical laboratories: drift detection, self-healing, pruning, sync waves, migration hooks, and AppSets.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('troubleshoot')}>
            <span className={styles.playIcon}>🚨</span>
            <h3>K8s Troubleshooting Arena</h3>
            <p>Triage real production incidents: CrashLoopBackOff, ImagePullBackOff, OOMKilled, and NetworkPolicy drops.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('realinfra')}>
            <span className={styles.playIcon}>⚙️</span>
            <h3>Real Local Infrastructure Guide</h3>
            <p>Step-by-step verified setup guides for real Docker Engine, kind multi-node clusters, Helm, and Argo CD.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('competency')}>
            <span className={styles.playIcon}>📊</span>
            <h3>Competency Matrix</h3>
            <p>Automated skill diagnostic across 8 engineering domains with personalized recommendations.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('capstones')}>
            <span className={styles.playIcon}>🏗️</span>
            <h3>Capstone Projects</h3>
            <p>5 end-to-end projects transforming MERN from local code to an enterprise cloud-native platform.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('terminal')}>
            <span className={styles.playIcon}>🖥️</span>
            <h3>Academy Terminal</h3>
            <p>Practice Linux, Git, Docker, kubectl, Helm, ArgoCD, and Terraform commands in a simulated environment.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('lab')}>
            <span className={styles.playIcon}>🧪</span>
            <h3>Code Lab (12 YAML Labs)</h3>
            <p>Write real Deployment, Service, PVC, HPA, Ingress, ArgoCD, and Kyverno policy YAML with live checks.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('reconcile')}>
            <span className={styles.playIcon}>🛰️</span>
            <h3>Reconcile Loop Simulator</h3>
            <p>Edit Git, break the cluster, and observe automated level-triggered reconciliation convergence.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('pipeline')}>
            <span className={styles.playIcon}>🔁</span>
            <h3>Pipeline DAG Simulator</h3>
            <p>Step through commit → CI → container registry → Argo CD sync → live rolling update.</p>
          </button>
          <button className={styles.playCard} onClick={() => onNavigate('commands')}>
            <span className={styles.playIcon}>📖</span>
            <h3>Command Explorer</h3>
            <p>Searchable reference of Linux, git, kubectl, argocd, helm, and docker commands.</p>
          </button>
        </div>
      </section>
    </div>
  )
}
