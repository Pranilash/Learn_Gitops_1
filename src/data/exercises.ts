export type Difficulty = 'easy' | 'medium' | 'hard'
export type ExerciseCategory =
  | 'deployment'
  | 'service'
  | 'argocd'
  | 'kustomize'
  | 'sync'
  | 'secret'
  | 'rollout'
  | 'appset'

export interface ValidationResult {
  passed: boolean
  feedback: string[]
}

export type NodeKind = 'git' | 'argo' | 'k8s' | 'sync' | 'check' | 'cluster' | 'secret'

export interface DiagramNode {
  label: string
  kind: NodeKind
  detail?: string
  status?: 'ok' | 'pending' | 'warn'
}

export interface Exercise {
  id: string
  title: string
  difficulty: Difficulty
  category: ExerciseCategory
  concept: string
  /** ties the task back to a DSA / Git idea the learner already knows */
  analogy: string
  problem: string
  filename: string
  starterCode: string
  hints: string[]
  solution: string
  xp: number
  validate: (code: string) => ValidationResult
  getDiagram: (code: string) => DiagramNode[]
}

function hasLine(code: string, pattern: RegExp): boolean {
  return code.split('\n').some((l) => pattern.test(l.trim()))
}

function has(code: string, pattern: RegExp): boolean {
  return pattern.test(code)
}

