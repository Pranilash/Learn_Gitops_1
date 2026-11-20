import { useMemo } from 'react'
import { domainMetadata, computeTier, type EngineeringDomain, type DomainScore } from '../data/competency'
import { useProgress } from '../hooks/useProgress'
import styles from './CompetencyMatrix.module.css'

interface Props {
  onSelectLesson: (phaseId: string, moduleId: string, lessonId: string) => void
  onNavigate: (view: string) => void
}

export function CompetencyMatrix({ onNavigate }: Props) {
  const { completedLessons, completedExercises, completedMissions } = useProgress()

  const domainScores = useMemo<DomainScore[]>(() => {
    // Read incident resolutions
    let resolvedIncidentsCount = 0
    try {
      const saved = localStorage.getItem('academy-resolved-incidents')
      if (saved) {
        resolvedIncidentsCount = Object.values(JSON.parse(saved)).filter(Boolean).length
      }
    } catch {
      // ignore
    }

    // Read Argo labs completed
    let argoLabsCount = 0
    try {
      const saved = localStorage.getItem('academy-completed-argolabs')
      if (saved) {
        argoLabsCount = Object.values(JSON.parse(saved)).filter(Boolean).length
      }
    } catch {
      // ignore
    }

    // Read capstones
    let capstoneTasksCount = 0
    try {
      const saved = localStorage.getItem('academy-capstone-tasks')
      if (saved) {
        capstoneTasksCount = Object.values(JSON.parse(saved)).filter(Boolean).length
      }
    } catch {
      // ignore
    }

    const calc = (domain: EngineeringDomain): DomainScore => {
      let passed = 0
      let total = 10

      switch (domain) {
        case 'linux_systems':
          // Evaluated by Phase 0 lessons + terminal mission
          passed = Math.min(10, (completedLessons.size > 0 ? 3 : 0) + (completedMissions.has('terminal') ? 4 : 0) + (completedExercises.size > 0 ? 3 : 0))
          break
        case 'git_internals':
          passed = Math.min(10, (completedLessons.size > 2 ? 4 : 0) + (completedMissions.has('pipeline') ? 3 : 0) + (completedExercises.has('kustomize-overlay') ? 3 : 0))
          break
        case 'containers':
          passed = Math.min(10, (completedLessons.size > 5 ? 4 : 0) + (completedExercises.has('first-deployment') ? 3 : 0) + (capstoneTasksCount > 2 ? 3 : 0))
          break
        case 'kubernetes':
          passed = Math.min(10, (completedExercises.has('service-stable-address') ? 2 : 0) + (completedExercises.has('ingress-routing') ? 2 : 0) + (completedExercises.has('hpa-autoscaling') ? 2 : 0) + (completedExercises.has('mongo-pvc') ? 2 : 0) + (resolvedIncidentsCount > 0 ? 2 : 0))
          break
        case 'cicd':
          passed = Math.min(10, (completedMissions.has('pipeline') ? 4 : 0) + (capstoneTasksCount > 5 ? 3 : 0) + (completedExercises.has('canary-rollout') ? 3 : 0))
          break
        case 'gitops_argocd':
          passed = Math.min(10, (completedExercises.has('argocd-application') ? 2 : 0) + (completedExercises.has('sync-waves') ? 2 : 0) + (completedExercises.has('applicationset') ? 2 : 0) + (argoLabsCount > 2 ? 4 : 0))
          break
        case 'cloud_iac':
          passed = Math.min(10, (completedExercises.has('external-secret') ? 4 : 0) + (capstoneTasksCount > 8 ? 3 : 0) + (completedExercises.has('kyverno-policy') ? 3 : 0))
          break
        case 'observability_sre':
          passed = Math.min(10, (resolvedIncidentsCount >= 3 ? 5 : resolvedIncidentsCount * 1.5) + (completedMissions.has('self-heal') ? 3 : 0) + (completedExercises.has('canary-rollout') ? 2 : 0))
          break
      }

      const score = Math.round((passed / total) * 100)
      return {
        domain,
        score,
        tier: computeTier(score),
        passedItems: Math.round(passed),
        totalItems: total,
      }
    }

    return (Object.keys(domainMetadata) as EngineeringDomain[]).map(calc)
  }, [completedLessons, completedExercises, completedMissions])

  const overallScore = Math.round(
    domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length
  )
  const overallTier = computeTier(overallScore)

  // Find lowest domain for targeted diagnostic recommendation
  const lowestDomain = [...domainScores].sort((a, b) => a.score - b.score)[0]
  const lowestMeta = domainMetadata[lowestDomain.domain]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>$ competency-matrix --evaluate-learner</p>
        <h2>Engineering Competency &amp; Diagnostic Matrix</h2>
        <p className={styles.sub}>
          Real infrastructure mastery is measured by verified practical deliverables — passed YAML challenges,
          resolved production outages, and completed GitOps laboratories — not merely opening lessons.
        </p>
      </header>

      {/* Overview Card */}
      <div className={styles.overviewCard}>
        <div className={styles.overviewLeft}>
          <span className={styles.architectIcon}>◆</span>
          <div>
            <div className={styles.overviewTitle}>
              Engineering Level: {overallTier}
            </div>
            <div className={styles.overviewSub}>
              Based on automated evaluation across all 8 technical infrastructure domains.
            </div>
          </div>
        </div>

        <div className={styles.overallScoreBox}>
          <span className={styles.overallScoreNum}>{overallScore}%</span>
          <span className={styles.overallScoreLabel}>Overall Mastery Index</span>
        </div>
      </div>

      {/* Diagnostic Recommendation */}
      <div className={styles.diagnosticBox}>
        <div className={styles.diagnosticHeading}>
          💡 Diagnostic Recommendation: Targeted Growth Area
        </div>
        <p className={styles.diagnosticText}>
          Your lowest scoring area is <strong>{lowestMeta.name}</strong> ({lowestDomain.score}% mastery).
          To level up your engineering profile, we recommend working through{' '}
          <strong style={{ cursor: 'pointer', color: 'var(--cyan)' }} onClick={() => onNavigate('troubleshoot')}>
            Interactive Troubleshooting Scenarios
          </strong>{' '}
          or practicing in the{' '}
          <strong style={{ cursor: 'pointer', color: 'var(--green-soft)' }} onClick={() => onNavigate('argolab')}>
            Argo CD GitOps Laboratory
          </strong>.
        </p>
      </div>

      {/* Domain Grid */}
      <div className={styles.grid}>
        {domainScores.map(d => {
          const meta = domainMetadata[d.domain]
          const tierClass =
            d.tier === 'Architect'
              ? styles.tierArchitect
              : d.tier === 'Practitioner'
              ? styles.tierPractitioner
              : d.tier === 'Apprentice'
              ? styles.tierApprentice
              : styles.tierNovice

          return (
            <div key={d.domain} className={styles.domainCard}>
              <div className={styles.domainHeader}>
                <span className={styles.domainName}>
                  <span>{meta.icon}</span>
                  {meta.name}
                </span>
                <span className={`${styles.tierBadge} ${tierClass}`}>
                  {d.tier}
                </span>
              </div>

              <div className={styles.scoreRow}>
                <span>Mastery Progress</span>
                <strong>{d.score}% ({d.passedItems}/{d.totalItems} checkpoints)</strong>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${d.score}%`,
                    background:
                      d.score >= 85
                        ? 'var(--green)'
                        : d.score >= 60
                        ? 'var(--cyan)'
                        : d.score >= 30
                        ? 'var(--amber)'
                        : 'var(--red)',
                  }}
                />
              </div>

              <div className={styles.skillsTitle}>Verified Capabilities:</div>
              <div className={styles.skillsList}>
                {meta.keySkills.map((s, i) => (
                  <span key={i} className={styles.skillPill}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
