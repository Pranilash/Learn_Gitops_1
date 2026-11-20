import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('End-to-End Learner Journey & Navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    window.scrollTo = vi.fn()
  })

  const renderApp = () => {
    const utils = render(<App />)
    const skipBtn = screen.queryByText(/click to skip/i)
    if (skipBtn) {
      fireEvent.click(skipBtn)
    }
    return utils
  }

  it('renders the Academy Dashboard on initial load with stats and quick launch', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
    expect(screen.getByText(/From MERN developer to GitOps engineer/i)).toBeDefined()
    expect(screen.getByText(/# learning roadmap/i)).toBeDefined()
    expect(screen.getByText(/Containers & Docker Architecture/i)).toBeDefined()
    expect(screen.getByText(/Argo CD & GitOps Mastery/i)).toBeDefined()
  })

  it('navigates to Curriculum Explorer and displays phase tree', async () => {
    renderApp()
    const browseBtn = screen.getByRole('button', { name: /browse curriculum/i })
    fireEvent.click(browseBtn)

    expect(screen.getByText(/Curriculum Explorer/i)).toBeDefined()
    expect(screen.getByText(/Containers & Docker Architecture/i)).toBeDefined()
  })

  it('navigates into an Academy Lesson and verifies the 5-tab workspace', () => {
    // Set view directly to the first phase0 lesson
    localStorage.setItem('gitops-learn-view', 'academy:phase0:os-linux:how-operating-systems-work')
    renderApp()

    // Lesson title should be rendered
    expect(screen.getByText(/How Operating Systems Work/i)).toBeDefined()

    // 5 workspace tab buttons (exact match on label to distinguish from sidebar nav items)
    expect(screen.getByRole('button', { name: /^lesson$/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /^terminal$/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /^quiz/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /^notes$/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /^refs/i })).toBeDefined()

    // Switch to Live Terminal tab
    fireEvent.click(screen.getByRole('button', { name: /^terminal$/i }))
    expect(screen.getByText(/Practice commands from this lesson/i)).toBeDefined()

    // Switch to Quiz tab
    fireEvent.click(screen.getByRole('button', { name: /^quiz/i }))
    expect(screen.getAllByText(/check answer/i).length).toBeGreaterThan(0)

    // Switch to Notes tab
    fireEvent.click(screen.getByRole('button', { name: /^notes$/i }))
    expect(screen.getByPlaceholderText(/Type your notes here/i)).toBeDefined()

    // Switch to References tab
    fireEvent.click(screen.getByRole('button', { name: /^refs/i }))
    expect(screen.getByText(/Operating Systems: Three Easy Pieces/i)).toBeDefined()
  })

  it('navigates to Terminal Simulator and executes simulated CLI commands', () => {
    localStorage.setItem('gitops-learn-view', 'terminal')
    renderApp()

    expect(screen.getByRole('heading', { name: /Academy Terminal/i })).toBeDefined()

    // Click quick command chip 'help'
    const helpBtn = screen.getByRole('button', { name: /^help$/i })
    fireEvent.click(helpBtn)
    expect(screen.getByText(/Available command families:/i)).toBeDefined()

    // Click quick command chip 'kubectl get pods'
    const k8sBtn = screen.getByRole('button', { name: /^kubectl get pods$/i })
    fireEvent.click(k8sBtn)
    expect(screen.getAllByText(/web-7d9f-/i).length).toBeGreaterThan(0)

    // Click quick command chip 'docker ps'
    const dockerBtn = screen.getByRole('button', { name: /^docker ps$/i })
    fireEvent.click(dockerBtn)
    expect(screen.getByText(/CONTAINER ID/i)).toBeDefined()
  })

  it('navigates to Argo CD Laboratory and allows selecting and inspecting labs', () => {
    localStorage.setItem('gitops-learn-view', 'argolab')
    renderApp()

    expect(screen.getByText(/Argo CD & GitOps Engineering Laboratory/i)).toBeDefined()
    expect(screen.getByText(/Twenty comprehensive hands-on GitOps laboratories/i)).toBeDefined()

    // Select Lab 5 (Drift Detection)
    const lab5Btn = screen.getByRole('button', { name: /Simulate Cluster Drift & Diff Analysis/i })
    fireEvent.click(lab5Btn)

    expect(screen.getByText(/Simulate an out-of-band manual modification/i)).toBeDefined()
    expect(screen.getByText(/\$ argocd app diff guestbook/i)).toBeDefined()
  })

  it('navigates to Kubernetes Troubleshooter and performs triage command inspection', () => {
    localStorage.setItem('gitops-learn-view', 'troubleshoot')
    renderApp()

    expect(screen.getByText(/Kubernetes Fault-Injection & Troubleshooting Arena/i)).toBeDefined()
    expect(screen.getAllByText(/CrashLoopBackOff: Unhandled Environment Variable/i).length).toBeGreaterThan(0)

    // Click first triage command chip
    const triageChips = screen.getAllByRole('button', { name: /\$ kubectl/i })
    expect(triageChips.length).toBeGreaterThan(0)
    fireEvent.click(triageChips[0])

    // Output lines from command execution should render
    expect(screen.getAllByText(/CrashLoopBackOff/i).length).toBeGreaterThan(1)
  })

  it('navigates to Capstones and persists task completion to localStorage', () => {
    localStorage.setItem('gitops-learn-view', 'capstones')
    renderApp()

    expect(screen.getByText(/End-to-End Capstone Projects/i)).toBeDefined()
    expect(screen.getByText(/Containerized MERN Application/i)).toBeDefined()

    // Click first task checkbox in Capstone 1
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    const firstCheckbox = checkboxes[0] as HTMLInputElement

    expect(firstCheckbox.checked).toBe(false)
    fireEvent.click(firstCheckbox)
    expect(firstCheckbox.checked).toBe(true)

    // Verify persisted in localStorage
    const saved = localStorage.getItem('academy-capstone-tasks')
    expect(saved).toBeTruthy()
    expect(JSON.parse(saved!)).toMatchObject({ 'capstone-1-docker-mern-m0-t0': true })
  })

  it('navigates to Competency Matrix and renders skills assessment', () => {
    localStorage.setItem('gitops-learn-view', 'competency')
    renderApp()

    expect(screen.getByText(/Engineering Competency & Diagnostic Matrix/i)).toBeDefined()
    expect(screen.getByText(/Diagnostic Recommendation/i)).toBeDefined()
    expect(screen.getAllByText(/Linux & Systems Engineering/i).length).toBeGreaterThan(0)
  })

  it('navigates to Revision Notebook and renders notes overview with export button', () => {
    // Seed a note for a lesson
    localStorage.setItem('academy-notes-how-operating-systems-work', 'Learned about kernel syscalls and process tables.')
    localStorage.setItem('gitops-learn-view', 'notes')
    renderApp()

    expect(screen.getByText(/Personal Engineering Notes & Revision/i)).toBeDefined()
    expect(screen.getByText(/How Operating Systems Work/i)).toBeDefined()
    expect(screen.getByText(/Learned about kernel syscalls and process tables/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Export All Notes \(\.md\)/i })).toBeDefined()
  })

  it('handles invalid phase navigation gracefully with error fallback', () => {
    localStorage.setItem('gitops-learn-view', 'academy:invalid-phase:fake-mod:fake-lesson')
    renderApp()
    expect(screen.getByText(/Phase not found/i)).toBeDefined()
  })
})
