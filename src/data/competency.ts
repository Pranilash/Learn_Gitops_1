export type EngineeringDomain =
  | 'linux_systems'
  | 'git_internals'
  | 'containers'
  | 'kubernetes'
  | 'cicd'
  | 'gitops_argocd'
  | 'cloud_iac'
  | 'observability_sre'

export interface DomainMeta {
  id: EngineeringDomain
  name: string
  icon: string
  color: string
  description: string
  keySkills: string[]
  recommendedPhases: string[]
}

export const domainMetadata: Record<EngineeringDomain, DomainMeta> = {
  linux_systems: {
    id: 'linux_systems',
    name: 'Linux & Systems Engineering',
    icon: '🐧',
    color: 'var(--cyan)',
    description: 'Operating systems, process lifecycle, Linux filesystem hierarchy, file permissions, shell scripting, TCP/IP, and networking fundamentals.',
    keySkills: ['Process inspection (ps, top)', 'File permissions (chmod, chown)', 'Pipes & text processing', 'Network sockets (ss, curl)', 'Systemd services'],
    recommendedPhases: ['phase0'],
  },
  git_internals: {
    id: 'git_internals',
    name: 'Git Internals & Workflows',
    icon: '🔀',
    color: 'var(--git)',
    description: 'The Git object model (blobs, trees, commits, refs), branching strategies, rebase vs merge, commit signing, and repo structure.',
    keySkills: ['Object model comprehension', 'Merge conflict resolution', 'Rebase & commit squashing', 'Conventional commits', 'Repo separation'],
    recommendedPhases: ['phase1'],
  },
  containers: {
    id: 'containers',
    name: 'Containerization & Docker',
    icon: '🐳',
    color: 'var(--blue)',
    description: 'Linux namespaces and cgroups, multi-stage Dockerfiles, unprivileged users, volume persistence, Docker Compose, and image security.',
    keySkills: ['Multi-stage Dockerfiles', 'Non-root container security', 'Docker Compose multi-service', 'Layer cache optimization', 'Trivy CVE scanning'],
    recommendedPhases: ['phase2'],
  },
  kubernetes: {
    id: 'kubernetes',
    name: 'Kubernetes Orchestration',
    icon: '⎈',
    color: 'var(--k8s)',
    description: 'Control plane internals, worker nodes, Deployments, StatefulSets, Services, Ingress, ConfigMaps, Secrets, PVCs, and HPA.',
    keySkills: ['Workload manifest authoring', 'StorageClass & PVC binding', 'Liveness & readiness probes', 'Ingress HTTP routing', 'Kubectl debugging'],
    recommendedPhases: ['phase3', 'phase4'],
  },
  cicd: {
    id: 'cicd',
    name: 'CI/CD Pipeline Engineering',
    icon: '🔄',
    color: 'var(--amber)',
    description: 'Automated test execution, multi-arch image builds, container registry integration, and the automated GitOps config handoff.',
    keySkills: ['GitHub Actions workflows', 'Docker Buildx caching', 'Automated security scanning', 'Semantic versioning', 'Decoupled Git handoff'],
    recommendedPhases: ['phase5'],
  },
  gitops_argocd: {
    id: 'gitops_argocd',
    name: 'Argo CD & GitOps Mastery',
    icon: '🎯',
    color: 'var(--argo)',
    description: 'Pull-based continuous delivery, reconciliation loops, drift detection, automated self-healing, sync waves, hooks, App of Apps, and ApplicationSets.',
    keySkills: ['Application CRD authoring', 'Self-healing & pruning', 'Sync waves & PreSync hooks', 'App of Apps architecture', 'ApplicationSet generators'],
    recommendedPhases: ['phase6'],
  },
  cloud_iac: {
    id: 'cloud_iac',
    name: 'Cloud & Infrastructure as Code',
    icon: '☁️',
    color: 'var(--magenta)',
    description: 'Declarative infrastructure with Terraform/OpenTofu, state management, provider configuration, Sealed Secrets, and cloud architectures.',
    keySkills: ['Terraform HCL syntax', 'State locking & backends', 'Kubernetes Helm provider', 'Sealed Secrets encryption', 'Cloud IAM & compute'],
    recommendedPhases: ['phase7'],
  },
  observability_sre: {
    id: 'observability_sre',
    name: 'Observability & Site Reliability',
    icon: '🏗️',
    color: 'var(--red)',
    description: 'Prometheus metrics, PromQL queries, Grafana dashboards, Alertmanager, SRE error budgets, blameless postmortems, and incident triage.',
    keySkills: ['PromQL vector queries', 'SLI/SLO definition', 'Root cause analysis', 'Kubernetes fault diagnosis', 'Canary metric analysis'],
    recommendedPhases: ['phase7', 'phase8'],
  },
}

export interface DomainScore {
  domain: EngineeringDomain
  score: number // 0 to 100%
  tier: 'Novice' | 'Apprentice' | 'Practitioner' | 'Architect'
  passedItems: number
  totalItems: number
}

export function computeTier(score: number): 'Novice' | 'Apprentice' | 'Practitioner' | 'Architect' {
  if (score >= 85) return 'Architect'
  if (score >= 60) return 'Practitioner'
  if (score >= 30) return 'Apprentice'
  return 'Novice'
}
