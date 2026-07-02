export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface Command {
  command: string
  description: string
  example: string
  gitEquivalent?: string
  whenToUse: string
}

export interface Lesson {
  id: string
  title: string
  summary: string
  /** Paragraphs. A line starting with ``` is rendered as a code block. */
  content: string[]
  commands?: Command[]
  keyTakeaways: string[]
  exercise?: string
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  level: Level
  lessons: Lesson[]
}

export const modules: Module[] = [
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Map GitOps onto the Git mental model you already have.',
    icon: '◆',
    level: 'beginner',
    lessons: [
      {
        id: 'what-is-gitops',
        title: 'What is GitOps?',
        summary:
          'GitOps = use a Git repo as the single source of truth for your infrastructure, and let software continuously make reality match the repo.',
        content: [
          'You already use Git to version application code. GitOps is one idea applied everywhere: put the *desired state of your system* (which apps run, how many copies, what version, what config) into a Git repo as files, and let an automated agent make the real environment match those files.',
          'In a traditional deploy, a human or CI script *pushes* changes by running commands: `kubectl apply`, `ssh prod && ./deploy.sh`, clicking buttons in a console. The truth lives in the running servers, and nobody is fully sure how they got into that state.',
          'In GitOps, the truth lives in Git. A controller running next to your infrastructure constantly reads the repo and asks: "Does reality match what main says it should be?" If not, it fixes reality. Deploying becomes a `git push`. Rolling back becomes `git revert`.',
          'Because every change is a commit, you get the things Git already gives you for free: history, blame, pull requests, code review, signed commits, and an audit log of exactly who changed what and when — now for your entire infrastructure, not just code.',
          'A rough definition to memorize: "GitOps is operating infrastructure through declarative configuration stored in Git, reconciled automatically by software."',
          'The word "Ops" matters: this is how platform/SRE teams run production. As an SDE, you will most often *consume* it — you change a YAML value, open a PR, it gets reviewed and merged, and minutes later it is live. Understanding the machinery makes you faster and safer.',
        ],
        keyTakeaways: [
          'Git is the single source of truth for *desired state*.',
          'Software (not humans) makes the live system match the repo.',
          'Deploy = git push/merge. Rollback = git revert.',
          'You inherit Git superpowers: review, history, audit, blame.',
        ],
        exercise:
          'In the Reconciliation playground, change the image tag in "Git" and watch the cluster catch up. That is GitOps in one motion.',
      },
      {
        id: 'declarative-vs-imperative',
        title: 'Declarative vs Imperative',
        summary:
          'Imperative = a list of steps to run. Declarative = a description of the end state. GitOps is declarative.',
        content: [
          'You write Express like this — imperatively, step by step:',
          '```js\nconst app = express()\napp.get("/health", (req, res) => res.send("ok"))\napp.listen(3000)\n```',
          'Each line is an instruction the computer executes in order. If you run it twice, you might get an error ("port already in use"). Imperative code cares about *how* and *when*.',
          'Declarative config instead describes the *desired end result* and lets the system figure out the steps:',
          '```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n        - name: web\n          image: ghcr.io/acme/web:1.4.0\n```',
          'This file says "I want 3 copies of web running version 1.4.0." It does not say how to get there. Kubernetes compares this to reality and does whatever is needed: start pods if there are too few, kill some if too many, replace them on a version change.',
          'This is why declarative config is *idempotent*: applying it 1 time or 100 times converges to the same state. That property is what makes continuous reconciliation safe — the controller can re-apply constantly without breaking anything.',
          'GitOps requires declarative tools. You store the "what" in Git; the controller owns the "how". This is the single biggest mindset shift coming from imperative scripting.',
        ],
        keyTakeaways: [
          'Imperative = steps (how). Declarative = end state (what).',
          'Declarative config is idempotent: re-applying is safe.',
          'GitOps stores the "what"; the controller computes the "how".',
          'Your Express handlers are imperative; your K8s YAML is declarative.',
        ],
      },
      {
        id: 'reconciliation-loop',
        title: 'The Reconciliation Loop',
        summary:
          'A control loop that forever compares desired state (Git) to actual state (cluster) and closes the gap. This is the engine of GitOps.',
        content: [
          'The heart of GitOps is a loop that never stops. In pseudocode it is something you could write today:',
          '```js\nwhile (true) {\n  const desired = readFromGit()        // what main says\n  const actual  = readFromCluster()    // what is really running\n  const diff    = compare(desired, actual)\n  if (diff.length) apply(diff)         // fix reality\n  sleep(180)                           // poll every ~3 min\n}\n```',
          'This is exactly the pattern behind a thermostat: desired temperature is set on the dial (Git), the sensor reads the room (cluster), and the heater turns on until they match. The controller is the thermostat for your infrastructure.',
          'Two events trigger a fix: (1) Git changes — someone merged a PR, so desired state moved. (2) Reality drifts — a pod crashed, or someone ran `kubectl edit` by hand. Either way the diff is non-empty and the loop converges them back together.',
          'The state where desired == actual is called **Synced**. When they differ it is **OutOfSync**, and the difference is called **drift**. A separate signal, **Health**, asks a different question: are the running things actually working (pods ready, not crash-looping)?',
          'Manual changes to the cluster are temporary by design. If you `kubectl edit` a Deployment to 5 replicas but Git says 3, the next loop will *revert you to 3*. This "self-healing" is a feature: Git always wins, so the cluster can never silently drift from what is reviewed and recorded.',
          'Internalize this loop. Almost everything else in GitOps — ArgoCD, Flux, sync waves, auto-pruning — is just decoration around this single while-loop.',
        ],
        keyTakeaways: [
          'Reconciliation = forever loop: read desired, read actual, fix the gap.',
          'Synced = desired equals actual. Drift = they differ.',
          'Health is separate: are the running workloads actually OK?',
          'Manual cluster edits get reverted — Git always wins (self-healing).',
        ],
        exercise:
          'Open the Reconciliation playground, manually break the cluster (simulate `kubectl scale`), and watch the loop self-heal it back to the Git value.',
      },
      {
        id: 'push-vs-pull',
        title: 'Push vs Pull Delivery',
        summary:
          'Old CI/CD pushes into the cluster from outside. GitOps pulls from inside the cluster. Pull is more secure and self-correcting.',
        content: [
          'In a classic CI/CD pipeline (push model), your CI server holds cluster credentials and runs `kubectl apply` or `helm upgrade` against production from the outside. The pipeline reaches *into* the cluster and shoves changes in.',
          'Problems with push: your CI system needs powerful prod credentials (a juicy target for attackers); the cluster only updates when the pipeline runs, so out-of-band drift goes unnoticed; and a half-failed pipeline can leave the cluster in an unknown state.',
          'GitOps flips this to a pull model. An agent *inside* the cluster watches the Git repo and pulls approved changes in. Credentials stay inside the trust boundary; CI never needs cluster access. The agent runs continuously, so drift is caught even when nobody is deploying.',
          'A clean separation falls out of this: **CI** builds and tests your code and produces an artifact (a container image + a manifest update). **CD** is just "Git changed, so the in-cluster agent reconciles." CI writes to Git; the cluster reads from Git. They never talk directly.',
          'Concretely, the daily flow becomes: you push code → CI builds image `:1.4.1` and commits a one-line change to the config repo bumping the tag → the in-cluster agent sees the new commit → it pulls and applies → new pods roll out. No machine outside the cluster ever held prod credentials.',
          'There are managed push-style GitOps flavors too, but "pull-based, agent-in-cluster" (ArgoCD, Flux) is the dominant model and what you will see at most companies.',
        ],
        commands: [
          {
            command: 'git revert <sha>',
            description: 'Undo a deployment by reverting the commit that caused it.',
            example: 'git revert 9f2c1a4 && git push',
            gitEquivalent: 'You already know this — in GitOps it IS the rollback.',
            whenToUse: 'A bad version is live and you need the previous state back, with an audit trail.',
          },
        ],
        keyTakeaways: [
          'Push: external CI holds prod creds and applies changes inward.',
          'Pull: an in-cluster agent watches Git and pulls changes inward.',
          'Pull keeps credentials inside the cluster and self-corrects drift.',
          'CI writes to Git; the cluster reads from Git; they stay decoupled.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'k8s-essentials',
    title: 'Kubernetes, Just Enough',
    description: 'The minimum Kubernetes you need so GitOps makes sense.',
    icon: '⎈',
    level: 'beginner',
    lessons: [
      {
        id: 'why-k8s',
        title: 'Why Kubernetes Exists',
        summary:
          'Containers solved "it works on my machine". Kubernetes solves "now run thousands of them reliably across many servers".',
        content: [
          'A container (Docker) packages your app + runtime + deps into one immutable artifact. Great for one app on one box. But production needs many copies across many machines, restarts on crash, rolling upgrades with no downtime, networking, and config — by hand that is impossible.',
          'Kubernetes (K8s) is a container orchestrator: you tell it the desired state ("run 3 copies of this image, expose port 80") and it continuously makes that true across a fleet of machines (nodes). Sound familiar? K8s is itself built on a reconciliation loop — which is exactly why GitOps fits it so naturally.',
          'You do not talk to individual servers. You talk to the K8s **API server**, submitting declarative objects. Controllers inside K8s watch those objects and drive the real world to match. GitOps simply puts those same objects into Git and feeds them to the API server for you.',
          'You do NOT need to be a Kubernetes expert to do GitOps as an SDE. You need to recognize a handful of object types and read/edit their YAML. That is what the next lessons cover.',
        ],
        keyTakeaways: [
          'Containers package an app; Kubernetes runs many of them reliably.',
          'You declare desired state to the K8s API; controllers reconcile it.',
          'Kubernetes is itself a reconciliation engine — GitOps rides on top.',
          'As an SDE you mostly read and tweak K8s YAML, not operate the cluster.',
        ],
      },
      {
        id: 'k8s-objects',
        title: 'The Objects You Must Know',
        summary:
          'Pod, Deployment, Service, ConfigMap/Secret, Namespace, Ingress — 6 nouns cover 90% of day-to-day GitOps.',
        content: [
          'Every Kubernetes object shares the same 4-field skeleton. Learn this shape once and every YAML looks familiar:',
          '```yaml\napiVersion: apps/v1     # which API group/version\nkind: Deployment        # what type of object\nmetadata:\n  name: web             # its name (+ namespace, labels)\nspec:                   # the DESIRED state\n  replicas: 3\n```',
          '**Pod** — the smallest unit: one (or a few) containers running together. You rarely create Pods directly; something manages them for you.',
          '**Deployment** — manages a set of identical Pods. "Keep 3 replicas of image X alive, and roll them one-by-one when the image changes." This is the workhorse object for stateless apps like your Express server.',
          '**Service** — a stable network name + load balancer in front of Pods (which come and go with random IPs). `web-svc` always routes to the healthy `web` pods.',
          '**ConfigMap / Secret** — externalized configuration and credentials, injected as env vars or files. Secrets are base64-encoded, not encrypted (this matters a lot for GitOps — covered in the Advanced module).',
          '**Namespace** — a virtual folder to isolate groups of objects (e.g. `team-a`, `staging`, `prod`). **Ingress** — HTTP routing rules that map hostnames/paths to Services.',
        ],
        commands: [
          {
            command: 'kubectl get <kind>',
            description: 'List objects of a kind in the current namespace.',
            example: 'kubectl get deployments\nkubectl get pods -n staging',
            gitEquivalent: 'git status / git ls-files — show me what exists.',
            whenToUse: 'Quick check of what is running before/after a sync.',
          },
          {
            command: 'kubectl describe <kind> <name>',
            description: 'Detailed state + recent events for one object.',
            example: 'kubectl describe pod web-7d9f',
            whenToUse: 'A pod is unhealthy and you need the "why" (events, probes).',
          },
        ],
        keyTakeaways: [
          'Every object = apiVersion + kind + metadata + spec.',
          'Deployment manages Pods; Service gives them a stable address.',
          'ConfigMap/Secret hold config; Namespace isolates; Ingress routes HTTP.',
          'Secrets are base64 (encoded), not encrypted — never commit raw ones.',
        ],
      },
      {
        id: 'desired-vs-actual',
        title: 'Desired State vs Actual State',
        summary:
          '`spec` is what you want; `status` is what is real. The whole system exists to drive status → spec.',
        content: [
          'Open any live K8s object and you will see two big sections. `spec` is the desired state *you* wrote. `status` is the actual state the *controllers* report back. You write spec; the system writes status.',
          '```yaml\nspec:\n  replicas: 3            # you asked for 3\nstatus:\n  replicas: 3\n  readyReplicas: 2       # reality: only 2 are ready right now\n  conditions:\n    - type: Available\n      status: "False"\n```',
          'Here desired is 3 but only 2 are ready — maybe one pod is still pulling its image. The Deployment controller keeps working until `status` matches `spec`. This gap-closing is the same reconciliation loop, now *inside* Kubernetes itself.',
          'GitOps adds an outer loop on top: Git holds the desired `spec`, and the GitOps agent makes the cluster objects match Git, while Kubernetes makes reality match those objects. Two nested control loops, both converging.',
          'When you debug a deploy, always separate the questions: "Is the spec what Git says?" (a GitOps/sync question) vs "Is status healthy?" (a Kubernetes/health question). Mixing them up is the #1 source of confusion.',
        ],
        keyTakeaways: [
          'spec = desired (you write it). status = actual (controllers write it).',
          'Kubernetes drives status toward spec — its own reconciliation loop.',
          'GitOps is an outer loop driving the cluster spec toward Git.',
          'Debugging: "sync" questions (spec vs Git) are separate from "health".',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'gitops-principles',
    title: 'GitOps Principles',
    description: 'The 4 principles, repo layout, and how teams model environments.',
    icon: '§',
    level: 'intermediate',
    lessons: [
      {
        id: 'four-principles',
        title: 'The Four Principles',
        summary:
          'The OpenGitOps standard: Declarative, Versioned & Immutable, Pulled Automatically, Continuously Reconciled.',
        content: [
          'The community standardized GitOps into four principles (the OpenGitOps project). Memorize these four words — interviewers and design docs use them directly.',
          '**1. Declarative.** The entire desired state of the system is expressed declaratively (YAML/JSON), never as scripts of steps. (See: declarative vs imperative.)',
          '**2. Versioned and Immutable.** Desired state is stored so it is versioned and the full history is retained — i.e. Git. Each version is immutable; you do not edit the past, you add a new commit on top.',
          '**3. Pulled Automatically.** Software agents automatically pull the declared state from the source. No human runs `kubectl apply` by hand for normal changes.',
          '**4. Continuously Reconciled.** Agents continuously observe actual state and attempt to reconcile it to the desired state — the forever loop, catching drift even with no new commits.',
          'Notice these are tool-agnostic. ArgoCD and Flux are *implementations*; the principles are the contract. If a workflow violates one (e.g. someone hotfixes prod with `kubectl edit` and never commits), it is "not really GitOps" — and that drift will get reverted or cause confusion.',
        ],
        keyTakeaways: [
          'Declarative — desired state as data, not scripts.',
          'Versioned & Immutable — stored in Git, full history, append-only.',
          'Pulled Automatically — agents fetch desired state, no manual apply.',
          'Continuously Reconciled — forever loop fixes drift.',
        ],
      },
      {
        id: 'repo-structure',
        title: 'App Repo vs Config Repo',
        summary:
          'Separate your application source code from your deployment manifests. CI writes to the config repo; the agent reads from it.',
        content: [
          'A near-universal pattern: keep two repos. The **app repo** holds your application source (your Express code, Dockerfile, tests). The **config repo** (a.k.a. "GitOps repo" or "manifests repo") holds the K8s YAML that describes how the app is deployed.',
          'Why split them? (1) Different cadence and reviewers: app changes are reviewed by devs; deploy/config changes can be gated by platform/SRE. (2) It avoids an infinite loop — if CI commits an image tag back into the same repo, that commit would re-trigger CI. (3) The config repo cleanly maps 1:1 to "what is running", across many apps.',
          'The flow connecting them: push to app repo → CI builds image `web:1.4.1` and pushes it to a registry → CI makes a tiny commit to the config repo changing the image tag → the GitOps agent sees the config commit and deploys. The image tag is the handoff point between CI and CD.',
          'A typical config repo layout (a *tree* — your DSA brain will like this):',
          '```\nconfig-repo/\n├── apps/\n│   └── web/\n│       ├── base/                # shared manifests\n│       │   ├── deployment.yaml\n│       │   ├── service.yaml\n│       │   └── kustomization.yaml\n│       └── overlays/\n│           ├── staging/         # staging-specific patches\n│           └── prod/            # prod-specific patches\n└── argocd/\n    └── applications/            # ArgoCD App definitions\n```',
          'You, as an SDE, will spend most of your GitOps time editing files in `overlays/<env>` — bumping an image tag, changing replicas, tweaking an env var — then opening a PR against the config repo.',
        ],
        keyTakeaways: [
          'App repo = source code. Config repo = deployment manifests.',
          'CI builds the image and commits the new tag to the config repo.',
          'Splitting repos avoids CI loops and separates review responsibilities.',
          'Config repo is a tree: apps → base + overlays per environment.',
        ],
      },
      {
        id: 'environments',
        title: 'Modeling Environments',
        summary:
          'Promote the same artifact across staging → prod using directories/overlays, not by rebuilding. Prefer folders over long-lived branches.',
        content: [
          'You need staging, prod, maybe dev and QA. The golden rule: build the image **once**, then *promote the same immutable image* through environments. Never rebuild per environment — a rebuild could differ from what you tested.',
          'Two common strategies to represent environments in the config repo:',
          '**Directories / overlays (recommended).** One branch (main), and a folder per environment that patches a shared base. Promotion = change the image tag in `overlays/prod`. Easy to diff staging vs prod side-by-side; no messy branch merges.',
          '**Branch-per-environment (legacy).** A `staging` branch and a `prod` branch; promotion = merge staging→prod. Looks intuitive coming from Git, but it tends to cause drift between branches and painful merge conflicts in config. Most teams have moved away from it.',
          'Promotion in the directory model looks like this PR diff:',
          '```diff\n# apps/web/overlays/prod/kustomization.yaml\n  images:\n    - name: ghcr.io/acme/web\n-     newTag: 1.4.0\n+     newTag: 1.4.1   # promote the tag already validated in staging\n```',
          'Each environment usually maps to its own ArgoCD Application (and often its own namespace or cluster), all reading from the same config repo. The image tag is the unit of promotion that flows: dev → staging → prod.',
        ],
        keyTakeaways: [
          'Build the image once; promote the same artifact across environments.',
          'Prefer directory/overlay-per-env over branch-per-env.',
          'Promotion = change an image tag in the target env folder via PR.',
          'Each env typically = its own Application + namespace/cluster.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'argocd',
    title: 'Argo CD',
    description: 'The most popular pull-based GitOps controller, end to end.',
    icon: '◎',
    level: 'intermediate',
    lessons: [
      {
        id: 'argocd-architecture',
        title: 'How Argo CD Works',
        summary:
          'Argo CD runs in your cluster, watches Git + the live cluster, computes the diff, and shows/applies it. Three core components.',
        content: [
          'Argo CD is a Kubernetes controller you install *into* the cluster. It implements the pull model: it watches your config repo and the live cluster, computes the diff, and (optionally) applies it. It also gives you a slick web UI and CLI showing every app, its sync status, and a visual tree of resources.',
          'Three components you should be able to name:',
          '**repo-server** — clones your Git repo and renders the final manifests (running Kustomize/Helm if needed) into plain YAML.',
          '**application-controller** — the reconciliation engine. It compares rendered desired manifests (from repo-server) to live cluster state and marks each app Synced/OutOfSync and Healthy/Degraded, applying changes when configured to.',
          '**api-server** — backs the Web UI, CLI (`argocd`), and gRPC/REST API; handles auth (SSO/RBAC). A small Redis is used as a cache.',
          'Mental model: repo-server answers "what should exist?", application-controller answers "what does exist, and how do I make it match?", api-server answers "how do humans see and drive it?". Everything maps back to the reconciliation loop you already understand.',
        ],
        keyTakeaways: [
          'Argo CD is an in-cluster controller (pull model) with a UI/CLI.',
          'repo-server renders manifests from Git (Kustomize/Helm → plain YAML).',
          'application-controller diffs desired vs live and reconciles.',
          'api-server powers the UI/CLI/API and handles auth & RBAC.',
        ],
      },
      {
        id: 'application-crd',
        title: 'The Application Resource',
        summary:
          'An Argo CD `Application` is itself a K8s object that says: from THIS repo path, deploy to THIS cluster/namespace, with THIS sync policy.',
        content: [
          'You tell Argo CD what to manage by creating an `Application` custom resource. It is just more YAML — and it has the same skeleton you already know. This single object wires a Git source to a cluster destination:',
          '```yaml\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: web-prod\n  namespace: argocd\nspec:\n  project: default\n  source:\n    repoURL: https://github.com/acme/config-repo\n    targetRevision: main          # branch/tag/commit to track\n    path: apps/web/overlays/prod   # which folder to render\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: web\n  syncPolicy:\n    automated:\n      prune: true        # delete things removed from Git\n      selfHeal: true     # revert manual cluster edits\n```',
          '`source` = where desired state lives (repo + revision + path). `destination` = which cluster + namespace to deploy into. `syncPolicy` = how aggressive reconciliation is.',
          '`automated.selfHeal: true` turns on the "Git always wins" behavior: manual `kubectl edit`s get reverted. `automated.prune: true` means deleting a file from Git deletes the resource from the cluster. Without `automated`, Argo only *detects* drift and waits for you to click Sync (manual sync) — common for prod as a safety gate.',
          '`targetRevision` is powerful: point it at `main` to auto-follow, or pin it to a tag/commit SHA to freeze prod until you deliberately bump it.',
          'This is the object you will edit or copy most often in real work — to onboard a new service, you usually just add another `Application`.',
        ],
        commands: [
          {
            command: 'argocd app get <name>',
            description: 'Show an app: sync status, health, and per-resource diff.',
            example: 'argocd app get web-prod',
            whenToUse: 'Check whether prod matches Git and is healthy.',
          },
          {
            command: 'argocd app sync <name>',
            description: 'Trigger a sync now (manual deploy) instead of waiting for the poll.',
            example: 'argocd app sync web-prod',
            gitEquivalent: 'Like forcing a deploy of the latest merged commit.',
            whenToUse: 'Manual-sync apps, or to apply immediately after a merge.',
          },
        ],
        keyTakeaways: [
          'An Application maps a Git source path → a cluster destination.',
          'targetRevision pins the branch/tag/commit Argo tracks.',
          'selfHeal reverts manual edits; prune deletes resources removed from Git.',
          'No automated block = detect-only; you click Sync to deploy.',
        ],
        exercise:
          'In the Code Lab, write a complete Argo CD Application for a "payments" service in prod with prune + selfHeal enabled.',
      },
      {
        id: 'sync-health-drift',
        title: 'Sync, Health & Drift',
        summary:
          'Two independent signals: Sync status (does cluster match Git?) and Health (are workloads actually OK?). Learn to read both.',
        content: [
          'Argo CD reports every Application along two axes, and keeping them separate in your head is the key skill.',
          '**Sync status** answers "does the live cluster match Git?" Values: **Synced** (match), **OutOfSync** (drift — Git changed, or someone edited the cluster). This is purely a diff result.',
          '**Health status** answers "are the resources functioning?" Values include **Healthy**, **Progressing**, **Degraded**, **Missing**. A Deployment is Healthy when its ready replicas meet the spec; Degraded if pods are crash-looping.',
          'These combine into four very different situations: Synced+Healthy (great); OutOfSync+Healthy (running fine, but not what Git says — drift to investigate); Synced+Degraded (you deployed exactly what Git says, but the app itself is broken — a code/config bug, not a GitOps problem); OutOfSync+Degraded (a bad change is mid-rollout).',
          'Drift specifically means OutOfSync caused by a change made *outside* Git — a manual `kubectl scale`, an autoscaler, or another controller editing the object. With selfHeal on, Argo reverts it automatically; with selfHeal off, it just flags it red and waits.',
          'Debugging recipe: if OutOfSync, look at the *diff* (`argocd app diff`) to see which field differs and decide if Git or the cluster is right. If Degraded, ignore Argo and debug the workload itself (`kubectl describe`, logs) — Argo did its job.',
        ],
        commands: [
          {
            command: 'argocd app diff <name>',
            description: 'Show the exact field-level differences between Git and live.',
            example: 'argocd app diff web-prod',
            gitEquivalent: 'git diff — but desired (Git) vs actual (cluster).',
            whenToUse: 'An app is OutOfSync and you need to know precisely what drifted.',
          },
        ],
        keyTakeaways: [
          'Sync = does cluster match Git? Health = are workloads functioning?',
          'They are independent: you can be Synced but Degraded, or healthy but drifted.',
          'Drift = OutOfSync from a change made outside Git.',
          'OutOfSync → inspect the diff; Degraded → debug the workload itself.',
        ],
        exercise:
          'In the Reconciliation playground, create both situations: a Git change (OutOfSync from desired) and a manual cluster edit (drift), and read how each resolves.',
      },
      {
        id: 'sync-waves-hooks',
        title: 'Sync Waves & Hooks',
        summary:
          'Control ordering during a sync: lower waves apply first. Hooks run jobs (e.g. DB migration) at PreSync/PostSync.',
        content: [
          'By default Argo applies all resources together, but real apps need ordering: create the Namespace and run the database migration *before* starting the app pods. Sync waves give you that ordering — think topological sort on a dependency DAG (DSA: graph!).',
          'You annotate resources with a wave number; Argo applies lower numbers first and waits for each wave to become healthy before starting the next:',
          '```yaml\nmetadata:\n  annotations:\n    argocd.argoproj.io/sync-wave: "-1"   # runs before wave 0 (default)\n```',
          'Typical ordering: wave -1 = namespaces/CRDs/configmaps; wave 0 = the Deployment; wave 1 = things that depend on the app being up. Negative numbers are allowed and run first.',
          '**Hooks** let you run one-off Jobs tied to the sync lifecycle, via the `argocd.argoproj.io/hook` annotation: **PreSync** (e.g. run DB migrations before deploy), **Sync** (alongside), **PostSync** (e.g. smoke tests after), **SyncFail** (cleanup on failure).',
          '```yaml\n# a database migration Job that runs before the app updates\nmetadata:\n  annotations:\n    argocd.argoproj.io/hook: PreSync\n    argocd.argoproj.io/hook-delete-policy: HookSucceeded\n```',
          'Together, waves + hooks let you express "migrate the DB, then roll the app, then run smoke tests" entirely declaratively — no imperative deploy script needed.',
        ],
        keyTakeaways: [
          'Sync waves order resource application (low numbers first).',
          'It is a topological sort over your resource dependency graph.',
          'Hooks run Jobs at PreSync/Sync/PostSync/SyncFail.',
          'PreSync hook = classic place for DB migrations before a rollout.',
        ],
      },
      {
        id: 'app-of-apps',
        title: 'App of Apps & ApplicationSets',
        summary:
          'Manage many Applications declaratively: one root App that points at a folder of Application YAMLs, or an ApplicationSet that generates them.',
        content: [
          'Once you have dozens of services × environments, hand-writing every Application is toil. Two patterns scale it.',
          '**App of Apps.** Create one "root" Application whose Git path is a folder full of *other* Application manifests. Argo deploys the root, which deploys all the children. Now adding a service = committing one more Application file; the root picks it up. It is a tree whose leaves are real workloads (DSA: tree again).',
          '```yaml\n# root app points at a directory of Application YAMLs\nspec:\n  source:\n    repoURL: https://github.com/acme/config-repo\n    path: argocd/applications   # contains web.yaml, api.yaml, ...\n```',
          '**ApplicationSet.** A controller that *generates* Applications from a template + a generator. E.g. a list generator that stamps out the same app for staging/prod, or a Git-directory generator that auto-creates one Application per folder under `apps/`. Add a new folder → a new Application appears automatically.',
          '```yaml\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nspec:\n  generators:\n    - list:\n        elements:\n          - { env: staging }\n          - { env: prod }\n  template:\n    metadata: { name: "web-{{env}}" }\n    spec:\n      source: { path: "apps/web/overlays/{{env}}" }\n```',
          'Rule of thumb: App-of-Apps for a curated set you maintain by hand; ApplicationSet when you want apps generated from a pattern (per-env, per-cluster, per-team) without writing each one.',
        ],
        keyTakeaways: [
          'App of Apps: a root Application that deploys child Applications (a tree).',
          'ApplicationSet generates Applications from a template + generator.',
          'Both remove the toil of hand-writing every Application.',
          'Use ApplicationSet for per-env / per-cluster fan-out patterns.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'config-management',
    title: 'Config: Kustomize & Helm',
    description: 'The two tools that turn one base into many environment variants.',
    icon: '⌗',
    level: 'intermediate',
    lessons: [
      {
        id: 'kustomize',
        title: 'Kustomize: Bases & Overlays',
        summary:
          'Template-free YAML customization: a shared base + per-environment overlays that patch it. Tree of inheritance, no placeholders.',
        content: [
          'Kustomize is built into `kubectl` and is the simplest way to reuse manifests across environments without templating. You keep a **base** (the common YAML) and **overlays** that *patch* the base for each environment. No `{{ }}` placeholders — it merges real YAML on top of real YAML.',
          'The base declares the shared shape:',
          '```yaml\n# base/kustomization.yaml\nresources:\n  - deployment.yaml\n  - service.yaml\n```',
          'An overlay references the base and layers changes on top:',
          '```yaml\n# overlays/prod/kustomization.yaml\nresources:\n  - ../../base\nreplicas:\n  - name: web\n    count: 5            # prod runs more copies\nimages:\n  - name: ghcr.io/acme/web\n    newTag: 1.4.1       # the promoted tag\npatches:\n  - path: resources-patch.yaml   # bump CPU/memory for prod\n```',
          'Mentally this is inheritance / a tree: prod = base + prod patches; staging = base + staging patches. Argo CD renders the overlay for each env (the `path` in your Application points at the overlay folder).',
          'Because there are no templates, the files are valid Kubernetes YAML you can read directly — great for review and for newcomers. The trade-off: very dynamic config (lots of conditionals, loops) is awkward in Kustomize. That is where Helm shines.',
        ],
        commands: [
          {
            command: 'kubectl kustomize <dir>',
            description: 'Render an overlay to final YAML locally (what Argo will apply).',
            example: 'kubectl kustomize apps/web/overlays/prod',
            whenToUse: 'Preview the merged result before opening a PR.',
          },
        ],
        keyTakeaways: [
          'Kustomize = base + overlays, merged (no templating placeholders).',
          'Overlays patch images, replicas, resources per environment.',
          'It models environments as a tree of inheritance from a base.',
          'Render locally with `kubectl kustomize <overlay>` to preview.',
        ],
        exercise:
          'In the Code Lab, write a prod overlay kustomization that pins the base, sets replicas to 5, and bumps the image tag.',
      },
      {
        id: 'helm',
        title: 'Helm: Templated Packages',
        summary:
          'Helm packages K8s manifests as a parameterized "chart" rendered with a values file. Great for reusable, configurable apps.',
        content: [
          'Helm is a package manager for Kubernetes. An app is a **chart**: templated YAML (`{{ .Values.x }}`) plus a default `values.yaml`. You install/upgrade by supplying a values file that fills in the blanks — replicas, image, resources, feature flags.',
          '```yaml\n# templates/deployment.yaml (inside a chart)\nspec:\n  replicas: {{ .Values.replicaCount }}\n  template:\n    spec:\n      containers:\n        - image: "{{ .Values.image.repo }}:{{ .Values.image.tag }}"\n```',
          '```yaml\n# values-prod.yaml — your per-env inputs\nreplicaCount: 5\nimage:\n  repo: ghcr.io/acme/web\n  tag: 1.4.1\n```',
          'Helm excels when config is dynamic (conditionals, loops, many tunables) and for *consuming third-party software* — almost every popular tool (Prometheus, ingress-nginx, cert-manager) ships an official chart you configure with a values file.',
          'In GitOps, you do NOT run `helm install` by hand. Instead your Argo CD Application points at the chart and supplies values; Argo CD renders the chart (via repo-server) and reconciles the output. Helm becomes a *rendering engine*, not a deploy tool — keeping the pull/reconcile model intact.',
          'Kustomize vs Helm, quick call: Kustomize for your own straightforward apps and readable diffs; Helm for highly configurable apps and installing off-the-shelf software. Many teams even use both (Helm to render, Kustomize to patch the result).',
        ],
        commands: [
          {
            command: 'helm template <chart>',
            description: 'Render a chart to plain YAML locally (no install).',
            example: 'helm template ./web -f values-prod.yaml',
            whenToUse: 'Preview exactly what Argo CD will apply from a chart.',
          },
        ],
        keyTakeaways: [
          'Helm chart = templated manifests + values; render per environment.',
          'Best for dynamic config and installing third-party software.',
          'In GitOps, Argo renders the chart; you never `helm install` by hand.',
          'Kustomize = simple & readable; Helm = powerful & templated.',
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'advanced',
    title: 'Production & Advanced',
    description: 'Secrets, progressive delivery, multi-cluster, security, rollback.',
    icon: '⚡',
    level: 'advanced',
    lessons: [
      {
        id: 'secrets',
        title: 'Secrets in GitOps',
        summary:
          'You cannot commit raw secrets to Git. Use Sealed Secrets, External Secrets, or SOPS to keep Git as the source of truth safely.',
        content: [
          'The central tension: GitOps wants *everything* in Git, but Kubernetes Secrets are only base64-*encoded* (trivially reversible), so committing them is the same as leaking them. Three standard solutions resolve this.',
          '**Sealed Secrets (Bitnami).** A controller in the cluster holds a private key; you encrypt a Secret into a `SealedSecret` with the public key and commit *that*. Only the in-cluster controller can decrypt it into a real Secret. The encrypted blob in Git is safe to be public.',
          '```yaml\nkind: SealedSecret      # safe to commit — encrypted\nspec:\n  encryptedData:\n    DB_PASSWORD: AgBy3i4OJSWK... # ciphertext, decryptable only in-cluster\n```',
          '**External Secrets Operator (ESO).** Do not put the secret in Git at all. Commit a reference (`ExternalSecret`) that says "fetch DB_PASSWORD from AWS Secrets Manager / Vault / GCP". The operator pulls the value at runtime and creates the K8s Secret. Git holds only the pointer.',
          '**SOPS (often with age/KMS).** Encrypt secret *values* inside otherwise-readable YAML files; a controller or the renderer decrypts at apply time. Nice because the file structure stays diffable while values are encrypted.',
          'Pick based on environment: SealedSecrets is simplest to self-host; External Secrets is ideal when you already have a cloud secret store; SOPS is popular with Flux. The rule never changes: *plaintext secrets never enter Git.*',
        ],
        keyTakeaways: [
          'K8s Secrets are base64 (encoded), not encrypted — never commit raw.',
          'Sealed Secrets: commit an encrypted blob only the cluster can decrypt.',
          'External Secrets: commit a reference; operator fetches from Vault/cloud.',
          'SOPS: encrypt values inside YAML; decrypt at apply time.',
        ],
      },
      {
        id: 'progressive-delivery',
        title: 'Progressive Delivery',
        summary:
          'Roll out new versions gradually (canary, blue-green) with automated metric checks and instant rollback — via Argo Rollouts.',
        content: [
          'A plain Deployment does a rolling update: replace old pods with new ones, all-or-nothing-ish. Progressive delivery makes the rollout *gradual and verified*, shifting a slice of traffic and checking metrics before continuing. Argo Rollouts is the Argo-family tool for this; it replaces `Deployment` with a `Rollout` object.',
          '**Canary.** Send a small % of traffic to the new version, watch error rate/latency, and increase in steps. If a metric check (an AnalysisRun querying Prometheus) fails, it auto-aborts and rolls back. Example strategy:',
          '```yaml\nkind: Rollout\nspec:\n  strategy:\n    canary:\n      steps:\n        - setWeight: 10      # 10% to new version\n        - pause: { duration: 5m }\n        - setWeight: 50\n        - pause: {}          # wait for human/metric gate\n```',
          '**Blue-Green.** Run the new version (green) fully alongside the old (blue), test it on a preview URL, then flip 100% of traffic at once. Instant rollback = flip back to blue.',
          'This stays GitOps-native: the `Rollout` and its `AnalysisTemplate` live in Git, Argo CD syncs them, and Argo Rollouts executes the gradual shift. The strategy is declared, not scripted.',
          'For an SDE, the payoff is safety: a regression hits 10% of users for a few minutes and auto-reverts, instead of a full-blast outage. You will often just set the canary steps and the metric thresholds.',
        ],
        keyTakeaways: [
          'Progressive delivery = gradual, metric-verified rollouts.',
          'Canary: shift traffic in steps; auto-rollback on bad metrics.',
          'Blue-Green: full parallel version, then instant traffic flip.',
          'Argo Rollouts replaces Deployment and stays fully declarative in Git.',
        ],
      },
      {
        id: 'multi-cluster',
        title: 'Multi-Cluster & Multi-Tenancy',
        summary:
          'Manage many clusters from one control plane, and isolate teams with Projects, RBAC, and ApplicationSets.',
        content: [
          'At scale you run many clusters (per region, per environment, per customer). A single Argo CD can register and deploy to multiple clusters: each is a `destination.server` your Applications target. The control plane is one place; the fleet is many.',
          'ApplicationSets shine here: a **cluster generator** templates the same app across every registered cluster automatically. Add a cluster → it gets the standard apps without anyone writing new YAML.',
          '```yaml\nkind: ApplicationSet\nspec:\n  generators:\n    - clusters: {}        # one Application per registered cluster\n  template:\n    spec:\n      destination:\n        server: "{{server}}"   # filled per cluster\n```',
          '**Multi-tenancy** isolates teams sharing one Argo CD. The `AppProject` is the boundary: it restricts which repos a team may deploy from, which clusters/namespaces they may deploy to, and which resource kinds are allowed. Combined with SSO + RBAC, team A cannot touch team B’s apps.',
          'Guardrails matter more than features here: AppProjects + RBAC + a policy engine (next lesson) are what keep a shared platform safe as the number of teams and clusters grows.',
        ],
        keyTakeaways: [
          'One Argo CD can deploy to many clusters via destination targeting.',
          'ApplicationSet cluster generator fans an app out to every cluster.',
          'AppProject is the multi-tenancy boundary (allowed repos/dests/kinds).',
          'SSO + RBAC + AppProjects isolate teams on a shared control plane.',
        ],
      },
      {
        id: 'drift-rollback-dr',
        title: 'Drift, Rollback & Disaster Recovery',
        summary:
          'Why GitOps makes recovery boring: revert a commit, or re-point a fresh cluster at the repo and let it rebuild itself.',
        content: [
          'GitOps turns scary operations into ordinary Git operations. **Rollback** = `git revert` the bad commit (or set `targetRevision` back to a known-good tag) and let reconciliation apply the previous state. The rollback is itself a reviewed, audited commit — no mystery hotfixes.',
          '**Drift** is continuously detected by the reconciliation loop. With selfHeal it auto-corrects; without it, you get an OutOfSync alert to investigate. Either way you always know when reality diverged from Git — something the old push model could not guarantee.',
          '**Disaster recovery** is the killer feature. If a cluster is destroyed, you provision a new empty one, install Argo CD, point it at the same config repo, and it *rebuilds every app to the exact desired state*. Your repo is a complete, versioned blueprint of the platform. (Stateful data still needs backups — Git restores config, not your database.)',
          'A few caveats to respect: Git restores declarative *config*, not data in volumes/databases (back those up separately). And not everything belongs in the reconciled set — pin `targetRevision` for prod so a stray merge cannot auto-deploy, and use a policy engine to block dangerous manifests.',
          'The mental upgrade: treat the cluster as cattle and the Git repo as the herd’s blueprint. Lose a cluster? Recreate it from the blueprint. This is why teams sleep better on GitOps.',
        ],
        commands: [
          {
            command: 'argocd app rollback <name> <revision>',
            description: 'Roll an app back to a previously synced revision.',
            example: 'argocd app rollback web-prod 42',
            gitEquivalent: 'git revert / checkout an old commit — for the live app.',
            whenToUse: 'Emergency: get prod back to the last good state fast.',
          },
        ],
        keyTakeaways: [
          'Rollback = revert a commit or re-pin targetRevision; fully audited.',
          'Drift is always detected; selfHeal can auto-correct it.',
          'DR: point a fresh cluster at the repo and it rebuilds itself.',
          'Git restores config, not data — back up databases separately.',
        ],
      },
      {
        id: 'security-policy',
        title: 'Security & Policy',
        summary:
          'Sign commits/images, enforce reviews on the config repo, and use a policy engine (OPA/Kyverno) to block bad manifests before they deploy.',
        content: [
          'In GitOps, *the Git repo is your production control plane*, so repo security IS production security. Lock it down like prod: required PR reviews, branch protection on main, CODEOWNERS for sensitive paths, and signed commits so you can trust who authored a change.',
          'Extend trust to artifacts: sign your container images (e.g. Sigstore/cosign) and have an admission policy verify signatures, so only images your CI built can run. This closes the gap between "Git is trusted" and "the image referenced by Git is trusted".',
          '**Policy as code** validates manifests automatically. A policy engine — **OPA/Gatekeeper** or **Kyverno** — runs as an admission controller and rejects resources that violate rules: "no `latest` tags", "must set resource limits", "no privileged containers", "images only from our registry".',
          '```yaml\n# Kyverno: forbid the mutable :latest tag\nkind: ClusterPolicy\nspec:\n  rules:\n    - name: disallow-latest-tag\n      validate:\n        message: "Using :latest is not allowed"\n        pattern:\n          spec:\n            containers:\n              - image: "!*:latest"\n```',
          'Layer the defenses: PR review catches human mistakes, the policy engine catches anything review missed, RBAC/AppProjects limit blast radius, and signed commits + images establish provenance. Together they let a fast GitOps flow stay safe.',
          'As an SDE you mostly *experience* these as guardrails — your PR fails a policy check, or you must add resource limits before merge. Knowing why makes you fix it in seconds instead of fighting it.',
        ],
        keyTakeaways: [
          'The config repo is the prod control plane — secure it like prod.',
          'Require reviews, branch protection, CODEOWNERS, signed commits.',
          'Sign images and verify signatures at admission (cosign/Sigstore).',
          'OPA/Gatekeeper or Kyverno block non-compliant manifests automatically.',
        ],
      },
      {
        id: 'ci-cd-separation',
        title: 'CI/CD Separation, Done Right',
        summary:
          'CI builds + tests + writes an image tag to the config repo. CD is the cluster pulling from the config repo. Keep them decoupled.',
        content: [
          'Tie it all together. The cleanest production setup draws a hard line between CI and CD, connected only through Git — never a direct pipeline-to-cluster call.',
          '**CI (in the app repo):** on merge to main, run tests, build the container image, push it to a registry with an immutable tag (a commit SHA or semver — never `latest`). CI’s *last* step is to make a small commit to the config repo bumping that image tag in the target overlay.',
          '```yaml\n# CI’s commit to the config repo (the handoff)\nimages:\n  - name: ghcr.io/acme/web\n    newTag: sha-9f2c1a4   # immutable, traceable to a commit\n```',
          '**CD (in the cluster):** Argo CD sees the new commit in the config repo and reconciles — pulling the new image and rolling pods. No CI credentials ever touch the cluster; the only thing crossing the boundary is a Git commit.',
          'This decoupling is why GitOps scales: CI systems can be swapped, prod credentials never leak into pipelines, and "what is deployed" is always answerable by reading one commit in the config repo. Promotion across environments is just another small commit (change the tag in the next overlay).',
          'Your end-to-end story as an SDE: write code → open PR in app repo → merge → CI builds `web:sha-…` and commits the tag to config repo (often auto-PR’d) → reviewer approves the promotion → Argo CD syncs → canary rollout with metric checks → Synced + Healthy. Every arrow is a reviewable, revertible Git event.',
        ],
        keyTakeaways: [
          'CI: test, build, push immutable image, commit the tag to config repo.',
          'CD: in-cluster agent reconciles from the config repo — no cluster creds in CI.',
          'The only link between CI and CD is a Git commit (the image tag).',
          'Use immutable tags (SHA/semver), never :latest, for traceability.',
        ],
      },
    ],
  },
]

// ── helpers (mirrors docker-learn API) ───────────────────────────────────────

export function getLesson(moduleId: string, lessonId: string) {
  const module = modules.find((m) => m.id === moduleId)
  if (!module) return null
  const lesson = module.lessons.find((l) => l.id === lessonId)
  if (!lesson) return null
  return { module, lesson }
}

export function getAllLessons(): { module: Module; lesson: Lesson }[] {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ module, lesson }))
  )
}
