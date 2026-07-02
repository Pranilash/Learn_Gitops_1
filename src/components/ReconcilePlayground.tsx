import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import styles from './ReconcilePlayground.module.css'

type DriftSource = 'git' | 'cluster' | null

interface LogEntry {
  text: string
  kind: 'info' | 'git' | 'sync' | 'drift' | 'heal'
}

const TICK_MS = 2200

export function ReconcilePlayground() {
  const { markMissionComplete, isMissionComplete } = useProgress()

  const [gitReplicas, setGitReplicas] = useState(3)
  const [gitTag, setGitTag] = useState('1.4.0')
  const [clusterReplicas, setClusterReplicas] = useState(3)
  const [clusterTag, setClusterTag] = useState('1.4.0')
  const [selfHeal, setSelfHeal] = useState(true)
  const [autoLoop, setAutoLoop] = useState(true)
  const [driftSource, setDriftSource] = useState<DriftSource>(null)
  const [spinning, setSpinning] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([
    { text: 'reconciler online · git is the source of truth', kind: 'info' },
  ])
  const [healedMission, setHealedMission] = useState(isMissionComplete('self-heal'))

  const logRef = useRef<HTMLDivElement>(null)

  const inSync = gitReplicas === clusterReplicas && gitTag === clusterTag

  const addLog = (entry: LogEntry) => setLog((l) => [...l.slice(-40), entry])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  const reconcile = () => {
    if (gitReplicas === clusterReplicas && gitTag === clusterTag) {
      addLog({ text: 'reconcile: cluster already matches git → Synced', kind: 'sync' })
      return
    }
    setSpinning(true)
    const wasClusterDrift = driftSource === 'cluster'
    const changes: string[] = []
    if (gitTag !== clusterTag) changes.push(`image ${clusterTag} → ${gitTag}`)
    if (gitReplicas !== clusterReplicas) changes.push(`replicas ${clusterReplicas} → ${gitReplicas}`)

    setTimeout(() => {
      setClusterReplicas(gitReplicas)
      setClusterTag(gitTag)
      setSpinning(false)
      addLog({ text: `applied: ${changes.join(', ')}`, kind: wasClusterDrift ? 'heal' : 'sync' })
      addLog({ text: 'status: Synced ✓ Healthy', kind: 'sync' })
      if (wasClusterDrift) {
        addLog({ text: 'self-heal: reverted out-of-band cluster change. Git wins.', kind: 'heal' })
        if (!healedMission) {
          markMissionComplete('self-heal')
          setHealedMission(true)
          addLog({ text: '🏆 mission complete: Drift Hunter (+75 XP, +60 badge)', kind: 'heal' })
        }
      }
      setDriftSource(null)
    }, 650)
  }

  // auto reconcile loop: when out of sync (and self-heal is on), converge after a tick
  useEffect(() => {
    if (!autoLoop || !selfHeal || inSync || spinning) return
    const id = setTimeout(() => reconcile(), TICK_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoop, selfHeal, inSync, spinning, gitReplicas, gitTag, clusterReplicas, clusterTag])

  // ── user actions ──
  const commitGitTag = () => {
    const parts = gitTag.split('.')
    const patch = (parseInt(parts[2] || '0', 10) + 1).toString()
    const next = `${parts[0]}.${parts[1]}.${patch}`
    setGitTag(next)
    setDriftSource('git')
    addLog({ text: `git commit: bump image → ${next}; git push`, kind: 'git' })
    addLog({ text: 'status: OutOfSync (desired changed)', kind: 'drift' })
  }
  const setGitReplicasTo = (n: number) => {
    setGitReplicas(n)
    setDriftSource('git')
    addLog({ text: `git commit: replicas = ${n}; git push`, kind: 'git' })
    addLog({ text: 'status: OutOfSync (desired changed)', kind: 'drift' })
  }
  const driftClusterReplicas = (n: number) => {
    setClusterReplicas(n)
    setDriftSource('cluster')
    addLog({ text: `$ kubectl scale deploy/web --replicas=${n}  (out-of-band!)`, kind: 'drift' })
    addLog({ text: 'status: OutOfSync — drift detected', kind: 'drift' })
  }
  const killPod = () => {
    if (clusterReplicas <= 0) return
    setClusterReplicas((r) => r - 1)
    setDriftSource('cluster')
    addLog({ text: '$ kubectl delete pod web-xxxx  (chaos!)', kind: 'drift' })
    addLog({ text: 'status: OutOfSync — a pod vanished', kind: 'drift' })
  }

  const statusLabel = inSync ? 'Synced' : 'OutOfSync'
  const pods = Array.from({ length: Math.max(0, Math.min(clusterReplicas, 8)) })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ ./reconcile --watch</p>
        <h2>Reconciliation Loop</h2>
        <p className={styles.sub}>
          The engine of GitOps. Change <b>Git</b> (desired) or break the <b>Cluster</b> (actual), then watch the loop
          converge them. Cause drift from the cluster and let self-heal revert it to unlock <b>Drift Hunter</b>.
        </p>
      </header>

      <div className={styles.statusBar}>
        <div className={`${styles.badge} ${inSync ? styles.synced : styles.outOfSync}`}>
          <span className={`${styles.loop} ${spinning ? styles.spin : ''}`}>{spinning ? '◐' : inSync ? '●' : '○'}</span>
          {statusLabel}
        </div>
        <div className={`${styles.badge} ${styles.healthy}`}>● Healthy</div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={selfHeal} onChange={(e) => setSelfHeal(e.target.checked)} />
          selfHeal
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={autoLoop} onChange={(e) => setAutoLoop(e.target.checked)} />
          auto-loop
        </label>
        <button className={styles.syncBtn} onClick={reconcile} disabled={inSync}>
          ▸ sync now
        </button>
      </div>

      <div className={styles.panes}>
        {/* GIT */}
        <div className={`${styles.pane} ${styles.gitPane}`}>
          <div className={styles.paneHead}>
            <span className={styles.gitLabel}>◆ Git — desired state</span>
            <span className={styles.repo}>config-repo@main</span>
          </div>
          <pre className={styles.manifest}>{`spec:
  replicas: ${gitReplicas}
  image: web:${gitTag}`}</pre>
          <div className={styles.controls}>
            <span>replicas</span>
            <div className={styles.stepper}>
              <button onClick={() => setGitReplicasTo(Math.max(0, gitReplicas - 1))}>−</button>
              <b>{gitReplicas}</b>
              <button onClick={() => setGitReplicasTo(Math.min(8, gitReplicas + 1))}>+</button>
            </div>
          </div>
          <button className={styles.commitBtn} onClick={commitGitTag}>
            git commit: bump image tag
          </button>
        </div>

        {/* LOOP */}
        <div className={styles.middle}>
          <div className={`${styles.arrowBox} ${!inSync ? styles.active : ''}`}>
            <span className={styles.arrowLabel}>diff &amp; apply</span>
            <span className={styles.bigArrow}>⟶</span>
            <span className={styles.loopText}>reconcile()</span>
            <span className={styles.bigArrow}>⟵</span>
            <span className={styles.arrowLabel}>observe</span>
          </div>
        </div>

        {/* CLUSTER */}
        <div className={`${styles.pane} ${styles.clusterPane}`}>
          <div className={styles.paneHead}>
            <span className={styles.clusterLabel}>⎈ Cluster — actual state</span>
            <span className={styles.repo}>ns/web</span>
          </div>
          <div className={styles.pods}>
            {pods.map((_, i) => (
              <div key={i} className={`${styles.pod} ${clusterTag === gitTag ? '' : styles.podOld}`}>
                <span className={styles.podDot} />
                web-{i + 1}
                <small>:{clusterTag}</small>
              </div>
            ))}
            {pods.length === 0 && <span className={styles.noPods}>no pods running</span>}
          </div>
          <div className={styles.controls}>
            <span>kubectl scale</span>
            <div className={styles.stepper}>
              <button onClick={() => driftClusterReplicas(Math.max(0, clusterReplicas - 1))}>−</button>
              <b>{clusterReplicas}</b>
              <button onClick={() => driftClusterReplicas(Math.min(8, clusterReplicas + 1))}>+</button>
            </div>
          </div>
          <button className={styles.chaosBtn} onClick={killPod}>
            ⚠ kubectl delete pod (chaos)
          </button>
        </div>
      </div>

      <div className={styles.console}>
        <div className={styles.consoleHead}>reconciler.log</div>
        <div className={styles.consoleBody} ref={logRef}>
          {log.map((l, i) => (
            <div key={i} className={`${styles.logLine} ${styles[l.kind]}`}>
              <span className={styles.ts}>{String(i).padStart(3, '0')}</span> {l.text}
            </div>
          ))}
        </div>
      </div>

      {healedMission && (
        <div className={styles.missionDone}>✓ Drift Hunter unlocked — you watched Git win over a manual change.</div>
      )}
    </div>
  )
}
