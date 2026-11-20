import { useEffect, useState } from 'react'

// New Academy components
import { AcademyHome } from './components/AcademyHome'
import { CurriculumExplorer } from './components/CurriculumExplorer'
import { AcademyLessonViewer } from './components/AcademyLessonViewer'
import { AcademyTerminal } from './components/AcademyTerminal'
import { Search } from './components/Search'
import { Capstones } from './components/Capstones'
import { ReferenceLibrary } from './components/ReferenceLibrary'
import { NotesNotebook } from './components/NotesNotebook'
import { K8sTroubleshooter } from './components/K8sTroubleshooter'
import { ArgoCDLab } from './components/ArgoCDLab'
import { RealInfraGuide } from './components/RealInfraGuide'
import { CompetencyMatrix } from './components/CompetencyMatrix'
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout'

// Existing components (preserved)
import { Layout } from './components/Layout'
import { CommandExplorer } from './components/CommandExplorer'
import { CodeLab } from './components/CodeLab'
import { ReconcilePlayground } from './components/ReconcilePlayground'
import { PipelineDAG } from './components/PipelineDAG'
import { Achievements } from './components/Achievements'

// New curriculum data
import { curriculum } from './data/curriculum-index'

const VIEW_KEY = 'gitops-learn-view'

function App() {
  const [view, setView] = useState<string>(() => localStorage.getItem(VIEW_KEY) || 'home')

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view)
    window.scrollTo(0, 0)
  }, [view])

  const navigate = (target: string) => setView(target)

  // Three-level lesson selection (phase/module/lesson)
  const selectAcademyLesson = (phaseId: string, moduleId: string, lessonId: string) => {
    setView(`academy:${phaseId}:${moduleId}:${lessonId}`)
  }

  const renderContent = () => {
    // New Academy lesson viewer
    if (view.startsWith('academy:')) {
      const [, phaseId, moduleId, lessonId] = view.split(':')
      const phase = curriculum.find(p => p.id === phaseId)
      if (!phase) return <p>Phase not found.</p>
      const mod = phase.modules.find(m => m.id === moduleId)
      if (!mod) return <p>Module not found.</p>
      const lesson = mod.lessons.find(l => l.id === lessonId)
      if (!lesson) return <p>Lesson not found.</p>

      // Find next lesson (across modules and phases)
      const allLessons = curriculum.flatMap(p =>
        p.modules.flatMap(m =>
          m.lessons.map(l => ({ phase: p, module: m, lesson: l }))
        )
      )
      const currentIdx = allLessons.findIndex(
        x => x.phase.id === phaseId && x.module.id === moduleId && x.lesson.id === lessonId
      )
      const next = allLessons[currentIdx + 1]
      const lessonIndex = mod.lessons.findIndex(l => l.id === lessonId)

      return (
        <AcademyLessonViewer
          phase={phase}
          module={mod}
          lesson={lesson}
          lessonIndex={lessonIndex}
          onBack={() => setView('curriculum')}
          hasNext={!!next}
          onNext={next ? () => selectAcademyLesson(next.phase.id, next.module.id, next.lesson.id) : undefined}
        />
      )
    }

    // Direct scenario view in VS Code Workspace
    if (view.startsWith('scenario:')) {
      const scenarioId = view.split(':')[1]
      return (
        <WorkspaceLayout
          initialScenarioId={scenarioId}
          onNavigateHome={() => setView('home')}
          onSelectLesson={selectAcademyLesson}
        />
      )
    }

    // Existing lab with ID
    if (view.startsWith('lab:')) {
      return <CodeLab initialExerciseId={view.split(':')[1]} />
    }

    switch (view) {
      case 'workspace':
        return (
          <WorkspaceLayout
            onNavigateHome={() => setView('home')}
            onSelectLesson={selectAcademyLesson}
          />
        )
      case 'curriculum':
        return <CurriculumExplorer onSelectLesson={selectAcademyLesson} />
      case 'capstones':
        return <Capstones />
      case 'argolab':
        return <ArgoCDLab />
      case 'troubleshoot':
        return <K8sTroubleshooter />
      case 'realinfra':
        return <RealInfraGuide />
      case 'competency':
        return <CompetencyMatrix onSelectLesson={selectAcademyLesson} onNavigate={navigate} />
      case 'references':
        return <ReferenceLibrary />
      case 'notes':
        return <NotesNotebook onSelectLesson={selectAcademyLesson} />
      case 'commands':
        return <CommandExplorer />
      case 'lab':
        return <CodeLab />
      case 'reconcile':
        return <ReconcilePlayground />
      case 'pipeline':
        return <PipelineDAG />
      case 'terminal':
        return (
          <div>
            <header style={{ marginBottom: '1.2rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>$ ssh operator@gitops-academy</p>
              <h2>Academy Terminal</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Practice Linux, Git, Docker, kubectl, Helm, Argo CD, and Terraform commands.
                This is a stateful simulated environment — safe to experiment freely.
              </p>
            </header>
            <AcademyTerminal fullHeight />
          </div>
        )
      case 'achievements':
        return <Achievements />
      case 'search':
        return <Search onSelectLesson={selectAcademyLesson} />
      default:
        return <AcademyHome onNavigate={navigate} onSelectLesson={selectAcademyLesson} />
    }
  }

  return (
    <Layout currentView={view} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  )
}

export default App
