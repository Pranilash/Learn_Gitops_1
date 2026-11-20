import { describe, it, expect } from 'vitest'
import { scenarios } from '../data/scenarios/scenarioData'
import { createDefaultState, writeFile } from '../hooks/useTerminal'

describe('Engineering Academy Practical Scenarios', () => {
  it('defines the 6 required core scenarios with complete metadata', () => {
    expect(scenarios).toHaveLength(6)
    const ids = scenarios.map((s) => s.id)
    expect(ids).toContain('docker-containerize-mern')
    expect(ids).toContain('docker-repair-networking')
    expect(ids).toContain('k8s-deploy-mern')
    expect(ids).toContain('k8s-repair-service-endpoints')
    expect(ids).toContain('argocd-deploy-gitops')
    expect(ids).toContain('argocd-resolve-drift')

    for (const sc of scenarios) {
      expect(sc.title).toBeTruthy()
      expect(['guided', 'troubleshoot']).toContain(sc.type)
      expect(sc.estimatedMinutes).toBeGreaterThan(0)
      expect(sc.contextDescription).toBeTruthy()
      expect(sc.targetStateDescription).toBeTruthy()
      expect(sc.hints.length).toBeGreaterThanOrEqual(2)
      expect(sc.solution.explanation).toBeTruthy()
      expect(sc.solution.fixSteps.length).toBeGreaterThan(0)
      expect(sc.realWorldAlternative.commands.length).toBeGreaterThan(0)
    }
  })

  // ─── Scenario 1: Docker Containerize Backend ──────────────────────────────
  describe('Scenario 1: Containerize MERN Backend (Guided)', () => {
    const sc = scenarios.find((s) => s.id === 'docker-containerize-mern')!

    it('fails validation when Dockerfile is missing or running as root', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      // Dockerfile incomplete doesn't have USER node or image
      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(false)
    })

    it('passes validation when secure Dockerfile exists and image is built', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      writeFile(
        state.fs,
        'mern-app/Dockerfile',
        'FROM node:20-alpine\nWORKDIR /app\nUSER node\nEXPOSE 5000\nCMD ["node", "dist/server.js"]',
        '/home/operator'
      )
      state.dockerImages.unshift({
        repository: 'mern-backend',
        tag: '1.0.0',
        id: 'sha256:abc1234',
        size: '138MB',
      })

      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(true)
      expect(result.message).toContain('containerized securely')
    })
  })

  // ─── Scenario 2: Repair Docker Networking ─────────────────────────────────
  describe('Scenario 2: Repair Docker Networking (Troubleshoot)', () => {
    const sc = scenarios.find((s) => s.id === 'docker-repair-networking')!

    it('starts in broken state with ECONNREFUSED symptoms', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(false)
      expect(state.env['MONGO_URI']).toContain('localhost')
    })

    it('passes validation once custom bridge network is created and connected', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      state.dockerNetworks.push('mern-net')
      state.env['MONGO_URI'] = 'mongodb://mongo:27017/app'

      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(true)
      expect(result.details).toBeDefined()
    })
  })

  // ─── Scenario 3: Deploy MERN to Kubernetes ────────────────────────────────
  describe('Scenario 3: Deploy MERN to Kubernetes (Guided)', () => {
    const sc = scenarios.find((s) => s.id === 'k8s-deploy-mern')!

    it('fails when mern namespace and deployment are missing', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(false)
    })

    it('passes when namespace, deployment, and service exist in mern namespace', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      state.kubeNamespaces.push('mern')
      state.kubeDeployments.push({
        name: 'web',
        ready: '3/3',
        upToDate: 3,
        available: 3,
        age: '1m',
        namespace: 'mern',
      })
      state.kubePods.push(
        { name: 'web-1', ready: '1/1', status: 'Running', restarts: 0, age: '1m', namespace: 'mern', image: 'ghcr.io/acme/web:1.4.0' },
        { name: 'web-2', ready: '1/1', status: 'Running', restarts: 0, age: '1m', namespace: 'mern', image: 'ghcr.io/acme/web:1.4.0' },
        { name: 'web-3', ready: '1/1', status: 'Running', restarts: 0, age: '1m', namespace: 'mern', image: 'ghcr.io/acme/web:1.4.0' }
      )
      state.kubeServices.push({
        name: 'web-svc',
        type: 'ClusterIP',
        clusterIP: '10.96.45.20',
        ports: '80/TCP',
        namespace: 'mern',
      })

      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(true)
    })
  })

  // ─── Scenario 4: Repair Service Endpoints ─────────────────────────────────
  describe('Scenario 4: Repair Broken Kubernetes Service Endpoints (Troubleshoot)', () => {
    const sc = scenarios.find((s) => s.id === 'k8s-repair-service-endpoints')!

    it('starts with selector mismatch and empty endpoints', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      expect(state.kubeEndpoints['web-svc']).toHaveLength(0)
      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(false)
    })

    it('passes when selector is corrected to app: web and endpoints populate', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      writeFile(
        state.fs,
        'apps/web/base/service.yaml',
        'apiVersion: v1\nkind: Service\nmetadata:\n  name: web-svc\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 3000',
        '/home/operator/config-repo'
      )
      state.kubeEndpoints['web-svc'] = ['10.244.0.12:3000', '10.244.0.13:3000', '10.244.0.14:3000']

      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(true)
      expect(result.message).toContain('Endpoints populated')
    })
  })

  // ─── Scenario 5: Deploy Application with Argo CD ──────────────────────────
  describe('Scenario 5: Deploy Application with Argo CD (Guided)', () => {
    const sc = scenarios.find((s) => s.id === 'argocd-deploy-gitops')!

    it('fails validation while application is OutOfSync', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(false)
    })

    it('passes validation when synced and healthy', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      state.argoSynced = true
      const app = state.argoApps.find((a) => a.name === 'web-prod')!
      app.syncStatus = 'Synced'
      app.health = 'Healthy'

      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(true)
    })
  })

  // ─── Scenario 6: Resolve Argo CD Configuration Drift ──────────────────────
  describe('Scenario 6: Resolve Argo CD Configuration Drift (Troubleshoot)', () => {
    const sc = scenarios.find((s) => s.id === 'argocd-resolve-drift')!

    it('starts with divergence between live replicas and Git', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(false)
    })

    it('passes when drift is synced and selfHeal is enabled in GitOps manifest', () => {
      const state = createDefaultState()
      sc.setupEnvironment(state)
      state.argoSynced = true
      const app = state.argoApps.find((a) => a.name === 'web-prod')!
      app.syncStatus = 'Synced'
      writeFile(
        state.fs,
        'argocd/web-app.yaml',
        'apiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true',
        '/home/operator/config-repo'
      )

      const result = sc.validateFinalState(state)
      expect(result.passed).toBe(true)
      expect(result.message).toContain('self-healing active')
    })
  })
})
