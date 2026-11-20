import { useState, useEffect, useRef } from 'react'
import { scenarios } from '../../data/scenarios/scenarioData'
import type { AcademyScenario } from '../../data/scenarios/types'
import { useTerminal, readFile, writeFile } from '../../hooks/useTerminal'
import type { TerminalState } from '../../hooks/useTerminal'
import styles from './WorkspaceLayout.module.css'

interface WorkspaceTab {
  id: string
  title: string
  type: 'scenario' | 'file' | 'notes'
  filePath?: string
}

interface WorkspaceLayoutProps {
  initialScenarioId?: string
  onNavigateHome?: () => void
  onSelectLesson?: (phaseId: string, moduleId: string, lessonId: string) => void
}

export function WorkspaceLayout({ initialScenarioId, onNavigateHome: _onNavigateHome }: WorkspaceLayoutProps) {
  // Active activity bar tool
  const [activeActivity, setActiveActivity] = useState<'explorer' | 'labs' | 'challenges' | 'terminal' | 'notes'>('labs')

  // Selected scenario
  const [selectedScenario, setSelectedScenario] = useState<AcademyScenario>(() => {
    return scenarios.find(s => s.id === initialScenarioId) || scenarios[0]
  })

  // Open editor tabs
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    { id: 'instructions', title: 'Instructions.md', type: 'scenario' },
    { id: 'file-dockerfile', title: 'Dockerfile', type: 'file', filePath: 'mern-app/Dockerfile' },
    { id: 'file-deploy', title: 'deployment.yaml', type: 'file', filePath: 'apps/web/base/deployment.yaml' },
  ])
  const [activeTabId, setActiveTabId] = useState<string>('instructions')

  // Resizable split state
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(50)
  const isDraggingRef = useRef<boolean>(false)

  // Bottom panel state
  const [activeBottomTab, setActiveBottomTab] = useState<'verification' | 'hints' | 'solution' | 'realinfra'>('verification')
  const [validationResult, setValidationResult] = useState<{ passed: boolean; message: string; details?: string[] } | null>(null)
  const [unlockedHints, setUnlockedHints] = useState<number>(1)
  const [showSolution, setShowSolution] = useState<boolean>(false)

  // Active file editor content
  const [editingFileContent, setEditingFileContent] = useState<string>('')
  const [fileSaveNotice, setFileSaveNotice] = useState<string>('')

  // Terminal connection
  const terminal = useTerminal({
    labEnvironment: `workspace@${selectedScenario.id}`,
    scenario: selectedScenario,
    onCommandExecuted: () => {
      // Clear old validation message when user types commands
      setValidationResult(null)
    },
  })

  // Synchronize when initialScenarioId prop changes
  useEffect(() => {
    if (initialScenarioId) {
      const match = scenarios.find(s => s.id === initialScenarioId)
      if (match && match.id !== selectedScenario.id) {
        setSelectedScenario(match)
      }
    }
  }, [initialScenarioId, selectedScenario.id])

  // Reset hints and validation whenever scenario changes
  useEffect(() => {
    setValidationResult(null)
    setUnlockedHints(1)
    setShowSolution(false)
    setActiveBottomTab('verification')

    // Ensure instructions tab is open
    setTabs(prev => {
      if (!prev.some(t => t.id === 'instructions')) {
        return [{ id: 'instructions', title: 'Instructions.md', type: 'scenario' }, ...prev]
      }
      return prev
    })
    setActiveTabId('instructions')
  }, [selectedScenario])

  // Load file content when a file tab is selected
  useEffect(() => {
    const currentTab = tabs.find(t => t.id === activeTabId)
    if (currentTab?.type === 'file' && currentTab.filePath) {
      const content = readFile(terminal.state.fs, currentTab.filePath, '/home/operator')
      setEditingFileContent(content || `# ${currentTab.filePath}\n# (File empty or not yet created)`)
    }
  }, [activeTabId, tabs, terminal.state])

  // Handle panel resize drag
  const handleMouseDown = () => {
    isDraggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const container = document.getElementById('workspace-split-area')
      if (!container) return
      const rect = container.getBoundingClientRect()
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100
      if (newPercent > 20 && newPercent < 80) {
        setLeftWidthPercent(newPercent)
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Switch scenario
  const switchScenario = (sc: AcademyScenario) => {
    setSelectedScenario(sc)
    terminal.resetEnvironment(sc)
  }

  // Open file in tab
  const openFileTab = (filePath: string, title: string) => {
    const existing = tabs.find(t => t.filePath === filePath)
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      const newTab: WorkspaceTab = {
        id: `file-${Date.now()}`,
        title,
        type: 'file',
        filePath,
      }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
    }
  }

  // Close tab
  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const remaining = tabs.filter(t => t.id !== tabId)
    setTabs(remaining)
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id)
    }
  }

  // Save edited file back to virtual filesystem
  const handleSaveFile = () => {
    const currentTab = tabs.find(t => t.id === activeTabId)
    if (currentTab?.filePath) {
      writeFile(terminal.state.fs, currentTab.filePath, editingFileContent, '/home/operator')
      setFileSaveNotice('✓ Saved to Virtual Filesystem')
      setTimeout(() => setFileSaveNotice(''), 2500)
    }
  }

  // Run automated verification
  const handleVerify = () => {
    const res = selectedScenario.validateFinalState(terminal.state)
    setValidationResult(res)
    setActiveBottomTab('verification')
  }

  // Reset environment
  const handleReset = () => {
    terminal.resetEnvironment(selectedScenario)
    setValidationResult(null)
  }

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

  return (
    <div className={styles.workspaceRoot}>
      {/* ─── 1. Activity Bar ─────────────────────────────────────────────── */}
      <nav className={styles.activityBar} aria-label="workspace activities">
        <button
          className={`${styles.activityBtn} ${activeActivity === 'explorer' ? styles.active : ''}`}
          onClick={() => setActiveActivity('explorer')}
          title="Explorer & Files"
        >
          <span>📁</span>
          <span className={styles.activityLabel}>Files</span>
        </button>
        <button
          className={`${styles.activityBtn} ${activeActivity === 'labs' ? styles.active : ''}`}
          onClick={() => setActiveActivity('labs')}
          title="Guided Labs (Killercoda-style)"
        >
          <span>🧭</span>
          <span className={styles.activityLabel}>Labs</span>
        </button>
        <button
          className={`${styles.activityBtn} ${activeActivity === 'challenges' ? styles.active : ''}`}
          onClick={() => setActiveActivity('challenges')}
          title="Troubleshooting Challenges (SadServers-style)"
        >
          <span>⚡</span>
          <span className={styles.activityLabel}>Triage</span>
        </button>
        <button
          className={`${styles.activityBtn} ${activeActivity === 'notes' ? styles.active : ''}`}
          onClick={() => {
            setActiveActivity('notes')
            const existing = tabs.find(t => t.id === 'notes')
            if (!existing) {
              setTabs(prev => [...prev, { id: 'notes', title: 'Engineering Notes', type: 'notes' }])
            }
            setActiveTabId('notes')
          }}
          title="Engineering Notes"
        >
          <span>📝</span>
          <span className={styles.activityLabel}>Notes</span>
        </button>
      </nav>

      {/* ─── 2. Sidebar Explorer ─────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>
            {activeActivity === 'explorer' && 'Explorer: Project'}
            {activeActivity === 'labs' && 'Guided Labs'}
            {activeActivity === 'challenges' && 'Triage Incidents'}
            {activeActivity === 'notes' && 'Workspace Notes'}
          </span>
          <span className={styles.sidebarBadge}>
            {activeActivity === 'labs' && 'Guided'}
            {activeActivity === 'challenges' && 'SadServers'}
            {activeActivity === 'explorer' && 'VFS'}
          </span>
        </div>

        <div className={styles.sidebarContent}>
          {activeActivity === 'explorer' && (
            <div>
              <div className={styles.explorerSection}>
                <div className={styles.sectionHeader}>📂 mern-app (Source)</div>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'mern-app/package.json' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('mern-app/package.json', 'package.json')}
                >
                  📄 package.json
                </button>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'mern-app/Dockerfile' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('mern-app/Dockerfile', 'Dockerfile')}
                >
                  🐳 Dockerfile
                </button>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'mern-app/docker-compose.yml' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('mern-app/docker-compose.yml', 'docker-compose.yml')}
                >
                  🐙 docker-compose.yml
                </button>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'mern-app/src/server.ts' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('mern-app/src/server.ts', 'server.ts')}
                >
                  ⚡ server.ts
                </button>
              </div>

              <div className={styles.explorerSection}>
                <div className={styles.sectionHeader}>📂 config-repo (GitOps)</div>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'apps/web/base/deployment.yaml' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('apps/web/base/deployment.yaml', 'deployment.yaml')}
                >
                  ☸️ deployment.yaml
                </button>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'apps/web/base/service.yaml' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('apps/web/base/service.yaml', 'service.yaml')}
                >
                  ☸️ service.yaml
                </button>
                <button
                  className={`${styles.fileItem} ${activeTab?.filePath === 'argocd/web-app.yaml' ? styles.activeFile : ''}`}
                  onClick={() => openFileTab('argocd/web-app.yaml', 'web-app.yaml')}
                >
                  🐙 web-app.yaml
                </button>
              </div>
            </div>
          )}

          {activeActivity === 'labs' && (
            <div>
              {scenarios.filter(s => s.type === 'guided').map(sc => (
                <button
                  key={sc.id}
                  className={`${styles.scenarioCard} ${selectedScenario.id === sc.id ? styles.activeCard : ''}`}
                  onClick={() => switchScenario(sc)}
                >
                  <div className={styles.cardHeader}>
                    <span className={`${styles.scenarioType} ${styles.typeGuided}`}>Guided Lab</span>
                    <span className={styles.scenarioDiff}>{sc.difficulty} · {sc.estimatedMinutes}m</span>
                  </div>
                  <div className={styles.cardTitle}>{sc.title}</div>
                </button>
              ))}
            </div>
          )}

          {activeActivity === 'challenges' && (
            <div>
              {scenarios.filter(s => s.type === 'troubleshoot').map(sc => (
                <button
                  key={sc.id}
                  className={`${styles.scenarioCard} ${selectedScenario.id === sc.id ? styles.activeCard : ''}`}
                  onClick={() => switchScenario(sc)}
                >
                  <div className={styles.cardHeader}>
                    <span className={`${styles.scenarioType} ${styles.typeTroubleshoot}`}>Broken Incident</span>
                    <span className={styles.scenarioDiff}>{sc.difficulty} · {sc.estimatedMinutes}m</span>
                  </div>
                  <div className={styles.cardTitle}>{sc.title}</div>
                </button>
              ))}
            </div>
          )}

          {activeActivity === 'notes' && (
            <div style={{ padding: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <p>💡 Open the <strong>Engineering Notes</strong> tab to jot down architecture diagrams, command shortcuts, and post-mortems.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ─── 3. Main Workspace Area ───────────────────────────────────────── */}
      <div className={styles.mainArea}>
        {/* Tab Bar */}
        <div className={styles.tabBar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTabId === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span>
                {tab.type === 'scenario' && '📖'}
                {tab.type === 'notes' && '📝'}
                {tab.type === 'file' && (tab.title.endsWith('.yaml') || tab.title.endsWith('.yml') ? '☸️' : '📄')}
              </span>
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <span
                  className={styles.tabClose}
                  onClick={(e) => closeTab(e, tab.id)}
                  title="Close tab"
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Desktop Resizable Split Area */}
        <div className={styles.splitArea} id="workspace-split-area">
          {/* Left Pane: Reading & Instruction Editor */}
          <div
            className={`${styles.pane} ${styles.readingPane}`}
            style={{ flex: `0 0 ${leftWidthPercent}%` }}
          >
            {activeTab.type === 'scenario' && (
              <div>
                <div className={styles.readingHeader}>
                  <div className={styles.readingMeta}>
                    <span className={`${styles.scenarioType} ${selectedScenario.type === 'guided' ? styles.typeGuided : styles.typeTroubleshoot}`}>
                      {selectedScenario.type === 'guided' ? 'Killercoda Guided Lab' : 'SadServers Incident Triage'}
                    </span>
                    <span className={styles.scenarioDiff}>
                      {selectedScenario.category.toUpperCase()} · {selectedScenario.difficulty} · ~{selectedScenario.estimatedMinutes} mins
                    </span>
                  </div>
                  <h2 className={styles.readingTitle}>{selectedScenario.title}</h2>
                  <p className={styles.readingSummary}>{selectedScenario.summary}</p>
                </div>

                <div className={styles.sectionBlock}>
                  <h3>
                    <span>{selectedScenario.type === 'guided' ? '📋 Engineering Briefing' : '🚨 Incident Briefing'}</span>
                  </h3>
                  <div className={selectedScenario.type === 'guided' ? styles.targetCallout : styles.incidentCallout}>
                    {selectedScenario.contextDescription}
                  </div>
                </div>

                <div className={styles.sectionBlock}>
                  <h3>
                    <span>🎯 Expected Target State</span>
                  </h3>
                  <p className={styles.proseText}>
                    {selectedScenario.targetStateDescription}
                  </p>
                </div>

                {selectedScenario.type === 'guided' && selectedScenario.instructions && (
                  <div className={styles.sectionBlock}>
                    <h3>
                      <span>🛠️ Step-by-Step Instructions</span>
                    </h3>
                    <div className={styles.instructionList}>
                      {selectedScenario.instructions.map((step, idx) => (
                        <div key={idx} className={styles.instructionItem}>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScenario.type === 'troubleshoot' && (
                  <div className={styles.sectionBlock}>
                    <h3>
                      <span>🔍 Diagnostic Workflow</span>
                    </h3>
                    <div className={styles.instructionList}>
                      <div className={styles.instructionItem}>
                        1. Inspect running containers/pods with <code>docker ps</code> or <code>kubectl get pods</code>.
                      </div>
                      <div className={styles.instructionItem}>
                        2. Read real-time logs with <code>docker logs &lt;container&gt;</code> or <code>kubectl logs &lt;pod&gt;</code>.
                      </div>
                      <div className={styles.instructionItem}>
                        3. Review networking and endpoints with <code>docker network ls</code> or <code>kubectl get endpoints</code>.
                      </div>
                      <div className={styles.instructionItem}>
                        4. Edit manifests directly in the Editor Tabs or apply fixes via terminal.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab.type === 'file' && (
              <div className={styles.fileEditor}>
                <div className={styles.editorToolbar}>
                  <span className={styles.filePath}>/home/operator/{activeTab.filePath}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {fileSaveNotice && <span style={{ color: 'var(--green)', fontSize: '0.72rem' }}>{fileSaveNotice}</span>}
                    <button className={styles.editorActionBtn} onClick={handleSaveFile}>
                      💾 Save & Apply to VFS
                    </button>
                  </div>
                </div>
                <textarea
                  className={styles.codeContent}
                  value={editingFileContent}
                  onChange={(e) => setEditingFileContent(e.target.value)}
                  spellCheck={false}
                  aria-label="code editor textarea"
                />
              </div>
            )}

            {activeTab.type === 'notes' && (
              <div className={styles.fileEditor}>
                <div className={styles.editorToolbar}>
                  <span className={styles.filePath}>workspace://notes.md</span>
                </div>
                <textarea
                  className={styles.codeContent}
                  defaultValue={`# Workspace Engineering Notes\n\n## Current Goal: ${selectedScenario.title}\n\n- [ ] Investigate current state\n- [ ] Apply required configuration\n- [ ] Verify endpoints and health`}
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Draggable Divider */}
          <div
            className={styles.paneResizer}
            onMouseDown={handleMouseDown}
            title="Drag to resize panels"
          />

          {/* Right Pane: Integrated Terminal */}
          <div
            className={`${styles.pane} ${styles.terminalPane}`}
            style={{ flex: `0 0 ${100 - leftWidthPercent}%` }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.8rem',
                background: '#090d13',
                borderBottom: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--cyan)' }}>⚡ operator@gitops-academy</span>
                <span style={{ color: 'var(--text-dim)' }}>|</span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedScenario.category}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  onClick={() => terminal.execute('clear')}
                >
                  clear
                </button>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  onClick={handleReset}
                >
                  reset
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: '1.5',
              }}
              ref={terminal.bodyRef}
            >
              {terminal.lines.map((l, i) => (
                <div
                  key={i}
                  style={{
                    color:
                      l.kind === 'error'
                        ? 'var(--red)'
                        : l.kind === 'success'
                        ? 'var(--green)'
                        : l.kind === 'dim'
                        ? 'var(--text-dim)'
                        : l.kind === 'info'
                        ? 'var(--cyan)'
                        : 'var(--text)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    marginBottom: '2px',
                  }}
                >
                  {l.text}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>{terminal.prompt}</span>
                <input
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                  value={terminal.input}
                  onChange={(e) => terminal.setInput(e.target.value)}
                  onKeyDown={terminal.handleKeyDown}
                  spellCheck={false}
                  autoFocus
                  aria-label="workspace terminal input"
                />
              </div>
            </div>

            {/* Quick Commands Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                background: '#090d13',
                borderTop: '1px solid var(--border)',
                overflowX: 'auto',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Quick:</span>
              {(selectedScenario.category === 'docker' || selectedScenario.category === 'networking'
                ? ['docker ps', 'docker images', 'docker network ls', 'cat package.json', 'cat Dockerfile']
                : selectedScenario.category === 'kubernetes'
                ? ['kubectl get pods', 'kubectl get svc', 'kubectl get ep', 'kubectl describe svc web-svc']
                : ['argocd app list', 'argocd app diff web-prod', 'argocd app sync web-prod', 'kubectl get deploy']
              ).map(cmd => (
                <button
                  key={cmd}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.15rem 0.45rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => terminal.execute(cmd)}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 4. Bottom Panel: Validation, Hints, Solutions ─────────────── */}
        <div className={styles.bottomPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTabs}>
              <button
                className={`${styles.panelTabBtn} ${activeBottomTab === 'verification' ? styles.activePanelTab : ''}`}
                onClick={() => setActiveBottomTab('verification')}
              >
                {selectedScenario.type === 'guided' ? 'Checkpoints & Verification' : 'Incident Verification'}
              </button>
              <button
                className={`${styles.panelTabBtn} ${activeBottomTab === 'hints' ? styles.activePanelTab : ''}`}
                onClick={() => setActiveBottomTab('hints')}
              >
                Progressive Hints ({unlockedHints}/{selectedScenario.hints.length})
              </button>
              <button
                className={`${styles.panelTabBtn} ${activeBottomTab === 'solution' ? styles.activePanelTab : ''}`}
                onClick={() => setActiveBottomTab('solution')}
              >
                Root Cause & Fix
              </button>
              <button
                className={`${styles.panelTabBtn} ${activeBottomTab === 'realinfra' ? styles.activePanelTab : ''}`}
                onClick={() => setActiveBottomTab('realinfra')}
              >
                Run on Real Host (kind / Docker)
              </button>
            </div>

            <div className={styles.panelActions}>
              <button className={styles.resetBtn} onClick={handleReset} title="Reset scenario environment">
                ↺ Reset
              </button>
              <button className={styles.verifyBtn} onClick={handleVerify}>
                ✓ Verify State
              </button>
            </div>
          </div>

          <div className={styles.panelBody}>
            {activeBottomTab === 'verification' && (
              <div>
                {validationResult && (
                  <div className={`${styles.validationBanner} ${validationResult.passed ? styles.bannerPassed : styles.bannerFailed}`}>
                    <span style={{ fontSize: '1.2rem' }}>{validationResult.passed ? '🎉' : '⚠️'}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {validationResult.passed ? 'Scenario Successfully Resolved!' : 'Verification Incomplete'}
                      </div>
                      <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>{validationResult.message}</div>
                      {validationResult.details && (
                        <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', fontSize: '0.78rem' }}>
                          {validationResult.details.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {selectedScenario.checkpoints && (
                  <div className={styles.checkpointList}>
                    {selectedScenario.checkpoints.map(cp => {
                      const check = cp.checkState(terminal.state as TerminalState)
                      return (
                        <div key={cp.id} className={styles.checkpointItem}>
                          <span className={styles.checkIcon}>{check.ok ? '✅' : '⚪'}</span>
                          <div className={styles.checkDetails}>
                            <div className={styles.checkTitle}>{cp.title}</div>
                            <div className={styles.checkDesc}>{check.message}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!selectedScenario.checkpoints && !validationResult && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <p>
                      Perform diagnosis in the terminal or editor above. When you believe the issue is resolved, click{' '}
                      <strong>Verify State</strong> to test the cluster state deterministically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeBottomTab === 'hints' && (
              <div>
                {selectedScenario.hints.slice(0, unlockedHints).map((hint, idx) => (
                  <div key={idx} className={styles.hintRow}>
                    <div className={styles.hintStep}>Hint {idx + 1} of {selectedScenario.hints.length}</div>
                    <div>{hint}</div>
                  </div>
                ))}
                {unlockedHints < selectedScenario.hints.length && (
                  <button
                    style={{
                      background: 'rgba(210, 153, 34, 0.15)',
                      border: '1px solid rgba(210, 153, 34, 0.35)',
                      color: 'var(--amber)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                    onClick={() => setUnlockedHints(prev => prev + 1)}
                  >
                    💡 Unlock Next Hint ({unlockedHints + 1}/{selectedScenario.hints.length})
                  </button>
                )}
              </div>
            )}

            {activeBottomTab === 'solution' && (
              <div className={styles.solutionBox}>
                {!showSolution ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                      Independent troubleshooting is the best way to master platform operations. Are you sure you want to reveal the full root-cause explanation and solution?
                    </p>
                    <button
                      style={{
                        background: 'rgba(248, 81, 73, 0.2)',
                        border: '1px solid var(--red)',
                        color: 'var(--red)',
                        padding: '0.4rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}
                      onClick={() => setShowSolution(true)}
                    >
                      Reveal Root Cause & Solution
                    </button>
                  </div>
                ) : (
                  <div>
                    {selectedScenario.solution.rootCause && (
                      <div style={{ marginBottom: '0.8rem' }}>
                        <div className={styles.solutionTitle}>Root Cause Analysis</div>
                        <p style={{ fontSize: '0.85rem', color: '#c9d1d9', lineHeight: '1.5' }}>
                          {selectedScenario.solution.rootCause}
                        </p>
                      </div>
                    )}
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div className={styles.solutionTitle}>Remediation Steps</div>
                      <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#c9d1d9' }}>
                        {selectedScenario.solution.fixSteps.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: '0.2rem' }}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className={styles.solutionTitle}>Architectural Context</div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {selectedScenario.solution.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeBottomTab === 'realinfra' && (
              <div style={{ fontSize: '0.82rem', color: '#c9d1d9' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--cyan)', marginBottom: '0.4rem' }}>
                  Execute on Your Own Local Infrastructure
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  {selectedScenario.realWorldAlternative.notes}
                </p>
                <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Prerequisites:</div>
                <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedScenario.realWorldAlternative.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Commands to Run:</div>
                <pre style={{ margin: 0 }}>
                  <code>{selectedScenario.realWorldAlternative.commands.join('\n')}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
