import { useRef } from 'react'
import { useTerminal } from '../hooks/useTerminal'
import styles from './AcademyTerminal.module.css'

interface AcademyTerminalProps {
  labEnvironment?: string
  quickCommands?: string[]
  fullHeight?: boolean
}

export function AcademyTerminal({ labEnvironment, quickCommands, fullHeight }: AcademyTerminalProps) {
  const {
    lines,
    input,
    setInput,
    handleKeyDown,
    bodyRef,
    prompt,
    execute,
  } = useTerminal(labEnvironment)
  
  const inputRef = useRef<HTMLInputElement>(null)

  const defaultQuickCmds = [
    'help', 'ls', 'pwd', 'kubectl get pods', 'argocd app list', 'docker ps', 'git status',
  ]
  const quickCmds = quickCommands || defaultQuickCmds

  return (
    <div
      className={`${styles.terminal} ${fullHeight ? styles.fullHeight : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className={styles.termHeader}>
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={`${styles.dot} ${styles.yellow}`} />
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.termTitle}>
          {labEnvironment || 'operator@gitops-academy'}
        </span>
        <span className={`${styles.badge} ${styles.simulated}`}>
          ⚡ simulated
        </span>
      </div>

      <div className={styles.body} ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={`${styles.line} ${styles[l.kind]}`}>
            {l.text}
          </div>
        ))}
        <div className={styles.inputRow}>
          <span className={styles.prompt}>{prompt}</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoFocus
            aria-label="terminal input"
          />
        </div>
      </div>

      <div className={styles.quickBar}>
        <span>quick:</span>
        {quickCmds.map((cmd) => (
          <button
            key={cmd}
            className={styles.quickBtn}
            onClick={() => {
              execute(cmd)
              inputRef.current?.focus()
            }}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  )
}
