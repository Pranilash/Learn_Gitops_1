import { useMemo, useState } from 'react'
import { modules, type Command } from '../data/curriculum'
import styles from './CommandExplorer.module.css'

interface ExtraCommand extends Command {
  tool: string
}

const extras: ExtraCommand[] = [
  { tool: 'kubectl', command: 'kubectl get all -n <ns>', description: 'List every common resource in a namespace.', example: 'kubectl get all -n web', whenToUse: 'Quick snapshot of what is running.' },
  { tool: 'kubectl', command: 'kubectl logs -f <pod>', description: 'Stream a pod’s logs.', example: 'kubectl logs -f web-7d9f', whenToUse: 'Debug a Degraded / crash-looping pod.' },
  { tool: 'kubectl', command: 'kubectl rollout status deploy/<n>', description: 'Watch a rollout finish.', example: 'kubectl rollout status deploy/web', whenToUse: 'Confirm new pods became ready.' },
  { tool: 'argocd', command: 'argocd app list', description: 'List all Applications + their sync/health.', example: 'argocd app list', whenToUse: 'Fleet-wide health glance.' },
  { tool: 'argocd', command: 'argocd app history <n>', description: 'Show past synced revisions (for rollback).', example: 'argocd app history web-prod', whenToUse: 'Find the revision to roll back to.' },
  { tool: 'kustomize', command: 'kustomize build <dir>', description: 'Render an overlay to YAML.', example: 'kustomize build overlays/prod', whenToUse: 'Preview merged manifests.' },
  { tool: 'helm', command: 'helm template <chart>', description: 'Render a chart locally (no install).', example: 'helm template ./web -f values-prod.yaml', whenToUse: 'See what Argo will apply from a chart.' },
  { tool: 'git', command: 'git revert <sha> && git push', description: 'Roll back a deploy via Git.', example: 'git revert 9f2c1a4 && git push', gitEquivalent: 'You already know this one.', whenToUse: 'Undo a bad release with an audit trail.' },
]

function toolOf(command: string): string {
  return command.trim().split(/\s+/)[0]
}

export function CommandExplorer() {
  const [query, setQuery] = useState('')
  const [tool, setTool] = useState('all')

  const allCommands = useMemo<ExtraCommand[]>(() => {
    const fromLessons: ExtraCommand[] = modules.flatMap((m) =>
      m.lessons.flatMap((l) => (l.commands ?? []).map((c) => ({ ...c, tool: toolOf(c.command) })))
    )
    const seen = new Set<string>()
    return [...fromLessons, ...extras].filter((c) => {
      if (seen.has(c.command)) return false
      seen.add(c.command)
      return true
    })
  }, [])

  const tools = useMemo(() => ['all', ...Array.from(new Set(allCommands.map((c) => c.tool))).sort()], [allCommands])

  const filtered = allCommands.filter((c) => {
    const matchesTool = tool === 'all' || c.tool === tool
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      c.command.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.whenToUse.toLowerCase().includes(q)
    return matchesTool && matchesQuery
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ man gitops</p>
        <h2>Command Explorer</h2>
        <p className={styles.sub}>Every git / kubectl / argocd / kustomize / helm command you’ll touch.</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <span className={styles.searchPrompt}>$</span>
          <input
            className={styles.search}
            placeholder="grep commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.tools}>
          {tools.map((t) => (
            <button
              key={t}
              className={`${styles.toolBtn} ${tool === t ? styles.activeTool : ''}`}
              onClick={() => setTool(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((c) => (
          <div key={c.command} className={styles.card}>
            <div className={styles.cardHead}>
              <code className={styles.cmd}>$ {c.command}</code>
              <span className={styles.toolTag}>{c.tool}</span>
            </div>
            <p className={styles.desc}>{c.description}</p>
            <pre>
              <code>{c.example}</code>
            </pre>
            {c.gitEquivalent && <span className={styles.gitEq}>git brain: {c.gitEquivalent}</span>}
            <span className={styles.when}>when: {c.whenToUse}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className={styles.empty}>no commands match “{query}”.</p>}
      </div>
    </div>
  )
}
