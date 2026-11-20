import { describe, it, expect } from 'vitest'
import { troubleshootingIncidents } from '../data/troubleshootingScenarios'

describe('Kubernetes Troubleshooting Arena Scenarios', () => {
  it('contains comprehensive fault-injection scenarios', () => {
    expect(troubleshootingIncidents.length).toBeGreaterThanOrEqual(7)
  })

  it('validates each incident has proper metadata, symptoms, and manifests', () => {
    for (const inc of troubleshootingIncidents) {
      expect(inc.id).toBeTruthy()
      expect(inc.number).toBeGreaterThan(0)
      expect(inc.title).toBeTruthy()
      expect(inc.symptom).toBeTruthy()
      expect(inc.context).toBeTruthy()
      expect(inc.brokenManifest).toBeTruthy()
      expect(inc.fixedManifest).toBeTruthy()
      expect(inc.postmortemTakeaway).toBeTruthy()
      expect(inc.remediationGuide).toBeTruthy()
      expect(inc.xp).toBeGreaterThan(0)

      // Must have at least 2 triage command outputs
      const cmds = Object.keys(inc.commandOutputs)
      expect(cmds.length, `Incident ${inc.id} should have command outputs`).toBeGreaterThanOrEqual(2)

      // Must have exactly one correct diagnosis option
      const correctOpts = inc.diagnosisOptions.filter(o => o.isCorrect)
      expect(correctOpts, `Incident ${inc.id} must have exactly 1 correct diagnosis option`).toHaveLength(1)
      expect(inc.diagnosisOptions.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('includes key failure modes: CrashLoopBackOff, ImagePullBackOff, OOMKilled, Selector mismatch, and NetworkPolicy', () => {
    const ids = troubleshootingIncidents.map(i => i.id)
    expect(ids).toContain('k8s-fault-crashloop-env')
    expect(ids).toContain('k8s-fault-image-pull-backoff')
    expect(ids).toContain('k8s-fault-service-selector-mismatch')
    expect(ids).toContain('k8s-fault-oom-killed')
    expect(ids).toContain('k8s-fault-pvc-unbound')
    expect(ids).toContain('k8s-fault-readiness-probe-path')
    expect(ids).toContain('k8s-fault-network-policy-blocked')
  })
})
