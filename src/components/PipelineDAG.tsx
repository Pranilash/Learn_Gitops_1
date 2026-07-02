import { useEffect, useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import styles from './PipelineDAG.module.css'

interface Stage {
  id: string
  actor: 'dev' | 'ci' | 'registry' | 'git' | 'argo' | 'k8s'
  cmd: string
  detail: string
  dsa: string
}

const stages: Stage[] = [
  { id: 'code', actor: 'dev', cmd: 'git push origin main', detail: 'You merge a PR in the app repo', dsa: 'queue: enqueue work' },
  { id: 'ci', actor: 'ci', cmd: 'ci: run tests', detail: 'CI triggers on main; unit + integration tests pass', dsa: 'DAG: first node' },
  { id: 'build', actor: 'ci', cmd: 'docker build -t web:sha-9f2c1a4', detail: 'Image built & tagged with the commit SHA (immutable)', dsa: 'stack: layer build' },
  { id: 'push', actor: 'registry', cmd: 'docker push ghcr.io/acme/web:sha-9f2c1a4', detail: 'Image lands in the registry', dsa: 'graph: edge to registry' },
  { id: 'bump', actor: 'git', cmd: 'ci: commit tag → config-repo', detail: 'CI writes the new tag into overlays/prod (the handoff)', dsa: 'tree: edit a leaf' },
  { id: 'detect', actor: 'argo', cmd: 'argocd: poll repo', detail: 'Argo CD sees a new commit → marks app OutOfSync', dsa: 'loop: detect diff' },
  { id: 'sync', actor: 'argo', cmd: 'argocd app sync web-prod', detail: 'Renders manifests, applies to the cluster', dsa: 'loop: apply' },
  { id: 'rollout', actor: 'k8s', cmd: 'kubectl rollout', detail: 'New pods roll out; old ones drain', dsa: 'queue: FIFO replace' },
  { id: 'done', actor: 'k8s', cmd: 'status: Synced ✓ Healthy', detail: 'web:sha-9f2c1a4 is live. Zero cluster creds left CI.', dsa: 'done' },
]

const actorMeta: Record<Stage['actor'], { label: string; color: string }> = {
  dev: { label: 'DEV', color: 'var(--green)' },
  ci: { label: 'CI', color: 'var(--amber)' },
  registry: { label: 'REGISTRY', color: 'var(--magenta)' },
  git: { label: 'GIT', color: 'var(--git)' },
  argo: { label: 'ARGO CD', color: 'var(--argo)' },
  k8s: { label: 'K8S', color: 'var(--cyan)' },
}

export function PipelineDAG() {
  const { markMissionComplete, isMissionComplete } = useProgress()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [missionDone, setMissionDone] = useState(isMissionComplete('pipeline'))

  useEffect(() => {
    if (!playing) return
    if (step >= stages.length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100)
    return () => clearTimeout(t)
  }, [playing, step])

  useEffect(() => {
    if (step >= stages.length - 1 && !missionDone) {
      markMissionComplete('pipeline')
      setMissionDone(true)
    }
  }, [step, missionDone, markMissionComplete])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ ./pipeline --trace</p>
        <h2>GitOps Pipeline DAG</h2>
        <p className={styles.sub}>
          A deploy is a directed acyclic graph: each stage depends on the last. CI writes to Git; the cluster reads
          from Git — they never talk directly. Step (or play) to the end to unlock <b>Pipeline Runner</b>.
        </p>
      </header>

      <div className={styles.controls}>
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← prev</button>
        <button className={styles.play} onClick={() => setPlaying((p) => !p)}>
          {playing ? '⏸ pause' : '▶ auto-play'}
        </button>
        <button onClick={() => setStep((s) => Math.min(stages.length - 1, s + 1))} disabled={step >= stages.length - 1}>
          next →
        </button>
        <span className={styles.counter}>stage {step + 1} / {stages.length}</span>
        <button className={styles.reset} onClick={() => { setStep(0); setPlaying(false) }}>reset</button>
      </div>

      <div className={styles.dag}>
        {stages.map((stage, i) => {
          const state = i < step ? 'past' : i === step ? 'current' : 'future'
          const meta = actorMeta[stage.actor]
          return (
            <div key={stage.id} className={styles.row}>
              <div className={styles.railCol}>
                <span
                  className={`${styles.node} ${styles[state]}`}
                  style={state !== 'future' ? { borderColor: meta.color, color: meta.color } : undefined}
                >
                  {i < step ? '✓' : i + 1}
                </span>
                {i < stages.length - 1 && <span className={`${styles.rail} ${i < step ? styles.railActive : ''}`} />}
              </div>
              <button className={`${styles.card} ${styles[state]}`} onClick={() => setStep(i)}>
                <div className={styles.cardTop}>
                  <span className={styles.actor} style={{ color: meta.color, borderColor: meta.color }}>{meta.label}</span>
                  <span className={styles.dsa}>{stage.dsa}</span>
                </div>
                <code className={styles.cmd}>$ {stage.cmd}</code>
                <span className={styles.detail}>{stage.detail}</span>
              </button>
            </div>
          )
        })}
      </div>

      {missionDone && (
        <div className={styles.missionDone}>
          ✓ Pipeline Runner unlocked — and notice: the only thing crossing CI → cluster was a Git commit.
        </div>
      )}
    </div>
  )
}
