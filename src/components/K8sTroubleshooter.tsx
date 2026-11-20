import { useState, useEffect } from 'react'
import { troubleshootingIncidents, type TroubleshootingIncident } from '../data/troubleshootingScenarios'
import styles from './K8sTroubleshooter.module.css'

const STORAGE_KEY = 'academy-resolved-incidents'

export function K8sTroubleshooter() {
  const [selectedIncident, setSelectedIncident] = useState<TroubleshootingIncident>(troubleshootingIncidents[0])
  const [activeTab, setActiveTab] = useState<'investigate' | 'manifest' | 'fixed'>('investigate')
  const [executedCmd, setExecutedCmd] = useState<string>('')
  const [cmdOutput, setCmdOutput] = useState<string[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [resolvedMap, setResolvedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedMap))
  }, [resolvedMap])

  const selectIncident = (inc: TroubleshootingIncident) => {
    setSelectedIncident(inc)
    setActiveTab('investigate')
    const firstCmd = Object.keys(inc.commandOutputs)[0] || ''
    setExecutedCmd(firstCmd)
    setCmdOutput(inc.commandOutputs[firstCmd] || [])
    setSelectedOptionId(null)
    setChecked(false)
  }

  const runCommand = (cmd: string) => {
    setExecutedCmd(cmd)
    setCmdOutput(selectedIncident.commandOutputs[cmd] || [`$ ${cmd}`, 'No events or resources found.'])
  }

  const handleOptionSelect = (optId: string) => {
    if (checked) return
    setSelectedOptionId(optId)
  }

  const handleCheckDiagnosis = () => {
    if (!selectedOptionId) return
    setChecked(true)
    const opt = selectedIncident.diagnosisOptions.find(o => o.id === selectedOptionId)
    if (opt?.isCorrect) {
      setResolvedMap(prev => ({ ...prev, [selectedIncident.id]: true }))
    }
  }

  const availableCommands = Object.keys(selectedIncident.commandOutputs)
  const resolvedCount = Object.values(resolvedMap).filter(Boolean).length

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ kubectl debug --incident-arena</p>
        <h2>Kubernetes Fault-Injection &amp; Troubleshooting Arena</h2>
        <p className={styles.sub}>
          Real-world Kubernetes production outage simulations: CrashLoopBackOff, ImagePullBackOff,
          OOMKilled, Selector mismatches, and NetworkPolicy packet drops. Investigate with real kubectl commands to diagnose and resolve.
        </p>
        <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Incidents Resolved: <strong style={{ color: 'var(--green)' }}>{resolvedCount} / {troubleshootingIncidents.length}</strong>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Incident List */}
        <aside className={styles.sidebar}>
          {troubleshootingIncidents.map(inc => {
            const isResolved = !!resolvedMap[inc.id]
            const isActive = selectedIncident.id === inc.id
            return (
              <button
                key={inc.id}
                className={`${styles.incidentBtn} ${isActive ? styles.active : ''} ${isResolved ? styles.resolved : ''}`}
                onClick={() => selectIncident(inc)}
              >
                <div className={styles.btnTop}>
                  <span className={styles.incidentId}>#{inc.number} {isResolved ? '✓' : ''}</span>
                  <span className={`${styles.sevBadge} ${styles[inc.severity]}`}>{inc.severity}</span>
                </div>
                <span className={styles.btnTitle}>{inc.title}</span>
              </button>
            )
          })}
        </aside>

        {/* Active Investigation Arena */}
        <main className={styles.arena}>
          <div className={styles.arenaHead}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
              <span className={`${styles.sevBadge} ${styles[selectedIncident.severity]}`}>
                {selectedIncident.severity}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Category: {selectedIncident.category} • Target: {selectedIncident.targetResource}
              </span>
            </div>
            <h3 className={styles.arenaTitle}>{selectedIncident.title}</h3>
          </div>

          <div className={styles.symptomBox}>
            <div className={styles.symptomLabel}>🚨 Incident Alert &amp; Symptom</div>
            <p className={styles.symptomText}>{selectedIncident.symptom}</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'investigate' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('investigate')}
            >
              🔎 Investigate (kubectl)
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'manifest' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('manifest')}
            >
              📄 Broken Manifest
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'fixed' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('fixed')}
            >
              ✓ Remediated Manifest
            </button>
          </div>

          {activeTab === 'investigate' && (
            <div>
              <div className={styles.terminalPane}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  Execute triage commands against the cluster:
                </div>
                <div className={styles.cmdChips}>
                  {availableCommands.map(cmd => (
                    <button
                      key={cmd}
                      className={styles.cmdChip}
                      onClick={() => runCommand(cmd)}
                    >
                      $ {cmd}
                    </button>
                  ))}
                </div>

                <div className={styles.outputArea}>
                  {executedCmd && (
                    <div style={{ color: 'var(--green)', marginBottom: '0.4rem', fontWeight: 700 }}>
                      operator@k8s:~$ {executedCmd}
                    </div>
                  )}
                  {cmdOutput.map((line, i) => (
                    <div key={i} className={styles.outputLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis Quiz */}
              <div className={styles.diagnosisSection}>
                <h4 className={styles.sectionHeading}>🎯 Triage Decision: What is the Root Cause?</h4>
                <div className={styles.optionsList}>
                  {selectedIncident.diagnosisOptions.map(opt => {
                    let optClass = styles.optionCard
                    if (checked && opt.isCorrect) optClass += ` ${styles.correctOption}`
                    else if (checked && opt.id === selectedOptionId && !opt.isCorrect) optClass += ` ${styles.wrongOption}`
                    else if (opt.id === selectedOptionId) optClass += ` ${styles.selectedOption}`

                    return (
                      <button
                        key={opt.id}
                        className={optClass}
                        onClick={() => handleOptionSelect(opt.id)}
                        disabled={checked}
                      >
                        {opt.text}
                      </button>
                    )
                  })}
                </div>

                {!checked ? (
                  <button
                    style={{
                      background: 'rgba(74, 246, 38, 0.15)',
                      border: '1px solid var(--green)',
                      color: 'var(--green)',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                    onClick={handleCheckDiagnosis}
                    disabled={!selectedOptionId}
                  >
                    ▸ Submit Root Cause Analysis
                  </button>
                ) : (
                  <div>
                    {selectedIncident.diagnosisOptions.find(o => o.id === selectedOptionId)?.isCorrect ? (
                      <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
                        ✓ Root cause correctly diagnosed! (+{selectedIncident.xp} XP)
                      </div>
                    ) : (
                      <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: '0.9rem' }}>
                        ✗ Incorrect diagnosis. Review the events and log output above.
                      </div>
                    )}

                    <div className={styles.postmortemBox}>
                      <div className={styles.postmortemLabel}>📋 SRE Blameless Postmortem &amp; Prevention</div>
                      <p className={styles.postmortemText}>{selectedIncident.postmortemTakeaway}</p>
                      <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--cyan)' }}>
                        <strong>Remediation:</strong> {selectedIncident.remediationGuide}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                This is the actual broken manifest running in the cluster. Inspect the fields causing the issue:
              </p>
              <div className={styles.manifestBox}>{selectedIncident.brokenManifest}</div>
            </div>
          )}

          {activeTab === 'fixed' && (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Production-ready corrected manifest:
              </p>
              <div className={styles.manifestBox}>{selectedIncident.fixedManifest}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
