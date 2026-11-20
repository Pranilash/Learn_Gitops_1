import { useState, useEffect } from 'react'
import { capstones } from '../data/capstones'
import styles from './Capstones.module.css'

const STORAGE_KEY = 'academy-capstone-tasks'

export function Capstones() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTasks))
  }, [completedTasks])

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const allTaskCount = capstones.reduce(
    (sum, c) => sum + c.milestones.reduce((mSum, m) => mSum + m.tasks.length, 0),
    0
  )
  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const progressPercent = allTaskCount > 0 ? Math.round((completedCount / allTaskCount) * 100) : 0

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ git status capstone-projects/</p>
        <h2>End-to-End Capstone Projects</h2>
        <p className={styles.sub}>
          Real-world production engineering projects that progressively transform an ordinary MERN stack
          into an automated, secure, observed, and GitOps-reconciled Kubernetes platform.
        </p>
        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Overall Project Progress: <strong style={{ color: 'var(--green)' }}>{completedCount} / {allTaskCount} tasks ({progressPercent}%)</strong></span>
        </div>
      </header>

      <div className={styles.projectList}>
        {capstones.map(project => (
          <article key={project.id} className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div>
                <div className={styles.projectTitleRow}>
                  <span className={styles.projectBadge}>Capstone {project.number}</span>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                </div>
                <div className={styles.projectMeta} style={{ marginTop: '0.4rem' }}>
                  <span>⏱ ~{project.estimatedHours} hours</span>
                  <span>•</span>
                  <span className={`${styles.difficulty} ${styles[project.difficulty]}`}>
                    {project.difficulty}
                  </span>
                  <span>•</span>
                  <span>Prerequisites: {project.prerequisites.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className={styles.projectBody}>
              <p className={styles.description}>{project.description}</p>

              <h4 className={styles.sectionTitle}>🎯 Core Learning Objectives</h4>
              <ul className={styles.objectivesList}>
                {project.objectives.map((obj, i) => (
                  <li key={i} className={styles.objectiveItem}>
                    {obj}
                  </li>
                ))}
              </ul>

              <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>📁 Target Repository Structure</h4>
              <div className={styles.repoBox}>{project.repositoryStructure}</div>

              <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>⛳ Implementation Milestones</h4>
              <div className={styles.milestonesList}>
                {project.milestones.map((m, mIdx) => (
                  <div key={mIdx} className={styles.milestoneCard}>
                    <div className={styles.milestoneHeader}>
                      <span className={styles.milestoneTitle}>{m.title}</span>
                    </div>
                    <p className={styles.milestoneDesc}>{m.description}</p>

                    <ul className={styles.taskList}>
                      {m.tasks.map((task, tIdx) => {
                        const taskId = `${project.id}-m${mIdx}-t${tIdx}`
                        const isDone = !!completedTasks[taskId]
                        return (
                          <li key={tIdx} className={styles.taskItem}>
                            <input
                              type="checkbox"
                              className={styles.taskCheckbox}
                              checked={isDone}
                              onChange={() => toggleTask(taskId)}
                              id={taskId}
                            />
                            <label
                              htmlFor={taskId}
                              style={{
                                cursor: 'pointer',
                                textDecoration: isDone ? 'line-through' : 'none',
                                color: isDone ? 'var(--text-dim)' : 'var(--text)',
                              }}
                            >
                              {task}
                            </label>
                          </li>
                        )
                      })}
                    </ul>

                    <div className={styles.verificationBox}>
                      <span className={styles.verificationLabel}>✓ Verification Command:</span>
                      <code className={styles.verificationCmd}>$ {m.verification}</code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Acceptance Criteria */}
              {project.acceptanceCriteria && project.acceptanceCriteria.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>📋 Acceptance Criteria & Definition of Done</h4>
                  <ul className={styles.criteriaList}>
                    {project.acceptanceCriteria.map((c, cIdx) => (
                      <li key={cIdx} className={styles.criteriaItem}>{c}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Execution Guide */}
              {project.executionGuide && project.executionGuide.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>🛠️ Step-by-Step Execution Guide</h4>
                  <div className={styles.guideList}>
                    {project.executionGuide.map((step, sIdx) => (
                      <div key={sIdx} className={styles.guideItem}>
                        <div className={styles.guideStep}>{step.step}</div>
                        {step.command && <code className={styles.guideCmd}>$ {step.command}</code>}
                        <p className={styles.guideExpl}>{step.explanation}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Troubleshooting */}
              {project.troubleshooting && project.troubleshooting.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>⚠️ Common Troubleshooting Scenarios</h4>
                  <div className={styles.troubleList}>
                    {project.troubleshooting.map((t, tIdx) => (
                      <div key={tIdx} className={styles.troubleItem}>
                        <div className={styles.troubleIssue}>Incident: {t.issue}</div>
                        <p className={styles.troubleFix}><strong>Resolution:</strong> {t.resolution}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Cleanup */}
              {project.cleanupInstructions && project.cleanupInstructions.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>🧹 Teardown & Resource Cleanup</h4>
                  <div className={styles.cleanupBox}>
                    {project.cleanupInstructions.map((cmd, cmdIdx) => (
                      <div key={cmdIdx} className={styles.cleanupItem}>$ {cmd}</div>
                    ))}
                  </div>
                </>
              )}

              {/* Portfolio Deliverables */}
              {project.portfolioDeliverables && project.portfolioDeliverables.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>💼 Production Portfolio Deliverables</h4>
                  <ul className={styles.deliverableList}>
                    {project.portfolioDeliverables.map((item, dIdx) => (
                      <li key={dIdx} className={styles.deliverableItem}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Resources */}
              {project.resources && project.resources.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle} style={{ marginTop: '1.4rem' }}>📚 Technical Documentation & References</h4>
                  <div className={styles.resourceList}>
                    {project.resources.map((res, rIdx) => (
                      <div key={rIdx} className={styles.resourceCard}>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
                          {res.title} ↗
                        </a>
                        <p className={styles.resourceDesc}>{res.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