export const exercises: Exercise[] = [
  // 1 ─────────────────────────────────────────────────────────────────────
  {
    id: 'first-deployment',
    title: 'Declare Your First Deployment',
    difficulty: 'easy',
    category: 'deployment',
    concept: 'Declarative desired state',
    analogy:
      'Like writing the "what" instead of the "how". You state replicas + image; Kubernetes figures out the steps to get there.',
    problem: `Write a Kubernetes Deployment for your Express app.

Requirements:
- name: web
- replicas: 3
- container image: ghcr.io/acme/web:1.4.0
- container name: web

This is the desired state GitOps will store in Git.`,
    filename: 'deployment.yaml',
    starterCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: 
spec:
  replicas: 
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: 
          image: `,
    hints: [
      'metadata.name should be "web".',
      'spec.replicas is the desired copy count: 3.',
      'The container image is ghcr.io/acme/web:1.4.0 — pin the tag, never use :latest.',
    ],
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: ghcr.io/acme/web:1.4.0`,
    xp: 100,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*Deployment/)) feedback.push('kind must be Deployment')
      if (!hasLine(code, /^name:\s*web/)) feedback.push('metadata.name must be web')
      if (!hasLine(code, /^replicas:\s*3\b/)) feedback.push('spec.replicas must be 3')
      if (!has(code, /image:\s*ghcr\.io\/acme\/web:1\.4\.0/)) feedback.push('image must be ghcr.io/acme/web:1.4.0')
      if (has(code, /:latest\b/)) feedback.push('Avoid :latest — use the pinned tag 1.4.0')
      if (feedback.length === 0) return { passed: true, feedback: ['Valid Deployment! 3 replicas of web:1.4.0 desired.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const replicas = Number((code.match(/replicas:\s*(\d+)/) || [])[1] || 0)
      const tag = (code.match(/web:([\w.-]+)/) || [])[1]
      const nodes: DiagramNode[] = [
        { label: 'Deployment web', kind: 'k8s', detail: 'desired spec', status: hasLine(code, /^kind:\s*Deployment/) ? 'ok' : 'warn' },
      ]
      const n = Math.min(replicas, 5)
      for (let i = 0; i < n; i++) {
        nodes.push({ label: `pod web-${i + 1}`, kind: 'cluster', detail: tag ? `:${tag}` : 'no image', status: tag ? 'ok' : 'warn' })
      }
      if (n === 0) nodes.push({ label: 'no pods', kind: 'cluster', detail: 'set replicas', status: 'warn' })
      return nodes
    },
  },

  // 2 ─────────────────────────────────────────────────────────────────────
  {
    id: 'service-stable-address',
    title: 'Give Pods a Stable Address',
    difficulty: 'easy',
    category: 'service',
    concept: 'Service = stable front for ephemeral pods',
    analogy:
      'Pods are like processes with random ports; a Service is a fixed hostname/load-balancer in front, so callers never chase moving IPs.',
    problem: `Pods come and go with random IPs. Write a Service that gives them
a stable name and load-balances traffic.

Requirements:
- name: web-svc
- selects pods with label app: web
- port 80 forwards to containers' targetPort 8080`,
    filename: 'service.yaml',
    starterCode: `apiVersion: v1
kind: Service
metadata:
  name: 
spec:
  selector:
    app: 
  ports:
    - port: 
      targetPort: `,
    hints: [
      'metadata.name should be web-svc.',
      'selector.app must match the Deployment pod label: web.',
      'port: 80 (the Service port), targetPort: 8080 (the container port).',
    ],
    solution: `apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080`,
    xp: 100,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*Service/)) feedback.push('kind must be Service')
      if (!hasLine(code, /^name:\s*web-svc/)) feedback.push('metadata.name must be web-svc')
      if (!has(code, /selector:[\s\S]*app:\s*web/)) feedback.push('selector.app must be web')
      if (!has(code, /port:\s*80\b/)) feedback.push('port must be 80')
      if (!has(code, /targetPort:\s*8080\b/)) feedback.push('targetPort must be 8080')
      if (feedback.length === 0) return { passed: true, feedback: ['Service routes :80 → pods :8080 by label app=web.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const ok = hasLine(code, /^kind:\s*Service/) && has(code, /app:\s*web/)
      return [
        { label: 'Service web-svc', kind: 'k8s', detail: ':80', status: ok ? 'ok' : 'warn' },
        { label: 'selector app=web', kind: 'sync', detail: 'load balance', status: has(code, /app:\s*web/) ? 'ok' : 'warn' },
        { label: 'pod web-1', kind: 'cluster', detail: ':8080', status: 'ok' },
        { label: 'pod web-2', kind: 'cluster', detail: ':8080', status: 'ok' },
      ]
    },
  },

  // 3 ─────────────────────────────────────────────────────────────────────
  {
    id: 'argocd-application',
    title: 'Wire Git to the Cluster',
    difficulty: 'medium',
    category: 'argocd',
    concept: 'Argo CD Application: source → destination',
    analogy:
      'The Application is the "edge" connecting a Git node to a cluster node in the GitOps graph. It declares the link and the sync policy.',
    problem: `Write an Argo CD Application that deploys the prod overlay.

Requirements:
- name: web-prod
- repoURL: https://github.com/acme/config-repo
- targetRevision: main
- path: apps/web/overlays/prod
- destination namespace: web
- syncPolicy.automated with prune: true and selfHeal: true`,
    filename: 'application.yaml',
    starterCode: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: 
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 
    targetRevision: 
    path: 
  destination:
    server: https://kubernetes.default.svc
    namespace: 
  syncPolicy:
    automated:
      prune: 
      selfHeal: `,
    hints: [
      'name: web-prod, and source.path points at the prod overlay folder.',
      'targetRevision: main makes Argo auto-follow the branch.',
      'prune: true deletes resources removed from Git; selfHeal: true reverts manual edits.',
    ],
    solution: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/acme/config-repo
    targetRevision: main
    path: apps/web/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: web
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
    xp: 150,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*Application/)) feedback.push('kind must be Application')
      if (!hasLine(code, /^name:\s*web-prod/)) feedback.push('metadata.name must be web-prod')
      if (!has(code, /repoURL:\s*https:\/\/github\.com\/acme\/config-repo/)) feedback.push('repoURL must be the config-repo URL')
      if (!hasLine(code, /^targetRevision:\s*main/)) feedback.push('targetRevision must be main')
      if (!has(code, /path:\s*apps\/web\/overlays\/prod/)) feedback.push('path must be apps/web/overlays/prod')
      if (!has(code, /namespace:\s*web\b/)) feedback.push('destination.namespace must be web')
      if (!has(code, /prune:\s*true/)) feedback.push('automated.prune must be true')
      if (!has(code, /selfHeal:\s*true/)) feedback.push('automated.selfHeal must be true')
      if (feedback.length === 0) return { passed: true, feedback: ['Application wired: prod overlay → namespace web, auto-sync on.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const selfHeal = has(code, /selfHeal:\s*true/)
      const prune = has(code, /prune:\s*true/)
      return [
        { label: 'Git config-repo', kind: 'git', detail: has(code, /targetRevision:\s*main/) ? '@main' : '?', status: has(code, /repoURL/) ? 'ok' : 'warn' },
        { label: 'Argo Application', kind: 'argo', detail: 'web-prod', status: hasLine(code, /^name:\s*web-prod/) ? 'ok' : 'warn' },
        { label: 'sync policy', kind: 'sync', detail: `${prune ? 'prune ' : ''}${selfHeal ? 'selfHeal' : 'manual'}`, status: selfHeal ? 'ok' : 'pending' },
        { label: 'ns: web', kind: 'cluster', detail: 'destination', status: has(code, /namespace:\s*web\b/) ? 'ok' : 'warn' },
      ]
    },
  },

  // 4 ─────────────────────────────────────────────────────────────────────
  {
    id: 'kustomize-overlay',
    title: 'Promote With a Prod Overlay',
    difficulty: 'medium',
    category: 'kustomize',
    concept: 'Base + overlay (tree of inheritance)',
    analogy:
      'Overlay = subclass of base. prod = base + patches. Promotion is just bumping the image tag in one file.',
    problem: `Write the prod overlay kustomization that inherits the base and
customizes it for production.

Requirements:
- resources: ../../base
- set replicas of "web" to 5
- set image ghcr.io/acme/web newTag to 1.4.1 (the promoted tag)`,
    filename: 'overlays/prod/kustomization.yaml',
    starterCode: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - 
replicas:
  - name: web
    count: 
images:
  - name: ghcr.io/acme/web
    newTag: `,
    hints: [
      'resources should point at the shared base: ../../base',
      'replicas.count for web should be 5 in prod.',
      'images.newTag is the promoted, already-tested tag: 1.4.1',
    ],
    solution: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
replicas:
  - name: web
    count: 5
images:
  - name: ghcr.io/acme/web
    newTag: 1.4.1`,
    xp: 150,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*Kustomization/)) feedback.push('kind must be Kustomization')
      if (!has(code, /-\s*\.\.\/\.\.\/base/)) feedback.push('resources must include ../../base')
      if (!has(code, /count:\s*5\b/)) feedback.push('replicas count for web must be 5')
      if (!has(code, /newTag:\s*["']?1\.4\.1["']?/)) feedback.push('image newTag must be 1.4.1')
      if (feedback.length === 0) return { passed: true, feedback: ['Prod overlay: base + 5 replicas + tag 1.4.1.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const tag = (code.match(/newTag:\s*["']?([\w.-]+)/) || [])[1]
      const count = (code.match(/count:\s*(\d+)/) || [])[1]
      return [
        { label: 'base/', kind: 'git', detail: 'shared manifests', status: has(code, /base/) ? 'ok' : 'warn' },
        { label: 'overlay prod', kind: 'sync', detail: 'patches', status: 'ok' },
        { label: 'replicas', kind: 'k8s', detail: count ? `× ${count}` : 'unset', status: count ? 'ok' : 'warn' },
        { label: 'image', kind: 'k8s', detail: tag ? `:${tag}` : 'unset', status: tag ? 'ok' : 'warn' },
      ]
    },
  },

  // 5 ─────────────────────────────────────────────────────────────────────
  {
    id: 'sync-waves',
    title: 'Order a Rollout With Sync Waves',
    difficulty: 'medium',
    category: 'sync',
    concept: 'Sync waves = topological order',
    analogy:
      'A DAG topological sort: run the DB migration (wave -1) before the app (wave 0). Lower waves first.',
    problem: `Make a database migration Job run BEFORE the app updates.

Requirements:
- It is a PreSync hook: annotation argocd.argoproj.io/hook: PreSync
- It runs in an early wave: annotation argocd.argoproj.io/sync-wave: "-1"
- Clean it up after success: argocd.argoproj.io/hook-delete-policy: HookSucceeded`,
    filename: 'migrate-job.yaml',
    starterCode: `apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
  annotations:
    argocd.argoproj.io/hook: 
    argocd.argoproj.io/sync-wave: 
    argocd.argoproj.io/hook-delete-policy: 
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/acme/migrate:1.4.1`,
    hints: [
      'hook: PreSync makes it run before the main sync.',
      'sync-wave must be a quoted string: "-1".',
      'hook-delete-policy: HookSucceeded removes the Job after it passes.',
    ],
    solution: `apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/sync-wave: "-1"
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/acme/migrate:1.4.1`,
    xp: 150,
    validate: (code) => {
      const feedback: string[] = []
      if (!has(code, /hook:\s*PreSync/)) feedback.push('annotation hook must be PreSync')
      if (!has(code, /sync-wave:\s*["']-1["']/)) feedback.push('sync-wave must be "-1" (quoted)')
      if (!has(code, /hook-delete-policy:\s*HookSucceeded/)) feedback.push('hook-delete-policy must be HookSucceeded')
      if (feedback.length === 0) return { passed: true, feedback: ['PreSync migration runs in wave -1, before the app.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const pre = has(code, /hook:\s*PreSync/)
      return [
        { label: 'wave -1', kind: 'check', detail: 'PreSync: db-migrate', status: pre ? 'ok' : 'warn' },
        { label: 'wave 0', kind: 'k8s', detail: 'Deployment web', status: 'pending' },
        { label: 'wave 1', kind: 'check', detail: 'PostSync: smoke test', status: 'pending' },
      ]
    },
  },

  // 6 ─────────────────────────────────────────────────────────────────────
  {
    id: 'external-secret',
    title: 'Keep Secrets Out of Git',
    difficulty: 'hard',
    category: 'secret',
    concept: 'Reference, do not commit, secrets',
    analogy:
      'Commit a pointer, not the value — like storing an env var name in code and the real value in a vault.',
    problem: `Use the External Secrets Operator. Commit a reference that pulls
DB_PASSWORD from a vault — never the plaintext secret itself.

Requirements:
- kind: ExternalSecret
- secretStoreRef.name: vault-backend
- target.name: web-db (the K8s Secret it creates)
- data key DB_PASSWORD from remoteRef.key: prod/web/db-password`,
    filename: 'external-secret.yaml',
    starterCode: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: web-db
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: 
    kind: ClusterSecretStore
  target:
    name: 
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: `,
    hints: [
      'secretStoreRef.name is the vault backend: vault-backend.',
      'target.name is the Secret created in-cluster: web-db.',
      'remoteRef.key is the path in the vault: prod/web/db-password.',
    ],
    solution: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: web-db
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: web-db
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: prod/web/db-password`,
    xp: 200,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*ExternalSecret/)) feedback.push('kind must be ExternalSecret')
      if (!has(code, /name:\s*vault-backend/)) feedback.push('secretStoreRef.name must be vault-backend')
      if (!has(code, /target:[\s\S]*name:\s*web-db/)) feedback.push('target.name must be web-db')
      if (!has(code, /key:\s*prod\/web\/db-password/)) feedback.push('remoteRef.key must be prod/web/db-password')
      if (has(code, /DB_PASSWORD:\s*\S+\s*$/m) && has(code, /value:/)) feedback.push('Never put the plaintext value in Git!')
      if (feedback.length === 0) return { passed: true, feedback: ['Only a reference is in Git — operator fetches the real value.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const ok = hasLine(code, /^kind:\s*ExternalSecret/)
      return [
        { label: 'Git: ExternalSecret', kind: 'git', detail: 'reference only', status: ok ? 'ok' : 'warn' },
        { label: 'ESO operator', kind: 'argo', detail: 'fetch at runtime', status: ok ? 'ok' : 'pending' },
        { label: 'Vault', kind: 'secret', detail: 'prod/web/db-password', status: has(code, /db-password/) ? 'ok' : 'warn' },
        { label: 'Secret web-db', kind: 'cluster', detail: 'created in-cluster', status: has(code, /web-db/) ? 'ok' : 'warn' },
      ]
    },
  },

  // 7 ─────────────────────────────────────────────────────────────────────
  {
    id: 'canary-rollout',
    title: 'Ship Safely With a Canary',
    difficulty: 'hard',
    category: 'rollout',
    concept: 'Progressive delivery (canary)',
    analogy:
      'Gradual rollout = binary-search your blast radius: send 10% first, verify, then widen. Auto-rollback on bad metrics.',
    problem: `Replace the Deployment with an Argo Rollout doing a canary.

Requirements:
- kind: Rollout
- strategy.canary.steps:
    - setWeight: 10
    - pause: { duration: 5m }
    - setWeight: 50
    - pause: {}        (indefinite — a manual/metric gate)`,
    filename: 'rollout.yaml',
    starterCode: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: web
spec:
  replicas: 5
  selector:
    matchLabels:
      app: web
  strategy:
    canary:
      steps:
        - setWeight: 
        - pause: { duration:  }
        - setWeight: 
        - pause: {}
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: ghcr.io/acme/web:1.4.1`,
    hints: [
      'First step sends 10% of traffic: setWeight: 10.',
      'Then pause 5m to watch metrics: pause: { duration: 5m }.',
      'Widen to 50, then an indefinite pause: { } as a final gate.',
    ],
    solution: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: web
spec:
  replicas: 5
  selector:
    matchLabels:
      app: web
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: {}
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: ghcr.io/acme/web:1.4.1`,
    xp: 200,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*Rollout/)) feedback.push('kind must be Rollout')
      if (!has(code, /canary:/)) feedback.push('strategy must be canary')
      if (!has(code, /setWeight:\s*10\b/)) feedback.push('first setWeight must be 10')
      if (!has(code, /duration:\s*5m/)) feedback.push('first pause duration must be 5m')
      if (!has(code, /setWeight:\s*50\b/)) feedback.push('second setWeight must be 50')
      if (feedback.length === 0) return { passed: true, feedback: ['Canary: 10% → wait 5m → 50% → gate. Safe rollout!'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const w1 = has(code, /setWeight:\s*10\b/)
      const w2 = has(code, /setWeight:\s*50\b/)
      return [
        { label: 'v1.4.0', kind: 'cluster', detail: 'stable', status: 'ok' },
        { label: 'canary 10%', kind: 'check', detail: 'watch metrics', status: w1 ? 'ok' : 'warn' },
        { label: 'canary 50%', kind: 'check', detail: 'widen', status: w2 ? 'ok' : 'pending' },
        { label: 'v1.4.1', kind: 'cluster', detail: '100% (after gate)', status: 'pending' },
      ]
    },
  },

  // 8 ─────────────────────────────────────────────────────────────────────
  {
    id: 'applicationset',
    title: 'Generate Apps For Every Env',
    difficulty: 'hard',
    category: 'appset',
    concept: 'ApplicationSet (template + generator)',
    analogy:
      'A for-loop over environments: one template, a list generator stamps out staging + prod Applications automatically.',
    problem: `Write an ApplicationSet that generates one Application per environment
from a list (staging, prod), each pointing at its overlay.

Requirements:
- kind: ApplicationSet
- list generator with elements env: staging and env: prod
- template name: web-{{env}}
- template source.path: apps/web/overlays/{{env}}`,
    filename: 'applicationset.yaml',
    starterCode: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: web
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: 
          - env: 
  template:
    metadata:
      name: 
    spec:
      project: default
      source:
        repoURL: https://github.com/acme/config-repo
        targetRevision: main
        path: 
      destination:
        server: https://kubernetes.default.svc
        namespace: web`,
    hints: [
      'List two elements: env: staging and env: prod.',
      'template.metadata.name uses the placeholder: web-{{env}}.',
      'source.path templates per env: apps/web/overlays/{{env}}.',
    ],
    solution: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: web
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: staging
          - env: prod
  template:
    metadata:
      name: web-{{env}}
    spec:
      project: default
      source:
        repoURL: https://github.com/acme/config-repo
        targetRevision: main
        path: apps/web/overlays/{{env}}
      destination:
        server: https://kubernetes.default.svc
        namespace: web`,
    xp: 200,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*ApplicationSet/)) feedback.push('kind must be ApplicationSet')
      if (!has(code, /env:\s*staging/)) feedback.push('list must include env: staging')
      if (!has(code, /env:\s*prod/)) feedback.push('list must include env: prod')
      if (!has(code, /name:\s*web-\{\{\s*env\s*\}\}/)) feedback.push('template name must be web-{{env}}')
      if (!has(code, /path:\s*apps\/web\/overlays\/\{\{\s*env\s*\}\}/)) feedback.push('path must be apps/web/overlays/{{env}}')
      if (feedback.length === 0) return { passed: true, feedback: ['Generates web-staging and web-prod automatically.'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const staging = has(code, /env:\s*staging/)
      const prod = has(code, /env:\s*prod/)
      return [
        { label: 'ApplicationSet', kind: 'argo', detail: 'list generator', status: hasLine(code, /^kind:\s*ApplicationSet/) ? 'ok' : 'warn' },
        { label: 'App web-staging', kind: 'sync', detail: 'overlays/staging', status: staging ? 'ok' : 'warn' },
        { label: 'App web-prod', kind: 'sync', detail: 'overlays/prod', status: prod ? 'ok' : 'warn' },
      ]
    },
  },

  // 9 ─────────────────────────────────────────────────────────────────────
  {
    id: 'ingress-routing',
    title: 'Route HTTP Traffic with Ingress',
    difficulty: 'medium',
    category: 'service',
    concept: 'Layer 7 HTTP routing & reverse proxying',
    analogy: 'Like an Nginx reverse proxy or Express router at the cluster edge: maps hostnames and paths to internal Services.',
    problem: `Configure an Ingress object to route traffic for host app.local:
- Path / routes to web-client Service on port 80
- Path /api routes to web-api Service on port 5000
- ingressClassName: nginx
- pathType: Prefix`,
    filename: 'ingress.yaml',
    starterCode: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  ingressClassName: 
  rules:
    - host: app.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: 
                port:
                  number: 
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: 
                port:
                  number: `,
    hints: [
      'ingressClassName should be "nginx".',
      'The root path / goes to service name "web-client" on port 80.',
      'The /api path goes to service name "web-api" on port 5000.',
    ],
    solution: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: app.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-client
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: web-api
                port:
                  number: 5000`,
    xp: 150,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*Ingress/)) feedback.push('kind must be Ingress')
      if (!has(code, /ingressClassName:\s*nginx/)) feedback.push('ingressClassName must be nginx')
      if (!has(code, /host:\s*app\.local/)) feedback.push('host must be app.local')
      if (!has(code, /name:\s*web-client/)) feedback.push('root path must route to web-client')
      if (!has(code, /number:\s*80\b/)) feedback.push('web-client port must be 80')
      if (!has(code, /name:\s*web-api/)) feedback.push('/api path must route to web-api')
      if (!has(code, /number:\s*5000\b/)) feedback.push('web-api port must be 5000')
      if (feedback.length === 0) return { passed: true, feedback: ['Ingress properly routes / and /api to respective backend Services!'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const ok = hasLine(code, /^kind:\s*Ingress/) && has(code, /app\.local/)
      return [
        { label: 'Host: app.local', kind: 'k8s', detail: 'Ingress Controller', status: ok ? 'ok' : 'warn' },
        { label: 'Path: /', kind: 'sync', detail: 'web-client:80', status: has(code, /web-client/) ? 'ok' : 'warn' },
        { label: 'Path: /api', kind: 'sync', detail: 'web-api:5000', status: has(code, /web-api/) ? 'ok' : 'warn' },
        { label: 'Pods Client & API', kind: 'cluster', detail: 'Live workloads', status: 'ok' },
      ]
    },
  },

  // 10 ────────────────────────────────────────────────────────────────────
  {
    id: 'hpa-autoscaling',
    title: 'Autoscale Pods with HPA',
    difficulty: 'medium',
    category: 'deployment',
    concept: 'Horizontal Pod Autoscaler (feedback control loop)',
    analogy: 'Like an automatic thermostat that scales worker threads when CPU load increases, then cools down when idle.',
    problem: `Create a HorizontalPodAutoscaler for the web deployment:
- name: web-hpa
- scaleTargetRef: Deployment web (apiVersion: apps/v1)
- minReplicas: 2
- maxReplicas: 10
- target CPU utilization percentage: 75%`,
    filename: 'hpa.yaml',
    starterCode: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: 
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: 
  minReplicas: 
  maxReplicas: 
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: `,
    hints: [
      'metadata.name should be web-hpa.',
      'scaleTargetRef.name should be web.',
      'minReplicas is 2, maxReplicas is 10.',
      'averageUtilization is 75.',
    ],
    solution: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 75`,
    xp: 150,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*HorizontalPodAutoscaler/)) feedback.push('kind must be HorizontalPodAutoscaler')
      if (!hasLine(code, /^name:\s*web-hpa/)) feedback.push('metadata.name must be web-hpa')
      if (!has(code, /scaleTargetRef:[\s\S]*name:\s*web\b/)) feedback.push('scaleTargetRef.name must be web')
      if (!has(code, /minReplicas:\s*2\b/)) feedback.push('minReplicas must be 2')
      if (!has(code, /maxReplicas:\s*10\b/)) feedback.push('maxReplicas must be 10')
      if (!has(code, /averageUtilization:\s*75\b/)) feedback.push('averageUtilization must be 75')
      if (feedback.length === 0) return { passed: true, feedback: ['HPA will scale web from 2 to 10 pods when CPU exceeds 75%!'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const ok = hasLine(code, /^kind:\s*HorizontalPodAutoscaler/)
      return [
        { label: 'HPA web-hpa', kind: 'k8s', detail: 'target CPU: 75%', status: ok ? 'ok' : 'warn' },
        { label: 'Deployment web', kind: 'argo', detail: '2 to 10 replicas', status: 'ok' },
        { label: 'Metrics Server', kind: 'cluster', detail: 'CPU Telemetry', status: 'ok' },
      ]
    },
  },

  // 11 ────────────────────────────────────────────────────────────────────
  {
    id: 'mongo-pvc',
    title: 'Persistent Storage with PVC',
    difficulty: 'medium',
    category: 'deployment',
    concept: 'Decoupling storage lifecycle from container lifecycle',
    analogy: 'Like plugging an external hard drive into a laptop: if the laptop crashes and is replaced, the hard drive and data remain intact.',
    problem: `Write a PersistentVolumeClaim for MongoDB data persistence:
- name: mongo-data-pvc
- accessModes: ReadWriteOnce
- storage: 10Gi
- storageClassName: standard`,
    filename: 'mongo-pvc.yaml',
    starterCode: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: 
spec:
  accessModes:
    - 
  storageClassName: 
  resources:
    requests:
      storage: `,
    hints: [
      'metadata.name should be mongo-data-pvc.',
      'accessModes is [ReadWriteOnce].',
      'storageClassName is "standard".',
      'resources.requests.storage is 10Gi.',
    ],
    solution: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi`,
    xp: 150,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*PersistentVolumeClaim/)) feedback.push('kind must be PersistentVolumeClaim')
      if (!hasLine(code, /^name:\s*mongo-data-pvc/)) feedback.push('metadata.name must be mongo-data-pvc')
      if (!has(code, /ReadWriteOnce/)) feedback.push('accessModes must include ReadWriteOnce')
      if (!has(code, /storageClassName:\s*standard/)) feedback.push('storageClassName must be standard')
      if (!has(code, /storage:\s*10Gi/)) feedback.push('storage request must be 10Gi')
      if (feedback.length === 0) return { passed: true, feedback: ['PVC dynamically binds 10Gi storage volume for MongoDB!'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const ok = hasLine(code, /^kind:\s*PersistentVolumeClaim/)
      return [
        { label: 'PVC mongo-data-pvc', kind: 'k8s', detail: 'Claim: 10Gi RWO', status: ok ? 'ok' : 'warn' },
        { label: 'StorageClass standard', kind: 'sync', detail: 'Dynamic Provisioner', status: 'ok' },
        { label: 'PV Volume Bound', kind: 'cluster', detail: 'Persistent Disk', status: ok ? 'ok' : 'pending' },
      ]
    },
  },

  // 12 ────────────────────────────────────────────────────────────────────
  {
    id: 'kyverno-policy',
    title: 'Enforce Security with Kyverno Policy',
    difficulty: 'hard',
    category: 'sync',
    concept: 'Policy as Code & Admission Control',
    analogy: 'Like TypeScript compiler strict mode or an ESLint rule, but applied at runtime to the cluster API before any YAML is allowed in.',
    problem: `Write a Kyverno ClusterPolicy that disallows the mutable ':latest' image tag:
- name: disallow-latest-tag
- validationFailureAction: Enforce
- matches pods
- validate pattern: spec.containers[*].image must NOT equal '*:latest'`,
    filename: 'disallow-latest.yaml',
    starterCode: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: 
spec:
  validationFailureAction: Enforce
  rules:
    - name: validate-image-tag
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Using ':latest' image tag is prohibited. Use immutable tags."
        pattern:
          spec:
            containers:
              - image: `,
    hints: [
      'metadata.name should be disallow-latest-tag.',
      'To disallow :latest, the pattern uses "!*:latest".',
    ],
    solution: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-latest-tag
spec:
  validationFailureAction: Enforce
  rules:
    - name: validate-image-tag
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Using ':latest' image tag is prohibited. Use immutable tags."
        pattern:
          spec:
            containers:
              - image: "!*:latest"`,
    xp: 250,
    validate: (code) => {
      const feedback: string[] = []
      if (!hasLine(code, /^kind:\s*ClusterPolicy/)) feedback.push('kind must be ClusterPolicy')
      if (!hasLine(code, /^name:\s*disallow-latest-tag/)) feedback.push('metadata.name must be disallow-latest-tag')
      if (!has(code, /validationFailureAction:\s*Enforce/)) feedback.push('validationFailureAction must be Enforce')
      if (!has(code, /image:\s*["']?!?\*:latest["']?/)) feedback.push('image pattern must prohibit !*:latest')
      if (feedback.length === 0) return { passed: true, feedback: ['Kyverno policy will block any container manifest with :latest!'] }
      return { passed: false, feedback }
    },
    getDiagram: (code) => {
      const ok = hasLine(code, /^kind:\s*ClusterPolicy/)
      return [
        { label: 'Kyverno Admission Controller', kind: 'check', detail: 'Validating Webhook', status: ok ? 'ok' : 'warn' },
        { label: 'Policy: disallow-latest-tag', kind: 'argo', detail: 'Action: Enforce', status: ok ? 'ok' : 'warn' },
        { label: 'Blocked: app:latest ❌', kind: 'cluster', detail: 'Rejection Gate', status: 'warn' },
        { label: 'Allowed: app:1.4.0 ✓', kind: 'cluster', detail: 'Immutable SHA/SemVer', status: 'ok' },
      ]
    },
  },
]
