import { describe, it, expect } from 'vitest'
import { domainMetadata, computeTier, type EngineeringDomain } from '../data/competency'

describe('Engineering Competency Matrix & Scoring', () => {
  it('covers all 8 essential engineering domains', () => {
    const domains: EngineeringDomain[] = [
      'linux_systems',
      'git_internals',
      'containers',
      'kubernetes',
      'cicd',
      'gitops_argocd',
      'cloud_iac',
      'observability_sre',
    ]

    for (const d of domains) {
      const meta = domainMetadata[d]
      expect(meta, `Domain ${d} metadata must exist`).toBeDefined()
      expect(meta.name).toBeTruthy()
      expect(meta.description).toBeTruthy()
      expect(meta.keySkills.length).toBeGreaterThanOrEqual(3)
      expect(meta.recommendedPhases.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('correctly maps score percentages to technical career tiers', () => {
    expect(computeTier(0)).toBe('Novice')
    expect(computeTier(25)).toBe('Novice')
    expect(computeTier(30)).toBe('Apprentice')
    expect(computeTier(55)).toBe('Apprentice')
    expect(computeTier(60)).toBe('Practitioner')
    expect(computeTier(80)).toBe('Practitioner')
    expect(computeTier(85)).toBe('Architect')
    expect(computeTier(100)).toBe('Architect')
  })
})
