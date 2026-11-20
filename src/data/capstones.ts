import type { CapstoneProject } from './types'

export const capstones: CapstoneProject[] = [
  {
    id: 'capstone-1-docker-mern',
    number: 1,
    title: 'Containerized MERN Application',
    description:
      'Transform a raw local 3-tier MERN stack (React, Express, MongoDB) into a hardened, optimized, multi-container production setup using Docker and Docker Compose.',
    difficulty: 'beginner',
    estimatedHours: 6,
    prerequisites: ['phase0', 'phase1', 'phase2'],
    objectives: [
      'Write multi-stage Dockerfiles with unprivileged non-root users and minimal base images',
      'Containerize the Vite/React client with an NGINX production web server',
      'Containerize the Express/TypeScript API with proper build steps and production dependencies',
      'Wire multi-container networking, persistent volumes, and health checks with Docker Compose',
      'Implement development vs production Compose overrides and verify image sizes and security with Trivy',
    ],
    repositoryStructure: `mern-containerized/
├── .dockerignore
├── docker-compose.yml
├── docker-compose.override.yml       # Local development hot-reload
├── docker-compose.prod.yml           # Production configuration
├── client/
│   ├── Dockerfile                   # Multi-stage: node build -> nginx:alpine
│   ├── nginx.conf                   # SPA fallback + reverse proxy
│   ├── package.json
│   └── src/
├── server/
│   ├── Dockerfile                   # Multi-stage: build TS -> slim runtime
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   └── health.ts                # /health endpoint for Docker HEALTHCHECK
└── mongo/
    └── init-scripts/                # Seed database initialization
        └── 01-init.js`,
    milestones: [
      {
        title: 'Milestone 1: Backend Dockerfile & Security Hardening',
        description: 'Construct a 2-stage Dockerfile for the Express/Node.js backend, dropping root privileges.',
        tasks: [
          'Create multi-stage Dockerfile with node:20-alpine as build stage',
          'Compile TypeScript to dist/ and prune devDependencies',
          'Use node:20-alpine runtime stage, create unprivileged user `appuser:appgroup`',
          'Configure HEALTHCHECK instruction curling http://localhost:5000/health',
          'Verify image size < 150MB and scan with `trivy image server:latest`',
        ],
        verification: 'docker build -t mern-server:test ./server && docker run --rm -p 5000:5000 mern-server:test curl -f http://localhost:5000/health',
      },
      {
        title: 'Milestone 2: Frontend Multi-Stage Dockerfile with NGINX',
        description: 'Build the React application and serve static assets through a tuned NGINX alpine container.',
        tasks: [
          'Build client assets via `npm run build` using node:20-alpine',
          'Copy static build output to nginx:1.25-alpine html root',
          'Configure custom nginx.conf with SPA routing fallback (`try_files $uri /index.html`)',
          'Include proxy pass header rules for `/api` requests to the backend service',
          'Implement gzip compression and security headers in NGINX',
        ],
        verification: 'docker build -t mern-client:test ./client && docker run --rm -p 8080:80 mern-client:test',
      },
      {
        title: 'Milestone 3: Docker Compose Multi-Service Architecture',
        description: 'Coordinate client, server, and MongoDB with isolated networks and persistent volumes.',
        tasks: [
          'Define `backend-network` and `frontend-network` to isolate database traffic',
          'Attach MongoDB only to `backend-network`; mount `mongo-data` named volume to `/data/db`',
          'Configure `depends_on` with `condition: service_healthy` for reliable startup ordering',
          'Pass database credentials securely via `.env` file rather than hardcoded compose strings',
          'Verify end-to-end data persistence across `docker compose down` and `docker compose up`',
        ],
        verification: 'docker compose -f docker-compose.yml up -d && docker compose ps && curl -f http://localhost:3000',
      },
    ],
    acceptanceCriteria: [
      'Express backend image size is under 150MB and executes under unprivileged UID 10001 (appuser).',
      'React frontend is served by NGINX alpine with SPA client-side routing fallback and API reverse proxy.',
      'MongoDB database data persists reliably across container restarts using a Docker named volume.',
      'Backend and database communicate over an isolated bridge network inaccessible to public external traffic.',
      'Trivy container vulnerability scan returns 0 CRITICAL and 0 HIGH CVEs.',
    ],
    executionGuide: [
      {
        step: '1. Create .dockerignore files',
        command: 'echo "node_modules\n.git\ndist\n.env" > .dockerignore',
        explanation: 'Prevent bloated context transfers and prevent committing local node_modules and secrets into Docker build images.',
      },
      {
        step: '2. Build and verify the Express backend container',
        command: 'docker build -t mern-server:1.0 ./server',
        explanation: 'Runs TypeScript compilation in stage 1, copies artifacts to stage 2, and sets up unprivileged user.',
      },
      {
        step: '3. Build and test the React NGINX container',
        command: 'docker build -t mern-client:1.0 ./client',
        explanation: 'Compiles the Vite bundle and transfers dist/ into an alpine NGINX container with custom reverse proxy rules.',
      },
      {
        step: '4. Launch the entire multi-tier stack',
        command: 'docker compose -f docker-compose.yml up -d',
        explanation: 'Starts MongoDB, runs healthchecks, boots backend, and exposes frontend on port 3000.',
      },
      {
        step: '5. Verify end-to-end persistence and health',
        command: 'curl http://localhost:3000/api/health',
        explanation: 'Tests whether client reverse proxy, Express backend, and MongoDB connection loop are all functioning.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Host port conflict (e.g. port 3000 or 5000 already in use)',
        resolution: 'Identify the occupying process using `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (macOS/Linux) and terminate it, or change the host port mapping in docker-compose.yml.',
      },
      {
        issue: 'MongooseServerSelectionError: connect ECONNREFUSED',
        resolution: 'Ensure Express connects using the Docker DNS service name `mongodb://mongo:27017/app`, NOT `localhost:27017`. Ensure both containers share `backend-network`.',
      },
      {
        issue: 'React SPA routes return 404 Not Found on browser refresh',
        resolution: 'Add `try_files $uri $uri/ /index.html;` inside the client `nginx.conf` location block to enable client-side routing.',
      },
    ],
    cleanupInstructions: [
      'docker compose down -v --rmi local',
      'docker system prune -f (to clear unused build cache)',
    ],
    portfolioDeliverables: [
      'Hardened multi-stage Dockerfiles for Node.js/TypeScript backend and Vite/React frontend',
      'Production-ready docker-compose.yml and docker-compose.override.yml',
      'README.md containing container architecture diagram and Trivy scan verification badge',
    ],
    resources: [
      {
        title: 'Docker Multi-stage Builds Documentation',
        url: 'https://docs.docker.com/build/building/multi-stage/',
        type: 'documentation',
        description: 'Official Docker guide for creating lean, secure multi-stage images.',
        difficulty: 'beginner',
        priority: 'required',
      },
      {
        title: 'OWASP Docker Security Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html',
        type: 'specification',
        description: 'Industry-standard guidelines for unprivileged users, drop capabilities, and filesystem lockdown.',
        difficulty: 'intermediate',
        priority: 'recommended',
      },
    ],
  },
  {
    id: 'capstone-2-kubernetes-deployment',
    number: 2,
    title: 'Production Kubernetes Cluster Deployment',
    description:
      'Deploy the multi-tier MERN application to a local Kubernetes cluster (kind/minikube) with zero-downtime rolling updates, persistent state, health probes, ingress routing, and resource quotas.',
    difficulty: 'intermediate',
    estimatedHours: 8,
    prerequisites: ['phase2', 'phase3', 'phase4'],
    objectives: [
      'Provision a local multi-node Kubernetes cluster using kind with ingress port mappings',
      'Create declarative manifests for client Deployment, server Deployment, and MongoDB StatefulSet',
      'Expose services via ClusterIP and route external traffic with NGINX Ingress Controller',
      'Configure PersistentVolumeClaims and StorageClasses for database resilience',
      'Implement startup, liveness, and readiness probes to ensure zero dropped requests during rollouts',
      'Enforce ResourceQuotas and LimitRanges to guard against noisy neighbor starvation',
    ],
    repositoryStructure: `k8s-manifests/
├── cluster/
│   └── kind-config.yaml              # Multi-node cluster with port mappings
├── base/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── resource-quota.yaml
│   ├── client-deployment.yaml
│   ├── client-service.yaml
│   ├── server-deployment.yaml
│   ├── server-service.yaml
│   ├── server-configmap.yaml
│   ├── mongo-statefulset.yaml
│   ├── mongo-headless-service.yaml
│   └── ingress.yaml
└── overlays/
    └── local/
        ├── kustomization.yaml
        └── patches/`,
    milestones: [
      {
        title: 'Milestone 1: Cluster Provisioning & Network Bootstrap',
        description: 'Create a 3-node kind cluster and install the NGINX Ingress Controller.',
        tasks: [
          'Create `kind-config.yaml` with 1 control-plane and 2 worker nodes',
          'Map host ports 80 and 443 into the cluster with `extraPortMappings`',
          'Install NGINX Ingress Controller for kind using official provider manifests',
          'Verify Ingress controller reaches `Running` status with ready endpoints',
        ],
        verification: 'kind get clusters && kubectl get pods -n ingress-nginx',
      },
      {
        title: 'Milestone 2: Stateful Workload & Database Persistence',
        description: 'Deploy MongoDB as a StatefulSet with persistent storage and headless service.',
        tasks: [
          'Define `mongo-statefulset.yaml` with `volumeClaimTemplates` requesting 1Gi storage',
          'Configure a headless Service (`clusterIP: None`) for stable network identity',
          'Write data to MongoDB, delete the pod with `kubectl delete pod mongo-0`, and verify data remains intact',
        ],
        verification: 'kubectl get statefulset mongo && kubectl get pvc',
      },
      {
        title: 'Milestone 3: Application Workloads, Ingress & Rollout Resilience',
        description: 'Deploy MERN client and server with health probes and zero-downtime rolling updates.',
        tasks: [
          'Configure liveness, readiness, and startup probes for Express and React pods',
          'Define CPU and memory requests and limits for all containers',
          'Apply `ingress.yaml` routing `/api` to server-service and `/` to client-service',
          'Execute a rolling update `kubectl set image deployment/server server=...:1.4.1` while streaming HTTP requests',
          'Confirm zero HTTP 5xx errors during the rollout',
        ],
        verification: 'kubectl apply -f base/ && kubectl rollout status deployment/server -n web && curl -f http://app.local/health',
      },
    ],
    acceptanceCriteria: [
      'Multi-node kind cluster operational with 1 control plane and 2 worker nodes.',
      'MongoDB running as StatefulSet with dynamic PVC bound and persistent data verified across pod terminations.',
      'Express backend deployed with 3 replicas, resource requests/limits, and calibrated liveness/readiness probes.',
      'NGINX Ingress terminates routing: `/` routes to React frontend and `/api` routes to Express backend.',
      'Zero-downtime rolling deployment verified under synthetic HTTP load with 0 dropped packets.',
    ],
    executionGuide: [
      {
        step: '1. Create local kind multi-node cluster',
        command: 'kind create cluster --config cluster/kind-config.yaml --name mern-k8s',
        explanation: 'Provisions 1 control-plane and 2 worker nodes with host port 80/443 mappings for Ingress.',
      },
      {
        step: '2. Install NGINX Ingress Controller',
        command: 'kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml',
        explanation: 'Deploys ingress controller with node-selector patches for kind host port binding.',
      },
      {
        step: '3. Deploy all Kubernetes manifests',
        command: 'kubectl apply -k base/',
        explanation: 'Applies Namespace, ConfigMaps, Secrets, StatefulSet, Deployments, Services, and Ingress via Kustomize.',
      },
      {
        step: '4. Verify Pod status and probe health',
        command: 'kubectl get pods -n web -o wide',
        explanation: 'Checks that all replicas reach 1/1 Running state across worker nodes.',
      },
      {
        step: '5. Test rolling update resilience',
        command: 'kubectl rollout restart deployment/server -n web && kubectl rollout status deployment/server -n web',
        explanation: 'Validates that new pods achieve readiness before old pods receive SIGTERM termination.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Pod stuck in CrashLoopBackOff on startup',
        resolution: 'Inspect container crash logs with `kubectl logs <pod-name> -n web --previous`. Check for missing ConfigMap or Secret keys in `envFrom`.',
      },
      {
        issue: 'Ingress returns HTTP 503 Service Unavailable',
        resolution: 'Check endpoint health with `kubectl get endpointslices -n web`. Verify that the Service `selector` labels match the Pod `spec.template.metadata.labels` exactly.',
      },
      {
        issue: 'PVC remains in Pending state indefinitely',
        resolution: 'Inspect storage provisioner with `kubectl describe pvc <pvc-name> -n web`. Ensure `standard` StorageClass is set as default in kind.',
      },
    ],
    cleanupInstructions: [
      'kind delete cluster --name mern-k8s',
      'Clean any temporary test host mappings in your local hosts file',
    ],
    portfolioDeliverables: [
      'Complete declarative Kubernetes repository with Kustomize base and overlays',
      'Documented kind cluster configuration and Ingress routing rules',
      'Recorded terminal demo showing successful zero-downtime rollout under HTTP load',
    ],
    resources: [
      {
        title: 'Kubernetes Official StatefulSet Tutorial',
        url: 'https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/',
        type: 'documentation',
        description: 'Comprehensive guide on persistent storage and headless services for stateful databases.',
        difficulty: 'intermediate',
        priority: 'required',
      },
      {
        title: 'Configure Liveness, Readiness and Startup Probes',
        url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/',
        type: 'documentation',
        description: 'Official Kubernetes probe reference to eliminate downtime during container startup.',
        difficulty: 'beginner',
        priority: 'required',
      },
    ],
  },
  {
    id: 'capstone-3-ci-pipeline',
    number: 3,
    title: 'Automated CI Pipeline & GitOps Handoff',
    description:
      'Construct a complete GitHub Actions CI/CD automation pipeline that executes tests, builds and tags multi-arch container images, performs Trivy vulnerability scans, signs artifacts with Cosign, and commits updated tags to a separate deployment config repository.',
    difficulty: 'intermediate',
    estimatedHours: 6,
    prerequisites: ['phase1', 'phase2', 'phase5'],
    objectives: [
      'Write GitHub Actions workflows triggered on pull requests and commits to main',
      'Implement parallel automated testing, linting, and build validation jobs',
      'Build container images with Docker Buildx and GitHub Actions cache backend',
      'Scan images for CVEs using Trivy and break the build on CRITICAL severity',
      'Generate immutable semantic tags using the Git commit SHA',
      'Implement the automated GitOps handoff: auto-commit new image tag to the deployment config repository',
    ],
    repositoryStructure: `mern-app-source/
├── .github/
│   └── workflows/
│       ├── ci.yaml                   # PR validation: lint, test, build-test
│       └── release.yaml              # Main branch: build, scan, push, gitops-handoff
├── client/
│   └── ...
├── server/
│   └── ...
└── config-repo/                      # Separate deployment repository
    └── apps/
        └── mern/
            └── overlays/
                └── staging/
                    └── kustomization.yaml # Automatically patched with new sha`,
    milestones: [
      {
        title: 'Milestone 1: Automated Test Matrix & Lint Pipeline',
        description: 'Build a fast PR validation workflow running unit tests across Node.js versions.',
        tasks: [
          'Configure GitHub Actions matrix for Node.js 18.x and 20.x',
          'Execute TypeScript compiler check (`tsc --noEmit`) and ESLint',
          'Run Vitest / Jest unit test suites with code coverage reporting',
          'Enforce branch protection requiring CI status checks to pass before merging PRs',
        ],
        verification: 'gh workflow run ci.yaml && gh run list --workflow=ci.yaml',
      },
      {
        title: 'Milestone 2: Container Image Build, Cache & Vulnerability Scan',
        description: 'Implement high-performance multi-arch container image building and security scanning.',
        tasks: [
          'Set up Docker Buildx with GitHub Actions cache (`type=gha`)',
          'Build and push image tagged with Git SHA (`ghcr.io/org/mern-server:${{ github.sha }}`)',
          'Integrate Trivy container vulnerability scanner with `--exit-code 1 --severity CRITICAL`',
          'Verify pipeline terminates and alerts when an image contains unpatched critical vulnerabilities',
        ],
        verification: 'trivy image --exit-code 1 ghcr.io/org/mern-server:test',
      },
      {
        title: 'Milestone 3: The GitOps Handoff Automation',
        description: 'Bridge application CI to deployment GitOps without giving CI direct cluster access.',
        tasks: [
          'Generate a GitHub machine user or fine-grained Personal Access Token (PAT)',
          'Write a workflow step that clones the `config-repo` deployment repository',
          'Use `kustomize edit set image` to update the image tag to the new Git SHA',
          'Commit and push the update to `main` with commit message: `chore(release): bump mern-server to ${{ github.sha }}`',
        ],
        verification: 'git -C config-repo log -1 --oneline # verifies automated commit exists',
      },
    ],
    acceptanceCriteria: [
      'GitHub Actions pipeline triggers automatically on PRs and commits to main.',
      'Parallel jobs execute linting and tests across Node.js versions with fast caching.',
      'Container images are built with Docker Buildx and tagged with the immutable Git commit SHA.',
      'Trivy scanner halts the pipeline if CRITICAL security vulnerabilities are found.',
      'Automated GitOps handoff successfully updates `kustomization.yaml` in the configuration repo without CI having direct cluster credentials.',
    ],
    executionGuide: [
      {
        step: '1. Create PR validation workflow (.github/workflows/ci.yaml)',
        command: 'cat << "EOF" > .github/workflows/ci.yaml ...',
        explanation: 'Runs linting and test suites on pull requests with caching.',
      },
      {
        step: '2. Create Release and Handoff workflow (.github/workflows/release.yaml)',
        command: 'cat << "EOF" > .github/workflows/release.yaml ...',
        explanation: 'Triggers on merge to main: builds image, scans with Trivy, pushes to registry, and commits to config repo.',
      },
      {
        step: '3. Configure GitHub Secrets',
        command: 'gh secret set GITOPS_DEPLOY_KEY --body "$SSH_PRIVATE_KEY"',
        explanation: 'Grants the release workflow authenticated permission to push to the external config-repo.',
      },
      {
        step: '4. Trigger pipeline by opening and merging a PR',
        command: 'git checkout -b feature/health-check && git commit -am "feat: add detailed db health" && git push && gh pr create',
        explanation: 'Observes automated CI run, verifies PR checks, and merges to watch the GitOps handoff execute.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Docker build cache miss on every run',
        resolution: 'Verify `cache-from: type=gha` and `cache-to: type=gha,mode=max` are included in `docker/build-push-action`.',
      },
      {
        issue: 'GitOps handoff fails with "remote: Permission to config-repo denied"',
        resolution: 'Ensure the GitHub Token or deploy key has `contents: write` permission on the target deployment repository.',
      },
      {
        issue: 'Trivy fails on accepted legacy OS vulnerabilities',
        resolution: 'Add a `.trivyignore` file documenting approved CVE exceptions or pass `--ignore-unfixed` to only fail on actionable vulnerabilities with existing patches.',
      },
    ],
    cleanupInstructions: [
      'Revoke test GitHub Personal Access Tokens and clean up test container tags from the container registry.',
    ],
    portfolioDeliverables: [
      'Production `.github/workflows/ci.yaml` and `.github/workflows/release.yaml` files',
      'Demonstrated GitOps separation: source code repo separate from declarative config repo',
      'Working automated handoff commit history demonstrating continuous delivery',
    ],
    resources: [
      {
        title: 'Building and Testing Node.js with GitHub Actions',
        url: 'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs',
        type: 'documentation',
        description: 'Official GitHub Actions reference for Node.js pipelines.',
        difficulty: 'beginner',
        priority: 'required',
      },
      {
        title: 'Trivy Container Vulnerability Scanner Documentation',
        url: 'https://aquasecurity.github.io/trivy/',
        type: 'documentation',
        description: 'Comprehensive vulnerability and misconfiguration scanner for container images.',
        difficulty: 'intermediate',
        priority: 'recommended',
      },
    ],
  },
  {
    id: 'capstone-4-gitops-argocd',
    number: 4,
    title: 'Complete GitOps Deployment with Argo CD',
    description:
      'Deploy and operate the entire MERN platform declaratively using Argo CD. Implement automated drift correction, self-healing, sync waves, database migration hooks, and progressive promotion between staging and production environments.',
    difficulty: 'intermediate',
    estimatedHours: 8,
    prerequisites: ['phase4', 'phase5', 'phase6'],
    objectives: [
      'Install Argo CD in a dedicated namespace and configure CLI & UI access',
      'Model staging and production environments using Kustomize overlays in Git',
      'Create Argo CD Application manifests with automated prune and self-heal policies',
      'Orchestrate zero-downtime database migrations using Argo CD PreSync hooks and sync waves',
      'Simulate manual cluster drift (e.g. `kubectl scale`) and observe Argo CD automatic reconciliation',
      'Promote releases safely across staging and production using Git pull requests',
    ],
    repositoryStructure: `config-repo/
├── bootstrap/
│   ├── root-app.yaml                 # App-of-Apps root Application
│   └── argocd-project.yaml           # AppProject boundary
├── apps/
│   └── mern/
│       ├── base/
│       │   ├── client-deployment.yaml
│       │   ├── server-deployment.yaml
│       │   ├── mongo-statefulset.yaml
│       │   ├── db-migration-job.yaml # PreSync hook
│       │   └── kustomization.yaml
│       └── overlays/
│           ├── staging/
│           │   ├── kustomization.yaml
│           │   └── patches/
│           └── prod/
│               ├── kustomization.yaml
│               └── patches/
└── argo-apps/
    ├── mern-staging.yaml             # Application for Staging
    └── mern-prod.yaml                # Application for Production (manual sync gate)`,
    milestones: [
      {
        title: 'Milestone 1: Argo CD Cluster Installation & CLI Setup',
        description: 'Deploy the Argo CD control plane into Kubernetes and authenticate.',
        tasks: [
          'Create `argocd` namespace and apply official installation manifests',
          'Retrieve initial admin password securely from `argocd-initial-admin-secret`',
          'Port-forward or configure ingress to access the Argo CD Web UI at `https://localhost:8080`',
          'Log in via the `argocd` CLI and verify cluster connection with `argocd cluster list`',
        ],
        verification: 'argocd version && argocd app list',
      },
      {
        title: 'Milestone 2: App of Apps Pattern & Multi-Environment Setup',
        description: 'Deploy staging and prod environments managed entirely through Git.',
        tasks: [
          'Declare `mern-staging` Application pointing to `apps/mern/overlays/staging` with auto-sync',
          'Declare `mern-prod` Application pointing to `apps/mern/overlays/prod` with manual sync or auto-sync with prune',
          'Create `root-app.yaml` that watches the `argo-apps/` directory (App of Apps pattern)',
          'Apply the root application and observe Argo CD auto-discover child applications',
        ],
        verification: 'argocd app get mern-staging && argocd app get mern-prod',
      },
      {
        title: 'Milestone 3: Sync Waves, DB Migration Hooks & Drift Self-Healing',
        description: 'Implement ordered deployment with PreSync migration hooks and test self-healing.',
        tasks: [
          'Annotate MongoDB StatefulSet with `argocd.argoproj.io/sync-wave: "1"`',
          'Annotate DB migration Job with `argocd.argoproj.io/hook: PreSync` and sync-wave "2"',
          'Annotate server and client Deployments with sync-wave "3"',
          'Break cluster state manually via `kubectl scale deployment server --replicas=0 -n web-staging`',
          'Watch Argo CD detect drift and auto-heal the replica count back to Git desired state in seconds',
        ],
        verification: 'kubectl get jobs -n web-staging && argocd app diff mern-staging',
      },
    ],
    acceptanceCriteria: [
      'Argo CD is deployed in Kubernetes with healthy controllers and authenticated CLI access.',
      'App-of-Apps root Application successfully bootstraps both Staging and Production environments.',
      'Sync waves enforce strict startup order: MongoDB (Wave 1) -> DB Migration Job (Wave 2) -> Web Apps (Wave 3).',
      'Database migration Job runs as an Argo CD PreSync hook and cleans up on completion.',
      'Automated self-healing detects manual cluster mutations (`kubectl delete pod` or `kubectl scale`) and restores Git desired state within 60 seconds.',
    ],
    executionGuide: [
      {
        step: '1. Install Argo CD control plane',
        command: 'kubectl create namespace argocd && kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml',
        explanation: 'Deploys argocd-server, repo-server, application-controller, and redis cache.',
      },
      {
        step: '2. Log into Argo CD CLI',
        command: 'argocd login localhost:8080 --username admin --password $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d) --insecure',
        explanation: 'Authenticates CLI against the port-forwarded API server.',
      },
      {
        step: '3. Bootstrap the GitOps App-of-Apps root application',
        command: 'kubectl apply -f bootstrap/root-app.yaml',
        explanation: 'Points Argo CD to the argo-apps/ directory, which recursively discovers and deploys all environments.',
      },
      {
        step: '4. Test manual drift and observe self-healing',
        command: 'kubectl scale deployment server --replicas=0 -n web-staging && sleep 10 && kubectl get deployment server -n web-staging',
        explanation: 'Verifies that Argo CD immediately identifies OutOfSync drift and restores 3 replicas automatically.',
      },
      {
        step: '5. Promote a release to Production via Git',
        command: 'git checkout -b promote-1.4.2 && kustomize edit set image ghcr.io/org/mern-server:1.4.2 && git commit -am "chore(prod): promote 1.4.2" && git push',
        explanation: 'Opens a pull request to promote the release; once merged, Argo CD deploys to production.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Argo CD application stuck in "ComparisonError"',
        resolution: 'Run `kustomize build apps/mern/overlays/staging` locally to identify broken YAML indentation or missing patch references.',
      },
      {
        issue: 'PreSync migration job fails and blocks sync',
        resolution: 'Inspect migration job logs with `kubectl logs job/db-migration -n web-staging`. Fix the migration script in Git and sync again with `argocd app sync mern-staging`.',
      },
      {
        issue: 'App-of-Apps child applications not appearing in UI',
        resolution: 'Ensure child application manifests in `argo-apps/` specify the correct `spec.project` (e.g. `default`) and target cluster `https://kubernetes.default.svc`.',
      },
    ],
    cleanupInstructions: [
      'argocd app delete root-app --cascade',
      'kubectl delete ns web-staging web-prod argocd',
    ],
    portfolioDeliverables: [
      'Complete GitOps configuration repository (`config-repo`) on GitHub with Kustomize overlays',
      'Declarative App-of-Apps bootstrap manifests and PreSync database migration hooks',
      'Recorded terminal and UI demonstration of automated drift detection and self-healing',
    ],
    resources: [
      {
        title: 'Argo CD Official Architectural Overview',
        url: 'https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/',
        type: 'documentation',
        description: 'Deep dive into repo-server, application-controller, and API server internals.',
        difficulty: 'intermediate',
        priority: 'required',
      },
      {
        title: 'Argo CD Sync Waves and Hooks Guide',
        url: 'https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/',
        type: 'documentation',
        description: 'Comprehensive documentation on ordering resource creation and migration jobs.',
        difficulty: 'intermediate',
        priority: 'required',
      },
    ],
  },
  {
    id: 'capstone-5-production-platform',
    number: 5,
    title: 'Enterprise Cloud-Native Platform Engineering',
    description:
      'The ultimate synthesis capstone: Build a production-grade, enterprise-ready Kubernetes GitOps platform incorporating Terraform infrastructure provisioning, Argo CD ApplicationSets, Sealed Secrets, Prometheus & Grafana observability, Kyverno admission security policies, and Argo Rollouts canary progressive delivery.',
    difficulty: 'advanced',
    estimatedHours: 14,
    prerequisites: ['phase0', 'phase1', 'phase2', 'phase3', 'phase4', 'phase5', 'phase6', 'phase7', 'phase8'],
    objectives: [
      'Provision Kubernetes infrastructure and cloud dependencies using Terraform / OpenTofu',
      'Manage multi-tenant fleets declaratively with Argo CD ApplicationSets',
      'Implement zero-trust secrets management with Bitnami Sealed Secrets or External Secrets Operator',
      'Enforce admission security policies using Kyverno (disallow :latest, enforce limits, drop capabilities)',
      'Deploy full-stack Prometheus, Grafana, and Alertmanager monitoring with custom SLI/SLO dashboards',
      'Implement progressive delivery canary deployments using Argo Rollouts with automated metric rollbacks',
    ],
    repositoryStructure: `enterprise-platform/
├── terraform/                        # IaC layer
│   ├── main.tf                       # Cluster & VPC definition
│   ├── variables.tf
│   └── outputs.tf
├── platform/                         # Cluster infrastructure tools (App of Apps)
│   ├── ingress/                      # ingress-nginx
│   ├── cert-manager/                 # Automated TLS certificates
│   ├── sealed-secrets/               # In-cluster decryption controller
│   ├── kyverno/                      # Policy as Code admission controller
│   ├── observability/                # Prometheus-stack + Grafana dashboards
│   └── argo-rollouts/                # Canary delivery controller
├── policies/                         # Kyverno ClusterPolicies
│   ├── require-non-root.yaml
│   ├── require-resource-limits.yaml
│   └── disallow-latest-tag.yaml
├── apps/                             # Application workloads
│   └── appsets/
│       └── mern-appset.yaml          # Generates apps across staging & prod
└── rollouts/
    ├── server-rollout.yaml           # Replaces Deployment with Canary Rollout
    └── analysis-template.yaml        # Prometheus metric checks for error rate < 1%`,
    milestones: [
      {
        title: 'Milestone 1: Infrastructure as Code with Terraform / OpenTofu',
        description: 'Provision cluster and network infrastructure with state locking.',
        tasks: [
          'Declare VPC, subnets, and Kubernetes cluster configuration in Terraform',
          'Configure remote state storage with S3/GCS backend and state locking',
          'Execute `terraform plan` and verify declarative infrastructure execution graph',
          'Bootstrap Argo CD using Terraform Kubernetes and Helm providers',
        ],
        verification: 'terraform plan -out=tfplan && terraform apply tfplan',
      },
      {
        title: 'Milestone 2: Security Guardrails with Sealed Secrets & Kyverno Policies',
        description: 'Lock down secrets in Git and enforce cluster security policies at admission.',
        tasks: [
          'Install Sealed Secrets controller and encrypt database passwords using `kubeseal`',
          'Commit the encrypted `SealedSecret` manifest safely to Git',
          'Apply Kyverno ClusterPolicies forbidding container execution as root and requiring resource limits',
          'Test policy enforcement by attempting to apply a pod with `:latest` image tag and verifying rejection',
        ],
        verification: 'kubectl apply -f bad-pod.yaml 2>&1 | grep "disallow-latest-tag" # confirms blocked',
      },
      {
        title: 'Milestone 3: Observability Stack & Progressive Canary Delivery',
        description: 'Deploy Prometheus metrics and execute automated metric-verified canary rollouts.',
        tasks: [
          'Deploy `kube-prometheus-stack` via Argo CD Helm integration',
          'Configure custom Grafana dashboard monitoring MERN request rates, p95 latencies, and error budgets',
          'Replace standard Deployment with an Argo Rollouts `Rollout` object with canary steps: 10%, 25%, 50%, 100%',
          'Attach an `AnalysisTemplate` querying Prometheus error rates during the rollout',
          'Simulate a faulty release (HTTP 500 spike) and watch Argo Rollouts automatically abort and roll back',
        ],
        verification: 'kubectl argo rollouts get rollout server -n web-prod && kubectl argo rollouts status server -n web-prod',
      },
    ],
    acceptanceCriteria: [
      'Underlying Kubernetes cluster and networking provisioned declaratively via Terraform/OpenTofu with remote state locking.',
      'Argo CD ApplicationSet dynamically generates and manages staging and production environments from Git directories.',
      'Secrets are encrypted with Bitnami Sealed Secrets and safely stored in public Git repositories.',
      'Kyverno admission controller actively blocks non-compliant manifests (e.g. pods without CPU limits or with `:latest` image tags).',
      'Prometheus collects MERN RED metrics (Rate, Errors, Duration) and alerts on SLO error budget burn.',
      'Argo Rollouts executes canary releases with automated Prometheus analysis, automatically rolling back on elevated error rates.',
    ],
    executionGuide: [
      {
        step: '1. Provision platform infrastructure via Terraform',
        command: 'cd terraform && terraform init && terraform apply -auto-approve',
        explanation: 'Creates the cluster, network boundaries, and bootstraps the Argo CD control plane.',
      },
      {
        step: '2. Deploy the Platform App-of-Apps',
        command: 'kubectl apply -f platform/root-platform.yaml',
        explanation: 'Deploys Sealed Secrets, Kyverno, Prometheus stack, and Argo Rollouts via GitOps.',
      },
      {
        step: '3. Encrypt secrets with kubeseal',
        command: 'kubeseal --format=yaml < secret-plain.yaml > platform/sealed-secrets/mongo-secret.yaml',
        explanation: 'Encrypts database passwords using the cluster public key for safe storage in Git.',
      },
      {
        step: '4. Deploy Argo CD ApplicationSet',
        command: 'kubectl apply -f apps/appsets/mern-appset.yaml',
        explanation: 'ApplicationSet controller scans apps/ and generates individual Application CRDs for all environments.',
      },
      {
        step: '5. Execute canary rollout with automated analysis',
        command: 'kubectl argo rollouts set image server server=ghcr.io/org/mern-server:2.0.0 -n web-prod',
        explanation: 'Argo Rollouts routes 10% traffic to canary and invokes Prometheus AnalysisTemplate to verify error rate < 1%.',
      },
    ],
    troubleshooting: [
      {
        issue: 'Terraform state lock acquisition error',
        resolution: 'If a previous terraform run was killed abnormally, inspect DynamoDB lock or run `terraform force-unlock <LOCK-ID>` after verifying no concurrent operations are running.',
      },
      {
        issue: 'Kyverno webhook prevents cluster operations during outage',
        resolution: 'Temporarily set `failurePolicy: Ignore` on the Kyverno ValidatingWebhookConfiguration or delete the webhook configuration temporarily to restore apiserver responsiveness.',
      },
      {
        issue: 'Canary rollout aborts with AnalysisRun Failed',
        resolution: 'Inspect analysis run logs with `kubectl argo rollouts get rollout server -n web-prod`. Check Prometheus query syntax in `analysis-template.yaml` and verify metric endpoint reachability.',
      },
    ],
    cleanupInstructions: [
      'kubectl delete -f apps/appsets/mern-appset.yaml',
      'kubectl delete -f platform/root-platform.yaml',
      'cd terraform && terraform destroy -auto-approve',
    ],
    portfolioDeliverables: [
      'Enterprise platform engineering repository containing Terraform IaC, Argo CD ApplicationSets, Kyverno security policies, and Argo Rollouts canary manifests',
      'Grafana SLO dashboard JSON export showing MERN error budget burn and latency percentiles',
      'Comprehensive Production Runbook documenting disaster recovery, incident triage, and maintenance procedures',
    ],
    resources: [
      {
        title: 'Google Cloud Architecture: Building Secure & Reliable Systems',
        url: 'https://sre.google/books/building-secure-reliable-systems/',
        type: 'book',
        author: 'Google SRE Team',
        description: 'Best practices for defense-in-depth, least privilege, and reliable deployment architectures.',
        difficulty: 'advanced',
        priority: 'required',
      },
      {
        title: 'Argo Rollouts Canary Progressive Delivery',
        url: 'https://argoproj.github.io/argo-rollouts/features/canary/',
        type: 'documentation',
        description: 'Official guide on traffic routing, analysis templates, and automated rollback strategies.',
        difficulty: 'advanced',
        priority: 'required',
      },
      {
        title: 'Kyverno Policy as Code Documentation',
        url: 'https://kyverno.io/docs/',
        type: 'documentation',
        description: 'Kubernetes-native policy management for security, validation, and mutate admission controls.',
        difficulty: 'intermediate',
        priority: 'recommended',
      },
    ],
  },
]
