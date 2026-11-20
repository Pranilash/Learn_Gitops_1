import { describe, it, expect } from 'vitest'
import { capstones } from '../data/capstones'
import { libraryReferences } from '../data/references'
import { realInfraGuides } from '../data/realInfraGuides'

describe('Capstone Projects Portfolio', () => {
  it('contains all 5 progressive capstones', () => {
    expect(capstones).toHaveLength(5)
    capstones.forEach((c, idx) => {
      expect(c.number).toBe(idx + 1)
      expect(c.id).toBeTruthy()
      expect(c.title).toBeTruthy()
      expect(c.description).toBeTruthy()
      expect(c.objectives.length).toBeGreaterThanOrEqual(3)
      expect(c.milestones.length).toBeGreaterThanOrEqual(3)
      expect(c.repositoryStructure).toBeTruthy()
      expect(c.resources.length).toBeGreaterThanOrEqual(2)
      expect(c.acceptanceCriteria.length, `Acceptance criteria in ${c.id}`).toBeGreaterThanOrEqual(4)
      expect(c.executionGuide.length, `Execution guide in ${c.id}`).toBeGreaterThanOrEqual(4)
      expect(c.troubleshooting.length, `Troubleshooting in ${c.id}`).toBeGreaterThanOrEqual(2)
      expect(c.cleanupInstructions.length, `Cleanup in ${c.id}`).toBeGreaterThanOrEqual(1)
      expect(c.portfolioDeliverables.length, `Portfolio deliverables in ${c.id}`).toBeGreaterThanOrEqual(2)
      c.milestones.forEach(m => {
        expect(m.title).toBeTruthy()
        expect(m.description).toBeTruthy()
        expect(m.tasks.length).toBeGreaterThanOrEqual(1)
        expect(m.verification).toBeTruthy()
      })
    })
  })

  it('covers full evolutionary journey from Docker MERN to Production GitOps', () => {
    const titles = capstones.map(c => c.title.toLowerCase())
    expect(titles.some(t => t.includes('containerized mern'))).toBe(true)
    expect(titles.some(t => t.includes('kubernetes'))).toBe(true)
    expect(titles.some(t => t.includes('ci pipeline'))).toBe(true)
    expect(titles.some(t => t.includes('gitops deployment') || t.includes('argo cd'))).toBe(true)
    expect(titles.some(t => t.includes('enterprise cloud-native') || t.includes('platform'))).toBe(true)
  })
})

describe('Seminal Reference Library', () => {
  it('contains authentic research papers and industry specifications', () => {
    expect(libraryReferences.length).toBeGreaterThanOrEqual(15)
    libraryReferences.forEach(ref => {
      expect(ref.title).toBeTruthy()
      expect(ref.url).toMatch(/^https?:\/\//)
      expect(ref.author).toBeTruthy()
      expect(ref.category).toBeTruthy()
      expect(ref.description).toBeTruthy()
    })
  })

  it('contains Google Borg paper, ACM Queue paper, and OpenGitOps principles', () => {
    const titles = libraryReferences.map(r => r.title.toLowerCase())
    expect(titles.some(t => t.includes('borg'))).toBe(true)
    expect(titles.some(t => t.includes('twelve-factor') || t.includes('twelve factor'))).toBe(true)
    expect(titles.some(t => t.includes('site reliability engineering'))).toBe(true)
    expect(titles.some(t => t.includes('opengitops') || t.includes('gitops'))).toBe(true)
  })
})

describe('Real Infrastructure Guided Pathways', () => {
  it('provides guides for Docker, Kind, Helm, and Argo CD across Windows, macOS, and Linux', () => {
    expect(realInfraGuides.length).toBeGreaterThanOrEqual(4)
    realInfraGuides.forEach(guide => {
      expect(guide.id).toBeTruthy()
      expect(guide.tool).toBeTruthy()
      expect(guide.title).toBeTruthy()
      expect(guide.verificationCommand).toBeTruthy()
      expect(guide.expectedOutput).toBeTruthy()
      expect(guide.platforms.length).toBe(3) // Windows, macOS, Linux
      
      const osList = guide.platforms.map(p => p.os)
      expect(osList).toContain('windows')
      expect(osList).toContain('macos')
      expect(osList).toContain('linux')
    })
  })
})
