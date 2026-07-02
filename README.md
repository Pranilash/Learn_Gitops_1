# gitops-learn

An interactive, gamified, terminal-themed course that takes you from **complete beginner to advanced GitOps** — built for an SDE who already knows Git, a bit of Linux, basic DSA, and basic JS/Express.

It leans hard on what you already know: GitOps is explained as your Git brain applied to running software, and every concept is mapped to a DSA idea (the reconciliation loop = a `while` loop, sync waves = topological sort, kustomize overlays = inheritance, config repos = trees).

## Highlights

- **Terminal / phosphor-CRT theme** — monospace everything, scanlines, window chrome, blinking cursor, boot sequence.
- **Gamified** — XP, a career rank ladder (Intern → GitOps Architect), unlockable badges, and a daily streak. All saved to `localStorage`, so you can come back anytime and pick up where you left off.
- **6 modules / 23 lessons**, beginner → advanced:
  1. Foundations (what GitOps is, declarative vs imperative, the reconciliation loop, push vs pull)
  2. Kubernetes, Just Enough
  3. GitOps Principles (the 4 principles, repo structure, environments)
  4. Argo CD (architecture, the Application resource, sync/health/drift, sync waves & hooks, App-of-Apps & ApplicationSets)
  5. Config: Kustomize & Helm
  6. Production & Advanced (secrets, progressive delivery, multi-cluster, drift/rollback/DR, security & policy, CI/CD separation)
- **Code Lab** — write real Deployment / Service / Argo CD / Kustomize / Sync-wave / ExternalSecret / Rollout / ApplicationSet YAML, get instant validation, hints, solutions, and a **live diagram** that updates as you type.
- **3 interactive playgrounds** (each unlocks a badge):
  - **Reconcile Loop** — edit Git or break the cluster and watch the loop converge & self-heal.
  - **Pipeline DAG** — step/auto-play through commit → CI → image → Argo sync → live pods.
  - **Terminal Sim** — drive a fake cluster with real `git` / `kubectl` / `argocd` commands.

## Run it

Requires **Node.js 20.19+ or 22.12+** (Vite 8). If you use `nvm`:

```bash
nvm use 20      # or nvm install 20
npm install
npm run dev     # http://localhost:5173
```

Other scripts:

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
npm run preview # preview the production build
```

## Where things live

```
src/
├── data/
│   ├── curriculum.ts     # all modules, lessons, commands
│   ├── exercises.ts      # Code Lab exercises + validators + live-diagram generators
│   └── gamification.ts   # ranks + badge definitions
├── hooks/
│   └── useProgress.ts    # XP / levels / badges / streak, persisted to localStorage
└── components/           # Layout, Home, ModuleList, LessonViewer, CommandExplorer,
                          # CodeLab, LiveDiagram, ReconcilePlayground, PipelineDAG,
                          # GitTerminal, Achievements
```

## Recommended path

Start at **home → lesson 01**, do the **Reconcile playground** right after the reconciliation-loop lesson, then alternate lessons with **Code Lab** exercises. Aim for the **GitOps Architect** badge (100%).

Built with React 19 + TypeScript + Vite. Progress is local to your browser.
