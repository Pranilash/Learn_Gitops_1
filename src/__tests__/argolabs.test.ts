import { describe, it, expect } from 'vitest'
import { argoLabs } from '../data/argoLabs'

describe('Argo CD GitOps Laboratory', () => {
  it('contains exactly 20 structured practical labs', () => {
    expect(argoLabs).toHaveLength(20)
  })

  it('validates sequential numbering from 1 to 20', () => {
    argoLabs.forEach((lab, index) => {
      expect(lab.number).toBe(index + 1)
      expect(lab.id).toBeDefined()
      expect(lab.title).toBeTruthy()
      expect(lab.objective).toBeTruthy()
      expect(lab.instructions.length).toBeGreaterThan(0)
      expect(lab.commands.length).toBeGreaterThan(0)
      expect(lab.internalMechanism).toBeTruthy()
      expect(lab.validationCheck.verificationCommand).toBeTruthy()
    })
  })

  it('covers core GitOps pillars: drift, self-heal, prune, hooks, waves, App-of-Apps, and AppSets', () => {
    const titles = argoLabs.map(l => l.title.toLowerCase())
    expect(titles.some(t => t.includes('drift'))).toBe(true)
    expect(titles.some(t => t.includes('self-healing') || t.includes('self-heal'))).toBe(true)
    expect(titles.some(t => t.includes('pruning') || t.includes('prune'))).toBe(true)
    expect(titles.some(t => t.includes('wave'))).toBe(true)
    expect(titles.some(t => t.includes('hook') || t.includes('presync'))).toBe(true)
    expect(titles.some(t => t.includes('app-of-apps') || t.includes('app of apps'))).toBe(true)
    expect(titles.some(t => t.includes('applicationset') || t.includes('applicationsets'))).toBe(true)
    expect(titles.some(t => t.includes('sealed secrets') || t.includes('secret'))).toBe(true)
    expect(titles.some(t => t.includes('disaster recovery') || t.includes('rebuild'))).toBe(true)
  })

  it('validates manifests have sound Kubernetes/ArgoCD syntax and structure', () => {
    for (const lab of argoLabs) {
      expect(lab.yamlFiles.length, `Lab ${lab.id} should have yamlFiles`).toBeGreaterThanOrEqual(1)
      for (const y of lab.yamlFiles) {
        expect(y.filename).toBeTruthy()
        expect(y.content).toBeTruthy()
        expect(y.description).toBeTruthy()

        if (y.filename.endsWith('.yaml') || y.filename.endsWith('.yml')) {
          // Verify valid YAML top-level structure
          expect(y.content).toMatch(/apiVersion:\s*[^\s]+/)
          expect(y.content).toMatch(/kind:\s*[^\s]+/)

          // Standard Kubernetes resources have metadata (Kustomization does not require it)
          if (!y.content.includes('kind: Kustomization')) {
            expect(y.content).toMatch(/metadata:\s*/)
          }

          // If kind is Application, check required spec fields
          if (y.content.includes('kind: Application\n') || y.content.includes('kind: Application\r\n')) {
            expect(y.content).toMatch(/source:\s*/)
            expect(y.content).toMatch(/destination:\s*/)
          }

          // If kind is ApplicationSet, check generator and template
          if (y.content.includes('kind: ApplicationSet')) {
            expect(y.content).toMatch(/generators:\s*/)
            expect(y.content).toMatch(/template:\s*/)
          }
        }
      }
    }
  })
})
