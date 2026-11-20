export type IncidentSeverity = 'critical' | 'high' | 'medium'
export type IncidentCategory =
  | 'runtime'
  | 'networking'
  | 'storage'
  | 'security'
  | 'scheduling'
  | 'configuration'

export interface TroubleshootingIncident {
  id: string
  number: number
  title: string
  severity: IncidentSeverity
  category: IncidentCategory
  symptom: string
  context: string
  targetResource: string
  namespace: string
  brokenManifest: string
  fixedManifest: string
  commandOutputs: Record<string, string[]>
  diagnosisOptions: {
    id: string
    text: string
    isCorrect: boolean
    explanation: string
  }[]
  remediationGuide: string
  postmortemTakeaway: string
  xp: number
}

export const troubleshootingIncidents: TroubleshootingIncident[] = [
  {
    id: 'k8s-fault-crashloop-env',
    number: 1,
    title: 'CrashLoopBackOff: Unhandled Environment Variable in Node.js',
    severity: 'critical',
    category: 'runtime',
    symptom: 'PagerDuty alert: `mern-backend` pods are continually restarting. HTTP 502 Bad Gateway reported by Ingress.',
    context: 'A developer updated the database connection code to require `MONGO_URI` directly on startup without a fallback default. The new deployment rolled out to staging.',
    targetResource: 'deployment/mern-backend',
    namespace: 'staging',
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-backend
  namespace: staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mern-backend
  template:
    metadata:
      labels:
        app: mern-backend
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/mern-api:1.4.1
          ports:
            - containerPort: 5000
          env:
            - name: PORT
              value: "5000"
            # BUG: MONGO_URI was omitted from env!`,
    fixedManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-backend
  namespace: staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mern-backend
  template:
    metadata:
      labels:
        app: mern-backend
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/mern-api:1.4.1
          ports:
            - containerPort: 5000
          env:
            - name: PORT
              value: "5000"
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: mongo-secrets
                  key: connection-string`,
    commandOutputs: {
      'kubectl get pods -n staging': [
        'NAME                            READY   STATUS             RESTARTS      AGE',
        'mern-backend-698d49576c-482fx   0/1     CrashLoopBackOff   5 (85s ago)   3m42s',
        'mern-backend-698d49576c-l8k92   0/1     CrashLoopBackOff   5 (88s ago)   3m42s',
        'mongo-0                         1/1     Running            0             42m',
      ],
      'kubectl logs mern-backend-698d49576c-482fx -n staging': [
        '2026-11-16T20:30:12.112Z [INFO] Initializing Express HTTP server on port 5000...',
        '2026-11-16T20:30:12.155Z [FATAL] Database connection failed!',
        'Error: ConfigurationError: MONGO_URI environment variable is required but was undefined.',
        '    at connectDB (/app/dist/config/db.js:14:15)',
        '    at startServer (/app/dist/server.js:28:9)',
        '[Process terminated with exit code 1]',
      ],
      'kubectl describe pod mern-backend-698d49576c-482fx -n staging': [
        'Name:             mern-backend-698d49576c-482fx',
        'Namespace:        staging',
        'Status:           Running',
        'Containers:',
        '  api:',
        '    Image:         ghcr.io/acme/mern-api:1.4.1',
        '    State:          Waiting',
        '      Reason:       CrashLoopBackOff',
        '    Last State:     Terminated',
        '      Reason:       Error',
        '      Exit Code:    1',
        '      Started:      Mon, 16 Nov 2026 20:30:12 +0000',
        '      Finished:     Mon, 16 Nov 2026 20:30:12 +0000',
        '    Environment:',
        '      PORT:  5000',
        'Events:',
        '  Type     Reason     Age                   From               Message',
        '  ----     ------     ----                  ----               -------',
        '  Normal   Scheduled  4m                    default-scheduler  Successfully assigned staging/mern-backend-698d49576c-482fx to worker-1',
        '  Normal   Pulled     3m55s                 kubelet            Container image "ghcr.io/acme/mern-api:1.4.1" already present on machine',
        '  Normal   Created    3m55s                 kubelet            Created container api',
        '  Normal   Started    3m54s                 kubelet            Started container api',
        '  Warning  BackOff    14s (x12 over 3m40s)  kubelet            Back-off restarting failed container api in pod mern-backend-698d49576c-482fx_staging',
      ],
      'kubectl get events -n staging --sort-by=.metadata.creationTimestamp': [
        '3m55s  Normal   Pulled    pod/mern-backend-698d49576c-482fx  Container image already present',
        '3m54s  Normal   Started   pod/mern-backend-698d49576c-482fx  Started container api',
        '14s    Warning  BackOff   pod/mern-backend-698d49576c-482fx  Back-off restarting failed container',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'The worker node ran out of memory, causing the Linux OOM killer to terminate the pod.',
        isCorrect: false,
        explanation: 'The container exit code is 1 (application exception), not 137 (OOMKilled). Logs explicitly show a missing environment variable error.',
      },
      {
        id: 'd2',
        text: 'The Node.js application process threw an unhandled exception because MONGO_URI was missing from container environment variables.',
        isCorrect: true,
        explanation: 'Logs clearly show `ConfigurationError: MONGO_URI environment variable is required but was undefined`, causing instant process termination with Exit Code 1.',
      },
      {
        id: 'd3',
        text: 'The container image was not found in the container registry.',
        isCorrect: false,
        explanation: 'The describe output shows `Successfully assigned` and `Container image already present on machine`, meaning image pull was successful.',
      },
      {
        id: 'd4',
        text: 'Kubernetes liveness probe failed due to a timeout.',
        isCorrect: false,
        explanation: 'There is no liveness probe failure in events; the container crashed immediately before any probes ran.',
      },
    ],
    remediationGuide: 'Inject the `MONGO_URI` environment variable into the Deployment spec referencing the `mongo-secrets` Kubernetes Secret, or supply a default configuration via ConfigMap.',
    postmortemTakeaway: 'Always validate mandatory environment variables in application initialization with friendly error logs, and enforce manifest schema validation in CI with tools like `kubeconform` to ensure all required secret references are present.',
    xp: 120,
  },

  {
    id: 'k8s-fault-image-pull-backoff',
    number: 2,
    title: 'ImagePullBackOff: Typo in Container Registry Tag',
    severity: 'critical',
    category: 'configuration',
    symptom: 'Deploying release v1.4.2 stalled. New pods remain in ImagePullBackOff or ErrImagePull status.',
    context: 'A release pipeline commit changed the image tag in the production Kustomize overlay, but the release job on the app repo failed before publishing.',
    targetResource: 'deployment/mern-frontend',
    namespace: 'prod',
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-frontend
  namespace: prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mern-frontend
  template:
    metadata:
      labels:
        app: mern-frontend
    spec:
      containers:
        - name: web
          image: ghcr.io/acme/mern-frontend:v1.4.2-relase # Typo: relase vs release
          ports:
            - containerPort: 80`,
    fixedManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-frontend
  namespace: prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mern-frontend
  template:
    metadata:
      labels:
        app: mern-frontend
    spec:
      containers:
        - name: web
          image: ghcr.io/acme/mern-frontend:v1.4.2-release
          ports:
            - containerPort: 80`,
    commandOutputs: {
      'kubectl get pods -n prod': [
        'NAME                             READY   STATUS             RESTARTS   AGE',
        'mern-frontend-85f6797cc7-789wq   0/1     ImagePullBackOff   0          2m14s',
        'mern-frontend-85f6797cc7-bk82n   0/1     ImagePullBackOff   0          2m14s',
        'mern-frontend-54c795d46c-94fx8   1/1     Running            0          18d (old pod)',
        'mern-frontend-54c795d46c-kmz12   1/1     Running            0          18d (old pod)',
      ],
      'kubectl describe pod mern-frontend-85f6797cc7-789wq -n prod': [
        'Name:             mern-frontend-85f6797cc7-789wq',
        'Namespace:        prod',
        'Containers:',
        '  web:',
        '    Image:          ghcr.io/acme/mern-frontend:v1.4.2-relase',
        '    State:          Waiting',
        '      Reason:       ImagePullBackOff',
        'Events:',
        '  Type     Reason   Age                    From     Message',
        '  ----     ------   ----                   ----     -------',
        '  Normal   Scheduled 2m20s                  default-scheduler  Assigned prod/mern-frontend-85f6797cc7-789wq to worker-2',
        '  Normal   Pulling   45s (x4 over 2m18s)   kubelet  Pulling image "ghcr.io/acme/mern-frontend:v1.4.2-relase"',
        '  Warning  Failed    43s (x4 over 2m16s)   kubelet  Failed to pull image "ghcr.io/acme/mern-frontend:v1.4.2-relase": rpc error: code = NotFound desc = failed to pull and unpack image "ghcr.io/acme/mern-frontend:v1.4.2-relase": failed to resolve reference "ghcr.io/acme/mern-frontend:v1.4.2-relase": not found',
        '  Warning  Failed    43s (x4 over 2m16s)   kubelet  Error: ErrImagePull',
        '  Normal   BackOff   18s (x6 over 2m14s)   kubelet  Back-off pulling image "ghcr.io/acme/mern-frontend:v1.4.2-relase"',
      ],
      'kubectl logs mern-frontend-85f6797cc7-789wq -n prod': [
        'Error from server (BadRequest): container "web" in pod "mern-frontend-85f6797cc7-789wq" is waiting to start: trying and failing to pull image',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'The Kubelet cannot pull the image because the specified tag "v1.4.2-relase" does not exist in the container registry (HTTP 404 Not Found).',
        isCorrect: true,
        explanation: 'The describe events state: `failed to resolve reference ... not found`. A typo in the image tag (`relase` instead of `release`) caused the registry lookup to fail.',
      },
      {
        id: 'd2',
        text: 'The worker node does not have sufficient disk space to extract the image.',
        isCorrect: false,
        explanation: 'Disk space issues produce `DiskPressure` or `FailedToExtractImage` events, not `not found`.',
      },
      {
        id: 'd3',
        text: 'The registry secret credentials have expired.',
        isCorrect: false,
        explanation: 'Authentication errors produce `401 Unauthorized` or `403 Forbidden` messages, not `not found`.',
      },
    ],
    remediationGuide: 'Correct the image tag typo in Git or rollback the Git commit. If the image was not built, verify that the CI pipeline successfully pushed the image before merging the GitOps config bump.',
    postmortemTakeaway: 'Always use automated CI tools (like Argo CD Image Updater or GitHub Actions automated tag bumping) that read the actual published SHA rather than manually typing image tags in YAML.',
    xp: 120,
  },

  {
    id: 'k8s-fault-service-selector-mismatch',
    number: 3,
    title: 'Service Routing Failure: Selector Label Mismatch',
    severity: 'high',
    category: 'networking',
    symptom: 'Frontend cannot communicate with backend API. Browser reports `ERR_CONNECTION_REFUSED` when calling `/api/users`. Ingress reports HTTP 503.',
    context: 'The development team refactored deployment labels from `app: mern-api` to `app: api-server` in the Deployment, but forgot to update the corresponding Service manifest.',
    targetResource: 'service/backend-service',
    namespace: 'web',
    brokenManifest: `apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: web
spec:
  ports:
    - port: 5000
      targetPort: 5000
  selector:
    app: mern-api # MISMATCH! Pods are labeled app: api-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: server
          image: ghcr.io/acme/mern-api:1.4.0
          ports:
            - containerPort: 5000`,
    fixedManifest: `apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: web
spec:
  ports:
    - port: 5000
      targetPort: 5000
  selector:
    app: api-server # Corrected selector matching pod label`,
    commandOutputs: {
      'kubectl get pods -n web --show-labels': [
        'NAME                       READY   STATUS    RESTARTS   AGE   LABELS',
        'backend-599c4bd956-6m94k   1/1     Running   0          12m   app=api-server,pod-template-hash=599c4bd956',
        'backend-599c4bd956-w7g4x   1/1     Running   0          12m   app=api-server,pod-template-hash=599c4bd956',
        'frontend-776fd8659-4v9k    1/1     Running   0          12m   app=mern-frontend',
      ],
      'kubectl get svc backend-service -n web': [
        'NAME              TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE',
        'backend-service   ClusterIP   10.96.142.88    <none>        5000/TCP   2d',
      ],
      'kubectl get endpoints backend-service -n web': [
        'NAME              ENDPOINTS   AGE',
        'backend-service   <none>      2d   <-- ZERO ENDPOINTS!',
      ],
      'kubectl describe svc backend-service -n web': [
        'Name:              backend-service',
        'Namespace:         web',
        'Selector:          app=mern-api',
        'Type:              ClusterIP',
        'IP:                10.96.142.88',
        'Port:              <unset>  5000/TCP',
        'TargetPort:        5000/TCP',
        'Endpoints:         <none>    # Notice no pod IPs attached!',
        'Session Affinity:  None',
        'Events:            <none>',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'The backend pods crashed and are not running.',
        isCorrect: false,
        explanation: '`kubectl get pods` clearly shows both backend pods are `Running` and `1/1 Ready`.',
      },
      {
        id: 'd2',
        text: 'The Service selector `app: mern-api` does not match the actual pod labels `app: api-server`, leaving the Service with zero endpoints.',
        isCorrect: true,
        explanation: '`kubectl get endpoints backend-service` returns `<none>` because Kubernetes Service selectors perform an exact equality label match.',
      },
      {
        id: 'd3',
        text: 'CoreDNS is down inside the kube-system namespace.',
        isCorrect: false,
        explanation: 'The problem is not DNS lookup; the Service has a ClusterIP, but has no backing pod Endpoints.',
      },
    ],
    remediationGuide: 'Update the Service manifest `spec.selector` to `app: api-server` so that kube-proxy adds the pod IPs to the EndpointSlice.',
    postmortemTakeaway: 'Always run `kubectl get endpoints <service>` when debugging connection refused errors in Kubernetes. Zero endpoints is almost always caused by a selector mismatch or failing readiness probes.',
    xp: 140,
  },

  {
    id: 'k8s-fault-oom-killed',
    number: 4,
    title: 'OOMKilled: Exit Code 137 (Out Of Memory)',
    severity: 'high',
    category: 'runtime',
    symptom: 'API server periodically drops client connections. Pod restart count is rapidly climbing.',
    context: 'A reporting endpoint exports an unpaginated 500,000 document MongoDB collection into memory. The container has a strict memory limit of 128Mi.',
    targetResource: 'deployment/mern-api',
    namespace: 'prod',
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-api
  namespace: prod
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/mern-api:1.4.0
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi" # Too low for in-memory batch exports!
              cpu: "500m"`,
    fixedManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-api
  namespace: prod
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/mern-api:1.4.0
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"`,
    commandOutputs: {
      'kubectl get pods -n prod': [
        'NAME                        READY   STATUS    RESTARTS      AGE',
        'mern-api-7b8b4c9597-9kdf8   1/1     Running   6 (2m ago)    24m',
        'mern-api-7b8b4c9597-xr4m2   1/1     Running   4 (4m ago)    24m',
      ],
      'kubectl describe pod mern-api-7b8b4c9597-9kdf8 -n prod': [
        'Name:         mern-api-7b8b4c9597-9kdf8',
        'Namespace:    prod',
        'Containers:',
        '  api:',
        '    State:          Running',
        '    Last State:     Terminated',
        '      Reason:       OOMKilled',
        '      Exit Code:    137',
        '      Started:      Mon, 16 Nov 2026 20:25:10 +0000',
        '      Finished:     Mon, 16 Nov 2026 20:27:32 +0000',
        '    Limits:',
        '      cpu:     500m',
        '      memory:  128Mi',
        '    Requests:',
        '      cpu:     100m',
        '      memory:  64Mi',
        'Events:',
        '  Type     Reason     Age                  From               Message',
        '  ----     ------     ----                 ----               -------',
        '  Warning  OOMKilled  2m14s (x6 over 24m)  kernel-cgroup      Task in /kubepods.slice killed as a result of limit exhausted',
      ],
      'kubectl logs mern-api-7b8b4c9597-9kdf8 -n prod --previous': [
        '2026-11-16T20:27:28.120Z [INFO] Processing request GET /api/reports/full-export',
        '2026-11-16T20:27:29.450Z [INFO] Loading 500,000 documents from mongo.orders into memory buffer...',
        '2026-11-16T20:27:31.900Z [INFO] Buffer size: 124MB...',
        'Killed',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'The container exceeded its configured memory limit of 128Mi and was killed with SIGKILL (Exit Code 137 = 128 + 9) by the Linux cgroup OOM killer.',
        isCorrect: true,
        explanation: 'Exit code 137 means 128 + 9 (SIGKILL). `Last State: Terminated, Reason: OOMKilled` confirms the container hit its memory ceiling.',
      },
      {
        id: 'd2',
        text: 'CPU throttling caused the application event loop to freeze.',
        isCorrect: false,
        explanation: 'CPU limits throttle CPU time (CFS bandwidth), but never terminate pods with Exit Code 137 or OOMKilled.',
      },
      {
        id: 'd3',
        text: 'The Node.js process crashed due to an unhandled Promise rejection.',
        isCorrect: false,
        explanation: 'Unhandled promise rejections exit with code 1, not 137 OOMKilled.',
      },
    ],
    remediationGuide: 'Increase container memory limits to 512Mi or 1Gi, and refactor the backend export endpoint to stream documents via Node.js Transform streams instead of buffering into heap memory.',
    postmortemTakeaway: 'Monitor Prometheus metric `container_memory_working_set_bytes` against `kube_pod_container_resource_limits` to trigger proactive alerts at 85% memory utilization before OOM kills occur.',
    xp: 140,
  },

  {
    id: 'k8s-fault-pvc-unbound',
    number: 5,
    title: 'PersistentVolumeClaim Unbound: Non-Existent StorageClass',
    severity: 'high',
    category: 'storage',
    symptom: 'MongoDB pod is stuck indefinitely in `Pending` state. Application backend cannot connect to database.',
    context: 'A manifest copied from an AWS EKS production cluster was applied to a local kind development cluster.',
    targetResource: 'pvc/mongo-data-pvc',
    namespace: 'database',
    brokenManifest: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-data-pvc
  namespace: database
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3-ebs # EKS StorageClass, does NOT exist in local kind cluster!
  resources:
    requests:
      storage: 10Gi`,
    fixedManifest: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-data-pvc
  namespace: database
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard # Default StorageClass in kind / minikube
  resources:
    requests:
      storage: 10Gi`,
    commandOutputs: {
      'kubectl get pods -n database': [
        'NAME      READY   STATUS    RESTARTS   AGE',
        'mongo-0   0/1     Pending   0          8m22s',
      ],
      'kubectl describe pod mongo-0 -n database': [
        'Name:         mongo-0',
        'Namespace:    database',
        'Status:       Pending',
        'Volumes:',
        '  data:',
        '    Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)',
        '    ClaimName:  mongo-data-pvc',
        'Events:',
        '  Type     Reason            Age                 From               Message',
        '  ----     ------            ----                ----               -------',
        '  Warning  FailedScheduling  5m (x6 over 8m22s)  default-scheduler  0/3 nodes are available: 3 pod has unbound immediate PersistentVolumeClaims.',
      ],
      'kubectl get pvc -n database': [
        'NAME             STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE',
        'mongo-data-pvc   Pending                                      gp3-ebs        8m45s',
      ],
      'kubectl describe pvc mongo-data-pvc -n database': [
        'Name:          mongo-data-pvc',
        'Namespace:     database',
        'StorageClass:  gp3-ebs',
        'Status:        Pending',
        'Events:',
        '  Type     Reason               Age                 From                         Message',
        '  ----     ------               ----                ----                         -------',
        '  Warning  ProvisioningFailed   45s (x10 over 8m)   persistentvolume-controller  storageclass.storage.k8s.io "gp3-ebs" not found',
      ],
      'kubectl get sc': [
        'NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE',
        'standard (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  42d',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'The node disk is full.',
        isCorrect: false,
        explanation: 'The volume was never provisioned because the specified StorageClass does not exist.',
      },
      {
        id: 'd2',
        text: 'The PVC requested StorageClass "gp3-ebs", which does not exist in this cluster (available class is "standard").',
        isCorrect: true,
        explanation: 'The PVC describe events explicitly state: `storageclass.storage.k8s.io "gp3-ebs" not found`.',
      },
      {
        id: 'd3',
        text: 'The namespace quota for persistent storage was exceeded.',
        isCorrect: false,
        explanation: 'Resource quota rejections produce a `Forbidden: exceeded quota` error at admission time.',
      },
    ],
    remediationGuide: 'Change `storageClassName: standard` in the PVC manifest, or omit `storageClassName` to automatically adopt the cluster default StorageClass.',
    postmortemTakeaway: 'Use Kustomize overlays or Helm values to parameterize environment-specific infrastructure values (such as `storageClassName`), keeping base manifests storage-provider agnostic.',
    xp: 140,
  },

  {
    id: 'k8s-fault-readiness-probe-path',
    number: 6,
    title: 'Traffic Blackhole: Readiness Probe Path 404',
    severity: 'high',
    category: 'networking',
    symptom: 'Deploy rolled out successfully according to `kubectl get deploy`, but all live traffic is dropped. Service returns 503.',
    context: 'The readiness probe was configured to check `/healthz`, but the Express developer mounted the health router at `/api/health`.',
    targetResource: 'deployment/mern-api',
    namespace: 'prod',
    brokenManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-api
  namespace: prod
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/mern-api:1.4.0
          readinessProbe:
            httpGet:
              path: /healthz # BUG! Server listens at /api/health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5`,
    fixedManifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-api
  namespace: prod
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/mern-api:1.4.0
          readinessProbe:
            httpGet:
              path: /api/health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5`,
    commandOutputs: {
      'kubectl get pods -n prod': [
        'NAME                        READY   STATUS    RESTARTS   AGE',
        'mern-api-6b75965478-4k9m1   0/1     Running   0          6m12s',
        'mern-api-6b75965478-8v2k7   0/1     Running   0          6m12s',
        'mern-api-6b75965478-p8dx3   0/1     Running   0          6m12s',
      ],
      'kubectl describe pod mern-api-6b75965478-4k9m1 -n prod': [
        'Name:         mern-api-6b75965478-4k9m1',
        'Namespace:    prod',
        'Containers:',
        '  api:',
        '    Ready:          False',
        '    Readiness:      http-get http://:5000/healthz delay=5s timeout=1s period=5s #success=1 #failure=3',
        'Events:',
        '  Type     Reason     Age                   From     Message',
        '  ----     ------     ----                  ----     -------',
        '  Normal   Started    6m                    kubelet  Started container api',
        '  Warning  Unhealthy  12s (x70 over 5m55s)  kubelet  Readiness probe failed: HTTP probe failed with statuscode: 404',
      ],
      'kubectl get endpoints mern-api-service -n prod': [
        'NAME               ENDPOINTS   AGE',
        'mern-api-service   <none>      45d   <-- Pods are unready, so endpoints are purged!',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'The container has crashed and is not accepting socket connections.',
        isCorrect: false,
        explanation: 'Status is `Running`, and the probe received an actual HTTP 404 response from Express, proving the process is up and listening.',
      },
      {
        id: 'd2',
        text: 'The readiness probe is querying /healthz, but the application responds with HTTP 404 because the endpoint does not exist. Kubernetes marks pods unready and removes them from Service endpoints.',
        isCorrect: true,
        explanation: '`Readiness probe failed: HTTP probe failed with statuscode: 404`. When readiness fails, Kubernetes isolates the pod from Service traffic.',
      },
      {
        id: 'd3',
        text: 'The Service port is incorrectly mapped.',
        isCorrect: false,
        explanation: 'The probe is performed directly by the node kubelet against the container IP, not through the Service.',
      },
    ],
    remediationGuide: 'Update `spec.template.spec.containers[0].readinessProbe.httpGet.path` to match the actual API endpoint `/api/health`.',
    postmortemTakeaway: 'Distinguish readiness probes (which remove pods from endpoints) from liveness probes (which restart containers). Never configure liveness probes on endpoints that depend on external services like databases.',
    xp: 140,
  },

  {
    id: 'k8s-fault-network-policy-blocked',
    number: 7,
    title: 'NetworkPolicy Isolation: Database Port Blocked',
    severity: 'critical',
    category: 'security',
    symptom: 'After applying a security baseline, the backend API logs `MongooseServerSelectionError: connection timed out to mongo:27017`.',
    context: 'A DevSecOps engineer deployed a `default-deny-all` NetworkPolicy to the `database` namespace without adding an ingress allow rule for pods with label `app: mern-api`.',
    targetResource: 'networkpolicy/default-deny-ingress',
    namespace: 'database',
    brokenManifest: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: database
spec:
  podSelector: {}
  policyTypes:
    - Ingress # Blocks ALL incoming traffic to all pods in database namespace!`,
    fixedManifest: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-backend-to-mongo
  namespace: database
spec:
  podSelector:
    matchLabels:
      app: mongo
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: web
          podSelector:
            matchLabels:
              app: mern-api
      ports:
        - protocol: TCP
          port: 27017`,
    commandOutputs: {
      'kubectl get networkpolicies -n database': [
        'NAME               POD-SELECTOR   AGE',
        'default-deny-all   <none>         15m',
      ],
      'kubectl describe networkpolicy default-deny-all -n database': [
        'Name:         default-deny-all',
        'Namespace:    database',
        'Spec:',
        '  PodSelector:     <none> (Selects all pods in namespace)',
        '  Allowing ingress traffic:',
        '    <none> (Denies all ingress traffic)',
        '  PolicyTypes: Ingress',
      ],
      'kubectl exec -n web deployment/mern-api -- nc -zv -w 3 mongo.database.svc.cluster.local 27017': [
        'nc: connect to mongo.database.svc.cluster.local port 27017 (tcp) timed out: Operation now in progress',
      ],
    },
    diagnosisOptions: [
      {
        id: 'd1',
        text: 'MongoDB crashed and stopped listening on port 27017.',
        isCorrect: false,
        explanation: '`kubectl get pods -n database` shows mongo is Running and Ready.',
      },
      {
        id: 'd2',
        text: 'A default-deny Ingress NetworkPolicy in the database namespace is silently dropping all incoming TCP packets on port 27017.',
        isCorrect: true,
        explanation: 'Kubernetes NetworkPolicies implement silent packet drops when ingress is denied, causing connection timeouts.',
      },
      {
        id: 'd3',
        text: 'DNS failed to resolve the mongo service hostname.',
        isCorrect: false,
        explanation: 'The `nc` output shows DNS resolved the FQDN to an IP address, but the subsequent TCP handshake timed out.',
      },
    ],
    remediationGuide: 'Apply an ingress NetworkPolicy rule explicitly permitting ingress traffic on TCP port 27017 from the `web` namespace and `app: mern-api` pods.',
    postmortemTakeaway: 'Always pair default-deny NetworkPolicies with explicit allow rules for authorized service dependencies before applying them in shared environments.',
    xp: 150,
  },
]
