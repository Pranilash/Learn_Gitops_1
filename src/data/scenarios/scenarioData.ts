import type { AcademyScenario } from './types'
import type { TerminalState } from '../../hooks/useTerminal'
import { writeFile, readFile } from '../../hooks/useTerminal'

export const scenarios: AcademyScenario[] = [
  // ─── Scenario 1 (Guided): Containerize the MERN Backend ───────────────────
  {
    id: 'docker-containerize-mern',
    title: 'Containerize the MERN Backend',
    type: 'guided',
    category: 'docker',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    summary: 'Build a secure, production-grade container image for an Express/Node.js backend using multi-stage builds and a non-root user.',
    contextDescription:
      'The engineering team has written a production MERN backend in `/home/operator/mern-app`. Currently it runs locally on the host machine. Your platform engineering goal is to package this application into an immutable Docker container. You must follow container security best practices: use a minimal base image (Alpine), prune development dependencies, copy only necessary build artifacts, and ensure the process runs as an unprivileged user (node) rather than root.',
    targetStateDescription:
      'A valid multi-stage Dockerfile exists in `/home/operator/mern-app` specifying `USER node` and port 5000 exposition. The image is built and tagged as `mern-backend:1.0.0` in the local Docker daemon.',
    initialFiles: [
      {
        path: '/home/operator/mern-app/Dockerfile.incomplete',
        content: `# TODO: Complete this Dockerfile following container security best practices
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
# Hint: Set the non-root user and expose port 5000
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
`,
      },
    ],
    instructions: [
      '1. Navigate to `/home/operator/mern-app` and inspect the `package.json` file to understand the entry point.',
      '2. Create or finalize the `Dockerfile` with multi-stage build, `WORKDIR /app`, `USER node`, and `EXPOSE 5000`.',
      '3. Run `docker build -t mern-backend:1.0.0 .` to build the production image.',
      '4. Verify the image creation using `docker images`.',
    ],
    checkpoints: [
      {
        id: 'inspect-source',
        title: 'Inspect Package Definition',
        description: 'Verify package.json dependencies and start script.',
        expectedOutcome: 'Understand that the backend requires Node 20 and starts via dist/server.js.',
        hint: 'Use `cat mern-app/package.json` to inspect the scripts and main entry.',
        checkState: (state: TerminalState) => {
          const content = readFile(state.fs, 'mern-app/package.json', '/home/operator')
          return {
            ok: !!content && content.includes('mern-app'),
            message: content ? 'package.json found and valid.' : 'Missing mern-app/package.json',
          }
        },
      },
      {
        id: 'create-dockerfile',
        title: 'Author Secure Dockerfile',
        description: 'Ensure a production Dockerfile exists with USER node and EXPOSE 5000.',
        expectedOutcome: 'Dockerfile contains node base, non-root user node, and exposes port 5000.',
        hint: 'Copy Dockerfile.incomplete to Dockerfile or create it directly in the editor tab.',
        checkState: (state: TerminalState) => {
          const content = readFile(state.fs, 'mern-app/Dockerfile', '/home/operator')
          if (!content) return { ok: false, message: 'Dockerfile not found in /home/operator/mern-app' }
          const hasUser = content.includes('USER node')
          const hasExpose = content.includes('5000') || content.includes('3000')
          return {
            ok: hasUser && hasExpose,
            message: hasUser && hasExpose
              ? 'Dockerfile exists with non-root user and exposed port.'
              : 'Dockerfile is missing `USER node` or `EXPOSE 5000`.',
          }
        },
      },
      {
        id: 'build-image',
        title: 'Build Docker Image',
        description: 'Compile the container image and register it in local Docker storage.',
        expectedOutcome: 'Image tagged mern-backend:1.0.0 appears in `docker images`.',
        hint: 'Run `docker build -t mern-backend:1.0.0 mern-app` in the terminal.',
        checkState: (state: TerminalState) => {
          const img = state.dockerImages.find(
            (i) => i.repository === 'mern-backend' && (i.tag === '1.0.0' || i.tag === 'latest')
          )
          return {
            ok: !!img,
            message: img ? `Image ${img.repository}:${img.tag} built successfully.` : 'Image mern-backend:1.0.0 has not been built yet.',
          }
        },
      },
    ],
    setupEnvironment: (state: TerminalState) => {
      // Remove any pre-existing mern-backend image to allow learner to build it
      state.dockerImages = state.dockerImages.filter((i) => i.repository !== 'mern-backend')
      state.cwd = '/home/operator/mern-app'
    },
    validateFinalState: (state: TerminalState) => {
      const dockerfile = readFile(state.fs, 'mern-app/Dockerfile', '/home/operator')
      const img = state.dockerImages.find(
        (i) => i.repository === 'mern-backend' && (i.tag === '1.0.0' || i.tag === 'latest')
      )

      if (!dockerfile) {
        return { passed: false, message: 'Missing /home/operator/mern-app/Dockerfile' }
      }
      if (!dockerfile.includes('USER node')) {
        return { passed: false, message: 'Security check failed: Dockerfile must define `USER node` to prevent running as root.' }
      }
      if (!img) {
        return { passed: false, message: 'Image `mern-backend:1.0.0` not found. Execute `docker build -t mern-backend:1.0.0 .`' }
      }

      return {
        passed: true,
        message: 'MERN backend containerized securely with non-root privileges and verified in Docker registry.',
        details: [
          'Base Image: Node 20 Alpine',
          'Security: USER node enforced',
          'Image Tag: mern-backend:1.0.0',
        ],
      }
    },
    hints: [
      'Inspect `mern-app/package.json` with `cat package.json` to verify that the start script executes `node dist/server.js`.',
      'In Linux containers, running as root inside a container poses container breakout risks. Specify `USER node` before the `CMD` instruction.',
      'Build the image with `docker build -t mern-backend:1.0.0 .` or `docker build -t mern-backend:1.0.0 mern-app`. Check with `docker images`.',
    ],
    solution: {
      fixSteps: [
        '1. Open or edit `/home/operator/mern-app/Dockerfile`.',
        '2. Add `USER node` to ensure the process runs as unprivileged UID 1000.',
        '3. Expose port 5000: `EXPOSE 5000`.',
        '4. Execute: `docker build -t mern-backend:1.0.0 mern-app`',
      ],
      explanation:
        'Running Node.js applications as root in production is a critical security vulnerability (CWE-250). If a remote code execution vulnerability is discovered in an Express dependency, the attacker gains root privileges in the container namespace. Using `USER node` restricts the attack surface to unprivileged operations.',
      manifests: [
        {
          name: 'Dockerfile',
          language: 'dockerfile',
          content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]`,
        },
      ],
    },
    realWorldAlternative: {
      prerequisites: ['Docker Desktop or Docker Engine installed on Linux/macOS/WSL2', 'Git'],
      commands: [
        'git clone https://github.com/acme/mern-starter.git',
        'cd mern-starter/backend',
        'docker build -t mern-backend:1.0.0 .',
        'docker run -d -p 5000:5000 --name mern-backend mern-backend:1.0.0',
        'curl http://localhost:5000/health',
      ],
      notes:
        'In local production, test with `docker scout cves mern-backend:1.0.0` or `trivy image mern-backend:1.0.0` to detect base image vulnerabilities.',
    },
  },

  // ─── Scenario 2 (Fix): Repair Docker Networking & MongoDB Connection ──────
  {
    id: 'docker-repair-networking',
    title: 'Repair Broken Docker Networking & MongoDB Connection',
    type: 'troubleshoot',
    category: 'networking',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    summary: 'Triage an incident where the MERN backend crashes with ECONNREFUSED when attempting to reach the MongoDB container.',
    contextDescription:
      'INCIDENT SEVERITY 2: The MERN API service is reporting 100% error rate on database queries. The container logs show `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`. Both `mern-backend` and `mern-mongo` containers are currently running, but they were launched on separate networks, and the backend is erroneously pointing to localhost instead of the container DNS hostname.',
    targetStateDescription:
      'A dedicated bridge network `mern-net` is created. Both `mern-backend` and `mern-mongo` are connected to `mern-net`. The backend container connects to MongoDB using the service hostname `mongo` (`mongodb://mongo:27017/app`).',
    initialFiles: [
      {
        path: '/home/operator/mern-app/docker-compose.broken.yml',
        content: `version: "3.9"
services:
  backend:
    image: ghcr.io/acme/api:1.4.0
    environment:
      # BUG: In Docker, localhost refers to the backend container itself!
      - MONGO_URI=mongodb://localhost:27017/app
    ports:
      - "5000:5000"
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
`,
      },
    ],
    setupEnvironment: (state: TerminalState) => {
      state.cwd = '/home/operator/mern-app'
      // Inject broken config and env
      state.env['MONGO_URI'] = 'mongodb://localhost:27017/app'
      writeFile(
        state.fs,
        'mern-app/docker-compose.yml',
        'version: "3.9"\nservices:\n  backend:\n    image: ghcr.io/acme/api:1.4.0\n    environment:\n      - MONGO_URI=mongodb://localhost:27017/app\n    ports:\n      - "5000:5000"\n  mongo:\n    image: mongo:7\n    ports:\n      - "27017:27017"\n',
        '/home/operator'
      )
      state.dockerContainers = [
        { id: 'c1a2b3c4d5e6', image: 'ghcr.io/acme/api:1.4.0', status: 'Restarting (1) 2s ago', ports: '0.0.0.0:5000->5000/tcp', name: 'mern-backend' },
        { id: 'm7a8b9c0d1e2', image: 'mongo:7', status: 'Up 15 minutes', ports: '0.0.0.0:27017->27017/tcp', name: 'mern-mongo' },
      ]
      state.dockerNetworks = ['bridge', 'host', 'none']
    },
    validateFinalState: (state: TerminalState) => {
      const hasNet = state.dockerNetworks.includes('mern-net')
      const mongoUri = state.env['MONGO_URI'] || ''
      const hasFixedUri = mongoUri.includes('mongodb://mongo:27017') || mongoUri.includes('mongodb://mern-mongo:27017')
      const composeContent = readFile(state.fs, 'mern-app/docker-compose.yml', '/home/operator') || ''
      const composeFixed = composeContent.includes('mongodb://mongo:27017')

      if (!hasNet && !composeFixed && !hasFixedUri) {
        return {
          passed: false,
          message: 'Containers are still disconnected. Create a custom network `mern-net` or update the compose environment to use `mongodb://mongo:27017/app`.',
        }
      }

      return {
        passed: true,
        message: 'Docker networking restored! Containers share network and MongoDB DNS hostname resolves correctly.',
        details: [
          'Network: mern-net (custom bridge)',
          'DNS Hostname: mongo -> 27017',
          'Connection: Active and Healthy',
        ],
      }
    },
    hints: [
      'Check the error with `docker logs mern-backend`. Notice why `127.0.0.1:27017` fails inside an isolated container namespace.',
      'Inspect existing Docker networks with `docker network ls`. The default `bridge` network does NOT provide automatic DNS resolution between container names.',
      'Create a user-defined bridge network using `docker network create mern-net` or fix the compose file to connect services together via `mongodb://mongo:27017/app`.',
    ],
    solution: {
      rootCause:
        'Each Docker container resides in its own isolated Linux network namespace (netns). When `mern-backend` attempted to connect to `127.0.0.1`, it looked for MongoDB inside its own container loopback interface instead of MongoDB. Furthermore, Docker only provides automatic DNS resolution on user-defined bridge networks, not on the default bridge.',
      fixSteps: [
        '1. Inspect container logs: `docker logs mern-backend`.',
        '2. Create user-defined bridge network: `docker network create mern-net`.',
        '3. Update MONGO_URI to `mongodb://mongo:27017/app` using export or in `docker-compose.yml`.',
        '4. Connect containers: `docker network connect mern-net mern-backend` and `docker network connect mern-net mern-mongo`.',
      ],
      explanation:
        'Docker provides an embedded DNS server at `127.0.0.11` only within user-defined bridge networks. On such networks, container names act as resolvable hostnames. By placing both services on `mern-net`, Node.js resolves `mongo` to MongoDB container IP automatically.',
      manifests: [
        {
          name: 'docker-compose.yml',
          language: 'yaml',
          content: `version: "3.9"
networks:
  mern-net:
    driver: bridge

services:
  backend:
    image: ghcr.io/acme/api:1.4.0
    networks:
      - mern-net
    environment:
      - MONGO_URI=mongodb://mongo:27017/app
    ports:
      - "5000:5000"
  mongo:
    image: mongo:7
    networks:
      - mern-net
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:`,
        },
      ],
    },
    realWorldAlternative: {
      prerequisites: ['Docker Engine or Docker Desktop with Compose v2'],
      commands: [
        'docker network create mern-net',
        'docker run -d --name mongo --network mern-net -v mongo-data:/data/db mongo:7',
        'docker run -d --name backend --network mern-net -e MONGO_URI=mongodb://mongo:27017/app -p 5000:5000 mern-backend:1.0.0',
        'docker exec -it backend ping mongo',
      ],
      notes: 'Verify DNS with `docker exec -it backend nslookup mongo` or `docker network inspect mern-net`.',
    },
  },

  // ─── Scenario 3 (Guided): Deploy MERN Application to Kubernetes (kind) ────
  {
    id: 'k8s-deploy-mern',
    title: 'Deploy MERN Application to Kubernetes',
    type: 'guided',
    category: 'kubernetes',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    summary: 'Deploy the containerized MERN application into a local kind cluster with declarative Deployment and Service manifests.',
    contextDescription:
      'We have transitioned from single-host Docker Compose to container orchestration. We must deploy the MERN application into a Kubernetes cluster (`kind-gitops-lab`). This requires creating a dedicated namespace `mern`, applying a Deployment with 3 replicas, setting memory and CPU resource requests/limits, and defining a ClusterIP Service to distribute traffic across the pods.',
    targetStateDescription:
      'Namespace `mern` exists. Deployment `web` is running in `mern` with 3 ready replicas. Service `web-svc` exists in namespace `mern` routing port 80 to container port 3000.',
    instructions: [
      '1. Create the target namespace: `kubectl create namespace mern`.',
      '2. Inspect the Deployment manifest in `config-repo/apps/web/base/deployment.yaml`.',
      '3. Apply the Deployment and Service manifests to the `mern` namespace: `kubectl apply -f config-repo/apps/web/base/deployment.yaml -n mern` and `kubectl apply -f config-repo/apps/web/base/service.yaml -n mern`.',
      '4. Verify rollout: `kubectl get pods -n mern` and `kubectl get svc -n mern`.',
    ],
    checkpoints: [
      {
        id: 'create-ns',
        title: 'Create Namespace',
        description: 'Isolate workloads in a dedicated `mern` namespace.',
        expectedOutcome: 'Namespace mern is listed in `kubectl get namespaces`.',
        hint: 'Run `kubectl create namespace mern`.',
        checkState: (state: TerminalState) => {
          const exists = state.kubeNamespaces.includes('mern')
          return {
            ok: exists,
            message: exists ? 'Namespace mern created.' : 'Namespace mern does not exist yet.',
          }
        },
      },
      {
        id: 'apply-deployment',
        title: 'Deploy Pods with 3 Replicas',
        description: 'Apply the deployment manifest and achieve 3 running pods.',
        expectedOutcome: 'Deployment web has 3/3 ready replicas in namespace mern.',
        hint: 'Run `kubectl apply -f config-repo/apps/web/base/deployment.yaml -n mern`.',
        checkState: (state: TerminalState) => {
          const dep = state.kubeDeployments.find((d) => d.namespace === 'mern' && d.name === 'web')
          const pods = state.kubePods.filter((p) => p.namespace === 'mern' && p.status === 'Running')
          const ok = !!dep && pods.length >= 3
          return {
            ok,
            message: ok ? 'Deployment web has 3 ready replicas.' : 'Deployment web is not yet running with 3 replicas in mern.',
          }
        },
      },
      {
        id: 'apply-service',
        title: 'Expose Deployment with ClusterIP Service',
        description: 'Expose pods via Service web-svc.',
        expectedOutcome: 'Service web-svc exists in namespace mern.',
        hint: 'Run `kubectl apply -f config-repo/apps/web/base/service.yaml -n mern`.',
        checkState: (state: TerminalState) => {
          const svc = state.kubeServices.find((s) => s.namespace === 'mern' && s.name === 'web-svc')
          return {
            ok: !!svc,
            message: svc ? 'Service web-svc created in namespace mern.' : 'Service web-svc not found in mern.',
          }
        },
      },
    ],
    setupEnvironment: (state: TerminalState) => {
      // Clear out mern namespace workloads
      state.kubeNamespaces = state.kubeNamespaces.filter((ns) => ns !== 'mern')
      state.kubeDeployments = state.kubeDeployments.filter((d) => d.namespace !== 'mern')
      state.kubePods = state.kubePods.filter((p) => p.namespace !== 'mern')
      state.kubeServices = state.kubeServices.filter((s) => s.namespace !== 'mern')
      state.cwd = '/home/operator/config-repo'
    },
    validateFinalState: (state: TerminalState) => {
      const hasNs = state.kubeNamespaces.includes('mern')
      const dep = state.kubeDeployments.find((d) => d.namespace === 'mern' && d.name === 'web')
      const pods = state.kubePods.filter((p) => p.namespace === 'mern' && p.status === 'Running')
      const svc = state.kubeServices.find((s) => s.namespace === 'mern' && s.name === 'web-svc')

      if (!hasNs) return { passed: false, message: 'Namespace `mern` not found. Execute `kubectl create namespace mern`.' }
      if (!dep || pods.length < 3) return { passed: false, message: 'Deployment `web` not running with 3 replicas in `mern` namespace.' }
      if (!svc) return { passed: false, message: 'Service `web-svc` not found in `mern` namespace.' }

      return {
        passed: true,
        message: 'MERN stack successfully deployed to Kubernetes with 3 healthy replicas and active Service load balancer.',
        details: [
          'Namespace: mern',
          'Deployment: web (3/3 Ready)',
          'Service: web-svc (ClusterIP:80 -> 3000)',
        ],
      }
    },
    hints: [
      'Create the namespace with `kubectl create namespace mern`.',
      'Apply manifests with `kubectl apply -f apps/web/base/deployment.yaml -n mern` and `kubectl apply -f apps/web/base/service.yaml -n mern`.',
      'Check status with `kubectl get all -n mern`.',
    ],
    solution: {
      fixSteps: [
        '1. `kubectl create namespace mern`',
        '2. `kubectl apply -f apps/web/base/deployment.yaml -n mern`',
        '3. `kubectl apply -f apps/web/base/service.yaml -n mern`',
        '4. `kubectl get pods,svc -n mern`',
      ],
      explanation:
        'A Kubernetes Deployment creates a ReplicaSet to maintain the desired number of Pods. When a pod crashes or a node fails, the ReplicaSet controller creates replacements. The Service provides a stable ClusterIP and DNS record (`web-svc.mern.svc.cluster.local`), abstracting away ephemeral pod IP addresses.',
      manifests: [
        {
          name: 'deployment.yaml',
          language: 'yaml',
          content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: mern
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
          image: ghcr.io/acme/web:1.4.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi`,
        },
      ],
    },
    realWorldAlternative: {
      prerequisites: ['kind installed', 'kubectl installed', 'Docker running'],
      commands: [
        'kind create cluster --name gitops-lab',
        'kubectl create namespace mern',
        'kubectl apply -f config-repo/apps/web/base/ -n mern',
        'kubectl rollout status deployment/web -n mern',
      ],
      notes: 'Test locally with `kubectl port-forward -n mern svc/web-svc 8080:80` and open http://localhost:8080.',
    },
  },

  // ─── Scenario 4 (Fix): Repair a Broken Kubernetes Service (Selector Mismatch)
  {
    id: 'k8s-repair-service-endpoints',
    title: 'Repair Broken Kubernetes Service Endpoints',
    type: 'troubleshoot',
    category: 'kubernetes',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    summary: 'Triage an incident where pods are Running (3/3) but the Service has 0 endpoints and traffic fails with connection refused.',
    contextDescription:
      'INCIDENT SEVERITY 1: Production ingress is returning HTTP 503 Service Unavailable when calling `web-svc` in namespace `web`. The on-call engineer confirmed that `kubectl get pods -n web` shows 3/3 pods in "Running" state. However, running `kubectl get endpoints web-svc -n web` returns `<none>`. The kube-proxy has no backend endpoints to route packets to!',
    targetStateDescription:
      'The Service `web-svc` in namespace `web` has its selector corrected to `app: web`, matching the Pod template labels. `kubectl get endpoints web-svc -n web` shows active endpoints routing to the running pods.',
    initialFiles: [
      {
        path: '/home/operator/config-repo/apps/web/base/service.broken.yaml',
        content: `apiVersion: v1
kind: Service
metadata:
  name: web-svc
  namespace: web
spec:
  selector:
    # BUG: Pods are labeled "app: web", not "app: web-api"!
    app: web-api
  ports:
    - port: 80
      targetPort: 3000
`,
      },
    ],
    setupEnvironment: (state: TerminalState) => {
      state.cwd = '/home/operator/config-repo'
      state.kubeNamespace = 'web'
      // Inject broken service manifest with mismatched selector
      writeFile(
        state.fs,
        'apps/web/base/service.yaml',
        'apiVersion: v1\nkind: Service\nmetadata:\n  name: web-svc\n  namespace: web\nspec:\n  selector:\n    app: web-api\n  ports:\n    - port: 80\n      targetPort: 3000\n',
        '/home/operator/config-repo'
      )
      // Ensure pods exist with label app: web
      state.kubePods = [
        { name: 'web-7d9f-aa', ready: '1/1', status: 'Running', restarts: 0, age: '10m', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
        { name: 'web-7d9f-bb', ready: '1/1', status: 'Running', restarts: 0, age: '10m', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
        { name: 'web-7d9f-cc', ready: '1/1', status: 'Running', restarts: 0, age: '10m', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
      ]
      // Set service with broken selector
      state.kubeServices = [
        { name: 'web-svc', type: 'ClusterIP', clusterIP: '10.96.45.12', ports: '80/TCP', namespace: 'web' },
      ]
      // Endpoints empty due to selector mismatch
      state.kubeEndpoints['web-svc'] = []
    },
    validateFinalState: (state: TerminalState) => {
      const endpoints = state.kubeEndpoints['web-svc'] || []
      const svcContent = readFile(state.fs, 'apps/web/base/service.yaml', '/home/operator/config-repo') || ''
      const isFixedInYaml = svcContent.includes('app: web') && !svcContent.includes('app: web-api')
      const hasEndpoints = endpoints.length > 0

      if (!hasEndpoints && !isFixedInYaml) {
        return {
          passed: false,
          message: 'Service selector still does not match Pod labels. Endpoints list is empty.',
        }
      }

      // Automatically reconcile endpoints if fixed
      if (isFixedInYaml && endpoints.length === 0) {
        state.kubeEndpoints['web-svc'] = ['10.244.0.12:3000', '10.244.0.13:3000', '10.244.0.14:3000']
      }

      return {
        passed: true,
        message: 'Service selector matches Pod labels! Endpoints populated with healthy pod IPs.',
        details: [
          'Service: web-svc',
          'Selector: app=web',
          'Endpoints: 10.244.0.12:3000, 10.244.0.13:3000, 10.244.0.14:3000',
        ],
      }
    },
    hints: [
      'Inspect the endpoints with `kubectl describe svc web-svc -n web` or `kubectl get endpoints web-svc -n web`. Notice the `Endpoints: <none>`.',
      'Compare the pod labels (`kubectl get pods -n web --show-labels`) with the Service selector (`kubectl get svc web-svc -n web -o yaml`).',
      'Notice the mismatch: the Service has `selector: app=web-api` but the pods are labeled `app=web`. Patch or re-apply the fixed Service manifest.',
    ],
    solution: {
      rootCause:
        'A Kubernetes Service identifies backend pods via label selectors (`spec.selector`). When the selector (`app: web-api`) does not match the Pod labels (`app: web`), the EndpointSlice controller finds 0 matching pods. Consequently, kube-proxy generates no iptables/IPVS rules, and all incoming traffic drops or fails with 503.',
      fixSteps: [
        '1. Inspect endpoints: `kubectl get ep web-svc -n web` -> <none>.',
        '2. Inspect pod labels: `kubectl get pods -n web --show-labels` -> app=web.',
        '3. Fix `apps/web/base/service.yaml` so `spec.selector.app` is `web`.',
        '4. Apply fix: `kubectl apply -f apps/web/base/service.yaml -n web` or `kubectl patch svc web-svc -n web -p \'{"spec":{"selector":{"app":"web"}}}\'`.',
        '5. Verify endpoints: `kubectl get endpoints web-svc -n web`.',
      ],
      explanation:
        'In Kubernetes, the Service resource is decoupled from Pods. The EndpointSlice controller continuously watches Pods and Services. When a Service selector matches Pod labels AND the Pod passes its readiness probe, its IP and port are registered into the Endpoints/EndpointSlice object.',
      manifests: [
        {
          name: 'service.yaml',
          language: 'yaml',
          content: `apiVersion: v1
kind: Service
metadata:
  name: web-svc
  namespace: web
spec:
  selector:
    app: web # MATCHES: Deployment template.metadata.labels.app
  ports:
    - port: 80
      targetPort: 3000`,
        },
      ],
    },
    realWorldAlternative: {
      prerequisites: ['Kubernetes cluster (kind/minikube)', 'kubectl'],
      commands: [
        'kubectl get endpoints web-svc -n web',
        'kubectl get pods -n web --show-labels',
        'kubectl patch svc web-svc -n web -p \'{"spec":{"selector":{"app":"web"}}}\'',
        'kubectl get endpoints web-svc -n web',
      ],
      notes: 'Always check both selector matching AND readiness probe failures when endpoints are missing.',
    },
  },

  // ─── Scenario 5 (Guided): Deploy Application using Argo CD ─────────────────
  {
    id: 'argocd-deploy-gitops',
    title: 'Deploy an Application using Argo CD',
    type: 'guided',
    category: 'argocd',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    summary: 'Deploy and synchronize an application declaratively using Argo CD and GitOps principles.',
    contextDescription:
      'In a mature GitOps organization, direct `kubectl apply` commands are prohibited in production. Instead, an Argo CD `Application` custom resource declares the desired Git repository URL, target branch revision, and directory path containing Kubernetes manifests. Argo CD reconciles the live cluster against Git.',
    targetStateDescription:
      'Argo CD Application `web-prod` is registered in namespace `argocd`, successfully synced, and in `Healthy` status.',
    instructions: [
      '1. Inspect the Argo CD Application manifest in `config-repo/argocd/web-app.yaml`.',
      '2. Apply the Application definition to the cluster: `kubectl apply -f config-repo/argocd/web-app.yaml`.',
      '3. View the pending synchronization: `argocd app diff web-prod` and `argocd app get web-prod`.',
      '4. Trigger the synchronization: `argocd app sync web-prod`.',
      '5. Verify that the Application status is Synced and Healthy.',
    ],
    checkpoints: [
      {
        id: 'inspect-app-manifest',
        title: 'Inspect GitOps Application CR',
        description: 'Read the declarative Argo CD Application specification.',
        expectedOutcome: 'Understand repoURL, targetRevision, and path structure.',
        hint: 'Use `cat config-repo/argocd/web-app.yaml` to read the manifest.',
        checkState: (state: TerminalState) => {
          const content = readFile(state.fs, 'config-repo/argocd/web-app.yaml', '/home/operator')
          return {
            ok: !!content && content.includes('kind: Application'),
            message: content ? 'Application CR definition found.' : 'Missing argocd/web-app.yaml manifest.',
          }
        },
      },
      {
        id: 'apply-application',
        title: 'Register Application with Argo CD',
        description: 'Apply the Application CR into the argocd namespace.',
        expectedOutcome: 'Application web-prod is recognized by `argocd app list`.',
        hint: 'Run `kubectl apply -f config-repo/argocd/web-app.yaml`.',
        checkState: (state: TerminalState) => {
          const app = state.argoApps.find((a) => a.name === 'web-prod')
          return {
            ok: !!app,
            message: app ? 'Application web-prod registered.' : 'Application web-prod not found in Argo CD.',
          }
        },
      },
      {
        id: 'sync-application',
        title: 'Synchronize Application',
        description: 'Reconcile live cluster with Git repository.',
        expectedOutcome: 'App status is Synced and Healthy.',
        hint: 'Run `argocd app sync web-prod`.',
        checkState: (state: TerminalState) => {
          const app = state.argoApps.find((a) => a.name === 'web-prod')
          const isSynced = app?.syncStatus === 'Synced'
          return {
            ok: isSynced,
            message: isSynced ? 'Application web-prod is Synced and Healthy.' : 'Application is OutOfSync. Run `argocd app sync web-prod`.',
          }
        },
      },
    ],
    setupEnvironment: (state: TerminalState) => {
      state.cwd = '/home/operator/config-repo'
      state.argoSynced = false
      state.argoApps = [
        {
          name: 'web-prod',
          syncStatus: 'OutOfSync',
          health: 'Healthy',
          revision: 'a1b2c3d',
          repo: 'https://github.com/acme/config-repo',
          path: 'apps/web/overlays/prod',
        },
      ]
    },
    validateFinalState: (state: TerminalState) => {
      const app = state.argoApps.find((a) => a.name === 'web-prod')
      if (!app) return { passed: false, message: 'Application `web-prod` not found.' }
      if (app.syncStatus !== 'Synced' || !state.argoSynced) {
        return { passed: false, message: 'Application `web-prod` is OutOfSync. Execute `argocd app sync web-prod`.' }
      }

      return {
        passed: true,
        message: 'Argo CD application synchronized successfully! Cluster matches Git desired state.',
        details: [
          'App: web-prod',
          'Sync Status: Synced',
          'Health: Healthy',
          'Revision: 9f2c1a4',
        ],
      }
    },
    hints: [
      'Inspect the application with `argocd app get web-prod`.',
      'View the differences between Git and live cluster with `argocd app diff web-prod`.',
      'Reconcile live cluster with `argocd app sync web-prod`.',
    ],
    solution: {
      fixSteps: [
        '1. `kubectl apply -f argocd/web-app.yaml`',
        '2. `argocd app get web-prod`',
        '3. `argocd app diff web-prod`',
        '4. `argocd app sync web-prod`',
      ],
      explanation:
        'In Argo CD, the application controller continuously queries Git for the target commit SHA, runs Kustomize/Helm to generate rendered manifests, and compares them against the Kubernetes API live state. When `sync` is executed, Argo CD applies the diff to bring live state in parity with Git.',
      manifests: [
        {
          name: 'web-app.yaml',
          language: 'yaml',
          content: `apiVersion: argoproj.io/v1alpha1
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
        },
      ],
    },
    realWorldAlternative: {
      prerequisites: ['Kubernetes cluster with Argo CD installed', 'Argo CD CLI or Web UI access'],
      commands: [
        'kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml',
        'kubectl apply -f config-repo/argocd/web-app.yaml',
        'argocd app sync web-prod',
        'argocd app wait web-prod --sync --health',
      ],
      notes: 'In production, use sealed-secrets or external-secrets to manage credentials alongside GitOps manifests.',
    },
  },

  // ─── Scenario 6 (Fix): Resolve Argo CD Configuration Drift & Auto-Healing ──
  {
    id: 'argocd-resolve-drift',
    title: 'Resolve Argo CD Configuration Drift & Auto-Healing',
    type: 'troubleshoot',
    category: 'argocd',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    summary: 'Triage live cluster drift caused by manual modification, reconcile back to Git truth, and enforce self-healing.',
    contextDescription:
      'INCIDENT SEVERITY 2: Configuration drift detected in production. During an overnight database failover, an operator manually modified the production deployment replica count in the cluster using `kubectl scale deployment web --replicas=1` and forgot to revert it. Argo CD detected the discrepancy: Git specifies 5 replicas, but the live cluster has only 1! Because automated `selfHeal` was disabled, Argo CD left the divergent state in place.',
    targetStateDescription:
      'The cluster is reconciled back to Git desired state (5 replicas). Argo CD self-healing is enabled (`selfHeal: true`) in the syncPolicy to automatically counteract future manual edits.',
    initialFiles: [
      {
        path: '/home/operator/config-repo/argocd/web-app.yaml',
        content: `apiVersion: argoproj.io/v1alpha1
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
      # DRIFT RISK: selfHeal is currently false!
      selfHeal: false
`,
      },
    ],
    setupEnvironment: (state: TerminalState) => {
      state.cwd = '/home/operator/config-repo'
      state.argoSynced = false
      state.argoApps = [
        {
          name: 'web-prod',
          syncStatus: 'OutOfSync',
          health: 'Healthy',
          revision: 'a1b2c3d',
          repo: 'https://github.com/acme/config-repo',
          path: 'apps/web/overlays/prod',
        },
      ]
      // Deployment manually scaled to 1
      state.kubeDeployments = [
        { name: 'web', ready: '1/1', upToDate: 1, available: 1, age: '2h', namespace: 'web' },
      ]
      state.kubePods = [
        { name: 'web-7d9f-aa', ready: '1/1', status: 'Running', restarts: 0, age: '2h', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
      ]
    },
    validateFinalState: (state: TerminalState) => {
      const app = state.argoApps.find((a) => a.name === 'web-prod')
      const appFile = readFile(state.fs, 'argocd/web-app.yaml', '/home/operator/config-repo') || ''
      const hasSelfHealInYaml = appFile.includes('selfHeal: true')
      const isSynced = state.argoSynced || app?.syncStatus === 'Synced'
      const hasRestoredReplicas = state.kubeDeployments.some((d) => d.name === 'web' && (d.ready === '5/5' || d.ready === '3/3' || d.upToDate >= 3))

      if (!isSynced && !hasRestoredReplicas) {
        return {
          passed: false,
          message: 'Cluster is still OutOfSync. Reconcile drift using `argocd app sync web-prod`.',
        }
      }

      if (!hasSelfHealInYaml && app?.syncStatus !== 'Synced') {
        return {
          passed: false,
          message: 'Drift resolved, but selfHeal is still disabled! Enable `selfHeal: true` to prevent future unauthorized cluster modifications.',
        }
      }

      return {
        passed: true,
        message: 'Configuration drift resolved and self-healing active! Argo CD will automatically revert manual cluster tampering.',
        details: [
          'Live Replicas: Restored to Git desired count (5 replicas)',
          'Sync Status: Synced',
          'SyncPolicy: automated.selfHeal = true',
        ],
      }
    },
    hints: [
      'Inspect the differences between live cluster and Git with `argocd app diff web-prod`.',
      'Notice that the live cluster has 1 replica while Git requires 5. Run `argocd app sync web-prod` to synchronize.',
      'To ensure Argo CD immediately reverts any manual cluster drift in the future, set `selfHeal: true` in `argocd/web-app.yaml` or run `argocd app set web-prod --self-heal`.',
    ],
    solution: {
      rootCause:
        'A human operator bypassed the GitOps pipeline and mutated cluster state directly using `kubectl scale`. Because `syncPolicy.automated.selfHeal` was false, Argo CD detected the drift but took no action, leaving production in a degraded, divergent state.',
      fixSteps: [
        '1. Inspect drift: `argocd app diff web-prod`.',
        '2. Synchronize cluster to Git desired state: `argocd app sync web-prod`.',
        '3. Update `config-repo/argocd/web-app.yaml` to include `syncPolicy.automated.selfHeal: true`.',
        '4. Commit and push or apply: `kubectl apply -f config-repo/argocd/web-app.yaml`.',
        '5. Or execute CLI flag: `argocd app set web-prod --self-heal`.',
      ],
      explanation:
        'Self-healing is a cornerstone of the GitOps operating model. When `selfHeal` is enabled, any cluster modification performed outside of Git (via kubectl edit, scale, patch, or malicious tamper) triggers the reconciliation loop to overwrite the live resource back to the declarative state stored in version control.',
      manifests: [
        {
          name: 'web-app.yaml',
          language: 'yaml',
          content: `apiVersion: argoproj.io/v1alpha1
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
      selfHeal: true # AUTOMATICALLY REVERTS CLUSTER TAMPERING`,
        },
      ],
    },
    realWorldAlternative: {
      prerequisites: ['Argo CD installed in Kubernetes cluster'],
      commands: [
        'kubectl scale deployment web -n web --replicas=1',
        'argocd app diff web-prod',
        'argocd app set web-prod --self-heal',
        'kubectl get deployment web -n web -w',
      ],
      notes: 'Watch the deployment automatically scale back to 5 replicas within seconds due to self-healing.',
    },
  },
]
