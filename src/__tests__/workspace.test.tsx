import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout'

describe('VS Code-Inspired Workspace Layout Component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  it('renders the workspace with activity bar, explorer, editor tabs, reading pane, and terminal', () => {
    render(<WorkspaceLayout />)

    // Activity bar
    expect(screen.getByRole('navigation', { name: /workspace activities/i })).toBeDefined()
    expect(screen.getByTitle(/guided labs/i)).toBeDefined()
    expect(screen.getByTitle(/troubleshooting challenges/i)).toBeDefined()

    // Editor tabs
    expect(screen.getByText('Instructions.md')).toBeDefined()
    expect(screen.getByText('Dockerfile')).toBeDefined()
    expect(screen.getByText('deployment.yaml')).toBeDefined()

    // Reading pane
    expect(screen.getByRole('heading', { name: /Containerize the MERN Backend/i })).toBeDefined()
    expect(screen.getByText(/Killercoda Guided Lab/i)).toBeDefined()
    expect(screen.getByText(/Expected Target State/i)).toBeDefined()

    // Integrated terminal
    expect(screen.getByLabelText(/workspace terminal input/i)).toBeDefined()
  })

  it('allows switching to SadServers incident triage challenges', async () => {
    render(<WorkspaceLayout />)

    // Switch to Triage in Activity bar
    const triageBtn = screen.getByTitle(/troubleshooting challenges/i)
    fireEvent.click(triageBtn)

    // Check that troubleshooting cards appear in sidebar
    const incidentCard = await screen.findByText(/Repair Broken Docker Networking/i)
    expect(incidentCard).toBeDefined()

    // Click the scenario card
    fireEvent.click(incidentCard)

    // Verify Reading pane updates to the incident
    expect(await screen.findByText(/SadServers Incident Triage/i)).toBeDefined()
    expect(screen.getByText(/Incident Briefing/i)).toBeDefined()
    expect(screen.getByText(/Diagnostic Workflow/i)).toBeDefined()
  })

  it('executes terminal commands and reflects output', async () => {
    render(<WorkspaceLayout />)

    const input = screen.getByLabelText(/workspace terminal input/i)
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText(/Available command families:/i)).toBeDefined()
    })
  })

  it('allows clicking quick commands to run them directly', async () => {
    render(<WorkspaceLayout />)

    const quickCmd = screen.getByRole('button', { name: 'docker ps' })
    fireEvent.click(quickCmd)

    await waitFor(() => {
      expect(screen.getAllByText(/CONTAINER ID/i).length).toBeGreaterThan(0)
    })
  })

  it('unlocks progressive hints sequentially', async () => {
    render(<WorkspaceLayout />)

    // Switch to progressive hints tab in bottom panel
    const hintsTabBtn = screen.getByRole('button', { name: /Progressive Hints/i })
    fireEvent.click(hintsTabBtn)

    expect(screen.getByText(/Hint 1 of/i)).toBeDefined()

    // Unlock next hint
    const unlockBtn = screen.getByRole('button', { name: /Unlock Next Hint/i })
    fireEvent.click(unlockBtn)

    expect(await screen.findByText(/Hint 2 of/i)).toBeDefined()
  })

  it('reveals root-cause post-mortem and remediation upon confirmation', async () => {
    render(<WorkspaceLayout />)

    const solutionTabBtn = screen.getByRole('button', { name: /Root Cause & Fix/i })
    fireEvent.click(solutionTabBtn)

    const revealBtn = screen.getByRole('button', { name: /Reveal Root Cause & Solution/i })
    fireEvent.click(revealBtn)

    expect(await screen.findByText(/Remediation Steps/i)).toBeDefined()
    expect(screen.getByText(/Architectural Context/i)).toBeDefined()
  })

  it('executes automated state verification when clicking Verify State', async () => {
    render(<WorkspaceLayout />)

    const verifyBtn = screen.getByRole('button', { name: /Verify State/i })
    fireEvent.click(verifyBtn)

    await waitFor(() => {
      expect(screen.getByText(/Verification Incomplete/i)).toBeDefined()
    })
  })

  it('allows opening, editing, and saving a virtual manifest file in editor tabs', async () => {
    render(<WorkspaceLayout />)

    // Click Dockerfile tab (pick first matching button with Dockerfile)
    const dockerfileTabs = screen.getAllByRole('button', { name: /Dockerfile/i })
    fireEvent.click(dockerfileTabs[0])

    // Textarea editor should display
    const textarea = screen.getByLabelText(/code editor textarea/i)
    expect(textarea).toBeDefined()

    // Edit content
    fireEvent.change(textarea, { target: { value: 'FROM node:20-alpine\nUSER node\nEXPOSE 5000' } })

    // Save to VFS
    const saveBtn = screen.getByRole('button', { name: /Save & Apply to VFS/i })
    fireEvent.click(saveBtn)

    expect(await screen.findByText(/Saved to Virtual Filesystem/i)).toBeDefined()
  })
})
