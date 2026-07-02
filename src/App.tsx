import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import { Home } from './components/Home'
import { ModuleList } from './components/ModuleList'
import { LessonViewer } from './components/LessonViewer'
import { CommandExplorer } from './components/CommandExplorer'
import { CodeLab } from './components/CodeLab'
import { ReconcilePlayground } from './components/ReconcilePlayground'
import { PipelineDAG } from './components/PipelineDAG'
import { GitTerminal } from './components/GitTerminal'
import { Achievements } from './components/Achievements'
import { getLesson, getAllLessons } from './data/curriculum'

const VIEW_KEY = 'gitops-learn-view'

function App() {
  const [view, setView] = useState<string>(() => localStorage.getItem(VIEW_KEY) || 'home')

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view)
    window.scrollTo(0, 0)
  }, [view])

  const navigate = (target: string) => setView(target)
  const selectLesson = (moduleId: string, lessonId: string) => setView(`lesson:${moduleId}:${lessonId}`)

  const renderContent = () => {
    if (view.startsWith('lesson:')) {
      const [, moduleId, lessonId] = view.split(':')
      const data = getLesson(moduleId, lessonId)
      if (!data) return <p>Lesson not found.</p>

      const all = getAllLessons()
      const idx = all.findIndex((l) => l.module.id === moduleId && l.lesson.id === lessonId)
      const next = all[idx + 1]
      const lessonIndex = data.module.lessons.findIndex((l) => l.id === lessonId)

      return (
        <LessonViewer
          module={data.module}
          lesson={data.lesson}
          lessonIndex={lessonIndex}
          lessonTotal={data.module.lessons.length}
          onBack={() => setView('modules')}
          hasNext={!!next}
          onNext={next ? () => selectLesson(next.module.id, next.lesson.id) : undefined}
          onOpenLab={() => setView('lab')}
        />
      )
    }

    if (view.startsWith('lab:')) {
      return <CodeLab initialExerciseId={view.split(':')[1]} />
    }

    switch (view) {
      case 'modules':
        return <ModuleList onSelectLesson={selectLesson} />
      case 'commands':
        return <CommandExplorer />
      case 'lab':
        return <CodeLab />
      case 'reconcile':
        return <ReconcilePlayground />
      case 'pipeline':
        return <PipelineDAG />
      case 'terminal':
        return <GitTerminal />
      case 'achievements':
        return <Achievements />
      default:
        return <Home onNavigate={navigate} onSelectLesson={selectLesson} />
    }
  }

  return (
    <Layout currentView={view} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  )
}

export default App
