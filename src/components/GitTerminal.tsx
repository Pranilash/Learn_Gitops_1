import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import styles from './GitTerminal.module.css'

interface Line {
  text: string
  kind: 'in' | 'out' | 'ok' | 'warn' | 'dim'
}

const banner: Line[] = [
  { text: 'GitOps terminal sim — fake cluster, real commands.', kind: 'dim' },
  { text: "type `help` to list commands, or `mission` for your task.", kind: 'dim' },
]

const helpText = [
  'help                 show this help',
  'mission              show the current mission',
  'git status           working tree + pending change',
  'git log --oneline    recent commits',
  'kubectl get pods     list running pods',
  'kubectl get deploy   list deployments',
  'argocd app list      list apps + sync/health',
  'argocd app get web   details for the web app',
  'argocd app diff web  show desired vs live diff',
  'argocd app sync web  reconcile the web app  ← mission goal',
  'clear                clear the screen',
]

export function GitTerminal() {
  const { markMissionComplete, isMissionComplete } = useProgress()
  const [lines, setLines] = useState<Line[]>(banner)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [synced, setSynced] = useState(false)
  const [missionDone, setMissionDone] = useState(isMissionComplete('terminal'))

  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const print = (newLines: Line[]) => setLines((l) => [...l, ...newLines])

  const run = (raw: string) => {
    const cmd = raw.trim()
    print([{ text: `operator@gitops:~$ ${raw}`, kind: 'in' }])
    if (!cmd) return

    setHistory((h) => [...h, cmd])
    const tag = synced ? '1.4.1' : '1.4.0'

    const out = (text: string, kind: Line['kind'] = 'out') => print([{ text, kind }])
    const lines2 = (arr: string[], kind: Line['kind'] = 'out') => print(arr.map((text) => ({ text, kind })))

    switch (true) {
      case cmd === 'help':
        lines2(helpText, 'dim')
        break
      case cmd === 'mission':
        lines2([
          'MISSION: a teammate merged a PR bumping web → 1.4.1.',
          'Argo CD shows the app OutOfSync. Investigate and deploy it:',
          '  1) git status        (see the pending change)',
          '  2) argocd app diff web   (see desired vs live)',
          '  3) argocd app sync web   (reconcile → deploy)',
        ], 'warn')
        break
      case cmd === 'clear':
        setLines([])
        break
      case cmd === 'whoami':
        out('operator')
        break
      case cmd === 'ls':
        out('apps/  argocd/  README.md')
        break
      case cmd === 'git status':
        lines2([
          'On branch main',
          "Your branch is up to date with 'origin/main'.",
          '',
          'latest commit bumps web image: 1.4.0 → 1.4.1',
          'nothing to commit, working tree clean',
        ])
        break
      case cmd.startsWith('git log'):
        lines2([
          '9f2c1a4 (HEAD -> main) chore: bump web to 1.4.1',
          'a1b2c3d feat: add /metrics endpoint',
          'd4e5f6a fix: handle null user',
        ])
        break
      case cmd === 'kubectl get pods':
        lines2([
          'NAME           READY   STATUS    RESTARTS   AGE',
          `web-7d9f-aa    1/1     Running   0          5m   (:${tag})`,
          `web-7d9f-bb    1/1     Running   0          5m   (:${tag})`,
          `web-7d9f-cc    1/1     Running   0          5m   (:${tag})`,
        ])
        break
      case cmd === 'kubectl get deploy' || cmd === 'kubectl get deployments':
        lines2([
          'NAME   READY   UP-TO-DATE   AVAILABLE   AGE',
          'web    3/3     3            3           5m',
        ])
        break
      case cmd === 'argocd app list':
        lines2([
          'NAME      SYNC STATUS   HEALTH    REVISION',
          `web       ${synced ? 'Synced    ' : 'OutOfSync '}   Healthy   ${synced ? '9f2c1a4' : 'a1b2c3d'}`,
        ], synced ? 'ok' : 'warn')
        break
      case cmd === 'argocd app get web':
        lines2([
          'Name:               web',
          'Project:            default',
          'Repo:               github.com/acme/config-repo',
          'Path:               apps/web/overlays/prod',
          `Sync Status:        ${synced ? 'Synced' : 'OutOfSync'}`,
          'Health Status:      Healthy',
          `Target Revision:    main (${synced ? '9f2c1a4' : 'a1b2c3d, new commit available'})`,
        ], synced ? 'ok' : 'warn')
        break
      case cmd === 'argocd app diff web':
        if (synced) {
          out('No differences. App is Synced.', 'ok')
        } else {
          lines2([
            '===== Deployment/web =====',
            '  spec:',
            '    template:',
            '      containers:',
            '-       image: ghcr.io/acme/web:1.4.0   (live)',
            '+       image: ghcr.io/acme/web:1.4.1   (git / desired)',
          ], 'warn')
        }
        break
      case cmd === 'argocd app sync web':
        if (synced) {
          out('app already Synced — nothing to do.', 'dim')
        } else {
          lines2([
            'Syncing app web ...',
            '  Deployment/web   configured',
            '  rollout: web-7d9f → web-8a0c   (1.4.1)',
            'app web is now Synced ✓ Healthy',
          ], 'ok')
          setSynced(true)
          if (!missionDone) {
            markMissionComplete('terminal')
            setMissionDone(true)
            print([{ text: '🏆 mission complete: Terminal Hacker (+75 XP, +60 badge)', kind: 'ok' }])
          }
        }
        break
      case cmd === 'sudo rm -rf /' || cmd === 'rm -rf /':
        out("nice try. GitOps would just reconcile it back anyway 😏", 'warn')
        break
      default:
        out(`command not found: ${cmd.split(' ')[0]} — try \`help\``, 'warn')
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
      setHistIdx(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx)
      setInput(history[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const idx = histIdx + 1
      if (idx >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(idx)
        setInput(history[idx])
      }
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ ssh operator@gitops</p>
        <h2>Terminal Sim</h2>
        <p className={styles.sub}>
          A fake cluster you can drive with real commands. Complete the mission (sync the <b>web</b> app) to unlock
          <b> Terminal Hacker</b>. Use ↑/↓ for history.
        </p>
      </header>

      <div className={styles.term} onClick={() => inputRef.current?.focus()}>
        <div className={styles.termHead}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
          <span className={styles.termTitle}>operator@gitops: ~</span>
          <span className={`${styles.statusPill} ${synced ? styles.ok : styles.warn}`}>
            web: {synced ? 'Synced' : 'OutOfSync'}
          </span>
        </div>
        <div className={styles.body} ref={bodyRef}>
          {lines.map((l, i) => (
            <div key={i} className={`${styles.line} ${styles[l.kind]}`}>{l.text}</div>
          ))}
          <div className={styles.inputLine}>
            <span className={styles.prompt}>operator@gitops:~$</span>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoFocus
              aria-label="terminal input"
            />
          </div>
        </div>
      </div>

      <div className={styles.quick}>
        <span>quick run:</span>
        {['mission', 'git status', 'argocd app diff web', 'argocd app sync web', 'kubectl get pods'].map((c) => (
          <button key={c} onClick={() => { run(c); inputRef.current?.focus() }}>{c}</button>
        ))}
      </div>

      {missionDone && (
        <div className={styles.missionDone}>✓ Terminal Hacker unlocked — you reconciled prod from the CLI.</div>
      )}
    </div>
  )
}
