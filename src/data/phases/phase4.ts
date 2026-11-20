import type { AcademyPhase } from '../types'

export const phase4: AcademyPhase = {
  "id": "phase4",
  "number": 4,
  "title": "Kubernetes Architecture & GitOps Runtime",
  "subtitle": "Production Container Orchestration & Cloud Native Operations",
  "description": "Master Kubernetes from the ground up: control plane internals, production workload deployment, multi-tier networking, persistent storage, advanced autoscaling & scheduling, and modern GitOps tooling with Helm and Kustomize.",
  "icon": "☸️",
  "difficulty": "intermediate",
  "color": "#326CE5",
  "modules": [
    {
      "id": "k8s-architecture",
      "title": "Kubernetes Architecture",
      "description": "Unpack the internal anatomy of Kubernetes: explore the distributed control plane, worker node agents, the declarative API machinery, and local cluster setup for MERN applications.",
      "icon": "🏛️",
      "difficulty": "intermediate",
      "estimatedHours": 4,
      "lessons": [
        {
          "id": "k8s-control-plane",
          "title": "Control Plane Deep Dive",
          "summary": "Explore the brain of Kubernetes: kube-apiserver, etcd, kube-scheduler, and kube-controller-manager, and understand how they coordinate to maintain desired state.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "what-is-gitops",
            "declarative-vs-imperative"
          ],
          "objectives": [
            {
              "text": "Deconstruct each component of the Kubernetes control plane and its primary responsibility",
              "skill": "k8s-architecture"
            },
            {
              "text": "Trace the lifecycle of a deployment request from kubectl submission to etcd persistence",
              "skill": "request-flow"
            },
            {
              "text": "Understand Raft consensus, etcd quorum mechanics, and split-brain prevention",
              "skill": "distributed-systems"
            },
            {
              "text": "Identify the role of kube-controller-manager loops in maintaining desired state for MERN workloads",
              "skill": "controllers"
            }
          ],
          "sections": [
            {
              "title": "The Brain of the Cluster: High-Level Overview",
              "level": "beginner",
              "content": "Kubernetes is a distributed system designed around a centralized **Control Plane** and a fleet of **Worker Nodes**. The control plane makes global decisions about the cluster (such as scheduling pods), detects and responds to cluster events (such as starting a new pod when a deployment replica count is unmet), and maintains the canonical single source of truth for all cluster resources.\n\nThe control plane consists of four core components:\n1. **kube-apiserver**: The front door of the control plane. It exposes the Kubernetes HTTP/JSON API, validates and configures data for pods, services, and replication controllers, and acts as the only component that directly talks to the datastore.\n2. **etcd**: A consistent, highly available distributed key-value store that stores the persistent state and configuration data of the entire cluster.\n3. **kube-scheduler**: A control plane component that watches for newly created Pods with no assigned node, and selects an optimal node for them to run on based on resource requirements, constraints, and affinity rules.\n4. **kube-controller-manager**: A daemon that embeds core control loops (such as the Node Lifecycle Controller, ReplicaSet Controller, EndpointSlice Controller, and ServiceAccount Controller). Each controller constantly compares current state against desired state."
            },
            {
              "title": "Deep Dive: kube-apiserver & etcd Consensus",
              "level": "intermediate",
              "content": "### kube-apiserver: The Gateway and State Gatekeeper\nThe `kube-apiserver` is stateless and horizontally scalable behind a load balancer. When a developer or GitOps operator runs `kubectl apply -f mern-backend-deploy.yaml`, the request flows through a strict multi-stage pipeline:\n1. **Authentication**: Identifies the caller (via X.509 client certs, OpenID Connect JWT tokens, or ServiceAccount bearer tokens).\n2. **Authorization**: Evaluates whether the authenticated identity has permission to perform the requested verb (`create`, `update`, `delete`) on the target resource using RBAC (Role-Based Access Control).\n3. **Mutating Admission Webhooks**: Allows admission controllers to modify the request (e.g., injecting sidecars, setting default resource limits).\n4. **Schema Validation**: Validates the payload against OpenAPI / JSON schemas.\n5. **Validating Admission Webhooks**: Validates business logic and policies (e.g., Gatekeeper/OPA or Kyverno policies prohibiting root containers).\n6. **Persistence**: Writes the validated object to `etcd`.\n\n```\n[ Client / GitOps ] ──HTTP/REST──▶ [ Authentication ]\n                                            │\n                                            ▼\n                                   [ Authorization (RBAC) ]\n                                            │\n                                            ▼\n                                [ Mutating Webhooks ]\n                                            │\n                                            ▼\n                                  [ Schema Validation ]\n                                            │\n                                            ▼\n                               [ Validating Webhooks ]\n                                            │\n                                            ▼\n                                  [ Write to etcd ]\n```\n\n### etcd: Raft Consensus and Quorum\n`etcd` implements the **Raft consensus algorithm** to guarantee strong consistency (linearizable reads and writes). In production, etcd runs in odd-numbered clusters (typically 3 or 5 members).\n- **Quorum formula**: To survive failures, a cluster of size $N$ requires a quorum of $\\lfloor N/2 \\rfloor + 1$ members.\n- A 3-node etcd cluster can tolerate $3 - 2 = 1$ failure.\n- A 5-node etcd cluster can tolerate $5 - 3 = 2$ failures.\n- **Why odd numbers?** A 4-node cluster also requires 3 nodes for quorum ($\\lfloor 4/2 \\rfloor + 1 = 3$), meaning it still only tolerates 1 failure while adding network overhead and failure surface.\n\netcd uses Multi-Version Concurrency Control (MVCC) where every modification increments a 64-bit revision counter. Controllers can establish HTTP/2 streaming **watchers** to receive real-time streams of resource modifications without polling."
            },
            {
              "title": "kube-scheduler & kube-controller-manager in Action",
              "level": "advanced",
              "content": "### The Lifecycle of a MERN Backend Deployment\nLet us trace what happens when we deploy our Express backend (`mern-backend`):\n\n1. **Submission**: `kubectl apply` submits the Deployment manifest with `spec.replicas: 3` to `kube-apiserver`.\n2. **Commit**: The API server authenticates, validates, and writes the Deployment object to etcd.\n3. **Deployment Controller**: Watching the API server, the Deployment Controller notices a new Deployment. It creates a **ReplicaSet** object specifying 3 desired pod replicas.\n4. **ReplicaSet Controller**: The ReplicaSet Controller sees the ReplicaSet and creates 3 **Pod** objects in `Pending` state with `spec.nodeName` empty.\n5. **kube-scheduler**:\n   - **Filtering Phase (Predicates)**: Filters out nodes that do not satisfy CPU/Memory requests, nodeSelectors, taints, or port requirements.\n   - **Scoring Phase (Priorities)**: Ranks remaining candidate nodes based on resource balancing (LeastRequestedPriority), pod anti-affinity (spreading replicas across failure zones), and image locality.\n   - **Binding Phase**: Writes a `Binding` object to the API server, setting `spec.nodeName` to the winning worker node (e.g., `worker-node-1`).\n6. **Execution**: The `kubelet` daemon running on `worker-node-1` detects the pod assignment and directs the container runtime to launch the containers."
            }
          ],
          "commands": [
            {
              "command": "kubectl get componentstatuses",
              "description": "Check the health status of control plane components (scheduler, controller-manager, etcd)",
              "example": "kubectl get componentstatuses",
              "output": "NAME                 STATUS    MESSAGE             ERROR\nscheduler            Healthy   ok                  \ncontroller-manager   Healthy   ok                  \netcd-0               Healthy   {\"health\":\"true\"}   ",
              "whenToUse": "Quick health verification of self-hosted control plane components"
            },
            {
              "command": "kubectl get pods -n kube-system",
              "description": "List the static pods running the Kubernetes control plane infrastructure",
              "flags": [
                {
                  "flag": "-n kube-system",
                  "description": "Filter resources by the core system namespace"
                },
                {
                  "flag": "-o wide",
                  "description": "Display additional details including node placement and IP"
                }
              ],
              "example": "kubectl get pods -n kube-system -o wide",
              "output": "NAME                                      READY   STATUS    RESTARTS   AGE   IP             NODE\netcd-control-plane                        1/1     Running   0          42d   192.168.1.10   control-plane\nkube-apiserver-control-plane              1/1     Running   0          42d   192.168.1.10   control-plane\nkube-controller-manager-control-plane     1/1     Running   0          42d   192.168.1.10   control-plane\nkube-scheduler-control-plane              1/1     Running   0          42d   192.168.1.10   control-plane",
              "whenToUse": "Inspect running control plane pods on a kubeadm or kind cluster"
            },
            {
              "command": "kubectl get --raw /livez",
              "description": "Query the API server direct health endpoint using the raw REST path",
              "example": "kubectl get --raw /livez?verbose",
              "output": "[+]ping ok\n[+]log ok\n[+]etcd ok\n[+]poststarthook/start-kube-apiserver-admission-initializer ok\nlivez check passed",
              "whenToUse": "Troubleshoot API server availability and internal sub-system health"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "kube-apiserver-static-pod.yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: kube-apiserver\n  namespace: kube-system\n  labels:\n    component: kube-apiserver\n    tier: control-plane\nspec:\n  hostNetwork: true\n  containers:\n  - name: kube-apiserver\n    image: registry.k8s.io/kube-apiserver:v1.30.0\n    command:\n    - kube-apiserver\n    - --advertise-address=192.168.1.10\n    - --allow-privileged=true\n    - --authorization-mode=Node,RBAC\n    - --client-ca-file=/etc/kubernetes/pki/ca.crt\n    - --enable-admission-plugins=NodeRestriction,LimitRanger,ResourceQuota\n    - --etcd-servers=https://127.0.0.1:2379\n    - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt\n    - --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt\n    - --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key\n    - --service-cluster-ip-range=10.96.0.0/12\n    livenessProbe:\n      httpGet:\n        path: /livez\n        port: 6443\n        scheme: HTTPS\n      initialDelaySeconds: 10\n      periodSeconds: 10\n    volumeMounts:\n    - mountPath: /etc/kubernetes/pki\n      name: k8s-certs\n      readOnly: true\n  volumes:\n  - hostPath:\n      path: /etc/kubernetes/pki\n      type: DirectoryOrCreate\n    name: k8s-certs",
              "explanation": "A declarative static pod definition for the kube-apiserver showing secure etcd connection parameters, admission plugins, and TLS certificate bindings."
            }
          ],
          "quiz": [
            {
              "id": "k8s-cp-q1",
              "type": "multiple-choice",
              "question": "Which control plane component directly interacts with the etcd database?",
              "options": [
                "kube-scheduler",
                "kube-controller-manager",
                "kube-apiserver",
                "kubelet"
              ],
              "correctAnswer": "kube-apiserver",
              "explanation": "Only kube-apiserver directly communicates with etcd. All other components (scheduler, controller manager, kubelet) read and write cluster state exclusively through the API server.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-cp-q2",
              "type": "multiple-choice",
              "question": "In a 5-node etcd cluster, what is the minimum number of healthy nodes required to form quorum and accept writes?",
              "options": [
                "2 nodes",
                "3 nodes",
                "4 nodes",
                "5 nodes"
              ],
              "correctAnswer": "3 nodes",
              "explanation": "Quorum is calculated as floor(N/2) + 1. For N=5, floor(5/2) + 1 = 2 + 1 = 3. If 3 nodes are alive, the cluster can elect a leader and commit writes.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "kubectl commands fail with \"Error from server (Timeout): context deadline exceeded\" and API server logs report \"etcdserver: request timed out\".",
              "cause": "etcd disk write latency is exceeding acceptable thresholds (typically >10ms fsync latency) or network partition caused etcd to lose quorum leader election.",
              "diagnosis": [
                "Run: etcdctl endpoint status --write-out=table to verify leader election and raft index",
                "Check disk write latency on etcd nodes: fio --name=test --size=100m --filename=/var/lib/etcd/test --bs=4k --ioengine=sync --fdatasync=1",
                "Inspect etcd container logs: kubectl logs -n kube-system etcd-control-plane --tail=100 | grep -i \"took too long\""
              ],
              "solution": "Ensure etcd is hosted on dedicated fast NVMe/SSD storage with high IOPS. Increase CPU/memory allocation and tune --heartbeat-interval=250 and --election-timeout=1250 if running in high-latency network environments.",
              "prevention": "Monitor etcd disk sync duration metrics (etcd_disk_wal_fsync_duration_seconds_bucket) via Prometheus alerts, and separate etcd storage from application persistent volumes."
            }
          ],
          "keyTakeaways": [
            "kube-apiserver is the single stateless entrypoint and the only component communicating directly with etcd.",
            "etcd guarantees strong consistency using Raft consensus, requiring (N/2)+1 nodes for quorum.",
            "The scheduler assigns pods to nodes in two stages: Filtering (predicates) and Scoring (priorities).",
            "kube-controller-manager runs discrete control loops that reconcile observed cluster state back to desired state."
          ],
          "bestPractices": [
            "Always run an odd number of etcd members (3 or 5) across distinct failure domains and availability zones.",
            "Isolate etcd onto dedicated SSDs to guarantee fsync latencies remain below 10ms.",
            "Enable NodeRestriction and ResourceQuota admission controllers on kube-apiserver for security."
          ],
          "securityConsiderations": [
            "Enforce mutual TLS (mTLS) for all control plane communication (API server to etcd, API server to kubelet).",
            "Encrypt etcd data at rest using an EncryptionConfiguration provider with AWS KMS, GCP KMS, or HashiCorp Vault."
          ],
          "commonMistakes": [
            "Deploying an even number of etcd nodes (e.g. 4 nodes), which increases failure risk without increasing fault tolerance.",
            "Treating the control plane as a place to run application pods without dedicated node taints."
          ],
          "interviewQuestions": [
            "What happens under the hood between running \"kubectl apply -f deployment.yaml\" and the pod actually running on a worker node?",
            "Why does etcd require an odd number of nodes, and what happens when an etcd cluster loses quorum?"
          ],
          "references": [
            {
              "title": "Kubernetes Components Overview",
              "url": "https://kubernetes.io/docs/concepts/overview/components/",
              "type": "documentation",
              "description": "Official Kubernetes documentation detailing the architecture of control plane and worker nodes.",
              "difficulty": "beginner",
              "priority": "required"
            },
            {
              "title": "Operating etcd Clusters for Kubernetes",
              "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/",
              "type": "documentation",
              "description": "Production operational guide for scaling, backing up, and tuning etcd.",
              "difficulty": "advanced",
              "priority": "recommended"
            }
          ],
          "connectsTo": [
            "k8s-worker-nodes",
            "k8s-api-primitives"
          ]
        },
        {
          "id": "k8s-worker-nodes",
          "title": "Worker Nodes",
          "summary": "Inspect the components running on worker nodes: Kubelet, Kube-proxy, and the Container Runtime, and trace how pods are scheduled and executed.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-control-plane"
          ],
          "objectives": [
            {
              "text": "Master the role of the Kubelet node agent and its reconciliation loop",
              "skill": "kubelet"
            },
            {
              "text": "Understand the Container Runtime Interface (CRI) and containerd architecture",
              "skill": "container-runtimes"
            },
            {
              "text": "Differentiate kube-proxy packet routing modes: iptables, IPVS, and eBPF",
              "skill": "kube-proxy"
            },
            {
              "text": "Trace the Pod creation workflow across Kubelet, CRI, and CNI plugins",
              "skill": "pod-lifecycle"
            }
          ],
          "sections": [
            {
              "title": "Worker Node Architecture",
              "level": "beginner",
              "content": "Worker nodes are the workhorses of a Kubernetes cluster. While the control plane manages the cluster state, worker nodes host the actual containerized applications—such as our Express API backend (`mern-backend`), React client (`mern-frontend`), and MongoDB database (`mern-mongo`).\n\nEvery worker node runs three fundamental software components:\n1. **kubelet**: The primary node agent that registers the node with the API server, watches for PodSpecs assigned to its node, and ensures the described containers are running and healthy.\n2. **Container Runtime (CRI)**: The software responsible for pulling images, allocating namespaces, and executing containers (e.g., `containerd`, `CRI-O`).\n3. **kube-proxy**: A network proxy that maintains network rules on nodes. These network rules allow network communication to your Pods from network sessions inside or outside of your cluster."
            },
            {
              "title": "Kubelet Internals and CRI Interaction",
              "level": "intermediate",
              "content": "### How Kubelet Manages Containers via CRI\nThe `kubelet` does not directly execute Docker or containerd commands. Instead, it communicates with the runtime over a local Unix domain socket using gRPC defined by the **Container Runtime Interface (CRI)**.\n\nThe CRI separates responsibilities into two gRPC services:\n- **RuntimeService**: Handles container lifecycle management (creating pods sandbox, starting/stopping containers, exec, attach).\n- **ImageService**: Handles pulling, inspecting, and deleting container images.\n\nWhen the scheduler assigns a pod to a node by setting `spec.nodeName`:\n1. **Watch Event**: The kubelet's sync loop detects the assigned pod via an API server watch stream.\n2. **RunPodSandbox**: Kubelet calls CRI `RunPodSandbox` to create the network namespace and IPC namespace for the pod.\n3. **CNI Invocation**: The runtime calls the **Container Network Interface (CNI)** plugin (e.g., Calico, Cilium, AWS VPC CNI) to allocate an IP address and configure the virtual ethernet pair (`veth`).\n4. **PullImage**: Kubelet requests CRI `PullImage` for each container specified in the pod spec (e.g., `node:20-alpine` for Express).\n5. **CreateContainer & StartContainer**: The runtime invokes low-level OCI runtimes (like `runc`) to create cgroups, apply security profiles (AppArmor/seccomp), and start the container process.\n6. **Probing**: Kubelet continuously executes configured liveness and readiness probes, reporting status back to the API server."
            },
            {
              "title": "kube-proxy: iptables vs IPVS vs eBPF",
              "level": "advanced",
              "content": "`kube-proxy` provides the implementation of the Kubernetes **Service** abstraction on each node. It programs the Linux kernel packet filtering engine so that traffic sent to a virtual Service ClusterIP is translated to one of the backing Pod IPs.\n\n### Modes of kube-proxy:\n1. **iptables Mode (Default in many clusters)**:\n   - kube-proxy creates chains of `iptables` rules in the `nat` table.\n   - For every Service, it appends rules; for $N$ backing Pods, it creates rules with random probability weights to achieve pseudo-round-robin load balancing.\n   - *Limitation*: iptables evaluation is sequential ($O(N)$). When a cluster scales to thousands of services and endpoints, packet traversal latency spikes and updating rules takes seconds or minutes.\n\n2. **IPVS Mode (IP Virtual Server)**:\n   - Uses the Linux kernel IPVS transport-layer load balancer.\n   - Organizes endpoints in Netfilter hash tables ($O(1)$ lookup time regardless of cluster size).\n   - Supports advanced load-balancing algorithms: least-connection, weighted round-robin, source hashing.\n\n3. **eBPF (Next-Gen: Cilium / Calico eBPF)**:\n   - Completely replaces kube-proxy by attaching bytecode programs directly to network sockets and tc (traffic control) hooks.\n   - Bypasses the entire Netfilter / iptables stack for near-native wire speed and zero-overhead observability."
            }
          ],
          "commands": [
            {
              "command": "kubectl describe node <node-name>",
              "description": "View detailed worker node specifications, conditions, allocatable resources, and running pods",
              "example": "kubectl describe node worker-1",
              "output": "Conditions:\n  Type             Status  Reason\n  Ready            True    KubeletReady\n  MemoryPressure   False   KubeletHasSufficientMemory\n  DiskPressure     False   KubeletHasNoDiskPressure\nAllocatable:\n  cpu:     3800m\n  memory:  15340Mi\n  pods:    110",
              "whenToUse": "Diagnosing node readiness, resource exhaustion, or kubelet conditions"
            },
            {
              "command": "crictl ps",
              "description": "List active containers managed by the Container Runtime Interface on the worker node",
              "example": "sudo crictl ps",
              "output": "CONTAINER   IMAGE            CREATED       STATE     NAME           ATTEMPT   POD ID\na1b2c3d4    ghcr.io/org/backend  2 hours ago   Running   mern-backend   0         e5f6g7h8",
              "whenToUse": "Direct container debugging on a worker node when kubectl exec or logs is unresponsive"
            },
            {
              "command": "iptables -t nat -L KUBE-SERVICES -n -v",
              "description": "Inspect the iptables NAT chains generated by kube-proxy for Kubernetes Services",
              "example": "sudo iptables -t nat -L KUBE-SERVICES -n -v | head -n 15",
              "output": "Chain KUBE-SERVICES (2 references)\n pkts bytes target          prot opt in  out   source      destination\n    0     0 KUBE-SVC-NP5L   tcp  --  *   *     0.0.0.0/0   10.96.142.12  /* default/mern-backend */ tcp dpt:5000",
              "whenToUse": "Debugging Service routing and packet loss at the host network layer"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "kubelet-config.yaml",
              "code": "apiVersion: kubelet.config.k8s.io/v1beta1\nkind: KubeletConfiguration\naddress: \"0.0.0.0\"\nport: 10250\nreadOnlyPort: 0\ncgroupDriver: \"systemd\"\ncontainerRuntimeEndpoint: \"unix:///run/containerd/containerd.sock\"\nmaxPods: 110\nevictionHard:\n  memory.available: \"250Mi\"\n  nodefs.available: \"10%\"\n  nodefs.inodesFree: \"5%\"\n  imagefs.available: \"15%\"\nsystemReserved:\n  cpu: \"200m\"\n  memory: \"512Mi\"\nkubeReserved:\n  cpu: \"100m\"\n  memory: \"256Mi\"",
              "explanation": "Production KubeletConfiguration enforcing systemd cgroup driver, container eviction thresholds, and reserving CPU and memory for the OS and Kubernetes daemons."
            }
          ],
          "quiz": [
            {
              "id": "k8s-node-q1",
              "type": "multiple-choice",
              "question": "What interface does Kubelet use to communicate with container runtimes such as containerd?",
              "options": [
                "CNI (Container Network Interface)",
                "CRI (Container Runtime Interface)",
                "CSI (Container Storage Interface)",
                "OCI (Open Container Initiative)"
              ],
              "correctAnswer": "CRI (Container Runtime Interface)",
              "explanation": "Kubelet uses the gRPC-based Container Runtime Interface (CRI) to manage container lifecycles and images. CNI is for networking, and CSI is for persistent storage.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-node-q2",
              "type": "multiple-choice",
              "question": "Why does IPVS mode in kube-proxy perform significantly better than iptables in large clusters?",
              "options": [
                "IPVS encrypts all traffic using WireGuard",
                "IPVS uses O(1) hash tables whereas iptables evaluates sequential rules in O(N) time",
                "IPVS bypasses the Linux kernel entirely",
                "IPVS runs inside user-space rather than kernel-space"
              ],
              "correctAnswer": "IPVS uses O(1) hash tables whereas iptables evaluates sequential rules in O(N) time",
              "explanation": "iptables rules are evaluated sequentially ($O(N)$), leading to latency spikes as services scale. IPVS organizes endpoints in Netfilter hash tables, providing constant-time ($O(1)$) lookups.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Worker node condition displays \"NotReady\" and kubectl get nodes reports status \"NotReady\". Pods on that node enter \"Terminating\" or \"Unknown\" status.",
              "cause": "The kubelet process crashed, ran out of memory, or lost network connectivity to the API server; alternatively, containerd runtime socket is unresponsive.",
              "diagnosis": [
                "Check kubelet service status: systemctl status kubelet",
                "Check kubelet journal logs: journalctl -u kubelet -n 100 -e --no-pager",
                "Check containerd status: systemctl status containerd && sudo crictl info"
              ],
              "solution": "Restart containerd and kubelet: sudo systemctl restart containerd && sudo systemctl restart kubelet. Verify disk space on /var/lib/kubelet and root volume.",
              "prevention": "Configure systemReserved and kubeReserved in KubeletConfiguration to prevent application pods from starving the host OS and Kubelet of memory and CPU."
            }
          ],
          "keyTakeaways": [
            "Kubelet is the node agent ensuring containers match their PodSpecs and executing health probes.",
            "CRI abstracts the container runtime, communicating via gRPC over a local Unix socket.",
            "kube-proxy programs the host kernel (via iptables or IPVS) to route virtual ClusterIP traffic to actual Pod IPs.",
            "Pod creation coordinates Kubelet, CRI for container isolation, and CNI for network interface provisioning."
          ],
          "bestPractices": [
            "Always align the container runtime cgroup driver with the init system (use systemd for both).",
            "Configure system-reserved and kube-reserved allocations to protect worker node stability.",
            "Adopt IPVS or eBPF (Cilium) over iptables when clusters exceed 1,000 services."
          ],
          "securityConsiderations": [
            "Disable the Kubelet read-only port (readOnlyPort: 0) to prevent unauthenticated information disclosure.",
            "Enable anonymous-auth: false and webhook authorization on the Kubelet 10250 API port."
          ],
          "commonMistakes": [
            "Mismatching cgroup drivers between Docker/containerd (cgroupfs) and Kubelet (systemd), causing kubelet crashloops.",
            "Allowing application pods to consume 100% of node memory without setting eviction thresholds."
          ],
          "interviewQuestions": [
            "What is the difference between CRI, CNI, and CSI?",
            "How does kube-proxy handle load balancing across pods, and why does iptables scale poorly at massive scale?"
          ],
          "references": [
            {
              "title": "Kubernetes Node Overview",
              "url": "https://kubernetes.io/docs/concepts/architecture/nodes/",
              "type": "documentation",
              "description": "Official documentation on node components, status, and management.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-api-primitives",
            "k8s-pods",
            "k8s-services"
          ]
        },
        {
          "id": "k8s-api-primitives",
          "title": "The Kubernetes API",
          "summary": "Understand the declarative API machinery: API groups, Group-Version-Resource (GVR), OpenAPI schemas, and the self-healing reconciliation loops.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-control-plane",
            "k8s-worker-nodes"
          ],
          "objectives": [
            {
              "text": "Deconstruct Group-Version-Resource (GVR) and Group-Version-Kind (GVK) conventions",
              "skill": "api-machinery"
            },
            {
              "text": "Understand declarative state vs imperative instructions",
              "skill": "declarative-config"
            },
            {
              "text": "Master the mechanics of Kubernetes reconciliation control loops (Observe -> Diff -> Act)",
              "skill": "reconciliation"
            },
            {
              "text": "Explain level-triggered vs edge-triggered architecture and self-healing",
              "skill": "control-theory"
            }
          ],
          "sections": [
            {
              "title": "The Structure of the Kubernetes API",
              "level": "beginner",
              "content": "Everything in Kubernetes is an API resource. Unlike imperative systems where you tell the server *what to do* (e.g., \"start container, configure IP, mount disk\"), Kubernetes is strictly **declarative**: you describe the *desired end state* of the system in YAML or JSON, and Kubernetes works autonomously to make reality match that description.\n\nEvery Kubernetes manifest begins with four mandatory root fields:\n1. `apiVersion`: The API group and version of the resource schema (e.g., `apps/v1` or `v1`).\n2. `kind`: The type of resource being created (e.g., `Deployment`, `Service`, `Pod`).\n3. `metadata`: Identifying metadata (name, namespace, labels, annotations).\n4. `spec`: The desired state of the resource (what containers to run, replicas, ports)."
            },
            {
              "title": "GVK and GVR: Navigating API Groups",
              "level": "intermediate",
              "content": "To allow Kubernetes to evolve its API without breaking existing deployments, resources are organized into **API Groups** and **Versions**.\n\n### GVK (Group, Version, Kind) vs GVR (Group, Version, Resource)\n- **GVK**: Used in YAML manifests to identify the schema.\n  - Group: `apps`\n  - Version: `v1`\n  - Kind: `Deployment`\n- **GVR**: The REST endpoint path exposed by `kube-apiserver`.\n  - Group: `apps`\n  - Version: `v1`\n  - Resource: `deployments` (plural, lowercase)\n  - REST Path: `/apis/apps/v1/namespaces/{namespace}/deployments`\n\n### Core API Group vs Named API Groups\n- **Core Group** (empty group string `\"\"`): Legacy core primitives (Pods, Services, Namespaces, ConfigMaps, Secrets, PersistentVolumes). In YAML, their `apiVersion` is simply `v1`.\n- **Named Groups**: Grouped by domain:\n  - `apps/v1`: Deployments, StatefulSets, DaemonSets, ReplicaSets.\n  - `batch/v1`: Jobs, CronJobs.\n  - `networking.k8s.io/v1`: Ingress, NetworkPolicy.\n  - `storage.k8s.io/v1`: StorageClass, CSIDriver."
            },
            {
              "title": "The Reconciliation Loop: Level-Triggered Self-Healing",
              "level": "advanced",
              "content": "The engine driving Kubernetes is the **Reconciliation Loop** (or control loop). In classical control theory, this is a feedback loop that continually operates:\n\n```\n   ┌───────────────────────────────────────────────┐\n   │                                               ▼\n[ Observe ] ──▶ [ Diff ] ──(Diff != 0)──▶ [ Act / Reconcile ]\nActual State   Desired State                  Update Reality\n```\n\n### Level-Triggered vs Edge-Triggered\n- **Edge-Triggered (Imperative)**: Reacts only when a change event occurs (e.g., \"button clicked\", \"webhook received\"). If an event is missed or dropped during a network partition, the system remains out of sync forever.\n- **Level-Triggered (Kubernetes)**: Examines the current *level* (state) of the system repeatedly. Even if an event packet was dropped or the controller crashed, the next iteration observes the discrepancy between desired state (`spec`) and actual state (`status`) and issues corrective actions.\n\n### MERN Example: Rescuing a Crashed Backend\n1. **Desired State**: Spec requests `replicas: 3` for `mern-backend`.\n2. **Failure**: Worker node 2 suffers a kernel panic; pod `mern-backend-7c98f98d-x4k2` dies.\n3. **Observe**: The ReplicaSet controller lists active pods matching label `app: mern-backend` and finds only 2 running pods.\n4. **Diff**: Desired (3) minus Actual (2) = +1 Pod needed.\n5. **Act**: The controller submits a POST request to `kube-apiserver` to create a new Pod.\n6. **Result**: Desired state equals actual state. System has self-healed."
            }
          ],
          "commands": [
            {
              "command": "kubectl api-resources",
              "description": "List all supported API resources, their API groups, namespaced status, and Kind",
              "example": "kubectl api-resources | grep -E \"deployments|services|statefulsets\"",
              "output": "deployments       deploy   apps/v1             true         Deployment\nservices          svc      v1                  true         Service\nstatefulsets      sts      apps/v1             true         StatefulSet",
              "whenToUse": "Discovering resource short names, API versions, and checking whether a resource is namespaced"
            },
            {
              "command": "kubectl api-versions",
              "description": "Print the supported API groups and versions in the target cluster",
              "example": "kubectl api-versions | head -n 10",
              "output": "admissionregistration.k8s.io/v1\napps/v1\nauthentication.k8s.io/v1\nauthorization.k8s.io/v1\nautoscaling/v2\nbatch/v1\nnetworking.k8s.io/v1\nv1",
              "whenToUse": "Checking cluster capabilities before applying manifests using newer API features"
            },
            {
              "command": "kubectl explain deployment.spec.strategy",
              "description": "Inspect documentation and schema fields directly from the cluster API specifications",
              "example": "kubectl explain deployment.spec.strategy",
              "output": "KIND:     Deployment\nVERSION:  apps/v1\nFIELD:    strategy <DeploymentStrategy>\nDESCRIPTION:\n    The deployment strategy to use to replace existing pods with new ones.\nFIELDS:\n    rollingUpdate <RollingUpdateDeployment>\n    type          <string>",
              "whenToUse": "Looking up valid YAML fields and syntax without leaving the terminal"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-backend-anatomy.yaml",
              "code": "apiVersion: apps/v1          # Group: apps, Version: v1\nkind: Deployment             # Kind: Deployment\nmetadata:                    # Object metadata\n  name: mern-backend\n  namespace: production\n  labels:\n    app.kubernetes.io/name: mern-backend\n    app.kubernetes.io/component: api\nspec:                        # Desired state (Spec)\n  replicas: 3\n  selector:\n    matchLabels:\n      app.kubernetes.io/name: mern-backend\n  template:                  # Pod template\n    metadata:\n      labels:\n        app.kubernetes.io/name: mern-backend\n    spec:\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.2.0\n        ports:\n        - containerPort: 5000\n# status:                    # Actual state (populated by Kubernetes controller)\n#   availableReplicas: 3\n#   readyReplicas: 3\n#   replicas: 3",
              "explanation": "Breakdown of a Kubernetes manifest highlighting the relationship between apiVersion, kind, metadata, desired spec, and controller-managed status."
            }
          ],
          "quiz": [
            {
              "id": "k8s-api-q1",
              "type": "multiple-choice",
              "question": "Which of the following is part of the legacy Core API group and has an apiVersion of simply \"v1\"?",
              "options": [
                "Deployment",
                "Service",
                "StatefulSet",
                "Ingress"
              ],
              "correctAnswer": "Service",
              "explanation": "Pods, Services, ConfigMaps, and Secrets belong to the legacy Core API group (empty group string) and use apiVersion: v1. Deployments belong to apps/v1, and Ingress belongs to networking.k8s.io/v1.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-api-q2",
              "type": "multiple-choice",
              "question": "What is the fundamental difference between level-triggered and edge-triggered control loops?",
              "options": [
                "Level-triggered only responds to manual operator intervention",
                "Edge-triggered loops compare desired and actual state continuously",
                "Level-triggered loops evaluate the current state regardless of missed change events, guaranteeing eventual consistency",
                "Edge-triggered loops do not require an API server"
              ],
              "correctAnswer": "Level-triggered loops evaluate the current state regardless of missed change events, guaranteeing eventual consistency",
              "explanation": "Level-triggered design checks the current condition (level) of the system rather than reacting exclusively to discrete edge transitions. This ensures self-healing even if individual notifications are dropped.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "kubectl apply fails with: \"error: unable to recognize \"manifest.yaml\": no matches for kind \"Deployment\" in version \"extensions/v1beta1\"\".",
              "cause": "The manifest references a deprecated and removed API version. \"extensions/v1beta1\" for Deployments was deprecated in v1.9 and permanently removed in Kubernetes v1.16.",
              "diagnosis": [
                "Check supported API versions for Deployment: kubectl api-resources | grep -i deployment",
                "Inspect manifest header to confirm apiVersion and kind"
              ],
              "solution": "Update the manifest apiVersion from \"extensions/v1beta1\" to \"apps/v1\".",
              "prevention": "Use linting tools like kubeval, conftest, or pluto in your CI/CD pipeline to catch deprecated API versions before merging to Git."
            }
          ],
          "keyTakeaways": [
            "Declarative specifications describe the desired end state; Kubernetes controllers automate the transition.",
            "Resources are identified by Group, Version, and Kind (GVK) in manifests, and GVR in REST endpoints.",
            "The reconciliation loop continually observes actual state, compares it with desired state, and acts on differences.",
            "Level-triggered architecture guarantees self-healing and eventual consistency despite network interruptions."
          ],
          "bestPractices": [
            "Always specify explicit namespaces in manifests or manage them consistently through Kustomize overlays.",
            "Regularly audit manifests for deprecated API versions before upgrading cluster versions.",
            "Rely on spec for desired state and inspect status for operational telemetry."
          ],
          "securityConsiderations": [
            "Never grant wildcard (\"*\") permissions across API groups in RBAC roles.",
            "Use validating admission webhooks to reject manifests that violate organizational security constraints."
          ],
          "commonMistakes": [
            "Attempting to edit the status block manually in YAML—the status block is overwritten by the controller.",
            "Confusing Kind (singular, capitalized e.g. Deployment) with Resource (plural, lowercase e.g. deployments)."
          ],
          "interviewQuestions": [
            "Explain the difference between GVK and GVR in Kubernetes.",
            "Why does Kubernetes use a level-triggered reconciliation loop instead of an edge-triggered event model?"
          ],
          "references": [
            {
              "title": "The Kubernetes API Machinery",
              "url": "https://kubernetes.io/docs/concepts/overview/kubernetes-api/",
              "type": "documentation",
              "description": "Deep dive into Kubernetes API design conventions, schema definitions, and versioning.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-local-cluster",
            "k8s-pods",
            "k8s-deployments"
          ]
        },
        {
          "id": "k8s-local-cluster",
          "title": "Setting Up a Local Cluster",
          "summary": "Bootstrap a multi-node Kubernetes cluster on your local workstation using kind and minikube, master kubeconfig context management, and verify cluster readiness.",
          "estimatedMinutes": 30,
          "difficulty": "beginner",
          "prerequisites": [
            "k8s-architecture",
            "k8s-api-primitives"
          ],
          "objectives": [
            {
              "text": "Create a multi-node local cluster using kind (Kubernetes in Docker)",
              "skill": "kind"
            },
            {
              "text": "Configure extraPortMappings to expose local ports for MERN frontend and backend testing",
              "skill": "port-mapping"
            },
            {
              "text": "Manage multi-cluster contexts, credentials, and clusters in ~/.kube/config",
              "skill": "kubeconfig"
            },
            {
              "text": "Verify node readiness, core DNS status, and basic cluster connectivity",
              "skill": "cluster-verification"
            }
          ],
          "sections": [
            {
              "title": "Why Local Clusters Matter for DevOps",
              "level": "beginner",
              "content": "Before pushing YAML to production GitOps repositories, every platform engineer and developer needs a fast, reproducible local sandbox. Testing directly against remote cloud clusters (like AWS EKS or GCP GKE) is slow, costs money, and requires internet connectivity.\n\nThe two most popular local Kubernetes tools are:\n- **kind (Kubernetes in Docker)**: Runs each Kubernetes node (both control plane and worker nodes) as a Docker container. It is blazingly fast, supports multi-node topologies out of the box, and is the tool used by the Kubernetes project itself to run integration tests.\n- **minikube**: Runs a single-node or multi-node cluster inside local virtual machines or Docker containers with integrated addons (dashboard, ingress, metrics-server)."
            },
            {
              "title": "Multi-Node Clusters with kind",
              "level": "intermediate",
              "content": "To accurately simulate production where our React frontend, Express backend, and MongoDB database run across different physical nodes, we will configure a 3-node cluster:\n- 1 Control Plane node\n- 2 Worker nodes\n\nWe also configure **extraPortMappings** so that traffic arriving at `localhost:80` and `localhost:443` on your development machine is forwarded directly into the kind worker nodes hosting your ingress controller."
            },
            {
              "title": "Demystifying ~/.kube/config",
              "level": "intermediate",
              "content": "The `kubectl` command-line tool looks for a configuration file located at `~/.kube/config` to determine which cluster to communicate with and how to authenticate.\n\nA kubeconfig file is composed of three interconnected sections:\n1. **clusters**: Contains API server endpoints and Certificate Authority (CA) data.\n2. **users**: Contains authentication tokens, client certificates, or external auth helper commands (like `aws-iam-authenticator` or `gke-gcloud-auth-plugin`).\n3. **contexts**: The tuple linking a specific user, a specific cluster, and an optional default namespace.\n\n```yaml\ncurrent-context: kind-devops-cluster\ncontexts:\n- context:\n    cluster: kind-devops-cluster\n    user: kind-devops-cluster\n    namespace: default\n  name: kind-devops-cluster\n```\n\nYou can switch contexts instantly using `kubectl config use-context <context-name>` or modern tools like `kubectx`."
            }
          ],
          "commands": [
            {
              "command": "kind create cluster --name devops-cluster --config kind-config.yaml",
              "description": "Create a local multi-node Kubernetes cluster based on a declarative configuration file",
              "example": "kind create cluster --name devops-cluster --config kind-config.yaml",
              "output": "Creating cluster \"devops-cluster\" ...\n ✓ Ensuring node image (kindest/node:v1.30.0) 🖼\n ✓ Preparing nodes 📦 📦 📦\n ✓ Writing configuration 📜\n ✓ Starting control-plane 🕹️\n ✓ Installing CNI 🔌\n ✓ Installing StorageClass 💾\n ✓ Joining worker nodes 🚜\nSet kubectl context to \"kind-devops-cluster\"",
              "whenToUse": "Initial provisioning of local development environment"
            },
            {
              "command": "kubectl cluster-info",
              "description": "Display the API server address and active control plane service endpoints",
              "example": "kubectl cluster-info",
              "output": "Kubernetes control plane is running at https://127.0.0.1:53942\nCoreDNS is running at https://127.0.0.1:53942/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy",
              "whenToUse": "Verifying cluster connectivity and checking control plane endpoint"
            },
            {
              "command": "kubectl config get-contexts",
              "description": "List all configured cluster contexts in kubeconfig and highlight the active context",
              "example": "kubectl config get-contexts",
              "output": "CURRENT   NAME                  CLUSTER               AUTHINFO              NAMESPACE\n*         kind-devops-cluster   kind-devops-cluster   kind-devops-cluster   default\n          minikube              minikube              minikube              default",
              "whenToUse": "Checking which cluster your kubectl commands will execute against"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "kind-config.yaml",
              "code": "# 3-node cluster configuration for MERN Stack testing\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nname: devops-cluster\nnodes:\n- role: control-plane\n  kubeadmConfigPatches:\n  - |\n    kind: InitConfiguration\n    nodeRegistration:\n      kubeletExtraArgs:\n        node-labels: \"ingress-ready=true\"\n  extraPortMappings:\n  - containerPort: 80\n    hostPort: 80\n    protocol: TCP\n  - containerPort: 443\n    hostPort: 443\n    protocol: TCP\n- role: worker\n- role: worker",
              "explanation": "A declarative kind configuration creating 1 control-plane and 2 worker nodes, mapping local host ports 80 and 443 into the cluster for testing Ingress controllers."
            }
          ],
          "quiz": [
            {
              "id": "k8s-local-q1",
              "type": "multiple-choice",
              "question": "What three elements form a \"context\" inside a kubeconfig file?",
              "options": [
                "API server, etcd endpoint, and token",
                "Cluster, User, and default Namespace",
                "Node, Container, and Pod",
                "Host, Port, and Protocol"
              ],
              "correctAnswer": "Cluster, User, and default Namespace",
              "explanation": "A context ties together a Cluster (where to connect), a User (how to authenticate), and an optional Namespace (default scope for commands).",
              "difficulty": "beginner",
              "xp": 25
            }
          ],
          "troubleshooting": [
            {
              "symptom": "kubectl commands fail with: \"The connection to the server 127.0.0.1:53942 was refused - did you specify the right host or port?\".",
              "cause": "The Docker daemon is not running, or the kind container hosting the control plane was stopped or deleted.",
              "diagnosis": [
                "Check Docker status: docker ps -a | grep devops-cluster",
                "Inspect kind container state: docker inspect devops-cluster-control-plane --format \"{{.State.Status}}\""
              ],
              "solution": "Start Docker desktop/daemon. If containers are stopped, run: docker start $(docker ps -a -q --filter \"name=devops-cluster\"). If removed, recreate with kind create cluster.",
              "prevention": "Ensure your container runtime is configured to start automatically on system boot."
            }
          ],
          "keyTakeaways": [
            "kind runs full Kubernetes nodes as Docker containers on your local workstation.",
            "extraPortMappings enable forwarding host traffic directly to ingress controllers inside kind.",
            "kubeconfig organizes multi-cluster management through clusters, users, and contexts.",
            "Always verify active context before executing potentially destructive kubectl commands."
          ],
          "bestPractices": [
            "Use tools like kubectx and kubens or terminal prompt indicators (starship/kube-ps1) to prevent accidental execution against production clusters.",
            "Keep local cluster configurations checked into your project repository alongside application code."
          ],
          "securityConsiderations": [
            "Never commit ~/.kube/config to public Git repositories—it contains administrative client certificates and private keys.",
            "Set file permissions on ~/.kube/config to 600 (chmod 600 ~/.kube/config)."
          ],
          "commonMistakes": [
            "Running kubectl commands while unknowingly connected to the wrong cluster context.",
            "Forgetting to map port 80/443 when creating the kind cluster, making ingress testing impossible."
          ],
          "interviewQuestions": [
            "How does a tool like kind run Kubernetes inside Docker containers?",
            "How do you manage multiple Kubernetes clusters and namespaces from a single terminal?"
          ],
          "references": [
            {
              "title": "kind Documentation",
              "url": "https://kind.sigs.k8s.io/",
              "type": "documentation",
              "description": "Official guide for creating local clusters with kind.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-pods",
            "k8s-deployments"
          ]
        }
      ]
    },
    {
      "id": "k8s-workloads",
      "title": "Core Workloads",
      "description": "Master Kubernetes compute primitives: Pod mechanics, multi-container design patterns, zero-downtime Deployments, StatefulSets for MongoDB, and batch Jobs/CronJobs.",
      "icon": "📦",
      "difficulty": "intermediate",
      "estimatedHours": 5,
      "lessons": [
        {
          "id": "k8s-pods",
          "title": "Pods",
          "summary": "Explore the fundamental atomic unit of Kubernetes: understand Pod shared namespaces, multi-container patterns (Init, Sidecar, Adapter), and the Pod lifecycle.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-architecture",
            "k8s-api-primitives"
          ],
          "objectives": [
            {
              "text": "Understand why Pods—not individual containers—are the atomic unit of scheduling",
              "skill": "pod-fundamentals"
            },
            {
              "text": "Deconstruct shared Linux namespaces: network (localhost), IPC, and volume sharing",
              "skill": "pod-networking"
            },
            {
              "text": "Implement multi-container design patterns: Init Containers, Sidecars, and Ambassadors",
              "skill": "multi-container-patterns"
            },
            {
              "text": "Trace the Pod phase lifecycle from Pending to Running, Failed, or Succeeded",
              "skill": "pod-lifecycle"
            }
          ],
          "sections": [
            {
              "title": "The Atomic Unit: Why Pods Instead of Containers?",
              "level": "beginner",
              "content": "In Docker, the primary abstraction is a single container. In Kubernetes, the primary atomic scheduling unit is the **Pod**. A Pod represents a single instance of a running process in your cluster and can contain one or more tightly coupled containers.\n\nAll containers in the same Pod share:\n1. **Network Namespace**: They share the same IP address and port space. They can communicate with each other over `localhost` (e.g., an Express app on port 5000 can reach a local Redis cache or envoy proxy on `127.0.0.1:6379`).\n2. **IPC Namespace**: Containers can communicate via standard inter-process communication (POSIX shared memory, semaphores).\n3. **Storage Volumes**: Volumes defined in the PodSpec can be mounted into multiple containers simultaneously, allowing shared file access.\n\nContainers in a Pod are always scheduled onto the **same physical or virtual worker node** and share the same lifecycle."
            },
            {
              "title": "Multi-Container Design Patterns",
              "level": "intermediate",
              "content": "While most production workloads follow the \"one container per Pod\" rule, multi-container Pods solve critical operational requirements:\n\n### 1. Init Containers\nInit containers run to completion **before** app containers start. If an init container fails, Kubernetes restarts the Pod until it succeeds.\n- *MERN Stack Use Case*: In our Express app Pod, we use an init container that uses `nc` (netcat) to poll `mern-mongo:27017` until the database is accepting TCP connections. This prevents the Express container from crashing with an unhandled connection error during startup.\n\n### 2. Sidecar Containers (Native in K8s 1.28+)\nA secondary container that extends or enhances the main application container without modifying its code.\n- *Examples*: A log-forwarding agent (Fluentbit/Vector) tailing logs from a shared volume, an Envoy proxy for service mesh mTLS, or a Prometheus metrics exporter.\n\n### 3. Ambassador / Adapter Containers\n- **Ambassador**: Proxies the app's outgoing network connections (e.g., the app connects to `localhost:6379`, and the ambassador handles clustering, sharding, and credentials to AWS ElastiCache).\n- **Adapter**: Standardizes heterogenous application outputs into a unified format for monitoring."
            },
            {
              "title": "Pod Lifecycle and Container States",
              "level": "advanced",
              "content": "### Pod Phases (`status.phase`):\n- **Pending**: Accepted by API server, but one or more containers have not been created (downloading images, waiting for scheduling).\n- **Running**: Bound to a node, all containers created, at least one container is running or starting.\n- **Succeeded**: All containers in the Pod have terminated successfully (exit code 0) and will not be restarted (common in batch Jobs).\n- **Failed**: All containers terminated, and at least one container terminated in failure (non-zero exit code).\n- **Unknown**: State could not be obtained, typically due to network disruption between API server and worker node kubelet.\n\n### Container States & Common Errors:\n- **Waiting**: Waiting to run. Typical reason: `ContainerCreating` (allocating network/volumes) or `CrashLoopBackOff` (process started and crashed repeatedly).\n- **Terminated**: Container completed execution. Common reasons: `Completed` (exit code 0), `Error` (exit code 1), or `OOMKilled` (exit code 137)."
            }
          ],
          "commands": [
            {
              "command": "kubectl get pods -o wide",
              "description": "List pods with their allocated internal cluster IPs, status, restart counts, and host node",
              "example": "kubectl get pods -o wide",
              "output": "NAME                            READY   STATUS    RESTARTS   AGE   IP           NODE\nmern-backend-56f89b5c7f-9x2jk   1/1     Running   0          12m   10.244.1.4   worker-1\nmern-mongo-0                    1/1     Running   0          45m   10.244.2.8   worker-2",
              "whenToUse": "Quick inspection of pod health, pod IPs, and node distribution"
            },
            {
              "command": "kubectl logs <pod-name> -c <container-name>",
              "description": "Stream container stdout/stderr logs from a specific container in a multi-container pod",
              "example": "kubectl logs mern-backend-56f89b5c7f-9x2jk -c init-mongo-check",
              "output": "Waiting for MongoDB at mern-mongo:27017...\nConnection to mern-mongo:27017 succeeded! Ready to start Express API.",
              "whenToUse": "Inspecting init container output or diagnosing a specific sidecar"
            },
            {
              "command": "kubectl run debug-shell --rm -i --tty --image=busybox -- sh",
              "description": "Spin up an ephemeral interactive pod to test internal DNS and network connectivity",
              "example": "kubectl run debug-shell --rm -i --tty --image=busybox -- sh",
              "output": "If you don't see a command prompt, try pressing enter.\n/ # wget -qO- http://mern-backend:5000/health\n{\"status\":\"healthy\",\"uptime\":3420}",
              "whenToUse": "Validating service DNS resolution and in-cluster HTTP responses"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-backend-pod-with-init.yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: mern-backend-pod\n  labels:\n    app.kubernetes.io/name: mern-backend\n    app.kubernetes.io/component: api\nspec:\n  # 1. Init container: waits for MongoDB port 27017 to be open\n  initContainers:\n  - name: wait-for-mongo\n    image: busybox:1.36\n    command:\n    - sh\n    - -c\n    - |\n      echo \"Testing connection to MongoDB service...\"\n      until nc -z -v -w 2 mern-mongo 27017; do\n        echo \"MongoDB is unavailable - sleeping 2 seconds...\"\n        sleep 2\n      done\n      echo \"MongoDB is up and accepting connections!\"\n  \n  # 2. Main app container: Node.js Express backend\n  containers:\n  - name: express-api\n    image: ghcr.io/org/mern-backend:1.1.0\n    ports:\n    - containerPort: 5000\n      name: http\n    env:\n    - name: PORT\n      value: \"5000\"\n    - name: MONGO_URI\n      value: \"mongodb://mern-mongo:27017/devops_db\"\n    resources:\n      requests:\n        cpu: \"250m\"\n        memory: \"256Mi\"\n      limits:\n        cpu: \"500m\"\n        memory: \"512Mi\"\n  restartPolicy: Always",
              "explanation": "A production Pod manifest utilizing an initContainer to verify MongoDB network availability before starting the primary Express API container."
            }
          ],
          "quiz": [
            {
              "id": "k8s-pod-q1",
              "type": "multiple-choice",
              "question": "How do multiple containers running within the same Pod communicate over the network with each other?",
              "options": [
                "Through external Ingress controllers",
                "Over localhost via the shared network namespace",
                "By querying the CoreDNS cluster IP",
                "Through hostPort environment variables"
              ],
              "correctAnswer": "Over localhost via the shared network namespace",
              "explanation": "All containers in a single Pod share the same Linux network namespace and IP address, allowing them to communicate via localhost on different ports.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-pod-q2",
              "type": "multiple-choice",
              "question": "What happens to the main application container if an init container fails and exits with a non-zero exit code?",
              "options": [
                "The main container starts anyway with degraded functionality",
                "The main container does not start; Kubernetes restarts the Pod based on its restartPolicy",
                "The Pod is permanently deleted from etcd",
                "The init container is skipped after 3 attempts"
              ],
              "correctAnswer": "The main container does not start; Kubernetes restarts the Pod based on its restartPolicy",
              "explanation": "Init containers must run to completion (exit code 0) sequentially before any app containers start. If an init container fails, the Pod enters CrashLoopBackOff or restarts.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Pod status shows \"Init:CrashLoopBackOff\" or \"Init:0/1\" indefinitely.",
              "cause": "The init container failed its command (e.g. timeout connecting to MongoDB, DNS lookup failure, or missing secret).",
              "diagnosis": [
                "Describe the pod: kubectl describe pod mern-backend-pod",
                "Check the init container logs: kubectl logs mern-backend-pod -c wait-for-mongo"
              ],
              "solution": "Ensure the upstream dependency (e.g. MongoDB service) is running and accessible. Fix hostname or port misconfigurations in the initContainer script.",
              "prevention": "Always configure connection timeouts in init scripts and provide descriptive log outputs for fast diagnosis."
            }
          ],
          "keyTakeaways": [
            "Pods are the smallest deployable units in Kubernetes, encapsulating one or more co-located containers.",
            "Containers in a Pod share the network namespace (localhost) and can share volumes.",
            "Init containers execute sequentially before application containers launch, making them ideal for dependency checks.",
            "CrashLoopBackOff indicates that a container process started and repeatedly exited with an error."
          ],
          "bestPractices": [
            "Prefer single-container Pods unless containers require shared localhost networking or shared local disk.",
            "Always specify resource requests and limits on every container inside the Pod.",
            "Use init containers to handle database migrations and service dependency readiness checks."
          ],
          "securityConsiderations": [
            "Avoid sharing the host network namespace (hostNetwork: true) or host PID namespace unless building node agents.",
            "Set securityContext to run containers as non-root users with read-only root filesystems."
          ],
          "commonMistakes": [
            "Deploying raw standalone Pods in production instead of managing them via Deployments or StatefulSets.",
            "Binding two containers in the same Pod to the exact same TCP port, causing port conflict crashes."
          ],
          "interviewQuestions": [
            "Why does Kubernetes use Pods as the scheduling unit instead of individual Docker containers?",
            "Describe the lifecycle differences between Init Containers and regular Application Containers."
          ],
          "references": [
            {
              "title": "Pod Lifecycle and Spec",
              "url": "https://kubernetes.io/docs/concepts/workloads/pods/",
              "type": "documentation",
              "description": "Official overview of Pod concepts, phases, and container management.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-deployments",
            "k8s-statefulsets"
          ]
        },
        {
          "id": "k8s-deployments",
          "title": "ReplicaSets & Deployments",
          "summary": "Achieve zero-downtime rolling updates, automated rollbacks, and scalable replica management for your MERN backend using Deployments and ReplicaSets.",
          "estimatedMinutes": 40,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-pods"
          ],
          "objectives": [
            {
              "text": "Understand the relationship between Deployments, ReplicaSets, and Pods",
              "skill": "deployments"
            },
            {
              "text": "Configure RollingUpdate strategies with maxSurge and maxUnavailable",
              "skill": "rolling-updates"
            },
            {
              "text": "Execute safe rollouts, monitor revision history, and trigger instant rollbacks",
              "skill": "rollbacks"
            },
            {
              "text": "Implement graceful shutdown in Node.js Express to prevent dropped HTTP requests",
              "skill": "graceful-shutdown"
            }
          ],
          "sections": [
            {
              "title": "The Hierarchy: Deployments vs ReplicaSets vs Pods",
              "level": "beginner",
              "content": "In production, you never manage individual Pods directly. If a node running a standalone Pod crashes, that Pod is lost forever.\n\nInstead, Kubernetes provides a 3-tier workload hierarchy:\n1. **Deployment**: The high-level declarative manager. You declare what container image you want, how many replicas, and how updates should roll out.\n2. **ReplicaSet**: Created and owned by the Deployment. Its sole job is to maintain a stable set of replica Pods running at any given time.\n3. **Pods**: The actual running workload instances.\n\n```\n[ Deployment: mern-backend ]\n          │ (manages)\n          ▼\n   [ ReplicaSet: mern-backend-v1 ] ──▶ [ Pod 1 ] [ Pod 2 ] [ Pod 3 ]\n```\n\nWhen you update the image tag in a Deployment from `v1.0.0` to `v1.1.0`, the Deployment creates a **new ReplicaSet** for `v1.1.0` and progressively scales it up while scaling down the old ReplicaSet."
            },
            {
              "title": "Mastering the RollingUpdate Strategy",
              "level": "intermediate",
              "content": "The `RollingUpdate` strategy guarantees zero downtime by gradually replacing old Pods with new ones.\n\nTwo critical parameters govern rollout speed and availability:\n- **maxSurge**: The maximum number (or percentage) of Pods that can be scheduled *above* the desired replica count during an update.\n  - *Example*: Replicas = 4, maxSurge = 25% (1 Pod). The Deployment can scale up to 5 total pods during rollout.\n- **maxUnavailable**: The maximum number (or percentage) of Pods that can be unavailable during the update.\n  - *Example*: Replicas = 4, maxUnavailable = 0. Kubernetes guarantees that all 4 pods remain healthy and ready before terminating an old pod.\n\n### Recommended Zero-Downtime Settings for MERN Backend:\n```yaml\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 25%\n    maxUnavailable: 0\n```\nWith `maxUnavailable: 0`, Kubernetes creates a new pod, waits for its readiness probe to succeed, adds it to the Service endpoints, and only then issues a termination signal to an old pod."
            },
            {
              "title": "Graceful Shutdown in Node.js Express",
              "level": "advanced",
              "content": "When Kubernetes replaces a Pod during a rolling update:\n1. Kube-proxy removes the terminating Pod's IP from the Service endpoints.\n2. The Kubelet sends a **SIGTERM** signal to the container process.\n3. Kubelet waits for `terminationGracePeriodSeconds` (default: 30s).\n4. If the process is still running after the grace period, Kubelet sends **SIGKILL**.\n\nIf your Express application does not catch `SIGTERM`, active HTTP client requests will be abruptly terminated with `502 Bad Gateway` errors.\n\n### Express Graceful Shutdown Implementation:\n```javascript\nconst server = app.listen(5000, () => console.log('API running on 5000'));\n\nprocess.on('SIGTERM', () => {\n  console.log('SIGTERM received. Closing HTTP server gracefully...');\n  server.close(() => {\n    console.log('HTTP server closed. Disconnecting MongoDB...');\n    mongoose.connection.close(false, () => {\n      console.log('Mongo disconnected. Exiting process.');\n      process.exit(0);\n    });\n  });\n});\n```"
            }
          ],
          "commands": [
            {
              "command": "kubectl rollout status deployment/mern-backend",
              "description": "Watch the live progress of a rolling deployment in the terminal until completion",
              "example": "kubectl rollout status deployment/mern-backend",
              "output": "Waiting for deployment \"mern-backend\" rollout to finish: 1 out of 3 new replicas have been updated...\nWaiting for deployment \"mern-backend\" rollout to finish: 2 of 3 updated replicas are available...\ndeployment \"mern-backend\" successfully rolled out",
              "whenToUse": "CI/CD deployment validation scripts and local terminal monitoring"
            },
            {
              "command": "kubectl rollout history deployment/mern-backend",
              "description": "View the rollout revisions, changes, and recorded change-causes",
              "example": "kubectl rollout history deployment/mern-backend",
              "output": "REVISION  CHANGE-CAUSE\n1         Initial deploy: ghcr.io/org/mern-backend:1.0.0\n2         Update image to ghcr.io/org/mern-backend:1.1.0",
              "whenToUse": "Auditing past releases or identifying a target revision for rollback"
            },
            {
              "command": "kubectl rollout undo deployment/mern-backend --to-revision=1",
              "description": "Instantly revert a malfunctioning deployment back to a previous stable revision",
              "example": "kubectl rollout undo deployment/mern-backend --to-revision=1",
              "output": "deployment.apps/mern-backend rolled back to revision 1",
              "whenToUse": "Emergency incident response when a new release introduces fatal runtime bugs"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-backend-deployment.yaml",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  labels:\n    app.kubernetes.io/name: mern-backend\n    app.kubernetes.io/component: api\nspec:\n  replicas: 3\n  revisionHistoryLimit: 10\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 25%\n      maxUnavailable: 0\n  selector:\n    matchLabels:\n      app.kubernetes.io/name: mern-backend\n  template:\n    metadata:\n      labels:\n        app.kubernetes.io/name: mern-backend\n        app.kubernetes.io/component: api\n    spec:\n      terminationGracePeriodSeconds: 45\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.1.0\n        imagePullPolicy: IfNotPresent\n        ports:\n        - containerPort: 5000\n          name: http\n        lifecycle:\n          preStop:\n            exec:\n              command: [\"/bin/sleep\", \"5\"] # Allow iptables updates to propagate\n        resources:\n          requests:\n            cpu: 250m\n            memory: 256Mi\n          limits:\n            cpu: 500m\n            memory: 512Mi",
              "explanation": "Production Deployment configuration for the Express backend featuring zero-downtime rolling updates, preStop sleep hook to allow network drain, and resource constraints."
            }
          ],
          "quiz": [
            {
              "id": "k8s-deploy-q1",
              "type": "multiple-choice",
              "question": "If replicas: 4, maxSurge: 25%, and maxUnavailable: 0, how many total pods will be running at the peak of a rolling update?",
              "options": [
                "4 pods",
                "5 pods",
                "6 pods",
                "8 pods"
              ],
              "correctAnswer": "5 pods",
              "explanation": "maxSurge: 25% of 4 is 1 pod. Therefore, Kubernetes can create 1 extra pod before terminating old pods, resulting in a peak total of 4 + 1 = 5 pods.",
              "difficulty": "intermediate",
              "xp": 30
            },
            {
              "id": "k8s-deploy-q2",
              "type": "multiple-choice",
              "question": "Why is a preStop hook with a short sleep often added to an Express container in a Deployment?",
              "options": [
                "To allow the database to finish creating backups",
                "To give kube-proxy time to remove the pod IP from service endpoints before the app stops listening",
                "To wait for CPU usage to drop",
                "To compress logs before exiting"
              ],
              "correctAnswer": "To give kube-proxy time to remove the pod IP from service endpoints before the app stops listening",
              "explanation": "Pod termination and endpoint removal happen asynchronously in parallel. A brief preStop sleep (e.g. 5s) prevents incoming requests from hitting a container that has already closed its listening socket.",
              "difficulty": "advanced",
              "xp": 40
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Rolling update is stuck indefinitely and kubectl rollout status shows \"Waiting for deployment \"mern-backend\" rollout to finish: 1 out of 3 new replicas have been updated...\".",
              "cause": "The new Pod is failing its readiness probe, the image tag does not exist (ImagePullBackOff), or the node lacks allocatable CPU/Memory.",
              "diagnosis": [
                "Check rollout status: kubectl rollout status deployment/mern-backend",
                "List pods to find failing replica: kubectl get pods -l app.kubernetes.io/name=mern-backend",
                "Inspect failing pod: kubectl describe pod <stuck-pod-name>"
              ],
              "solution": "If the image tag is bad, run: kubectl rollout undo deployment/mern-backend to immediately restore service. Fix the image tag or probe endpoint and re-deploy.",
              "prevention": "Always test container images in a staging environment and configure progressDeadlineSeconds in the Deployment spec to detect and alert on stalled rollouts."
            }
          ],
          "keyTakeaways": [
            "Deployments manage ReplicaSets, which in turn manage Pods.",
            "RollingUpdate with maxUnavailable: 0 ensures full capacity is maintained during deployments.",
            "Express apps must capture SIGTERM and gracefully close database connections and HTTP listeners.",
            "kubectl rollout undo enables rapid, one-command rollback to previous revisions."
          ],
          "bestPractices": [
            "Always set maxUnavailable to 0 in production customer-facing web services.",
            "Include a preStop sleep hook to prevent race conditions during endpoint deregistration.",
            "Retain at least 10 historical revisions (revisionHistoryLimit: 10) for safe rollbacks."
          ],
          "securityConsiderations": [
            "Do not use the \":latest\" container image tag in Deployments, as it makes rollbacks unpredictable.",
            "Enforce immutable image tags (e.g. Git SHA or semantic version) to guarantee auditability."
          ],
          "commonMistakes": [
            "Killing the Node process immediately on SIGTERM without closing ongoing HTTP connections.",
            "Updating pod template selectors, which is an immutable field and causes deployment rejections."
          ],
          "interviewQuestions": [
            "Explain how Kubernetes performs a zero-downtime rolling update under the hood.",
            "What is the difference between maxSurge and maxUnavailable, and how would you configure them for high-traffic APIs?"
          ],
          "references": [
            {
              "title": "Kubernetes Deployments",
              "url": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
              "type": "documentation",
              "description": "Official guide to managing declarative updates with Deployments.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-statefulsets",
            "k8s-services"
          ]
        },
        {
          "id": "k8s-statefulsets",
          "title": "StatefulSets",
          "summary": "Deploy stateful distributed systems like MongoDB on Kubernetes: understand stable network identities, ordinal indices, persistent volume claim templates, and headless services.",
          "estimatedMinutes": 45,
          "difficulty": "advanced",
          "prerequisites": [
            "k8s-pods",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Distinguish stateless architectures (Express) from stateful workloads (MongoDB)",
              "skill": "stateful-architecture"
            },
            {
              "text": "Understand ordinal indexing, deterministic pod naming, and ordered startup/shutdown",
              "skill": "statefulsets"
            },
            {
              "text": "Configure Headless Services (clusterIP: None) for direct pod-to-pod DNS resolution",
              "skill": "headless-services"
            },
            {
              "text": "Implement volumeClaimTemplates to dynamically provision dedicated PersistentVolumes",
              "skill": "storage-provisioning"
            }
          ],
          "sections": [
            {
              "title": "The Stateless vs Stateful Dilemma",
              "level": "beginner",
              "content": "Our Express backend is **stateless**: any pod can handle any incoming request, pods can be created and destroyed at will, and they share no persistent local state. Deployments are the perfect fit.\n\nHowever, databases like **MongoDB** are **stateful**:\n- Data must persist across pod restarts and rescheduling.\n- Nodes have distinct identities (e.g., Primary, Secondary, Arbiter).\n- Replication requires pods to communicate with specific peer instances by fixed hostnames, not a randomized load balancer pool.\n\nTo solve this, Kubernetes provides the **StatefulSet** controller."
            },
            {
              "title": "StatefulSet Guarantees and Mechanics",
              "level": "intermediate",
              "content": "StatefulSets provide four critical guarantees that Deployments do not:\n\n### 1. Stable, Unique Network Identifiers\nPods are assigned a predictable, ordinal index: `$(statefulset-name)-$(ordinal)`.\nFor a StatefulSet named `mern-mongo` with 3 replicas:\n- `mern-mongo-0` (Primary)\n- `mern-mongo-1` (Secondary)\n- `mern-mongo-2` (Secondary)\n\n### 2. Headless Service and Deterministic DNS\nStatefulSets require a **Headless Service** (`clusterIP: None`). Instead of routing traffic to a single virtual IP, CoreDNS creates direct A/AAAA records for each individual pod:\n```\nmern-mongo-0.mern-mongo-headless.production.svc.cluster.local\nmern-mongo-1.mern-mongo-headless.production.svc.cluster.local\n```\nThis allows the MongoDB connection string to explicitly name all replica set members.\n\n### 3. Ordered Deployment and Termination\nPods are created strictly in order: $0 \\to 1 \\to 2$. Pod $N$ must be `Running` and `Ready` before Pod $N+1$ begins creation.\nDuring scale-down or termination, they are destroyed in reverse order: $2 \\to 1 \\to 0$.\n\n### 4. volumeClaimTemplates: Dedicated Persistent Storage\nUnlike Deployments where all pods share the same volume claim, StatefulSets generate a unique `PersistentVolumeClaim` (PVC) for each pod:\n- `mongo-data-mern-mongo-0`\n- `mongo-data-mern-mongo-1`\n- `mongo-data-mern-mongo-2`\nIf `mern-mongo-1` dies and is rescheduled on another node, it automatically re-attaches to `mongo-data-mern-mongo-1`, ensuring zero data loss."
            },
            {
              "title": "Connecting Express to a MongoDB StatefulSet",
              "level": "advanced",
              "content": "In the MERN stack, the Express backend connects to the MongoDB cluster using the replica set discovery protocol.\n\nInstead of pointing Express to an ephemeral IP, we supply the headless service FQDNs in the connection string:\n```\nmongodb://mern-mongo-0.mern-mongo-headless:27017,mern-mongo-1.mern-mongo-headless:27017,mern-mongo-2.mern-mongo-headless:27017/devops_db?replicaSet=rs0&readPreference=secondaryPreferred\n```\nThe MongoDB Node.js driver automatically queries the replica set members, detects the current primary for writes, and distributes reads across secondaries."
            }
          ],
          "commands": [
            {
              "command": "kubectl get statefulset mern-mongo",
              "description": "Display active StatefulSets, desired replicas, and ready status",
              "example": "kubectl get statefulset mern-mongo",
              "output": "NAME         READY   AGE\nmern-mongo   3/3     18d",
              "whenToUse": "Verifying that all stateful replicas have reached ready state"
            },
            {
              "command": "kubectl get pvc -l app=mern-mongo",
              "description": "Inspect dynamically provisioned PersistentVolumeClaims bound to each stateful pod ordinal",
              "example": "kubectl get pvc -l app=mern-mongo",
              "output": "NAME                       STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE\nmongo-data-mern-mongo-0    Bound    pvc-1f3a8d4e-b5c6-4d7e-8f9a-0b1c2d3e4f5a   20Gi       RWO            standard-ssd   18d\nmongo-data-mern-mongo-1    Bound    pvc-2a4b6c8d-e0f1-4a2b-8c4d-6e8f0a2b4c6d   20Gi       RWO            standard-ssd   18d\nmongo-data-mern-mongo-2    Bound    pvc-3b5c7d9e-f1a2-4b3c-9d5e-7f9a1b3c5d7e   20Gi       RWO            standard-ssd   18d",
              "whenToUse": "Confirming individual volume binding and capacity per replica"
            },
            {
              "command": "kubectl exec -it mern-mongo-0 -- mongosh --eval \"rs.status()\"",
              "description": "Execute MongoDB shell inside replica 0 to inspect replication status",
              "example": "kubectl exec -it mern-mongo-0 -- mongosh --eval \"rs.status()\"",
              "output": "{\n  set: \"rs0\",\n  myState: 1,\n  members: [\n    { _id: 0, name: \"mern-mongo-0.mern-mongo-headless...:27017\", stateStr: \"PRIMARY\" },\n    { _id: 1, name: \"mern-mongo-1.mern-mongo-headless...:27017\", stateStr: \"SECONDARY\" },\n    { _id: 2, name: \"mern-mongo-2.mern-mongo-headless...:27017\", stateStr: \"SECONDARY\" }\n  ]\n}",
              "whenToUse": "Validating MongoDB replica set initialization and peer health"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-mongo-statefulset.yaml",
              "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: mern-mongo-headless\n  labels:\n    app: mern-mongo\nspec:\n  clusterIP: None # Headless service\n  ports:\n  - port: 27017\n    name: mongodb\n  selector:\n    app: mern-mongo\n---\napiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: mern-mongo\nspec:\n  serviceName: \"mern-mongo-headless\"\n  replicas: 3\n  podManagementPolicy: OrderedReady\n  selector:\n    matchLabels:\n      app: mern-mongo\n  template:\n    metadata:\n      labels:\n        app: mern-mongo\n    spec:\n      terminationGracePeriodSeconds: 60\n      containers:\n      - name: mongo\n        image: mongo:6.0.8\n        command:\n        - mongod\n        - \"--bind_ip_all\"\n        - \"--replSet\"\n        - \"rs0\"\n        ports:\n        - containerPort: 27017\n          name: mongodb\n        volumeMounts:\n        - name: mongo-data\n          mountPath: /data/db\n        resources:\n          requests:\n            cpu: 500m\n            memory: 1Gi\n          limits:\n            cpu: 1000m\n            memory: 2Gi\n  volumeClaimTemplates:\n  - metadata:\n      name: mongo-data\n    spec:\n      accessModes: [ \"ReadWriteOnce\" ]\n      storageClassName: \"standard-ssd\"\n      resources:\n        requests:\n          storage: 20Gi",
              "explanation": "Production MongoDB StatefulSet paired with a Headless Service and volumeClaimTemplates providing dedicated persistent NVMe storage for each database replica."
            }
          ],
          "quiz": [
            {
              "id": "k8s-sts-q1",
              "type": "multiple-choice",
              "question": "Why must a StatefulSet be paired with a Headless Service (clusterIP: None)?",
              "options": [
                "To disable security firewalls between nodes",
                "To allow CoreDNS to return direct A records for individual pod ordinal hostnames instead of a single cluster IP",
                "Because StatefulSets cannot use TCP networking",
                "To allow external internet users to access MongoDB without authentication"
              ],
              "correctAnswer": "To allow CoreDNS to return direct A records for individual pod ordinal hostnames instead of a single cluster IP",
              "explanation": "Headless services do not allocate a virtual ClusterIP. Instead, CoreDNS creates SRV and A records for each pod ordinal, allowing clients and database peers to address specific pods directly.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-sts-q2",
              "type": "multiple-choice",
              "question": "What happens to the PersistentVolumeClaim (PVC) when a StatefulSet replica pod is deleted or scaled down?",
              "options": [
                "The PVC is automatically deleted immediately",
                "The PVC is retained and preserved to prevent accidental data loss",
                "The PVC is merged into replica 0",
                "The data in the PVC is erased"
              ],
              "correctAnswer": "The PVC is retained and preserved to prevent accidental data loss",
              "explanation": "Kubernetes intentionally does not delete PVCs when scaling down or deleting StatefulSet pods. This prevents catastrophic data loss; if the pod is recreated, it reconnects to its existing volume.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "MongoDB StatefulSet pod mern-mongo-1 remains stuck in \"Pending\" status while mern-mongo-0 is Running.",
              "cause": "The storage provisioner failed to bind a PersistentVolume for volumeClaimTemplate \"mongo-data-mern-mongo-1\", or the cluster lacks available persistent disks in the target availability zone.",
              "diagnosis": [
                "Check pod events: kubectl describe pod mern-mongo-1",
                "Check PVC status: kubectl describe pvc mongo-data-mern-mongo-1",
                "Inspect StorageClass: kubectl describe storageclass standard-ssd"
              ],
              "solution": "Verify that the cloud CSI driver is running and that the storage quota has not been exceeded. Ensure volumeBindingMode in StorageClass is set to WaitForFirstConsumer if spanning multiple zones.",
              "prevention": "Set volumeBindingMode: WaitForFirstConsumer so persistent disks are provisioned only in the availability zone where the scheduler places the pod."
            }
          ],
          "keyTakeaways": [
            "StatefulSets provide stable ordinal naming (pod-0, pod-1) and dedicated persistent storage per pod.",
            "Headless Services (clusterIP: None) allow direct DNS addressing of specific database replicas.",
            "Scaling and deployment in StatefulSets are strictly ordered: $0 \\to 1 \\to 2$.",
            "Deleting or scaling down a StatefulSet never deletes underlying PersistentVolumeClaims."
          ],
          "bestPractices": [
            "Always set podManagementPolicy: OrderedReady for databases requiring strict cluster synchronization.",
            "Use WaitForFirstConsumer volume binding mode on multi-zone Kubernetes clusters.",
            "Grant generous terminationGracePeriodSeconds (e.g. 60-120s) to allow databases to flush dirty pages to disk on shutdown."
          ],
          "securityConsiderations": [
            "Never expose MongoDB headless services or database ports directly to external Ingress.",
            "Enable MongoDB authentication (keyfiles or TLS certificates) for inter-replica communication."
          ],
          "commonMistakes": [
            "Using a regular Deployment for MongoDB, which causes multiple pods to corrupt data by mounting the same ReadWriteOnce disk.",
            "Assuming that deleting a StatefulSet deletes the data—PVCs must be deleted manually if cleanup is desired."
          ],
          "interviewQuestions": [
            "How does a StatefulSet differ from a Deployment, and when would you choose one over the other?",
            "What is a Headless Service, and why is it necessary for running distributed databases like MongoDB on Kubernetes?"
          ],
          "references": [
            {
              "title": "StatefulSets Official Concept",
              "url": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/",
              "type": "documentation",
              "description": "Official guide to managing stateful applications on Kubernetes.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-daemonsets-jobs",
            "k8s-storage"
          ]
        },
        {
          "id": "k8s-daemonsets-jobs",
          "title": "DaemonSets, Jobs & CronJobs",
          "summary": "Run host-level infrastructure agents with DaemonSets, execute one-time database schema migrations with Jobs, and automate nightly MongoDB backups with CronJobs.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-pods",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Deploy node-level infrastructure daemons across all worker nodes using DaemonSets",
              "skill": "daemonsets"
            },
            {
              "text": "Execute run-to-completion batch tasks (Mongoose migrations/seeding) using Jobs",
              "skill": "batch-jobs"
            },
            {
              "text": "Schedule recurring tasks (database backups, report generation) using CronJobs",
              "skill": "cronjobs"
            },
            {
              "text": "Configure concurrency policies and backoff limits to handle batch failures gracefully",
              "skill": "batch-policies"
            }
          ],
          "sections": [
            {
              "title": "DaemonSets: Node-Level Workloads",
              "level": "beginner",
              "content": "While Deployments and StatefulSets run application logic, a **DaemonSet** ensures that all (or a subset of) worker nodes run **exactly one copy of a Pod**. As new worker nodes are joined to the cluster, the DaemonSet automatically adds the Pod to them; as nodes are decommissioned, those Pods are garbage collected.\n\n### Typical Use Cases for DaemonSets:\n- **Log Collection**: Running Promtail, Fluentd, or Fluentbit on every node to collect container logs from `/var/log/pods`.\n- **Node Monitoring**: Running Prometheus Node Exporter to scrape CPU, memory, and disk I/O metrics of the host VM.\n- **Cluster Networking**: Running CNI plugins like Calico or Cilium agents that configure kernel routing and iptables/eBPF."
            },
            {
              "title": "Jobs: Run-to-Completion Workloads",
              "level": "intermediate",
              "content": "A **Job** creates one or more Pods and will continue to retry execution until a specified number of them successfully terminate (exit code 0). When the process finishes, the Pod stops running, but its logs and metadata remain preserved for auditing.\n\n### MERN Use Case: Database Migration & Seeding\nBefore launching a new version of our Express API, we often need to run Mongoose schema migrations or seed initial administrative data into MongoDB.\n- We run a Kubernetes **Job** before updating the Deployment.\n- **backoffLimit**: Specifies the number of retries before marking the Job as failed.\n- **restartPolicy**: Must be either `OnFailure` or `Never` (never `Always`)."
            },
            {
              "title": "CronJobs: Scheduled Automated Operations",
              "level": "advanced",
              "content": "A **CronJob** manages time-based Jobs, running them periodically on a given schedule formatted using standard crontab syntax (`minute hour day-of-month month day-of-week`).\n\n### Concurrency Policies:\nWhat happens if a scheduled backup job takes 30 minutes, but the cron schedule runs every 15 minutes?\n1. **Allow** (Default): Concurrent jobs run simultaneously. Can overload the database.\n2. **Forbid**: If the previous job has not finished, the CronJob skips the new run.\n3. **Replace**: If the previous job is still running, it is cancelled and replaced by the new job.\n\n### MERN Use Case: Nightly MongoDB S3 Backups\nEvery midnight, a CronJob runs `mongodump`, compresses the archive, and uploads the backup artifact to an AWS S3 or GCP Cloud Storage bucket with `concurrencyPolicy: Forbid`."
            }
          ],
          "commands": [
            {
              "command": "kubectl get daemonsets -n kube-system",
              "description": "List active DaemonSets running across system infrastructure nodes",
              "example": "kubectl get daemonsets -n kube-system",
              "output": "NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE\nkube-proxy    3         3         3       3            3           kubernetes.io/os=linux   45d\npromtail      3         3         3       3            3           <none>                   12d",
              "whenToUse": "Verifying that logging or monitoring agents are running on all active worker nodes"
            },
            {
              "command": "kubectl create job --from=cronjob/mongo-nightly-backup manual-backup-01",
              "description": "Trigger an immediate one-off execution of a scheduled CronJob",
              "example": "kubectl create job --from=cronjob/mongo-nightly-backup manual-backup-01",
              "output": "job.batch/manual-backup-01 created",
              "whenToUse": "Taking an immediate pre-release database snapshot before executing risky schema migrations"
            },
            {
              "command": "kubectl get jobs --watch",
              "description": "Monitor the execution and completion status of active batch jobs",
              "example": "kubectl get jobs",
              "output": "NAME                   COMPLETIONS   DURATION   AGE\nmongo-schema-migrate   1/1           14s        2m\nmanual-backup-01       1/1           42s        45s",
              "whenToUse": "Validating that automated migrations or backups completed with exit code 0"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mongo-backup-cronjob.yaml",
              "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: mongo-nightly-backup\n  namespace: production\nspec:\n  schedule: \"0 2 * * *\" # Every day at 02:00 AM UTC\n  concurrencyPolicy: Forbid\n  successfulJobsHistoryLimit: 3\n  failedJobsHistoryLimit: 5\n  jobTemplate:\n    spec:\n      backoffLimit: 3\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n          - name: mongodump\n            image: mongo:6.0.8\n            command:\n            - /bin/sh\n            - -c\n            - |\n              TIMESTAMP=$(date +%Y%m%d_%H%M%S)\n              echo \"Starting MongoDB backup at $TIMESTAMP...\"\n              mongodump --host=mern-mongo-headless --port=27017 --db=devops_db --gzip --archive=/tmp/backup_$TIMESTAMP.gz\n              echo \"Backup completed successfully! Size: $(du -h /tmp/backup_$TIMESTAMP.gz | cut -f1)\"\n              # In production: aws s3 cp /tmp/backup_$TIMESTAMP.gz s3://my-prod-backups/\n            resources:\n              requests:\n                cpu: 250m\n                memory: 512Mi\n              limits:\n                cpu: 500m\n                memory: 1Gi",
              "explanation": "Production CronJob YAML executing automated nightly MongoDB database backups with concurrency controls, failure history retention, and resource limits."
            }
          ],
          "quiz": [
            {
              "id": "k8s-batch-q1",
              "type": "multiple-choice",
              "question": "Which restartPolicy is valid for a batch Job container?",
              "options": [
                "Always",
                "OnFailure or Never",
                "Preemptible",
                "Rolling"
              ],
              "correctAnswer": "OnFailure or Never",
              "explanation": "Batch Jobs represent run-to-completion tasks. Setting restartPolicy: Always is invalid because the Pod is meant to exit upon successful completion.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-batch-q2",
              "type": "multiple-choice",
              "question": "What is the purpose of concurrencyPolicy: Forbid in a CronJob?",
              "options": [
                "It prevents multiple CronJobs from running in the same namespace",
                "It skips spawning a new Job if the previous run is still in progress",
                "It blocks all incoming network traffic to the cluster",
                "It enforces single-threaded CPU execution"
              ],
              "correctAnswer": "It skips spawning a new Job if the previous run is still in progress",
              "explanation": "concurrencyPolicy: Forbid prevents resource exhaustion by ensuring that if a previous backup or batch process is running longer than expected, new overlapping jobs are suppressed.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Database migration Job fails with \"BackoffLimitExceeded\" and kubectl get jobs shows 0/1 completions.",
              "cause": "The migration script exited with a non-zero exit code due to connection failure to MongoDB or syntax errors in schema scripts, exceeding backoffLimit retries.",
              "diagnosis": [
                "Inspect Job events: kubectl describe job mongo-schema-migrate",
                "Find failed pod name: kubectl get pods -l job-name=mongo-schema-migrate -a",
                "Read container error logs: kubectl logs <failed-pod-name>"
              ],
              "solution": "Diagnose the root cause in the container logs (e.g. wrong MongoDB password or missing collection). Delete the failed job with kubectl delete job mongo-schema-migrate, fix the issue, and re-apply.",
              "prevention": "Always test migration scripts locally against test datasets before deploying to production clusters."
            }
          ],
          "keyTakeaways": [
            "DaemonSets run exactly one Pod per worker node, perfect for logging and monitoring agents.",
            "Jobs run processes to completion (exit code 0), essential for migrations and seed scripts.",
            "CronJobs schedule batch Jobs on standard cron intervals with configurable concurrency policies.",
            "Completed Job pods remain in Completed state to preserve logs until cleaned up by TTL controllers."
          ],
          "bestPractices": [
            "Always set concurrencyPolicy: Forbid on data-intensive CronJobs like database backups.",
            "Use ttlSecondsAfterFinished in Job specs to automatically clean up completed pods.",
            "Keep successfulJobsHistoryLimit and failedJobsHistoryLimit tuned to avoid cluttering etcd."
          ],
          "securityConsiderations": [
            "Run backup containers with dedicated read-only database credentials.",
            "Store cloud bucket credentials (AWS/GCP keys) in Kubernetes Secrets rather than plaintext in Job environment variables."
          ],
          "commonMistakes": [
            "Using restartPolicy: Always on a batch Job, which causes the Job controller to reject the manifest.",
            "Leaving concurrencyPolicy as Allow for heavy backups, causing multiple instances to overwhelm the database when slow."
          ],
          "interviewQuestions": [
            "What is the difference between a DaemonSet and a Deployment?",
            "How do you handle database schema migrations in a Kubernetes GitOps pipeline using Jobs?"
          ],
          "references": [
            {
              "title": "Kubernetes CronJob and Job Documentation",
              "url": "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/",
              "type": "documentation",
              "description": "Official guide to managing scheduled and batch workloads.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-services",
            "k8s-configmaps-secrets"
          ]
        }
      ]
    },
    {
      "id": "k8s-networking",
      "title": "Networking & Services",
      "description": "Unravel Kubernetes networking from L4 to L7: Services, Ingress controllers, Gateway API, CoreDNS service discovery, and zero-trust Network Policies for the MERN stack.",
      "icon": "🌐",
      "difficulty": "intermediate",
      "estimatedHours": 5,
      "lessons": [
        {
          "id": "k8s-services",
          "title": "Services: ClusterIP, NodePort, LoadBalancer",
          "summary": "Solve the ephemeral Pod IP challenge using Kubernetes Services: understand ClusterIP, NodePort, LoadBalancer, Endpoints, and EndpointSlices.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-pods",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Understand why the ephemeral nature of Pod IPs demands a stable Service abstraction",
              "skill": "service-fundamentals"
            },
            {
              "text": "Compare and contrast ClusterIP, NodePort, LoadBalancer, and ExternalName services",
              "skill": "service-types"
            },
            {
              "text": "Explain how kube-proxy, Endpoints, and EndpointSlices map traffic to backend pods",
              "skill": "endpoint-slices"
            },
            {
              "text": "Configure port, targetPort, and nodePort for MERN frontend and backend microservices",
              "skill": "port-configuration"
            }
          ],
          "sections": [
            {
              "title": "The Ephemeral IP Problem",
              "level": "beginner",
              "content": "In Kubernetes, Pods are mortal. They are created, assigned dynamic private IP addresses by the CNI, and destroyed during rolling updates, autoscaling, or node failures.\n\nIf our React frontend needed to send HTTP requests directly to the Express backend Pod IP (`10.244.1.4`), any rolling update would break the frontend immediately.\n\nA **Service** provides an enduring, stable network abstraction:\n1. It assigns a static virtual IP address (**ClusterIP**) that never changes for the life of the Service.\n2. It assigns a stable DNS name (`mern-backend.production.svc.cluster.local`).\n3. It automatically load-balances traffic across all healthy Pods that match the Service's `selector` labels."
            },
            {
              "title": "The Four Service Types Explained",
              "level": "intermediate",
              "content": "### 1. ClusterIP (Default)\nExposes the Service on an internal, cluster-only IP. The Service is only reachable from within the cluster.\n- *MERN Use Case*: Express backend API (`mern-backend:5000`) and MongoDB database (`mern-mongo:27017`). Frontend or other pods talk to them internally without internet exposure.\n\n### 2. NodePort\nAllocates a high-range static port (default: **30000–32767**) across **every single worker node** in the cluster.\nTraffic hitting `<Any-Node-IP>:<NodePort>` is routed to the Service.\n- *Use Case*: Developer testing, on-premise setups without cloud load balancers.\n\n### 3. LoadBalancer\nIntegrates with cloud providers (AWS NLB/ALB, GCP Cloud Load Balancer, Azure LB) to provision an external public IP that forwards traffic to the Service.\n- *MERN Use Case*: Exposing our Ingress controller or React frontend to public users.\n\n### 4. ExternalName\nMaps the Service to an external DNS name (CNAME record) without proxying traffic.\n- *MERN Use Case*: Connecting your Express backend to an external cloud database like **MongoDB Atlas** (`cluster0.mongodb.net`)."
            },
            {
              "title": "Under the Hood: Endpoints & EndpointSlices",
              "level": "advanced",
              "content": "A Service does not route traffic directly to Pods. Instead, Kubernetes maintains an intermediary resource:\n- **Endpoints / EndpointSlices**: When you define a `spec.selector` on a Service, the EndpointSlice controller queries all Pods matching those labels that pass their readiness probes and records their `IP:Port` pairs.\n- `EndpointSlices` (the modern replacement for legacy Endpoints) divide endpoints into manageable 100-pod slices, preventing massive etcd write amplification in large clusters.\n- **kube-proxy** watches EndpointSlices and updates the host node's iptables or IPVS rules to distribute incoming traffic."
            }
          ],
          "commands": [
            {
              "command": "kubectl get svc -o wide",
              "description": "List all services, their ClusterIPs, external IPs, and exposed ports",
              "example": "kubectl get svc",
              "output": "NAME           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE\nkubernetes     ClusterIP   10.96.0.1       <none>        443/TCP          45d\nmern-backend   ClusterIP   10.96.182.44    <none>        5000/TCP         12d\nmern-frontend  NodePort    10.96.220.101   <none>        80:30080/TCP     12d",
              "whenToUse": "Inspecting assigned cluster virtual IPs and port mappings"
            },
            {
              "command": "kubectl get endpointslices -l kubernetes.io/service-name=mern-backend",
              "description": "View the active backing pod IP endpoints for a given service",
              "example": "kubectl get endpointslices -l kubernetes.io/service-name=mern-backend",
              "output": "NAME                 ADDRESSTYPE   PORTS   ENDPOINTS                            AGE\nmern-backend-67xbk   IPv4          5000    10.244.1.4,10.244.1.5,10.244.2.10   12d",
              "whenToUse": "Troubleshooting why a service has no active backing endpoints"
            },
            {
              "command": "kubectl port-forward svc/mern-backend 8080:5000",
              "description": "Forward a local workstation port directly to a Kubernetes Service without exposing it publicly",
              "example": "kubectl port-forward svc/mern-backend 8080:5000",
              "output": "Forwarding from 127.0.0.1:8080 -> 5000\nForwarding from [::1]:8080 -> 5000\nHandling connection for 8080",
              "whenToUse": "Local development and debugging internal private services from localhost"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-services.yaml",
              "code": "# Internal ClusterIP Service for Express Backend\napiVersion: v1\nkind: Service\nmetadata:\n  name: mern-backend\n  labels:\n    app.kubernetes.io/name: mern-backend\n    app.kubernetes.io/component: api\nspec:\n  type: ClusterIP\n  selector:\n    app.kubernetes.io/name: mern-backend\n  ports:\n  - name: http\n    port: 5000        # Port exposed by the Service ClusterIP\n    targetPort: 5000  # Port listened to by Express inside the container\n    protocol: TCP\n---\n# NodePort Service exposing React Frontend for local testing\napiVersion: v1\nkind: Service\nmetadata:\n  name: mern-frontend\n  labels:\n    app.kubernetes.io/name: mern-frontend\n    app.kubernetes.io/component: ui\nspec:\n  type: NodePort\n  selector:\n    app.kubernetes.io/name: mern-frontend\n  ports:\n  - name: http\n    port: 80          # ClusterIP port\n    targetPort: 80    # Nginx container port\n    nodePort: 30080   # Port exposed on every worker node (30000-32767)\n    protocol: TCP",
              "explanation": "Declarative manifests creating an internal ClusterIP service for the Express backend and a NodePort service exposing the React frontend on static port 30080."
            }
          ],
          "quiz": [
            {
              "id": "k8s-svc-q1",
              "type": "multiple-choice",
              "question": "What is the default Service type in Kubernetes if the \"type\" field is omitted?",
              "options": [
                "NodePort",
                "ClusterIP",
                "LoadBalancer",
                "ExternalName"
              ],
              "correctAnswer": "ClusterIP",
              "explanation": "ClusterIP is the default service type. It creates an internal virtual IP accessible only within the cluster boundaries.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-svc-q2",
              "type": "multiple-choice",
              "question": "What happens if a pod matching a Service selector fails its readiness probe?",
              "options": [
                "The pod is immediately terminated and rescheduled",
                "The pod IP is removed from the EndpointSlice, so no traffic is routed to it",
                "The entire Service is deleted",
                "The Service continues sending traffic until a liveness probe fails"
              ],
              "correctAnswer": "The pod IP is removed from the EndpointSlice, so no traffic is routed to it",
              "explanation": "Readiness probes control traffic routing. If a pod fails readiness, its IP is automatically pulled from EndpointSlices, preventing clients from receiving 502/503 errors.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Connecting to mern-backend:5000 returns \"Connection refused\" or times out, and kubectl get endpoints mern-backend shows \"<none>\".",
              "cause": "The labels defined in the Service spec.selector do not match the labels in the Deployment pod template, or the pods are failing readiness probes.",
              "diagnosis": [
                "Check Service selector: kubectl get svc mern-backend -o jsonpath=\"{.spec.selector}\"",
                "Check Pod labels: kubectl get pods --show-labels -l app.kubernetes.io/name=mern-backend",
                "Check pod readiness: kubectl get pods -l app.kubernetes.io/name=mern-backend"
              ],
              "solution": "Ensure the selector in the Service YAML exactly matches the metadata.labels in the Deployment spec.template. Fix any failing readiness probes in the application.",
              "prevention": "Use standardized Kubernetes recommended labels (app.kubernetes.io/name) across Deployments and Services."
            }
          ],
          "keyTakeaways": [
            "Services provide permanent IP and DNS endpoints in front of dynamic, ephemeral Pods.",
            "ClusterIP is for internal traffic; NodePort and LoadBalancer expose services externally.",
            "EndpointSlices track the live IP:Port targets of pods that pass readiness probes.",
            "port is the Service port; targetPort is the container listener port."
          ],
          "bestPractices": [
            "Use ClusterIP for all internal microservices and databases.",
            "Name your service ports (e.g. name: http) so Ingress and Prometheus can reference them by name.",
            "Use kubectl port-forward for secure ad-hoc troubleshooting instead of opening NodePorts."
          ],
          "securityConsiderations": [
            "Never expose database services like MongoDB using LoadBalancer or NodePort types.",
            "Pair Services with NetworkPolicies to restrict which pods can communicate over ClusterIP."
          ],
          "commonMistakes": [
            "Confusing port (the Service front-end port) with targetPort (the container internal port).",
            "Typos in spec.selector labels causing the service to have 0 endpoints."
          ],
          "interviewQuestions": [
            "Explain the difference between port, targetPort, and nodePort in a Kubernetes Service.",
            "What is an EndpointSlice and how does kube-proxy use it to route traffic?"
          ],
          "references": [
            {
              "title": "Kubernetes Services Concept",
              "url": "https://kubernetes.io/docs/concepts/services-networking/service/",
              "type": "documentation",
              "description": "Comprehensive guide to Kubernetes services and endpoint routing.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-ingress",
            "k8s-dns"
          ]
        },
        {
          "id": "k8s-ingress",
          "title": "Ingress & Gateway API",
          "summary": "Route production HTTP/HTTPS traffic to MERN microservices using Ingress controllers, TLS termination with cert-manager, path-based routing, and explore the next-gen Gateway API.",
          "estimatedMinutes": 40,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-services"
          ],
          "objectives": [
            {
              "text": "Explain why L7 Ingress is preferred over provisioning multiple cloud LoadBalancers",
              "skill": "ingress-fundamentals"
            },
            {
              "text": "Configure path-based routing (/ -> frontend, /api -> backend) using Ingress-Nginx",
              "skill": "path-routing"
            },
            {
              "text": "Implement automated TLS certificate issuance and renewal via cert-manager and Let's Encrypt",
              "skill": "tls-termination"
            },
            {
              "text": "Understand the architectural advantages of the next-generation Kubernetes Gateway API",
              "skill": "gateway-api"
            }
          ],
          "sections": [
            {
              "title": "Why Ingress? L4 vs L7 Routing",
              "level": "beginner",
              "content": "In a microservices architecture, you might have dozens of backend services. If you created a `LoadBalancer` service for each one:\n- Each LoadBalancer provisions an expensive cloud load balancer (costing $15–$25/month per service on AWS/GCP).\n- Managing dozens of public IP addresses and DNS records becomes an operational nightmare.\n- You have no layer-7 awareness (cannot inspect HTTP headers, cookies, or URL paths).\n\nAn **Ingress** acts as a centralized Layer 7 smart router and reverse proxy. It runs inside the cluster, sits behind a single external LoadBalancer, and routes external HTTP/HTTPS traffic based on hostnames and URL paths."
            },
            {
              "title": "Ingress Controller vs Ingress Resource",
              "level": "intermediate",
              "content": "To use Ingress, two components are required:\n1. **Ingress Controller**: The actual running proxy software (e.g., `ingress-nginx`, Traefik, Envoy, HAProxy). It constantly watches the API server for Ingress resources and re-configures its reverse proxy rules.\n2. **Ingress Resource**: The declarative YAML manifest that defines the routing rules, hostnames, TLS certificates, and backend services.\n\n### Routing the MERN Stack:\nWe configure a single unified Ingress rule for our domain `devops.example.com`:\n- Traffic for `/api` is routed to `mern-backend:5000`.\n- All other traffic (`/`) is routed to `mern-frontend:80` (React SPA)."
            },
            {
              "title": "Automated TLS with cert-manager & The Gateway API",
              "level": "advanced",
              "content": "### Automated TLS Termination\nUsing **cert-manager**, we can annotate our Ingress resource with `cert-manager.io/cluster-issuer: letsencrypt-prod`.\ncert-manager automatically performs ACME HTTP-01 challenges, obtains a trusted TLS certificate from Let's Encrypt, stores it in a Kubernetes Secret (`tls.crt`, `tls.key`), and binds it to the Ingress for HTTPS termination.\n\n### The Next Generation: Gateway API\nThe traditional Ingress resource suffered from monolithic configuration: application developers and cluster administrators had to edit the exact same file.\n\nThe **Kubernetes Gateway API** replaces Ingress with role-oriented resources:\n- **GatewayClass**: Defined by cluster infrastructure providers (e.g., Envoy, Cilium).\n- **Gateway**: Managed by Platform / DevOps engineers (defines ports, TLS certs, and listening addresses).\n- **HTTPRoute**: Managed by Application developers (attaches routing paths and canary weightings to backend services)."
            }
          ],
          "commands": [
            {
              "command": "kubectl get ingress -A",
              "description": "List all ingress rules across all namespaces with their hosts and assigned public address",
              "example": "kubectl get ingress -A",
              "output": "NAMESPACE    NAME           CLASS   HOSTS                ADDRESS         PORTS     AGE\nproduction   mern-ingress   nginx   devops.example.com   34.120.55.19    80, 443   18d",
              "whenToUse": "Checking if an Ingress resource has been assigned an external IP by the ingress controller"
            },
            {
              "command": "kubectl describe ingress mern-ingress -n production",
              "description": "Display detailed routing rules, TLS configuration, and backend service mappings",
              "example": "kubectl describe ingress mern-ingress -n production",
              "output": "Rules:\n  Host                Path  Backends\n  ----                ----  --------\n  devops.example.com  \n                      /api(/|$)(.*)   mern-backend:5000 (10.244.1.4:5000)\n                      /(.*)           mern-frontend:80 (10.244.2.8:80)\nTLS:\n  mern-tls-secret terminates devops.example.com",
              "whenToUse": "Verifying path matching rules and verifying backend endpoint resolution"
            },
            {
              "command": "curl -k -H \"Host: devops.example.com\" https://<INGRESS-IP>/api/health",
              "description": "Test ingress path routing using Host header spoofing before public DNS propagation",
              "example": "curl -k -H \"Host: devops.example.com\" https://127.0.0.1/api/health",
              "output": "{\"status\":\"ok\",\"database\":\"connected\"}",
              "whenToUse": "Testing Ingress rules locally against kind or minikube"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-ingress.yaml",
              "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: mern-ingress\n  namespace: production\n  annotations:\n    kubernetes.io/ingress.class: \"nginx\"\n    cert-manager.io/cluster-issuer: \"letsencrypt-prod\"\n    nginx.ingress.kubernetes.io/use-regex: \"true\"\n    nginx.ingress.kubernetes.io/proxy-body-size: \"10m\"\n    nginx.ingress.kubernetes.io/ssl-redirect: \"true\"\nspec:\n  tls:\n  - hosts:\n    - devops.example.com\n    secretName: mern-tls-secret\n  rules:\n  - host: devops.example.com\n    http:\n      paths:\n      # Route API requests to Node.js Express backend\n      - path: /api(/|$)(.*)\n        pathType: ImplementationSpecific\n        backend:\n          service:\n            name: mern-backend\n            port:\n              number: 5000\n      # Route all other frontend requests to React Nginx container\n      - path: /()(.*)\n        pathType: ImplementationSpecific\n        backend:\n          service:\n            name: mern-frontend\n            port:\n              number: 80",
              "explanation": "Production Ingress configuration providing SSL termination, path-based routing between React and Express, and automated Let's Encrypt TLS issuance via cert-manager."
            }
          ],
          "quiz": [
            {
              "id": "k8s-ing-q1",
              "type": "multiple-choice",
              "question": "What is the role of an Ingress Controller in Kubernetes?",
              "options": [
                "It allocates static IP addresses to worker nodes",
                "It is the running proxy daemon (e.g. Nginx) that reads Ingress resources and routes external HTTP traffic",
                "It acts as the primary distributed database replacing etcd",
                "It generates Docker container images"
              ],
              "correctAnswer": "It is the running proxy daemon (e.g. Nginx) that reads Ingress resources and routes external HTTP traffic",
              "explanation": "Creating an Ingress resource YAML does nothing unless an Ingress Controller (such as ingress-nginx or Traefik) is running in the cluster to execute the routing rules.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-ing-q2",
              "type": "multiple-choice",
              "question": "How does the Kubernetes Gateway API improve upon the traditional Ingress resource?",
              "options": [
                "It removes the need for TLS certificates",
                "It separates responsibilities by role: Gateway for infrastructure/ops, and HTTPRoute for application developers",
                "It only works with non-HTTP protocols",
                "It runs inside the Linux kernel via eBPF exclusively"
              ],
              "correctAnswer": "It separates responsibilities by role: Gateway for infrastructure/ops, and HTTPRoute for application developers",
              "explanation": "Gateway API provides role-oriented design: platform teams manage Gateways (hosts, certs, infrastructure), while dev teams independently manage HTTPRoutes for their specific microservices.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Requesting https://devops.example.com/api/products returns \"404 Not Found\" from Express backend.",
              "cause": "Path rewriting is not configured, so the full \"/api/products\" URI is forwarded to Express when Express may only be listening on \"/products\", or pathType: Prefix matched incorrectly.",
              "diagnosis": [
                "Inspect ingress controller logs: kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=50",
                "Check rewrite annotations in the Ingress manifest",
                "Inspect Express route definitions"
              ],
              "solution": "Ensure Express app mounts routes under \"/api\" (e.g. app.use(\"/api\", router)) OR configure nginx.ingress.kubernetes.io/rewrite-target: /$2 with regex path capture.",
              "prevention": "Standardize API URL path prefixes in your Express application codebase."
            }
          ],
          "keyTakeaways": [
            "Ingress provides Layer 7 HTTP/HTTPS routing, host matching, and TLS termination.",
            "An Ingress Resource is just configuration; an Ingress Controller is the proxy that executes it.",
            "cert-manager automates issuance and renewal of Let's Encrypt SSL certificates.",
            "Gateway API provides modern, role-oriented routing decoupling ops from app developers."
          ],
          "bestPractices": [
            "Enforce ssl-redirect: \"true\" to automatically upgrade HTTP requests to HTTPS.",
            "Set proxy-body-size annotations to prevent clients from uploading massive payloads that cause memory spikes.",
            "Use pathType: Prefix rather than Exact for nested application routes."
          ],
          "securityConsiderations": [
            "Configure TLS 1.3 as the minimum protocol version in ingress controller configmaps.",
            "Enable rate limiting annotations on sensitive endpoints like /api/login."
          ],
          "commonMistakes": [
            "Deploying an Ingress manifest without having an Ingress Controller installed in the cluster.",
            "Path collision where a root path rule (/) matches and intercepts requests intended for /api."
          ],
          "interviewQuestions": [
            "What is the difference between a Kubernetes Service of type LoadBalancer and an Ingress?",
            "How does cert-manager integrate with Kubernetes Ingress to automate TLS certificates?"
          ],
          "references": [
            {
              "title": "Kubernetes Ingress Concept",
              "url": "https://kubernetes.io/docs/concepts/services-networking/ingress/",
              "type": "documentation",
              "description": "Official Kubernetes Ingress reference and routing behavior.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-dns",
            "k8s-network-policies"
          ]
        },
        {
          "id": "k8s-dns",
          "title": "DNS & Service Discovery",
          "summary": "Master internal cluster DNS: CoreDNS architecture, FQDN resolution mechanics, resolv.conf search paths, ndots:5 latency implications, and pod-to-pod discovery.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-services"
          ],
          "objectives": [
            {
              "text": "Deconstruct the Fully Qualified Domain Name (FQDN) structure of Kubernetes services and pods",
              "skill": "fqdn-structure"
            },
            {
              "text": "Understand CoreDNS architecture and the Corefile configuration plugin chain",
              "skill": "coredns"
            },
            {
              "text": "Analyze /etc/resolv.conf and diagnose the notorious ndots:5 performance issue",
              "skill": "dns-tuning"
            },
            {
              "text": "Trace how Express backend pods resolve MongoDB StatefulSet headless endpoints",
              "skill": "service-discovery"
            }
          ],
          "sections": [
            {
              "title": "How Service Discovery Works: The FQDN",
              "level": "beginner",
              "content": "In Kubernetes, you never hardcode IP addresses. Pods discover other services using **CoreDNS**, an internal DNS server that runs natively in the cluster.\n\nEvery Service receives an authoritative **Fully Qualified Domain Name (FQDN)** with the following structure:\n```\n<service-name>.<namespace>.svc.<cluster-domain>\n```\n\nFor our Express backend running in the `production` namespace on a default cluster:\n```\nmern-backend.production.svc.cluster.local\n```\n\n### Short-Name Resolution:\n- If our React frontend is in the **same namespace** (`production`), it can address the backend simply as:\n  `http://mern-backend:5000`\n- If a pod is in a **different namespace** (e.g. `staging`), it must specify the namespace:\n  `http://mern-backend.production:5000`"
            },
            {
              "title": "CoreDNS Internals & The Corefile",
              "level": "intermediate",
              "content": "CoreDNS runs as a Deployment in the `kube-system` namespace, exposed via a ClusterIP service (typically `10.96.0.10`). It is configured through a ConfigMap containing the **Corefile**.\n\nThe Corefile defines a pipeline of plugins:\n```text\n.:53 {\n    errors\n    health\n    kubernetes cluster.local in-addr.arpa ip6.arpa {\n        pods insecure\n        fallthrough in-addr.arpa ip6.arpa\n    }\n    forward . /etc/resolv.conf\n    cache 30\n    reload\n}\n```\n- **kubernetes plugin**: Intercepts queries ending in `cluster.local` and resolves them directly from the API server cache.\n- **forward plugin**: Forwards external queries (e.g., `api.stripe.com`, `github.com`) to the upstream DNS resolvers defined on the host node.\n- **cache plugin**: Caches DNS responses for 30 seconds to minimize API server load."
            },
            {
              "title": "The \"ndots: 5\" Dilemma & Performance Tuning",
              "level": "advanced",
              "content": "Every pod created in Kubernetes has its `/etc/resolv.conf` automatically injected by the Kubelet:\n```text\nnameserver 10.96.0.10\nsearch production.svc.cluster.local svc.cluster.local cluster.local\noptions ndots:5\n```\n\n### What is `ndots: 5`?\nThe `ndots: 5` option tells the resolver: *If a queried hostname contains fewer than 5 dots, try resolving it by appending each search domain in order BEFORE attempting an external lookup.*\n\n### The Problem with External APIs:\nWhen our Express backend calls an external API like `api.github.com` (contains 2 dots, which is $< 5$):\n1. Query 1: `api.github.com.production.svc.cluster.local` $\\to$ NXDOMAIN\n2. Query 2: `api.github.com.svc.cluster.local` $\\to$ NXDOMAIN\n3. Query 3: `api.github.com.cluster.local` $\\to$ NXDOMAIN\n4. Query 4: `api.github.com` $\\to$ SUCCESS!\n\nEach external API call generates **3 wasted DNS queries**, increasing latency and overloading CoreDNS!\n\n### The Solution:\n1. Append a trailing dot to external hostnames in application code (`api.github.com.`), which tells the resolver it is an absolute domain.\n2. Or tune `spec.dnsConfig` in your Deployment to set `ndots: 2`."
            }
          ],
          "commands": [
            {
              "command": "kubectl get pods -n kube-system -l k8s-app=kube-dns",
              "description": "Check the status and replica health of the CoreDNS cluster pods",
              "example": "kubectl get pods -n kube-system -l k8s-app=kube-dns",
              "output": "NAME                       READY   STATUS    RESTARTS   AGE\ncoredns-7db6d8ff4d-5q8vx   1/1     Running   0          45d\ncoredns-7db6d8ff4d-z9m4k   1/1     Running   0          45d",
              "whenToUse": "Verifying internal DNS server availability during cluster troubleshooting"
            },
            {
              "command": "kubectl run dnsutils --image=tutum/dnsutils --rm -it -- nslookup mern-backend",
              "description": "Spin up an ephemeral pod to test DNS resolution of a service name",
              "example": "kubectl run dnsutils --image=tutum/dnsutils --rm -it -- nslookup mern-backend",
              "output": "Server:         10.96.0.10\nAddress:        10.96.0.10#53\n\nName:   mern-backend.production.svc.cluster.local\nAddress: 10.96.182.44",
              "whenToUse": "Validating service DNS resolution from inside the cluster network"
            },
            {
              "command": "kubectl exec -it deployment/mern-backend -- cat /etc/resolv.conf",
              "description": "Inspect the DNS configuration and search paths injected into an application container",
              "example": "kubectl exec -it deployment/mern-backend -- cat /etc/resolv.conf",
              "output": "nameserver 10.96.0.10\nsearch default.svc.cluster.local svc.cluster.local cluster.local\noptions ndots:5",
              "whenToUse": "Auditing ndots settings and nameserver configurations on running workloads"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-backend-dns-tuned.yaml",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  namespace: production\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mern-backend\n  template:\n    metadata:\n      labels:\n        app: mern-backend\n    spec:\n      # Tuning DNS to avoid ndots:5 external query amplification\n      dnsPolicy: ClusterFirst\n      dnsConfig:\n        options:\n        - name: ndots\n          value: \"2\"\n        - name: single-request-reopen\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.1.0\n        env:\n        - name: MONGO_URI\n          # Resolves via headless service DNS\n          value: \"mongodb://mern-mongo-0.mern-mongo-headless.production.svc.cluster.local:27017/devops_db\"",
              "explanation": "Tuned Deployment configuration overriding ndots to 2, preventing excessive DNS search path amplification when connecting to external APIs and internal databases."
            }
          ],
          "quiz": [
            {
              "id": "k8s-dns-q1",
              "type": "multiple-choice",
              "question": "What is the full FQDN for a service named \"auth-api\" in namespace \"security\" on a standard cluster?",
              "options": [
                "auth-api.security.cluster.local",
                "auth-api.security.svc.cluster.local",
                "auth-api.k8s.security.local",
                "security.auth-api.pod.cluster"
              ],
              "correctAnswer": "auth-api.security.svc.cluster.local",
              "explanation": "The standard Kubernetes service FQDN format is <service-name>.<namespace>.svc.<cluster-domain>, resulting in auth-api.security.svc.cluster.local.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-dns-q2",
              "type": "multiple-choice",
              "question": "Why does the default \"options ndots:5\" setting cause performance issues for high-throughput microservices querying external domains?",
              "options": [
                "It forces DNS queries to be sent over unencrypted HTTP",
                "Any external domain with fewer than 5 dots (e.g. api.stripe.com) triggers failed internal search queries before external lookup",
                "It disables DNS caching in CoreDNS",
                "It limits the container to 5 concurrent DNS queries"
              ],
              "correctAnswer": "Any external domain with fewer than 5 dots (e.g. api.stripe.com) triggers failed internal search queries before external lookup",
              "explanation": "ndots:5 means any query with fewer than 5 dots appends cluster search paths first. api.stripe.com has 2 dots, generating 3 NXDOMAIN queries before finally querying the public internet.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Express backend pods throw \"getaddrinfo ENOTFOUND mern-mongo\" errors intermittently or take 5+ seconds to resolve external domains.",
              "cause": "CoreDNS pods are CPU-throttled, crashed, or saturated with queries caused by ndots:5 search path amplification.",
              "diagnosis": [
                "Check CoreDNS logs: kubectl logs -n kube-system -l k8s-app=kube-dns --tail=100",
                "Check CoreDNS CPU usage: kubectl top pods -n kube-system -l k8s-app=kube-dns",
                "Test DNS lookup latency: kubectl exec -it <pod> -- time nslookup api.github.com"
              ],
              "solution": "Scale up CoreDNS replicas: kubectl scale deployment/coredns -n kube-system --replicas=4. Deploy NodeLocal DNSCache to cache DNS queries locally on each node.",
              "prevention": "Deploy NodeLocal DNSCache in large clusters and tune pod dnsConfig with ndots:2 or use trailing dots on external hostnames."
            }
          ],
          "keyTakeaways": [
            "CoreDNS provides internal cluster name resolution mapping Service names to ClusterIPs.",
            "Services follow the FQDN pattern <service>.<namespace>.svc.cluster.local.",
            "Pods in the same namespace can use short names (e.g., mern-backend).",
            "ndots:5 causes external host queries to evaluate internal search paths first, which can degrade network performance."
          ],
          "bestPractices": [
            "Deploy NodeLocal DNSCache in clusters with high DNS query volumes.",
            "Use FQDNs or namespace-qualified names when communicating across namespaces.",
            "Use trailing dots on external API domains (e.g. api.sendgrid.com.) to bypass local search paths."
          ],
          "securityConsiderations": [
            "Do not allow untrusted user input to dictate DNS query names, preventing DNS rebinding attacks.",
            "Ensure CoreDNS is not configured to act as an open recursive resolver to the public internet."
          ],
          "commonMistakes": [
            "Assuming a pod in namespace \"staging\" can reach a service in namespace \"prod\" using just the short name.",
            "Ignoring CoreDNS CPU utilization, leading to silent connection timeouts across the entire cluster."
          ],
          "interviewQuestions": [
            "Trace what happens when an application inside a Kubernetes pod makes an HTTP call to \"http://mern-backend:5000\".",
            "Explain the \"ndots:5\" problem in Kubernetes and how you would mitigate it in production."
          ],
          "references": [
            {
              "title": "DNS for Services and Pods",
              "url": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/",
              "type": "documentation",
              "description": "Official specification for Kubernetes internal DNS and search paths.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-network-policies",
            "k8s-configmaps-secrets"
          ]
        },
        {
          "id": "k8s-network-policies",
          "title": "Network Policies",
          "summary": "Implement Zero-Trust network security: enforce default-deny ingress and egress rules, and restrict pod-to-pod communication so only Express can reach MongoDB.",
          "estimatedMinutes": 40,
          "difficulty": "advanced",
          "prerequisites": [
            "k8s-services",
            "k8s-dns"
          ],
          "objectives": [
            {
              "text": "Understand the default flat network model and why Zero-Trust security is critical",
              "skill": "zero-trust"
            },
            {
              "text": "Verify CNI network policy support (Calico, Cilium) vs basic providers (Flannel)",
              "skill": "cni-policies"
            },
            {
              "text": "Construct default-deny ingress and egress NetworkPolicy manifests",
              "skill": "default-deny"
            },
            {
              "text": "Lock down the MERN stack: isolate MongoDB port 27017 exclusively to Express backend pods",
              "skill": "mern-security"
            }
          ],
          "sections": [
            {
              "title": "The Default Flat Network: A Security Risk",
              "level": "beginner",
              "content": "By default, Kubernetes implements a **flat, non-isolated network model**:\n- Every pod can communicate with every other pod across all namespaces without NAT.\n- If a vulnerability in our React frontend (or an unauthenticated public pod) is exploited, an attacker can directly probe and query our MongoDB database on `10.244.2.8:27017`.\n\nTo achieve production compliance (SOC2, PCI-DSS, ISO 27001), you must enforce **Zero-Trust Network Policies**."
            },
            {
              "title": "CNI Requirements & Policy Mechanics",
              "level": "intermediate",
              "content": "### CNI Plugin Requirement\nNetworkPolicy is an API resource, but Kubernetes itself does not enforce it! Enforcing policies requires a **Network Policy Controller** provided by advanced CNI plugins:\n- **Enforces NetworkPolicy**: Calico, Cilium, Weave Net, AWS VPC CNI (with policy controller).\n- **Does NOT Enforce NetworkPolicy**: Standard Flannel (unless paired with Calico Canal).\n\n### How Policies Work:\n- **Selectors**: Policies use `podSelector` to define which pods the policy applies to.\n- **policyTypes**: Can govern `Ingress` (incoming traffic), `Egress` (outgoing traffic), or both.\n- **Additive Behavior**: NetworkPolicies are additive. If any policy matches a pod, only explicitly allowed traffic is permitted."
            },
            {
              "title": "Locking Down the MERN Stack",
              "level": "advanced",
              "content": "### 1. The Golden Rule: Default Deny\nWe first apply a **Default Deny All Ingress** policy to the namespace. All incoming pod traffic is blocked immediately.\n\n### 2. Isolate MongoDB\nWe create a policy specifically targeting pods with `app: mern-mongo`:\n- Allow **Ingress** on TCP port `27017` **ONLY** from pods with label `app.kubernetes.io/name: mern-backend`.\n- All other pods (including frontend pods, rogue containers, or pods in other namespaces) are rejected.\n\n### 3. Allow Express Egress to DNS and MongoDB\nThe Express backend must be granted egress to:\n- UDP/TCP port `53` (CoreDNS) for hostname resolution.\n- TCP port `27017` (MongoDB StatefulSet)."
            }
          ],
          "commands": [
            {
              "command": "kubectl get netpol -n production",
              "description": "List all active NetworkPolicies in the specified namespace",
              "example": "kubectl get netpol -n production",
              "output": "NAME                   POD-SELECTOR          AGE\ndefault-deny-ingress   <none>                18d\nisolate-mongo          app=mern-mongo        18d\nallow-backend-egress   app=mern-backend      18d",
              "whenToUse": "Auditing active firewall and isolation policies in production"
            },
            {
              "command": "kubectl describe netpol isolate-mongo -n production",
              "description": "Inspect detailed ingress and egress allow rules for the MongoDB isolation policy",
              "example": "kubectl describe netpol isolate-mongo -n production",
              "output": "Type: Ingress\nAllowing ingress traffic:\n  To Port: 27017/TCP\n  From:\n    PodSelector: app.kubernetes.io/name=mern-backend\nNot affecting egress traffic",
              "whenToUse": "Verifying that only authorized pods can reach database ports"
            },
            {
              "command": "kubectl run unauthorized-test --rm -it --image=busybox -- nc -z -v -w 3 mern-mongo 27017",
              "description": "Verify NetworkPolicy enforcement by testing connection from an unauthorized pod",
              "example": "kubectl run unauthorized-test --rm -it --image=busybox -- nc -z -v -w 3 mern-mongo 27017",
              "output": "nc: mern-mongo (10.96.150.20:27017): Operation timed out",
              "whenToUse": "Validating that NetworkPolicy successfully drops unauthorized traffic"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-network-policies.yaml",
              "code": "# 1. Baseline: Default Deny all incoming traffic in the namespace\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-ingress\n  namespace: production\nspec:\n  podSelector: {} # Matches all pods in this namespace\n  policyTypes:\n  - Ingress\n---\n# 2. Strict isolation: Only Express backend can connect to MongoDB\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: isolate-mongo\n  namespace: production\nspec:\n  podSelector:\n    matchLabels:\n      app: mern-mongo\n  policyTypes:\n  - Ingress\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          app.kubernetes.io/name: mern-backend\n    ports:\n    - protocol: TCP\n      port: 27017\n---\n# 3. Allow Express backend to resolve DNS and connect to MongoDB\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: allow-backend-egress\n  namespace: production\nspec:\n  podSelector:\n    matchLabels:\n      app.kubernetes.io/name: mern-backend\n  policyTypes:\n  - Egress\n  egress:\n  # Allow CoreDNS lookups\n  - to:\n    - namespaceSelector: {}\n      podSelector:\n        matchLabels:\n          k8s-app: kube-dns\n    ports:\n    - protocol: UDP\n      port: 53\n    - protocol: TCP\n      port: 53\n  # Allow connection to MongoDB\n  - to:\n    - podSelector:\n        matchLabels:\n          app: mern-mongo\n    ports:\n    - protocol: TCP\n      port: 27017",
              "explanation": "Production Zero-Trust NetworkPolicy suite enforcing default-deny ingress, isolating MongoDB port 27017 to the Express backend, and permitting CoreDNS resolution."
            }
          ],
          "quiz": [
            {
              "id": "k8s-netpol-q1",
              "type": "multiple-choice",
              "question": "If you apply a NetworkPolicy with \"podSelector: {}\" and \"policyTypes: [Ingress]\", what happens to incoming traffic in that namespace?",
              "options": [
                "All traffic is allowed without restriction",
                "All ingress traffic to all pods in that namespace is immediately dropped (default deny)",
                "Only external internet traffic is blocked; pod-to-pod traffic remains open",
                "The API server rejects the policy as invalid"
              ],
              "correctAnswer": "All ingress traffic to all pods in that namespace is immediately dropped (default deny)",
              "explanation": "An empty podSelector: {} matches every pod in the namespace. With policyTypes: [Ingress] and no ingress rules defined, it creates a Default Deny policy blocking all incoming traffic.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-netpol-q2",
              "type": "multiple-choice",
              "question": "Why must you explicitly allow egress to port 53 UDP/TCP when defining egress network policies for an application pod?",
              "options": [
                "Port 53 is used for Kubernetes heartbeat monitoring",
                "Without port 53 egress, the pod cannot perform DNS queries via CoreDNS, breaking hostname resolution",
                "To allow kubelet liveness probes",
                "Port 53 is required for Linux kernel logging"
              ],
              "correctAnswer": "Without port 53 egress, the pod cannot perform DNS queries via CoreDNS, breaking hostname resolution",
              "explanation": "DNS uses port 53 UDP/TCP. If you enforce egress filtering on a pod without explicitly whitelisting CoreDNS, all hostname lookups will fail with ENOTFOUND.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "After applying NetworkPolicy, the Express backend logs show \"MongooseServerSelectionError: connect ECONNREFUSED\" or times out connecting to MongoDB.",
              "cause": "The egress policy on the Express pod blocked port 27017, or the ingress policy on MongoDB has a typo in the podSelector matching the backend.",
              "diagnosis": [
                "Verify backend labels match policy: kubectl get pods -l app.kubernetes.io/name=mern-backend --show-labels",
                "Test DNS resolution inside backend pod: kubectl exec -it deployment/mern-backend -- nslookup mern-mongo-headless",
                "Check CNI policy drop logs: kubectl logs -n kube-system -l k8s-app=calico-node | grep -i drop"
              ],
              "solution": "Ensure the podSelector labels match exactly. Confirm egress to CoreDNS port 53 is permitted so the backend can resolve the MongoDB service FQDN.",
              "prevention": "Test network policy changes in a non-production namespace using automated network policy simulators like cyclonus before rolling out to production."
            }
          ],
          "keyTakeaways": [
            "By default, Kubernetes networking is completely open (all pods can reach all pods).",
            "NetworkPolicies require a supporting CNI (Calico, Cilium) to enforce rules.",
            "Always start with a default-deny ingress policy and incrementally whitelist required traffic.",
            "Remember to explicitly allow egress to CoreDNS (port 53 UDP/TCP) when restricting egress."
          ],
          "bestPractices": [
            "Isolate databases (MongoDB) so only authorized application backend pods can communicate on port 27017.",
            "Use namespaceSelector to isolate production workloads from staging and development environments.",
            "Regularly test network policies using ephemeral test pods to verify deny rules work as expected."
          ],
          "securityConsiderations": [
            "Do not rely on Kubernetes NetworkPolicy if your CNI does not support it (e.g. standard Flannel).",
            "Combine NetworkPolicy with Service Mesh mTLS (e.g. Istio or Linkerd) for encryption in transit."
          ],
          "commonMistakes": [
            "Applying an egress policy that blocks DNS port 53, causing immediate application failure.",
            "Assuming NetworkPolicy works out-of-the-box on managed cloud clusters without enabling network policy addons."
          ],
          "interviewQuestions": [
            "What happens when you apply a NetworkPolicy to a Kubernetes cluster that is running standard Flannel CNI?",
            "How would you design a zero-trust network policy architecture for a 3-tier MERN stack?"
          ],
          "references": [
            {
              "title": "Kubernetes Network Policies",
              "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
              "type": "documentation",
              "description": "Official guide to declaring pod network isolation rules.",
              "difficulty": "advanced",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-configmaps-secrets",
            "k8s-storage"
          ]
        }
      ]
    },
    {
      "id": "k8s-config",
      "title": "Configuration & Storage",
      "description": "Manage dynamic application configuration, persistent database volumes, CPU/memory resource boundaries, and self-healing health probes for production MERN workloads.",
      "icon": "⚙️",
      "difficulty": "intermediate",
      "estimatedHours": 5,
      "lessons": [
        {
          "id": "k8s-configmaps-secrets",
          "title": "ConfigMaps & Secrets",
          "summary": "Decouple configuration and sensitive credentials from container images using ConfigMaps and Secrets: env vars vs volume mounts, secret types, and KMS encryption.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Apply 12-Factor App methodology by decoupling code from configuration",
              "skill": "twelve-factor-config"
            },
            {
              "text": "Compare injecting config via environment variables versus volume mounts",
              "skill": "config-injection"
            },
            {
              "text": "Differentiate Kubernetes Secret types (Opaque, TLS, dockerconfigjson)",
              "skill": "secret-types"
            },
            {
              "text": "Understand base64 encoding vs encryption-at-rest with KMS and External Secrets",
              "skill": "secrets-security"
            }
          ],
          "sections": [
            {
              "title": "Decoupling Code from Configuration",
              "level": "beginner",
              "content": "The third principle of the **12-Factor App** dictates that configuration must be strictly separated from code. Building separate container images for development, staging, and production is an anti-pattern. You should build a single immutable image (`ghcr.io/org/mern-backend:1.1.0`) and inject runtime configuration dynamically.\n\nKubernetes provides two primitives for externalizing configuration:\n1. **ConfigMap**: Stores non-confidential key-value pairs (e.g., `PORT`, `NODE_ENV`, `LOG_LEVEL`, or entire configuration files like `nginx.conf`).\n2. **Secret**: Stores confidential data (e.g., database passwords, JWT signing keys, TLS private keys, API tokens)."
            },
            {
              "title": "Environment Variables vs Volume Mounts",
              "level": "intermediate",
              "content": "There are two primary ways an application container consumes ConfigMaps and Secrets:\n\n### 1. Environment Variables (`env` / `envFrom`)\n- **Pros**: Easy to read in Node.js via `process.env.PORT`.\n- **Cons**: Values are evaluated **only at container startup**. If you update the ConfigMap in the cluster, running pods will **NOT** see the change until they are restarted.\n- **Risk**: Process listings or crash dumps can expose sensitive environment variables.\n\n### 2. Volume Mounts (`volumeMounts`)\n- ConfigMap/Secret keys are projected as individual files inside a directory (e.g., `/etc/config/settings.json` or `/etc/secrets/jwt_key`).\n- **Live Updates**: When you update the ConfigMap or Secret, the Kubelet automatically updates the projected files inside running containers without restarting the Pod!\n- Your Express application can watch the file using `fs.watch()` to reload configuration on the fly."
            },
            {
              "title": "Secrets Reality: Base64 Encoding vs Encryption at Rest",
              "level": "advanced",
              "content": "### The Base64 Myth\nA common misconception among junior engineers is that Kubernetes Secrets are encrypted. By default, **Kubernetes Secrets are merely base64-encoded plain text**!\nAnyone with RBAC access to `get secret` can decode them instantly:\n```bash\necho \"c3VwZXJzZWNyZXRwYXNz\" | base64 --decode\n# Output: supersecretpass\n```\n\n### Production Hardening:\n1. **Encryption at Rest**: Configure the `kube-apiserver` with an `EncryptionConfiguration` provider backed by a cloud Key Management Service (AWS KMS, Google Cloud KMS, Azure Key Vault) so data written to etcd is encrypted with AES-CBC or AES-GCM.\n2. **External Secrets Operator (ESO)**: Never commit secrets to Git. Instead, store secrets in HashiCorp Vault, AWS Secrets Manager, or Doppler, and let the External Secrets Operator synchronize them into Kubernetes Secrets dynamically."
            }
          ],
          "commands": [
            {
              "command": "kubectl create configmap mern-config --from-literal=PORT=5000 --from-literal=NODE_ENV=production",
              "description": "Imperatively create a ConfigMap with literal key-value configuration pairs",
              "example": "kubectl create configmap mern-config --from-literal=PORT=5000 --from-literal=NODE_ENV=production",
              "output": "configmap/mern-config created",
              "whenToUse": "Quick generation or testing of application environment variables"
            },
            {
              "command": "kubectl create secret generic mern-secrets --from-literal=MONGO_PASSWORD=\"P@ssw0rdProd!\" --from-literal=JWT_SECRET=\"super-jwt-token\"",
              "description": "Create an Opaque Secret storing sensitive database credentials and JWT tokens",
              "example": "kubectl create secret generic mern-secrets --from-literal=MONGO_PASSWORD=\"P@ssw0rdProd!\"",
              "output": "secret/mern-secrets created",
              "whenToUse": "Provisioning application secrets without committing plain text to YAML files"
            },
            {
              "command": "kubectl get secret mern-secrets -o jsonpath=\"{.data.MONGO_PASSWORD}\" | base64 --decode",
              "description": "Extract and decode a specific secret value using jsonpath and base64",
              "example": "kubectl get secret mern-secrets -o jsonpath=\"{.data.MONGO_PASSWORD}\" | base64 --decode",
              "output": "P@ssw0rdProd!",
              "whenToUse": "Verifying secret decoding during deployment debugging"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-config-and-secret.yaml",
              "code": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: mern-backend-config\n  namespace: production\ndata:\n  PORT: \"5000\"\n  NODE_ENV: \"production\"\n  CORS_ORIGIN: \"https://devops.example.com\"\n  LOG_LEVEL: \"info\"\n---\napiVersion: v1\nkind: Secret\nmetadata:\n  name: mern-backend-secrets\n  namespace: production\ntype: Opaque\ndata:\n  # Echo \"mongodb://...\" | base64\n  MONGO_URI: bW9uZ29kYjovL21lcm4tbW9uZ28taGVhZGxlc3M6MjcwMTcvZGV2b3BzX2Ri\n  # Echo \"super-secret-jwt-signing-key\" | base64\n  JWT_SECRET: c3VwZXItc2VjcmV0LWp3dC1zaWduaW5nLWtleQ==\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  namespace: production\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mern-backend\n  template:\n    metadata:\n      labels:\n        app: mern-backend\n    spec:\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.1.0\n        # 1. Bulk import all ConfigMap keys as environment variables\n        envFrom:\n        - configMapRef:\n            name: mern-backend-config\n        # 2. Selectively import individual sensitive keys from Secret\n        env:\n        - name: MONGO_URI\n          valueFrom:\n            secretKeyRef:\n              name: mern-backend-secrets\n              key: MONGO_URI\n        - name: JWT_SECRET\n          valueFrom:\n            secretKeyRef:\n              name: mern-backend-secrets\n              key: JWT_SECRET",
              "explanation": "Production pattern combining ConfigMap (non-sensitive envs) and Secret (sensitive keys) injected into an Express application Deployment using envFrom and secretKeyRef."
            }
          ],
          "quiz": [
            {
              "id": "k8s-cfg-q1",
              "type": "multiple-choice",
              "question": "Are standard Kubernetes Secrets encrypted by default when stored in etcd?",
              "options": [
                "Yes, encrypted with AES-256 automatically",
                "No, they are only base64-encoded strings unless EncryptionConfiguration is enabled on the API server",
                "Yes, protected by Linux root file permissions",
                "No, they are transmitted as plain HTTP text"
              ],
              "correctAnswer": "No, they are only base64-encoded strings unless EncryptionConfiguration is enabled on the API server",
              "explanation": "Kubernetes Secrets are merely base64 encoded by default. True encryption at rest requires configuring the API server with an EncryptionConfiguration using KMS or a key provider.",
              "difficulty": "intermediate",
              "xp": 30
            },
            {
              "id": "k8s-cfg-q2",
              "type": "multiple-choice",
              "question": "What happens when you update a ConfigMap that is mounted as a volume into an existing Pod?",
              "options": [
                "The Pod crashes immediately",
                "The volume-mounted files are automatically updated by Kubelet without restarting the Pod",
                "The Pod automatically reboots",
                "The update is rejected because volumes are strictly immutable"
              ],
              "correctAnswer": "The volume-mounted files are automatically updated by Kubelet without restarting the Pod",
              "explanation": "Volume-mounted ConfigMaps are updated automatically by the kubelet sync loop. Conversely, environment variables injected via env or envFrom require a Pod restart to reflect updates.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Express backend pod fails to start with status \"CreateContainerConfigError\" or \"CrashLoopBackOff\".",
              "cause": "The pod spec references a ConfigMap or Secret (or specific key) that does not exist in the namespace.",
              "diagnosis": [
                "Describe the pod: kubectl describe pod -l app=mern-backend",
                "Look for event message: \"configmap \"mern-backend-config\" not found\" or \"key MONGO_URI not found\""
              ],
              "solution": "Ensure the referenced ConfigMap or Secret exists in the same namespace as the Pod. Check for spelling mismatches in metadata.name or secretKeyRef.key.",
              "prevention": "Use Kustomize secretGenerator or Helm templates to generate ConfigMaps and Secrets alongside the workloads that consume them."
            }
          ],
          "keyTakeaways": [
            "ConfigMaps store non-sensitive configuration; Secrets store confidential tokens and credentials.",
            "Environment variables are static and require pod restarts to update; volume mounts update dynamically.",
            "Kubernetes Secrets are only base64 encoded by default—not encrypted.",
            "Use KMS-based encryption-at-rest or external secret managers (HashiCorp Vault) for production."
          ],
          "bestPractices": [
            "Use immutable ConfigMaps and Secrets (immutable: true) to prevent unexpected runtime changes and reduce API server watch load.",
            "Never store raw database passwords or API keys in plain text in Git repositories.",
            "Use tools like SealedSecrets or External Secrets Operator for GitOps workflows."
          ],
          "securityConsiderations": [
            "Restrict RBAC permissions for \"get secret\" to cluster administrators only.",
            "Ensure the API server has KMS encryption enabled for etcd at rest."
          ],
          "commonMistakes": [
            "Committing base64-encoded secrets to GitHub, mistakenly believing base64 is encryption.",
            "Updating a ConfigMap injected via envFrom and wondering why the running Express app didn't pick up the new value."
          ],
          "interviewQuestions": [
            "What is the difference between injecting a ConfigMap as an environment variable versus mounting it as a volume?",
            "How do you manage sensitive secrets securely in a GitOps environment without exposing plain text in Git?"
          ],
          "references": [
            {
              "title": "ConfigMaps Concept",
              "url": "https://kubernetes.io/docs/concepts/configuration/configmap/",
              "type": "documentation",
              "description": "Official Kubernetes guide on externalizing configuration data.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-storage",
            "k8s-resources"
          ]
        },
        {
          "id": "k8s-storage",
          "title": "Persistent Volumes & Claims",
          "summary": "Master Kubernetes storage abstractions: PersistentVolumes (PV), PersistentVolumeClaims (PVC), dynamic provisioning with StorageClasses, access modes, and CSI drivers.",
          "estimatedMinutes": 40,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-statefulsets"
          ],
          "objectives": [
            {
              "text": "Deconstruct the relationship between StorageClass, PersistentVolume (PV), and PersistentVolumeClaim (PVC)",
              "skill": "storage-architecture"
            },
            {
              "text": "Understand Access Modes: ReadWriteOnce (RWO), ReadWriteMany (RWX), and ReadOnlyMany (ROX)",
              "skill": "access-modes"
            },
            {
              "text": "Configure dynamic provisioning with volumeBindingMode: WaitForFirstConsumer",
              "skill": "dynamic-provisioning"
            },
            {
              "text": "Attach reliable NVMe persistent storage to a MongoDB StatefulSet",
              "skill": "database-storage"
            }
          ],
          "sections": [
            {
              "title": "The Storage Problem: Ephemeral Container Filesystems",
              "level": "beginner",
              "content": "Containers are inherently ephemeral. If a MongoDB container crashes or is rescheduled to another node by the scheduler:\n- Any data written to the container's writable layer is permanently lost.\n- Multiple containers cannot safely share persistent disk files.\n\nKubernetes solves this with a 3-tier storage architecture:\n1. **StorageClass**: Defined by cluster administrators. Specifies the storage provisioner (AWS EBS, GCP PD, Ceph, Azure Disk), IOPS, filesystem (ext4, xfs), and binding mode.\n2. **PersistentVolume (PV)**: A piece of physical or virtual storage provisioned in the cluster (e.g., a 20Gi AWS EBS `gp3` volume).\n3. **PersistentVolumeClaim (PVC)**: A request for storage by a developer or workload (e.g., \"I need 20Gi of SSD storage with ReadWriteOnce access\")."
            },
            {
              "title": "Dynamic Volume Provisioning & Access Modes",
              "level": "intermediate",
              "content": "### Static vs Dynamic Provisioning\n- **Static Provisioning**: A cluster administrator manually creates cloud disks and writes PV manifests. Inflexible and doesn't scale.\n- **Dynamic Provisioning**: When a developer creates a `PersistentVolumeClaim`, the **Container Storage Interface (CSI)** driver automatically calls the cloud provider's API to create the volume and binds it to the PVC in seconds.\n\n### Access Modes:\n- **ReadWriteOnce (RWO)**: The volume can be mounted as read-write by a **single node**. (Standard for databases like MongoDB, PostgreSQL, MySQL).\n- **ReadOnlyMany (ROX)**: The volume can be mounted as read-only by **many nodes**. (Ideal for serving static assets or ML models).\n- **ReadWriteMany (RWX)**: The volume can be mounted as read-write by **many nodes simultaneously**. (Requires network filesystems like NFS, AWS EFS, or CephFS).\n- **ReadWriteOncePod (RWOP)**: Mountable as read-write by a **single Pod** (Kubernetes 1.22+)."
            },
            {
              "title": "The Multi-Zone Pitfall: WaitForFirstConsumer",
              "level": "advanced",
              "content": "In multi-zone cloud clusters (e.g., AWS `us-east-1a`, `us-east-1b`, `us-east-1c`), volumes are zone-locked. An EBS volume created in `us-east-1a` **cannot be attached to an EC2 instance in us-east-1b**!\n\n### The Problem with `volumeBindingMode: Immediate`\nIf the StorageClass uses `Immediate`, the cloud disk is provisioned as soon as the PVC is created in an arbitrary zone (e.g., `us-east-1a`). Later, the scheduler might place the MongoDB pod in `us-east-1b` due to CPU availability, leaving the pod stuck in `Pending` forever!\n\n### The Solution: `WaitForFirstConsumer`\n```yaml\nvolumeBindingMode: WaitForFirstConsumer\n```\nThis delays disk provisioning until the Pod is actually scheduled. The storage driver creates the disk in the **exact availability zone** where the worker node resides."
            }
          ],
          "commands": [
            {
              "command": "kubectl get sc",
              "description": "List available StorageClasses and their default provisioners and binding modes",
              "example": "kubectl get sc",
              "output": "NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE\nstandard (default)     rancher.io/local-path   Delete          WaitForFirstConsumer   false                  45d\nfast-ssd               ebs.csi.aws.com         Retain          WaitForFirstConsumer   true                   20d",
              "whenToUse": "Verifying available storage types before deploying stateful workloads"
            },
            {
              "command": "kubectl get pv,pvc -n production",
              "description": "Inspect PersistentVolumes and PersistentVolumeClaims, capacity, and bound status",
              "example": "kubectl get pv,pvc -n production",
              "output": "NAME                                                        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                  STORAGECLASS\npersistentvolume/pvc-8a9d1234-5b6c-7d8e-9f0a-1b2c3d4e5f6a   20Gi       RWO            Retain           Bound    production/mongo-data-mern-mongo-0     fast-ssd\n\nNAME                                                        STATUS     VOLUME                                     CAPACITY   ACCESS MODES\npersistentvolumeclaim/mongo-data-mern-mongo-0               Bound      pvc-8a9d1234-5b6c-7d8e-9f0a-1b2c3d4e5f6a   20Gi       RWO",
              "whenToUse": "Validating that claims have successfully bound to provisioned storage volumes"
            },
            {
              "command": "kubectl describe pvc mongo-data-mern-mongo-0 -n production",
              "description": "View binding events and volume mounting details for a claim",
              "example": "kubectl describe pvc mongo-data-mern-mongo-0 -n production",
              "output": "Status: Bound\nVolume: pvc-8a9d1234-5b6c-7d8e-9f0a-1b2c3d4e5f6a\nStorageClass: fast-ssd\nAccess Modes: RWO\nEvents:\n  Type    Reason                 Age   From                         Message\n  ----    ------                 ----  ----                         ------\n  Normal  ProvisioningSucceeded  12m   ebs.csi.aws.com_driver       Successfully provisioned volume",
              "whenToUse": "Diagnosing why a PVC remains unbound or failed to provision storage"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "storageclass-and-pvc.yaml",
              "code": "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nprovisioner: ebs.csi.aws.com\nvolumeBindingMode: WaitForFirstConsumer\nallowVolumeExpansion: true\nreclaimPolicy: Retain # Protect data from accidental deletion\nparameters:\n  type: gp3\n  iops: \"3000\"\n  throughput: \"125\"\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: mongo-data-pvc\n  namespace: production\nspec:\n  accessModes:\n  - ReadWriteOnce\n  storageClassName: fast-ssd\n  resources:\n    requests:\n      storage: 20Gi",
              "explanation": "Production StorageClass with WaitForFirstConsumer topology awareness and Retain reclaim policy, paired with a 20Gi PersistentVolumeClaim for MongoDB."
            }
          ],
          "quiz": [
            {
              "id": "k8s-stor-q1",
              "type": "multiple-choice",
              "question": "Which AccessMode is required for high-performance databases like MongoDB where only one node mounts the disk?",
              "options": [
                "ReadWriteMany (RWX)",
                "ReadOnlyMany (ROX)",
                "ReadWriteOnce (RWO)",
                "EphemeralDirect (ED)"
              ],
              "correctAnswer": "ReadWriteOnce (RWO)",
              "explanation": "Databases require block storage (EBS, Google Persistent Disk) which can only be safely attached to a single host node at a time to prevent data corruption, matching ReadWriteOnce.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-stor-q2",
              "type": "multiple-choice",
              "question": "Why should multi-zone production clusters use volumeBindingMode: WaitForFirstConsumer in StorageClasses?",
              "options": [
                "To compress files before saving them to disk",
                "To delay volume creation until the Pod is scheduled, ensuring the volume is provisioned in the same availability zone as the worker node",
                "To encrypt volumes using AES-GCM",
                "To prevent pods from consuming memory during startup"
              ],
              "correctAnswer": "To delay volume creation until the Pod is scheduled, ensuring the volume is provisioned in the same availability zone as the worker node",
              "explanation": "Cloud block storage (EBS/GCP PD) cannot cross availability zone boundaries. WaitForFirstConsumer ensures the disk is created in the exact zone where the Pod was scheduled.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "MongoDB Pod is stuck in \"Pending\" status and events show: \"0/3 nodes available: 1 node has volume node affinity conflict, 2 nodes had untolerated taint\".",
              "cause": "The PersistentVolume was provisioned in Zone A, but the scheduler placed the Pod on a node in Zone B, making volume attachment physically impossible.",
              "diagnosis": [
                "Inspect Pod scheduling events: kubectl describe pod mern-mongo-0",
                "Check PV topology zone labels: kubectl get pv <pv-name> -o yaml | grep \"topology.ebs.csi.aws.com/zone\"",
                "Check node zones: kubectl get nodes --show-labels | grep \"topology.kubernetes.io/zone\""
              ],
              "solution": "Update the StorageClass to use volumeBindingMode: WaitForFirstConsumer. Delete the unbound PVC/PV and recreate the StatefulSet so it provisions storage in the correct zone.",
              "prevention": "Always configure WaitForFirstConsumer for any cloud-provider block storage class in multi-zone clusters."
            }
          ],
          "keyTakeaways": [
            "StorageClasses enable dynamic provisioning of PersistentVolumes via CSI drivers.",
            "PVCs represent storage requests; PVs represent the underlying provisioned disks.",
            "ReadWriteOnce is standard for databases; ReadWriteMany is for shared network storage (NFS).",
            "WaitForFirstConsumer prevents cross-availability-zone attachment failures."
          ],
          "bestPractices": [
            "Set reclaimPolicy: Retain for database volumes to prevent data loss if a PVC is deleted.",
            "Enable allowVolumeExpansion: true so disk sizes can be resized dynamically without downtime.",
            "Monitor disk usage metrics (kubelet_volume_stats_used_bytes) via Prometheus alerts."
          ],
          "securityConsiderations": [
            "Ensure encrypted: \"true\" parameter is configured in cloud StorageClasses for encryption at rest.",
            "Enforce fsGroup in pod securityContext so containers can write to mounted volumes without running as root."
          ],
          "commonMistakes": [
            "Using volumeBindingMode: Immediate in multi-zone clusters, leading to zone-affinity scheduling deadlocks.",
            "Setting reclaimPolicy: Delete on production database storage classes."
          ],
          "interviewQuestions": [
            "Explain the relationship between StorageClasses, PersistentVolumes, and PersistentVolumeClaims.",
            "What is volumeBindingMode: WaitForFirstConsumer, and why is it essential in multi-availability-zone cloud environments?"
          ],
          "references": [
            {
              "title": "Persistent Volumes",
              "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/",
              "type": "documentation",
              "description": "Official Kubernetes guide on persistent storage architecture and provisioning.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-resources",
            "k8s-probes"
          ]
        },
        {
          "id": "k8s-resources",
          "title": "Resource Requests & Limits",
          "summary": "Master CPU and memory management: cgroups, CFS throttling, OOMKilled exit code 137, Quality of Service (QoS) classes, LimitRanges, and ResourceQuotas.",
          "estimatedMinutes": 40,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-pods",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Distinguish compressible resources (CPU) from incompressible resources (Memory)",
              "skill": "resource-types"
            },
            {
              "text": "Understand how the Linux CFS scheduler throttles CPU and how OOM-Killer terminates memory-leaking processes",
              "skill": "cgroups-internals"
            },
            {
              "text": "Analyze Quality of Service (QoS) classes: Guaranteed, Burstable, and BestEffort",
              "skill": "qos-classes"
            },
            {
              "text": "Enforce cluster governance using LimitRanges and namespace ResourceQuotas",
              "skill": "cluster-quotas"
            }
          ],
          "sections": [
            {
              "title": "Requests vs Limits: The Two Dimensions",
              "level": "beginner",
              "content": "In a shared Kubernetes cluster, running containers without resource boundaries is dangerous. A single memory leak in an Express backend could consume all memory on a worker node, starving other pods and crashing the Kubelet.\n\nEvery container specification should define two pairs of values:\n1. **Requests**: The minimum guaranteed resources the container needs. The **kube-scheduler** uses requests to decide which node has enough capacity to host the Pod.\n2. **Limits**: The maximum ceiling of resources the container is allowed to consume. The **Linux kernel (cgroups)** enforces these limits at runtime."
            },
            {
              "title": "CPU (Compressible) vs Memory (Incompressible)",
              "level": "intermediate",
              "content": "Kubernetes treats CPU and Memory very differently because of their physical nature:\n\n### CPU: Compressible Resource\n- Measured in millicores (`1000m` = 1 vCPU / CPU core). `250m` = 0.25 vCPU.\n- **What happens when a container exceeds its CPU limit?**\n  The Linux kernel **Completely Fair Scheduler (CFS)** throttles the container's execution time slices. The application slows down, response times spike, but the process is **never terminated**.\n\n### Memory: Incompressible Resource\n- Measured in bytes / mebibytes / gibibytes (`256Mi`, `1Gi`).\n- **What happens when a container exceeds its Memory limit?**\n  Memory cannot be compressed. The Linux kernel **Out-Of-Memory (OOM) Killer** immediately terminates the process with **Exit Code 137** (`OOMKilled`). The Kubelet then restarts the container according to its `restartPolicy`."
            },
            {
              "title": "Quality of Service (QoS) Classes & Eviction",
              "level": "advanced",
              "content": "Kubernetes assigns every Pod one of three **QoS classes** based on its requests and limits:\n\n1. **Guaranteed (Highest Priority)**:\n   - Every container in the Pod has CPU and Memory requests **equal to limits**.\n   - *Example*: `requests: {cpu: 500m, memory: 1Gi}`, `limits: {cpu: 500m, memory: 1Gi}`.\n   - *Eviction*: Evicted last when worker nodes experience resource pressure. Ideal for production databases (MongoDB).\n\n2. **Burstable (Medium Priority)**:\n   - Requests are lower than limits, or at least one request/limit is set.\n   - *Example*: `requests: {cpu: 250m, memory: 256Mi}`, `limits: {cpu: 500m, memory: 512Mi}`.\n   - *Eviction*: Evicted after BestEffort pods when exceeding requested memory. Standard for web APIs (Express).\n\n3. **BestEffort (Lowest Priority)**:\n   - No requests or limits specified.\n   - *Eviction*: First to be killed and evicted as soon as node memory pressure occurs. Never use in production!"
            }
          ],
          "commands": [
            {
              "command": "kubectl top pods -n production",
              "description": "View real-time CPU and Memory utilization of running pods via Metrics Server",
              "example": "kubectl top pods -n production",
              "output": "NAME                            CPU(cores)   MEMORY(bytes)\nmern-backend-56f89b5c7f-9x2jk   185m         312Mi\nmern-mongo-0                    410m         1420Mi",
              "whenToUse": "Monitoring container resource consumption during traffic spikes"
            },
            {
              "command": "kubectl describe node worker-1 | grep -A 8 \"Allocated resources\"",
              "description": "Inspect total CPU and Memory requests and limits allocated to a worker node",
              "example": "kubectl describe node worker-1 | grep -A 8 \"Allocated resources\"",
              "output": "Allocated resources:\n  (Total limits may be over 100 percent, i.e., overcommitted)\n  Resource           Requests     Limits\n  --------           --------     ------\n  cpu                2150m (56%)  4800m (126%)\n  memory             9120Mi (60%) 14200Mi (93%)",
              "whenToUse": "Capacity planning and checking if a node can accept additional workloads"
            },
            {
              "command": "kubectl get events --field-selector reason=OOMKilled -n production",
              "description": "Search cluster events specifically for containers terminated by the Linux OOM-Killer",
              "example": "kubectl get events --field-selector reason=OOMKilled -n production",
              "output": "LAST SEEN   TYPE      REASON      OBJECT                              MESSAGE\n4m12s       Warning   OOMKilled   pod/mern-backend-56f89b5c7f-9x2jk   Container express-api exceeded memory limit",
              "whenToUse": "Investigating sudden container crashes and exit code 137 restarts"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "limitrange-and-quota.yaml",
              "code": "# Enforce namespace-level resource caps\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: production-quota\n  namespace: production\nspec:\n  hard:\n    requests.cpu: \"8\"\n    requests.memory: 16Gi\n    limits.cpu: \"16\"\n    limits.memory: 32Gi\n    pods: \"20\"\n---\n# Provide default requests/limits for containers that omit them\napiVersion: v1\nkind: LimitRange\nmetadata:\n  name: default-limits\n  namespace: production\nspec:\n  limits:\n  - default: # Default limit\n      cpu: \"500m\"\n      memory: \"512Mi\"\n    defaultRequest: # Default request\n      cpu: \"250m\"\n      memory: \"256Mi\"\n    max: # Maximum allowed per container\n      cpu: \"2\"\n      memory: \"4Gi\"\n    min: # Minimum allowed per container\n      cpu: \"50m\"\n      memory: \"64Mi\"\n    type: Container",
              "explanation": "Cluster governance manifests establishing namespace ResourceQuotas and default container LimitRanges to prevent resource starvation."
            }
          ],
          "quiz": [
            {
              "id": "k8s-res-q1",
              "type": "multiple-choice",
              "question": "What occurs when an Express container exceeds its configured memory limit?",
              "options": [
                "The container process is throttled and slowed down",
                "The Linux kernel terminates the process with OOMKilled (Exit Code 137)",
                "Kubernetes adds more RAM to the worker node automatically",
                "The container is migrated to another node without stopping"
              ],
              "correctAnswer": "The Linux kernel terminates the process with OOMKilled (Exit Code 137)",
              "explanation": "Memory is an incompressible resource. When a container exceeds its memory limit, the Linux kernel Out-Of-Memory killer sends SIGKILL (Exit code 128 + 9 = 137) to the process.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-res-q2",
              "type": "multiple-choice",
              "question": "Which Quality of Service (QoS) class is assigned to a MongoDB pod where CPU and Memory requests are identical to their limits?",
              "options": [
                "Burstable",
                "BestEffort",
                "Guaranteed",
                "Critical"
              ],
              "correctAnswer": "Guaranteed",
              "explanation": "When requests and limits are explicitly defined and set to identical values for both CPU and Memory across all containers in a Pod, Kubernetes assigns the Guaranteed QoS class.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Express backend pod periodically restarts with exit code 137, and kubectl describe shows \"OOMKilled: true\".",
              "cause": "The Node.js V8 heap or uncollected memory leaks caused the container process to exceed its configured memory limit (e.g. 512Mi).",
              "diagnosis": [
                "Inspect pod last state: kubectl describe pod -l app=mern-backend | grep -A 5 \"Last State\"",
                "Profile memory utilization: kubectl top pod -l app=mern-backend",
                "Check Node.js max-old-space-size parameter"
              ],
              "solution": "Increase memory limit in the Deployment spec. Configure Node.js with --max-old-space-size=400 (setting it slightly lower than the container limit to allow V8 garbage collection before kernel OOM kill).",
              "prevention": "Run automated load tests and memory leak profiling using clinic.js or artillery before deploying to production."
            }
          ],
          "keyTakeaways": [
            "Requests are used by the scheduler to place pods; limits are enforced by the kernel cgroups.",
            "CPU is compressible (throttled when limit is exceeded); Memory is incompressible (OOMKilled with exit code 137).",
            "Guaranteed QoS pods (requests == limits) are the last to be evicted during node resource pressure.",
            "ResourceQuotas prevent teams from monopolizing cluster capacity."
          ],
          "bestPractices": [
            "Always configure resource requests and limits on every production container.",
            "For Node.js apps, set --max-old-space-size to roughly 75% of the container memory limit.",
            "Deploy LimitRanges in all namespaces to ensure default boundaries exist for all workloads."
          ],
          "securityConsiderations": [
            "ResourceQuotas protect clusters against Denial of Service (DoS) attacks caused by runaway pod creation.",
            "Monitor and alert on high CPU throttling (container_cpu_cfs_throttled_periods_total) via Prometheus."
          ],
          "commonMistakes": [
            "Setting memory limits too close to average usage, causing random OOM kills on minor traffic spikes.",
            "Deploying BestEffort pods in production that get evicted the moment a worker node faces slight memory pressure."
          ],
          "interviewQuestions": [
            "Explain the difference between CPU throttling and OOMKilled in Kubernetes.",
            "How does Kubernetes determine a Pod's Quality of Service (QoS) class, and how does this affect eviction priority?"
          ],
          "references": [
            {
              "title": "Managing Resources for Containers",
              "url": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
              "type": "documentation",
              "description": "Official Kubernetes guide on CPU, memory, and QoS mechanics.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-probes",
            "k8s-autoscaling"
          ]
        },
        {
          "id": "k8s-probes",
          "title": "Health Probes",
          "summary": "Keep MERN applications resilient and self-healing using Startup, Liveness, and Readiness probes: probe handlers, failure thresholds, and preventing cascading outages.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-pods",
            "k8s-resources"
          ],
          "objectives": [
            {
              "text": "Master the three probe types: Startup, Liveness, and Readiness",
              "skill": "probe-types"
            },
            {
              "text": "Choose appropriate probe mechanisms: httpGet, tcpSocket, and exec commands",
              "skill": "probe-handlers"
            },
            {
              "text": "Tune timing parameters (initialDelaySeconds, periodSeconds, failureThreshold)",
              "skill": "probe-tuning"
            },
            {
              "text": "Implement dedicated health check routes (/healthz and /ready) in Express to prevent cascading failures",
              "skill": "mern-health-checks"
            }
          ],
          "sections": [
            {
              "title": "The Three Health Probes Explained",
              "level": "beginner",
              "content": "In a microservices architecture, a running container process does not guarantee a functioning application. An Express process might be deadlocked in an infinite JavaScript event-loop lock, or unable to connect to MongoDB, yet the process is still running.\n\nKubernetes provides three distinct health probes:\n1. **Startup Probe**: Determines whether the application has finished its initial bootstrap. Disables liveness and readiness checks until it succeeds. Ideal for slow-starting apps or database schema migrations.\n2. **Liveness Probe**: Determines if the container needs to be **restarted**. If a liveness probe fails, Kubernetes kills the container and initiates a restart.\n3. **Readiness Probe**: Determines if the container is **ready to receive incoming traffic**. If a readiness probe fails, the Pod's IP is removed from Service EndpointSlices, stopping traffic without restarting the container."
            },
            {
              "title": "Probe Handlers: httpGet vs tcpSocket vs exec",
              "level": "intermediate",
              "content": "Probes can be executed using three mechanisms:\n\n### 1. httpGet (Recommended for Web APIs)\nSends an HTTP GET request to the container on a specified port and path.\n- Any HTTP status code $\\ge 200$ and $< 400$ indicates **success**.\n- Any other code indicates failure.\n- *MERN Usage*: Express exposes `/healthz` (liveness) and `/ready` (readiness).\n\n### 2. tcpSocket\nAttempts to establish a TCP socket connection to a specified port.\n- If the socket opens successfully, the container is deemed healthy.\n- *MERN Usage*: Checking if MongoDB is listening on port `27017`.\n\n### 3. exec\nExecutes an arbitrary shell command inside the container.\n- Exit code `0` is success; non-zero is failure.\n- *Caution*: Spawns a new process inside the container every few seconds; high CPU overhead!"
            },
            {
              "title": "Avoiding Cascading Failures in MERN",
              "level": "advanced",
              "content": "### The Deadly Liveness Anti-Pattern\nNever check external dependencies (such as MongoDB) in a **liveness probe**!\n- If MongoDB experiences a temporary network hiccup or restart, an Express backend that checks MongoDB in its liveness probe will fail its probe.\n- Kubernetes will kill all Express containers simultaneously!\n- When MongoDB recovers, all Express pods are crashlooping and restarting at the exact same time, creating a thundering herd that knocks MongoDB offline again!\n\n### The Golden Rule:\n- **Liveness Probe (`/healthz`)**: Checks internal process health only (e.g., event loop responsive, memory within threshold).\n- **Readiness Probe (`/ready`)**: Checks ability to serve requests (can include a lightweight ping to MongoDB with a short 2-second timeout)."
            }
          ],
          "commands": [
            {
              "command": "kubectl describe pod -l app=mern-backend | grep -A 10 \"Liveness:\"",
              "description": "Inspect configured probe parameters, paths, thresholds, and last probe status",
              "example": "kubectl describe pod -l app=mern-backend | grep -A 10 \"Liveness:\"",
              "output": "Liveness:    http-get http://:5000/healthz delay=15s timeout=2s period=10s #success=1 #failure=3\nReadiness:   http-get http://:5000/ready delay=5s timeout=2s period=5s #success=1 #failure=2",
              "whenToUse": "Verifying probe configurations and troubleshooting probe restart causes"
            },
            {
              "command": "kubectl get events --field-selector reason=Unhealthy -n production",
              "description": "Stream cluster events showing containers failing their liveness or readiness probes",
              "example": "kubectl get events --field-selector reason=Unhealthy -n production",
              "output": "LAST SEEN   TYPE      REASON      OBJECT                              MESSAGE\n22s         Warning   Unhealthy   pod/mern-backend-56f89b5c7f-9x2jk   Readiness probe failed: HTTP probe failed with statuscode: 503",
              "whenToUse": "Diagnosing why a pod is being pulled out of service rotation"
            }
          ],
          "codeExamples": [
            {
              "language": "typescript",
              "filename": "express-health-routes.ts",
              "code": "import express, { Request, Response } from 'express';\nimport mongoose from 'mongoose';\n\nconst app = express();\n\n// 1. LIVENESS: Fast, internal check only (never check external DB here!)\napp.get('/healthz', (req: Request, res: Response) => {\n  res.status(200).json({ status: 'healthy', uptime: process.uptime() });\n});\n\n// 2. READINESS: Checks if Express can actively serve traffic & DB is reachable\napp.get('/ready', (req: Request, res: Response) => {\n  // readyState 1 means connected to MongoDB\n  const isDbReady = mongoose.connection.readyState === 1;\n  \n  if (isDbReady) {\n    return res.status(200).json({ status: 'ready', database: 'connected' });\n  } else {\n    return res.status(503).json({ status: 'degraded', database: 'disconnected' });\n  }\n});",
              "explanation": "Idiomatic Express health route implementation cleanly separating liveness (internal process health) from readiness (database connectivity)."
            },
            {
              "language": "yaml",
              "filename": "mern-backend-probes.yaml",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  namespace: production\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.1.0\n        ports:\n        - containerPort: 5000\n          name: http\n        # Protects slow startup without triggering premature liveness kills\n        startupProbe:\n          httpGet:\n            path: /healthz\n            port: http\n          failureThreshold: 30\n          periodSeconds: 2 # Gives the app up to 60 seconds to bootstrap\n        # Detects deadlocks and restarts container if unresponsive\n        livenessProbe:\n          httpGet:\n            path: /healthz\n            port: http\n          initialDelaySeconds: 5\n          periodSeconds: 10\n          timeoutSeconds: 2\n          failureThreshold: 3\n        # Controls traffic routing; pulls pod from endpoints if DB drops\n        readinessProbe:\n          httpGet:\n            path: /ready\n            port: http\n          initialDelaySeconds: 5\n          periodSeconds: 5\n          timeoutSeconds: 2\n          failureThreshold: 2",
              "explanation": "Production Kubernetes manifest configuring startup, liveness, and readiness probes with optimized timing thresholds for an Express API."
            }
          ],
          "quiz": [
            {
              "id": "k8s-prb-q1",
              "type": "multiple-choice",
              "question": "What action does Kubernetes take when a container's Liveness Probe fails consecutive attempts exceeding failureThreshold?",
              "options": [
                "It removes the pod IP from service endpoints without restarting",
                "It terminates and restarts the container",
                "It adds more CPU to the container",
                "It triggers an autoscaling event"
              ],
              "correctAnswer": "It terminates and restarts the container",
              "explanation": "Liveness probes detect unrecoverable states (deadlocks). When a liveness probe fails, the Kubelet kills the container and initiates a restart.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-prb-q2",
              "type": "multiple-choice",
              "question": "Why should you avoid checking database connectivity inside a Liveness Probe?",
              "options": [
                "Because Express cannot perform asynchronous operations in health checks",
                "A database outage would cause all backend pods to fail their liveness probes simultaneously, creating a cascading restart loop",
                "Kubernetes does not support database drivers",
                "It violates the OCI runtime specification"
              ],
              "correctAnswer": "A database outage would cause all backend pods to fail their liveness probes simultaneously, creating a cascading restart loop",
              "explanation": "Checking external services in a liveness probe leads to cascading outages: if the database hiccups, all backend pods get killed and restart at once, overwhelming the database when it recovers.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Express pod restarts every 30 seconds after deployment, showing event \"Liveness probe failed: HTTP probe failed with statuscode: 500\".",
              "cause": "The liveness probe endpoint (/healthz) threw an internal server error or timed out because initialDelaySeconds was too short before the app finished binding to port 5000.",
              "diagnosis": [
                "Inspect pod describe events: kubectl describe pod -l app=mern-backend",
                "Check application startup logs: kubectl logs -l app=mern-backend --tail=50",
                "Curl the health route directly: kubectl exec -it <pod> -- curl -i http://localhost:5000/healthz"
              ],
              "solution": "Add a startupProbe with a generous failureThreshold (e.g. failureThreshold: 30, periodSeconds: 2) to protect slow application initialization before liveness checks activate.",
              "prevention": "Always pair liveness probes with startup probes for applications with heavy initial startup routines."
            }
          ],
          "keyTakeaways": [
            "Startup probes protect slow-booting applications from being killed before initialization.",
            "Liveness probes restart deadlocked containers; Readiness probes control whether pods receive traffic.",
            "Never check hard external dependencies in a liveness probe to avoid cascading failure storms.",
            "Always configure initialDelaySeconds, periodSeconds, timeoutSeconds, and failureThreshold intentionally."
          ],
          "bestPractices": [
            "Keep health check endpoints (/healthz) lightweight and non-blocking.",
            "Use startupProbe for applications that require several seconds to warm caches or run initializations.",
            "Tune readiness failureThreshold to 2 or 3 to avoid flapping during transient network blips."
          ],
          "securityConsiderations": [
            "Do not leak sensitive internal stack traces or connection strings in public health check JSON responses.",
            "Authenticate or restrict access to deep diagnostic health endpoints."
          ],
          "commonMistakes": [
            "Using an exec probe that executes bash scripts every second, causing significant CPU overhead.",
            "Setting timeoutSeconds equal to or greater than periodSeconds, causing probe timeouts to overlap."
          ],
          "interviewQuestions": [
            "What are the differences between Startup, Liveness, and Readiness probes in Kubernetes?",
            "Why is checking external database health in a liveness probe considered an anti-pattern, and how should it be handled instead?"
          ],
          "references": [
            {
              "title": "Configure Liveness, Readiness and Startup Probes",
              "url": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
              "type": "documentation",
              "description": "Official guide on configuring health probes in Kubernetes.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-labels-annotations",
            "k8s-autoscaling"
          ]
        }
      ]
    },
    {
      "id": "k8s-advanced",
      "title": "Advanced Kubernetes",
      "description": "Scale and secure your infrastructure: metadata taxonomies, advanced node/pod affinity scheduling, horizontal/vertical autoscaling, and zero-privilege RBAC policies.",
      "icon": "⚡",
      "difficulty": "advanced",
      "estimatedHours": 5,
      "lessons": [
        {
          "id": "k8s-labels-annotations",
          "title": "Labels, Selectors & Annotations",
          "summary": "Master Kubernetes metadata: organize resources with standard label taxonomies, craft equality and set-based selectors, and attach non-identifying annotations for GitOps and monitoring.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-deployments",
            "k8s-services"
          ],
          "objectives": [
            {
              "text": "Distinguish identifying metadata (Labels) from non-identifying metadata (Annotations)",
              "skill": "metadata-architecture"
            },
            {
              "text": "Implement the official Kubernetes standard label taxonomy across all MERN objects",
              "skill": "label-taxonomy"
            },
            {
              "text": "Craft complex equality-based and set-based selectors for CLI queries and manifests",
              "skill": "label-selectors"
            },
            {
              "text": "Utilize annotations for GitOps synchronization, Prometheus metric scraping, and ingress rules",
              "skill": "annotations"
            }
          ],
          "sections": [
            {
              "title": "Labels vs Annotations: Fundamental Differences",
              "level": "beginner",
              "content": "In Kubernetes, every resource includes a `metadata` block with two primary mechanisms for attaching key-value pairs:\n\n1. **Labels**:\n   - Used to **identify, organize, and select** subsets of objects.\n   - Strictly indexed by the API server for high-performance filtering.\n   - Used by Deployments (to manage Pods), Services (to route traffic), and NetworkPolicies (to isolate pods).\n   - Strict syntax constraints: keys must be $\\le 63$ characters (or contain a domain prefix $\\le 253$ chars) and follow RFC 1123 naming rules.\n\n2. **Annotations**:\n   - Used to attach **non-identifying, arbitrary metadata** to objects.\n   - **NOT** used for selecting or grouping resources.\n   - Can store large unstructured text, JSON payloads, Git commit SHAs, release timestamps, or instructions for external tools (e.g., Ingress-Nginx rewrite rules, Prometheus scrape configs, ArgoCD sync hooks)."
            },
            {
              "title": "The Kubernetes Standard Label Taxonomy",
              "level": "intermediate",
              "content": "To ensure consistency across ecosystem tooling (Helm, ArgoCD, Prometheus, Datadog), the Kubernetes community established the official **Recommended Labels** under the `app.kubernetes.io` prefix.\n\n### Production Label Standards for the MERN Stack:\n- `app.kubernetes.io/name`: The application name (e.g., `mern-stack`).\n- `app.kubernetes.io/instance`: A unique instance identifier (e.g., `mern-prod-us-east`).\n- `app.kubernetes.io/version`: The semantic software version (e.g., `1.2.0`).\n- `app.kubernetes.io/component`: The architectural tier (e.g., `api`, `frontend`, `database`).\n- `app.kubernetes.io/part-of`: The higher-level system (e.g., `ecommerce-platform`).\n- `app.kubernetes.io/managed-by`: The deploying tool (e.g., `argocd`, `helm`, `kustomize`)."
            },
            {
              "title": "Equality vs Set-Based Selectors",
              "level": "advanced",
              "content": "Selectors allow components to query resources matching specific label conditions:\n\n### 1. Equality-Based Selectors\nOperate with `=`, `==`, and `!=`.\n- Used in Service `spec.selector`.\n- *Example*: `environment = production, tier = backend`.\n\n### 2. Set-Based Selectors\nOperate with `in`, `notin`, and `exists` / `doesnotexist`.\n- Used in Deployment `spec.selector.matchExpressions`, PodAffinity, and NetworkPolicies.\n- *Example*: Filter pods where environment is either `production` or `staging`, and tier is not `canary`:\n```yaml\nmatchExpressions:\n- key: environment\n  operator: In\n  values: [\"production\", \"staging\"]\n- key: tier\n  operator: NotIn\n  values: [\"canary\"]\n```"
            }
          ],
          "commands": [
            {
              "command": "kubectl get pods -l \"app.kubernetes.io/component in (api, database)\" --show-labels",
              "description": "Filter and display pods matching set-based label criteria",
              "example": "kubectl get pods -l \"app.kubernetes.io/component in (api, database)\" --show-labels",
              "output": "NAME                            READY   STATUS    LABELS\nmern-backend-56f89b5c7f-9x2jk   1/1     Running   app.kubernetes.io/component=api,app.kubernetes.io/name=mern-backend\nmern-mongo-0                    1/1     Running   app.kubernetes.io/component=database,app=mern-mongo",
              "whenToUse": "Querying multiple application tiers simultaneously in a single command"
            },
            {
              "command": "kubectl label pod mern-backend-56f89b5c7f-9x2jk debug=true --overwrite",
              "description": "Dynamically add or update a label on a running pod without redeploying",
              "example": "kubectl label pod mern-backend-56f89b5c7f-9x2jk debug=true --overwrite",
              "output": "pod/mern-backend-56f89b5c7f-9x2jk labeled",
              "whenToUse": "Tagging specific pods for ad-hoc traffic routing or debugging"
            },
            {
              "command": "kubectl annotate deployment mern-backend gitops.commit=\"a1b2c3d\" --overwrite",
              "description": "Attach tracking metadata annotations to a Deployment",
              "example": "kubectl annotate deployment mern-backend gitops.commit=\"a1b2c3d\" --overwrite",
              "output": "deployment.apps/mern-backend annotated",
              "whenToUse": "Recording CI/CD build provenance and Git commit SHAs directly on cluster objects"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-metadata-standards.yaml",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  namespace: production\n  labels:\n    # Standard recommended labels\n    app.kubernetes.io/name: mern-backend\n    app.kubernetes.io/instance: production-release\n    app.kubernetes.io/version: \"1.2.0\"\n    app.kubernetes.io/component: api\n    app.kubernetes.io/part-of: mern-platform\n    app.kubernetes.io/managed-by: gitops\n  annotations:\n    # Non-identifying metadata\n    gitops.argoproj.io/sync-wave: \"2\"\n    build.ci.company.com/pipeline-id: \"9842\"\n    prometheus.io/scrape: \"true\"\n    prometheus.io/port: \"5000\"\n    prometheus.io/path: \"/metrics\"\nspec:\n  replicas: 3\n  selector:\n    matchExpressions:\n    - key: app.kubernetes.io/name\n      operator: In\n      values: [\"mern-backend\"]\n    - key: app.kubernetes.io/component\n      operator: In\n      values: [\"api\"]\n  template:\n    metadata:\n      labels:\n        app.kubernetes.io/name: mern-backend\n        app.kubernetes.io/component: api",
              "explanation": "Demonstration of Kubernetes recommended labels for grouping and rich annotations powering Prometheus metric scraping and GitOps sync wave sequencing."
            }
          ],
          "quiz": [
            {
              "id": "k8s-lbl-q1",
              "type": "multiple-choice",
              "question": "Can you use an Annotation as a selector inside a Kubernetes Service spec.selector?",
              "options": [
                "Yes, annotations and labels are interchangeable",
                "No, only Labels can be used in selectors because they are indexed by the API server",
                "Yes, if the annotation starts with app.kubernetes.io/",
                "Only if using IPVS mode"
              ],
              "correctAnswer": "No, only Labels can be used in selectors because they are indexed by the API server",
              "explanation": "Annotations are intended for non-identifying metadata and external tools. They are not indexed for querying and cannot be used in Service or Deployment selectors.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-lbl-q2",
              "type": "multiple-choice",
              "question": "Which selector operator allows matching pods where an environment label is either \"production\" or \"staging\"?",
              "options": [
                "operator: In",
                "operator: Contains",
                "operator: MatchesAny",
                "operator: Or"
              ],
              "correctAnswer": "operator: In",
              "explanation": "Set-based selectors support In, NotIn, Exists, and DoesNotExist. The In operator matches resources where the key's value equals any element in the specified array.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Service mern-backend has 0 endpoints even though all 3 backend pods are Running and healthy.",
              "cause": "The labels on the Pod template inside the Deployment do not match the spec.selector defined on the Service.",
              "diagnosis": [
                "Print Service selector: kubectl get svc mern-backend -o jsonpath=\"{.spec.selector}\"",
                "Print Pod labels: kubectl get pods -l app.kubernetes.io/name=mern-backend --show-labels",
                "Check for subtle typos or differing case in label keys"
              ],
              "solution": "Align the labels in the Deployment template.metadata.labels to exactly match the Service spec.selector.",
              "prevention": "Define labels once in shared Kustomize commonLabels or Helm _helpers.tpl to guarantee consistency across all resources."
            }
          ],
          "keyTakeaways": [
            "Labels identify, group, and select objects; Annotations store non-identifying metadata for tools.",
            "Always adopt the official app.kubernetes.io recommended label standard.",
            "Equality selectors (=, !=) are used in Services; Set-based selectors (In, NotIn) are used in Deployments.",
            "Prometheus, GitOps tools, and Ingress controllers rely heavily on annotations for configuration."
          ],
          "bestPractices": [
            "Enforce consistent label taxonomy across all services to enable unified monitoring and logging.",
            "Keep annotation keys domain-prefixed (e.g. company.com/team: devops) to avoid naming collisions.",
            "Never change matchLabels on an existing Deployment, as selector fields are immutable."
          ],
          "securityConsiderations": [
            "Ensure sensitive secrets or credentials are never stored in annotations, as annotations are visible in kubectl get -o yaml.",
            "Use admission webhooks (Kyverno/OPA) to mandate required organizational labels on all deployed resources."
          ],
          "commonMistakes": [
            "Using annotations when labels are required for service routing.",
            "Attempting to mutate spec.selector in an existing Deployment, causing an API validation failure."
          ],
          "interviewQuestions": [
            "What is the architectural difference between Labels and Annotations in Kubernetes?",
            "How do set-based selectors differ from equality-based selectors, and where is each used?"
          ],
          "references": [
            {
              "title": "Labels and Selectors",
              "url": "https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/",
              "type": "documentation",
              "description": "Official documentation on Kubernetes label mechanics and query syntax.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-affinity-taints",
            "k8s-autoscaling"
          ]
        },
        {
          "id": "k8s-affinity-taints",
          "title": "Scheduling: Affinity & Taints",
          "summary": "Control workload placement across worker nodes: nodeSelector, Node Affinity, Pod Affinity/Anti-Affinity for high availability, Taints & Tolerations, and Topology Spread Constraints.",
          "estimatedMinutes": 40,
          "difficulty": "advanced",
          "prerequisites": [
            "k8s-labels-annotations",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Compare simple nodeSelector against expressive Node Affinity rules",
              "skill": "node-affinity"
            },
            {
              "text": "Enforce Pod Anti-Affinity to spread Express backend pods across failure domains",
              "skill": "pod-anti-affinity"
            },
            {
              "text": "Dedicate specialized worker nodes (e.g. SSD/GPU) to MongoDB using Taints and Tolerations",
              "skill": "taints-tolerations"
            },
            {
              "text": "Implement Topology Spread Constraints to eliminate zone skew in production",
              "skill": "topology-spread"
            }
          ],
          "sections": [
            {
              "title": "Controlling Placement: nodeSelector vs Node Affinity",
              "level": "beginner",
              "content": "By default, the Kubernetes scheduler places Pods on any worker node with sufficient CPU and memory. However, production workloads have specialized requirements:\n- MongoDB needs fast NVMe SSD storage and high RAM.\n- Express pods should be spread across distinct availability zones to survive data center failures.\n\n### nodeSelector (Simple)\nThe simplest way to constrain pods to nodes with specific labels:\n```yaml\nnodeSelector:\n  disktype: ssd\n```\n\n### Node Affinity (Expressive)\nNode Affinity provides expressive operators and supports two tiers of rules:\n1. **requiredDuringSchedulingIgnoredDuringExecution (Hard Rule)**: The pod **cannot** be scheduled unless the rule is satisfied.\n2. **preferredDuringSchedulingIgnoredDuringExecution (Soft Rule)**: The scheduler tries to satisfy the rule, but if no matching node is available, the pod is still scheduled on another node."
            },
            {
              "title": "Pod Affinity & Anti-Affinity for High Availability",
              "level": "intermediate",
              "content": "While Node Affinity constrains pods based on *node labels*, **Pod Affinity and Anti-Affinity** constrain pods based on *labels of other pods already running on those nodes*.\n\n### Pod Anti-Affinity for High Availability:\nIf we run 3 replicas of `mern-backend`, we never want all 3 pods placed on the same physical worker node. If that node loses power, our entire backend goes offline!\n\nBy configuring **Pod Anti-Affinity** with `topologyKey: kubernetes.io/hostname` (or `topology.kubernetes.io/zone`), we instruct the scheduler:\n*\"Do not schedule this Express pod on any node that is already running another Express pod.\"*\n\n### Pod Affinity for Performance:\nCo-locate latency-sensitive microservices: place Express pods on the same node as a local Redis cache pod to eliminate network hops."
            },
            {
              "title": "Taints and Tolerations: Node-Level Repulsion",
              "level": "advanced",
              "content": "Node Affinity attracts pods to a set of nodes. **Taints** do the opposite: they allow a node to **repel a set of pods**.\n\nA taint is applied to a node in the format: `key=value:effect`.\nOnly pods that possess a matching **Toleration** are permitted to schedule on that tainted node.\n\n### Taint Effects:\n- **NoSchedule**: Pods without a matching toleration will not be scheduled on the node. Existing running pods are unaffected.\n- **PreferNoSchedule**: The scheduler avoids placing pods on the node, but will do so if no other capacity exists.\n- **NoExecute**: Un-tolerated pods are **immediately evicted** from the node if already running.\n\n### MERN Use Case: Dedicated Database Nodes\nWe taint our expensive memory-optimized worker nodes:\n```bash\nkubectl taint nodes worker-db-1 dedicated=database:NoSchedule\n```\nNow, regular web pods (React, Express) will never land on this node. Only MongoDB pods that explicitly tolerate `dedicated=database` can be scheduled there."
            }
          ],
          "commands": [
            {
              "command": "kubectl taint nodes worker-db-1 dedicated=database:NoSchedule",
              "description": "Apply a taint to a worker node to repel general workloads",
              "example": "kubectl taint nodes worker-db-1 dedicated=database:NoSchedule",
              "output": "node/worker-db-1 tainted",
              "whenToUse": "Reserving dedicated nodes for databases or GPU acceleration"
            },
            {
              "command": "kubectl describe node worker-db-1 | grep -i taints",
              "description": "Inspect the active taints applied to a specific node",
              "example": "kubectl describe node worker-db-1 | grep -i taints",
              "output": "Taints:             dedicated=database:NoSchedule",
              "whenToUse": "Verifying node taints during scheduling troubleshooting"
            },
            {
              "command": "kubectl get pods -o wide -l app=mern-backend",
              "description": "Verify that pods are evenly distributed across distinct worker nodes",
              "example": "kubectl get pods -o wide -l app=mern-backend",
              "output": "NAME                            READY   STATUS    NODE\nmern-backend-56f89b5c7f-9x2jk   1/1     Running   worker-1\nmern-backend-56f89b5c7f-b4m8n   1/1     Running   worker-2\nmern-backend-56f89b5c7f-q9z3p   1/1     Running   worker-3",
              "whenToUse": "Validating that PodAntiAffinity or TopologySpreadConstraints successfully spread pods"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-affinity-and-tolerations.yaml",
              "code": "# 1. Express Backend with PodAntiAffinity (Spread across nodes)\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  namespace: production\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mern-backend\n  template:\n    metadata:\n      labels:\n        app: mern-backend\n    spec:\n      affinity:\n        podAntiAffinity:\n          preferredDuringSchedulingIgnoredDuringExecution:\n          - weight: 100\n            podAffinityTerm:\n              labelSelector:\n                matchExpressions:\n                - key: app\n                  operator: In\n                  values: [\"mern-backend\"]\n              topologyKey: \"kubernetes.io/hostname\"\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.1.0\n---\n# 2. MongoDB StatefulSet with Toleration and NodeAffinity for dedicated node\napiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: mern-mongo\n  namespace: production\nspec:\n  serviceName: mern-mongo-headless\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mern-mongo\n  template:\n    metadata:\n      labels:\n        app: mern-mongo\n    spec:\n      # Tolerates the database taint\n      tolerations:\n      - key: \"dedicated\"\n        operator: \"Equal\"\n        value: \"database\"\n        effect: \"NoSchedule\"\n      # Attracts the pod specifically to database-labeled nodes\n      affinity:\n        nodeAffinity:\n          requiredDuringSchedulingIgnoredDuringExecution:\n            nodeSelectorTerms:\n            - matchExpressions:\n              - key: node-role.kubernetes.io/database\n                operator: In\n                values: [\"true\"]\n      containers:\n      - name: mongo\n        image: mongo:6.0.8",
              "explanation": "Combined manifest applying PodAntiAffinity to spread Express pods across nodes for high availability, while pinning MongoDB to dedicated tainted database nodes."
            }
          ],
          "quiz": [
            {
              "id": "k8s-aff-q1",
              "type": "multiple-choice",
              "question": "What is the key difference between a \"required\" and a \"preferred\" Node Affinity rule?",
              "options": [
                "Required rules are checked before the pod starts; preferred rules are checked after",
                "Required rules must be met for the pod to schedule; preferred rules are soft suggestions that the scheduler attempts to fulfill",
                "Required rules apply only to CPU; preferred rules apply to Memory",
                "There is no difference; they are synonyms"
              ],
              "correctAnswer": "Required rules must be met for the pod to schedule; preferred rules are soft suggestions that the scheduler attempts to fulfill",
              "explanation": "requiredDuringScheduling... is a hard rule: if no node matches, the pod stays Pending. preferredDuringScheduling... is a soft rule: the scheduler tries its best, but will place the pod elsewhere if needed.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-aff-q2",
              "type": "multiple-choice",
              "question": "If a node has a taint with effect \"NoExecute\", what happens to existing pods running on that node that do NOT have a matching toleration?",
              "options": [
                "They continue running normally until they terminate naturally",
                "They are immediately evicted and terminated from the node",
                "Their CPU usage is capped at 10%",
                "They are converted into DaemonSets"
              ],
              "correctAnswer": "They are immediately evicted and terminated from the node",
              "explanation": "NoExecute taints cause the scheduler to immediately evict any running pods on the node that do not possess a matching toleration, rescheduling them elsewhere if governed by a controller.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Express backend pod remains stuck in \"Pending\" status and events report: \"0/3 nodes available: 3 node(s) had untolerated taint {dedicated: database}\".",
              "cause": "All available worker nodes have been tainted for dedicated workloads, and the Express pod lacks a matching toleration, or general-purpose worker nodes are full.",
              "diagnosis": [
                "Inspect pod describe events: kubectl describe pod <pending-pod-name>",
                "Check node taints across the cluster: kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints"
              ],
              "solution": "Provision additional untainted general-purpose worker nodes, or remove unnecessary taints from existing nodes: kubectl taint nodes <node-name> dedicated:NoSchedule-.",
              "prevention": "Always ensure your cluster maintains a pool of untainted general worker nodes alongside specialized tainted nodes."
            }
          ],
          "keyTakeaways": [
            "Node Affinity attracts pods to nodes; Taints allow nodes to repel un-tolerated pods.",
            "Hard affinity (required) blocks scheduling if unmet; Soft affinity (preferred) is best-effort.",
            "Pod Anti-Affinity ensures high availability by preventing all replicas from co-locating on the same node.",
            "Tolerations permit pods to schedule on tainted nodes, but do not actively pull them there without Node Affinity."
          ],
          "bestPractices": [
            "Use preferred PodAntiAffinity rather than required to prevent pods from becoming stuck in Pending if node count is low.",
            "Always combine Taints with Node Affinity so specialized nodes only host intended workloads, and those workloads only land on those nodes.",
            "Use topologySpreadConstraints for finer-grained control over multi-zone replica distribution."
          ],
          "securityConsiderations": [
            "Use node taints and tolerations to isolate high-security or multi-tenant workloads onto dedicated physical nodes.",
            "Restrict developers from adding tolerations to critical system taints (e.g. node-role.kubernetes.io/control-plane)."
          ],
          "commonMistakes": [
            "Using required PodAntiAffinity with topologyKey hostname when replicas exceed the number of worker nodes, leaving pods in Pending.",
            "Adding a toleration to a pod and expecting it to land on that node without configuring Node Affinity."
          ],
          "interviewQuestions": [
            "How do Taints and Tolerations work together with Node Affinity to create dedicated node pools?",
            "How would you ensure that 3 replicas of an Express API are distributed across 3 different Availability Zones in AWS or GCP?"
          ],
          "references": [
            {
              "title": "Assigning Pods to Nodes",
              "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/",
              "type": "documentation",
              "description": "Official guide on node affinity, pod affinity, and taints/tolerations.",
              "difficulty": "advanced",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-autoscaling",
            "k8s-rbac-security"
          ]
        },
        {
          "id": "k8s-autoscaling",
          "title": "Autoscaling",
          "summary": "Scale MERN applications elastically: Horizontal Pod Autoscaler (HPA v2), Vertical Pod Autoscaler (VPA), Cluster Autoscaler/Karpenter, and scaling on custom metrics.",
          "estimatedMinutes": 45,
          "difficulty": "advanced",
          "prerequisites": [
            "k8s-resources",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Master the three dimensions of Kubernetes autoscaling: HPA, VPA, and Cluster Autoscaler",
              "skill": "autoscaling-dimensions"
            },
            {
              "text": "Understand the mathematical algorithm behind Horizontal Pod Autoscaler target evaluations",
              "skill": "hpa-algorithm"
            },
            {
              "text": "Configure HPA v2 with custom behavior stabilization windows to prevent flapping",
              "skill": "hpa-stabilization"
            },
            {
              "text": "Autoscale the Express backend based on CPU utilization and custom Prometheus request rates",
              "skill": "mern-autoscaling"
            }
          ],
          "sections": [
            {
              "title": "The Three Dimensions of Autoscaling",
              "level": "beginner",
              "content": "In production, traffic varies dramatically between peak business hours and late nights. Scaling manually is inefficient and error-prone.\n\nKubernetes provides three complementary autoscaling dimensions:\n1. **Horizontal Pod Autoscaler (HPA)**: Scales the **number of pod replicas** up or down based on observed metrics (CPU, memory, custom Prometheus metrics).\n2. **Vertical Pod Autoscaler (VPA)**: Automatically adjusts the **CPU and memory requests/limits** of existing containers over time.\n3. **Cluster Autoscaler / Karpenter**: Scales the **number of underlying physical or virtual worker nodes** (EC2 / Compute Engine VMs) in the cluster when pods cannot schedule due to insufficient resources."
            },
            {
              "title": "The HPA Algorithm & Stabilization Windows",
              "level": "intermediate",
              "content": "The Horizontal Pod Autoscaler controller periodically queries metrics (every 15 seconds by default) and applies a deterministic scaling formula:\n\n$$\\text{desiredReplicas} = \\left\\lceil \\text{currentReplicas} \\times \\left( \\frac{\\text{currentMetricValue}}{\\text{targetMetricValue}} \\right) \\right\\rceil$$\n\n### Example:\n- Current replicas = 3\n- Target CPU utilization = 50%\n- Current observed CPU utilization = 80%\n$$\\text{desiredReplicas} = \\lceil 3 \\times (80 / 50) \\rceil = \\lceil 3 \\times 1.6 \\rceil = \\lceil 4.8 \\rceil = 5 \\text{ replicas}$$\n\n### Preventing Flapping (Thrashing):\nRapid traffic spikes followed by sudden drops can cause the autoscaler to violently add and remove pods, destabilizing the application.\nHPA v2 introduces **behavior policies**:\n- **scaleUp stabilization**: Rapidly scale up (e.g. Add 100% more pods every 15 seconds).\n- **scaleDown stabilizationWindowSeconds**: Wait (e.g. 300 seconds / 5 minutes) before scaling down to ensure the traffic lull is sustained."
            },
            {
              "title": "Scaling Express on Custom Metrics",
              "level": "advanced",
              "content": "CPU and memory utilization are often lagging indicators for Node.js Express APIs. A Node.js server might be severely backlogged with queuing HTTP requests while CPU stays at 40% due to asynchronous I/O waiting.\n\nBy integrating the **Prometheus Adapter**, we can autoscale the Express backend directly on **Requests Per Second (RPS)**:\n- Target: 200 requests/second per pod.\n- If traffic surges to 1,000 RPS, HPA immediately scales Express from 3 to 5 pods before CPU saturation occurs."
            }
          ],
          "commands": [
            {
              "command": "kubectl get hpa mern-backend-hpa",
              "description": "View active HPA targets, current metric values, and replica min/max boundaries",
              "example": "kubectl get hpa mern-backend-hpa",
              "output": "NAME               REFERENCE                 TARGETS         MINPODS   MAXPODS   REPLICAS   AGE\nmern-backend-hpa   Deployment/mern-backend   74%/65%, 28Mi   3         15        5          18d",
              "whenToUse": "Monitoring real-time autoscaler decisions and replica counts"
            },
            {
              "command": "kubectl describe hpa mern-backend-hpa",
              "description": "Inspect detailed autoscaling events, calculation reasons, and metric conditions",
              "example": "kubectl describe hpa mern-backend-hpa",
              "output": "Conditions:\n  Type            Status  Reason\n  AbleToScale     True    ReadyForNewScale\n  ScalingActive   True    ValidMetricFound\nEvents:\n  Type    Reason             Age    Message\n  Normal  SuccessfulRescale  2m15s  New size: 5; reason: cpu resource utilization above target",
              "whenToUse": "Debugging why an HPA is not scaling or investigating scale events"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-backend-hpa.yaml",
              "code": "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: mern-backend-hpa\n  namespace: production\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: mern-backend\n  minReplicas: 3\n  maxReplicas: 15\n  metrics:\n  # 1. Resource metric: Target 65% average CPU utilization\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 65\n  # 2. Resource metric: Target 400Mi average memory\n  - type: Resource\n    resource:\n      name: memory\n      target:\n        type: AverageValue\n        averageValue: 400Mi\n  # Advanced behavior rules: Fast scale-up, conservative scale-down\n  behavior:\n    scaleUp:\n      stabilizationWindowSeconds: 0 # React instantly to spikes\n      policies:\n      - type: Percent\n        value: 100 # Double capacity if needed\n        periodSeconds: 15\n    scaleDown:\n      stabilizationWindowSeconds: 300 # Wait 5 minutes before scale down\n      policies:\n      - type: Percent\n        value: 20\n        periodSeconds: 60",
              "explanation": "Production HPA v2 manifest for the Express backend scaling between 3 and 15 replicas based on CPU and memory, with custom behavior stabilization windows to prevent flapping."
            }
          ],
          "quiz": [
            {
              "id": "k8s-hpa-q1",
              "type": "multiple-choice",
              "question": "What is a prerequisite for HorizontalPodAutoscaler to calculate CPU utilization percentages?",
              "options": [
                "The container must be running as the root user",
                "Every container in the target Deployment must have \"resources.requests.cpu\" defined",
                "The cluster must have at least 10 worker nodes",
                "Ingress controllers must be disabled"
              ],
              "correctAnswer": "Every container in the target Deployment must have \"resources.requests.cpu\" defined",
              "explanation": "HPA calculates CPU percentage relative to the container's requested CPU (actual / requested). If requests are omitted, HPA reports <unknown> and cannot scale.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-hpa-q2",
              "type": "multiple-choice",
              "question": "Why should HPA and VPA generally NOT be configured to scale the exact same resource (e.g. CPU) on the same workload simultaneously?",
              "options": [
                "Kubernetes API does not allow applying both manifests",
                "They will enter a race condition fighting each other over scaling pods vs scaling container size",
                "VPA only works with batch Jobs",
                "It consumes double the etcd storage"
              ],
              "correctAnswer": "They will enter a race condition fighting each other over scaling pods vs scaling container size",
              "explanation": "If HPA scales pods on CPU and VPA adjusts container CPU limits on CPU, they can destabilize each other. Use HPA for pods and Cluster Autoscaler for nodes, or use VPA in Recommendation-only mode.",
              "difficulty": "advanced",
              "xp": 40
            }
          ],
          "troubleshooting": [
            {
              "symptom": "kubectl get hpa shows \"TARGETS: <unknown>/65%\" and HPA conditions show \"ScalingActive: False\".",
              "cause": "The Kubernetes Metrics Server is either not installed/running, or the target Deployment containers omit resource requests.",
              "diagnosis": [
                "Check Metrics Server status: kubectl get pods -n kube-system -l k8s-app=metrics-server",
                "Verify container requests: kubectl get deployment mern-backend -o jsonpath=\"{.spec.template.spec.containers[*].resources.requests}\"",
                "Test metrics API: kubectl top pods"
              ],
              "solution": "Install the Metrics Server in the cluster. Ensure every container in the target deployment has resources.requests.cpu and memory explicitly defined.",
              "prevention": "Enforce LimitRanges in all namespaces so default requests are automatically applied to every container."
            }
          ],
          "keyTakeaways": [
            "HPA scales pod replicas horizontally; VPA adjusts container size vertically; Cluster Autoscaler scales nodes.",
            "HPA requires resource requests to be set on all containers to calculate percentage thresholds.",
            "Stabilization windows (behavior.scaleDown) prevent rapid scale-down flapping during transient lulls.",
            "Node.js applications can be autoscaled on custom Prometheus metrics (e.g. HTTP requests per second)."
          ],
          "bestPractices": [
            "Set minReplicas to at least 2 or 3 in production to maintain high availability during rolling updates.",
            "Configure a 300-second scaleDown stabilization window to prevent churn.",
            "Pair HPA with modern node autoscalers like Karpenter for rapid just-in-time cloud node provisioning."
          ],
          "securityConsiderations": [
            "Always set a reasonable maxReplicas cap to prevent unexpected cloud infrastructure billing runaway during DoS attacks.",
            "Monitor HPA events through Prometheus alerts to detect abnormal traffic anomalies early."
          ],
          "commonMistakes": [
            "Forgetting to configure CPU requests in the PodSpec, causing HPA to show <unknown> and never scale.",
            "Setting targetUtilization too high (e.g. 95%), which doesn't leave enough headroom for traffic spikes while new pods start."
          ],
          "interviewQuestions": [
            "Walk through the mathematical formula the Horizontal Pod Autoscaler uses to determine desired replica count.",
            "How do HPA, VPA, and Cluster Autoscaler interact, and what precautions must you take when combining them?"
          ],
          "references": [
            {
              "title": "Horizontal Pod Autoscaler",
              "url": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/",
              "type": "documentation",
              "description": "Official Kubernetes guide on declarative autoscaling.",
              "difficulty": "advanced",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-rbac-security",
            "k8s-kubectl-mastery"
          ]
        },
        {
          "id": "k8s-rbac-security",
          "title": "RBAC & Security",
          "summary": "Enforce least privilege and workload hardening: Roles, ClusterRoles, RoleBindings, ServiceAccounts, Pod Security Standards (PSS), and container securityContext.",
          "estimatedMinutes": 45,
          "difficulty": "advanced",
          "prerequisites": [
            "k8s-api-primitives",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Distinguish Authentication (Users/ServiceAccounts) from Authorization (RBAC)",
              "skill": "k8s-auth"
            },
            {
              "text": "Construct least-privilege Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings",
              "skill": "rbac-policies"
            },
            {
              "text": "Understand Pod Security Standards (Privileged, Baseline, Restricted)",
              "skill": "pod-security-standards"
            },
            {
              "text": "Harden Express and MongoDB containers using non-root, read-only securityContexts",
              "skill": "workload-hardening"
            }
          ],
          "sections": [
            {
              "title": "Authentication vs Authorization in Kubernetes",
              "level": "beginner",
              "content": "Security in Kubernetes operates in distinct stages:\n1. **Authentication (Who are you?)**:\n   - **Human Users**: Managed externally (OIDC, Google SSO, Okta, X.509 client certificates). Kubernetes has no internal \"User\" database object!\n   - **Workload Identities**: Managed inside Kubernetes using **ServiceAccounts** (identities for Pods, CI/CD runners, and automated controllers).\n2. **Authorization (What can you do?)**:\n   - Governed by **Role-Based Access Control (RBAC)**.\n   - Evaluates whether an identity can perform a specific **verb** (`get`, `list`, `create`, `delete`) on a specific **resource** (`pods`, `deployments`, `secrets`)."
            },
            {
              "title": "The Four RBAC Primitives",
              "level": "intermediate",
              "content": "Kubernetes RBAC is built from four core objects:\n\n| Scope | Permission Rules | Subject Binding |\n| :--- | :--- | :--- |\n| **Namespace-Scoped** | **Role** | **RoleBinding** |\n| **Cluster-Wide** | **ClusterRole** | **ClusterRoleBinding** |\n\n- **Role**: Defines a set of permissions within a single specific namespace (e.g., \"can read pods in `production`\").\n- **ClusterRole**: Defines permissions across all namespaces in the cluster, or on cluster-scoped resources (e.g., Nodes, PersistentVolumes, Namespaces).\n- **RoleBinding**: Grants the permissions of a Role (or ClusterRole) to subjects (users, groups, ServiceAccounts) within a specific namespace.\n- **ClusterRoleBinding**: Grants permissions cluster-wide to all namespaces."
            },
            {
              "title": "Workload Hardening: securityContext & PSS",
              "level": "advanced",
              "content": "Running containers as the `root` user (UID 0) inside Kubernetes is a major security vulnerability. If a remote code execution vulnerability is discovered in an npm package in our Express app, an attacker operating as root could break out of the container.\n\n### Pod Security Standards (PSS):\nModern clusters enforce three standard profiles via namespace labels:\n- **Privileged**: Unrestricted permissions (for CNI and storage daemons).\n- **Baseline**: Minimally restrictive; prevents known privilege escalations.\n- **Restricted**: Hardened; strictly enforces non-root, drops all Linux capabilities, and requires read-only root filesystems.\n\n### Hardening the Express Backend Container:\n```yaml\nsecurityContext:\n  runAsNonRoot: true\n  runAsUser: 10001\n  runAsGroup: 10001\n  allowPrivilegeEscalation: false\n  readOnlyRootFilesystem: true\n  capabilities:\n    drop: [\"ALL\"]\n  seccompProfile:\n    type: RuntimeDefault\n```\nIf Express needs to write temporary cache files, mount an in-memory `emptyDir` volume to `/tmp`."
            }
          ],
          "commands": [
            {
              "command": "kubectl auth can-i create deployments --as=system:serviceaccount:production:mern-sa -n production",
              "description": "Simulate and test RBAC permissions for a specific ServiceAccount or user identity",
              "example": "kubectl auth can-i create deployments --as=system:serviceaccount:production:mern-sa -n production",
              "output": "yes",
              "whenToUse": "Verifying that a CI/CD pipeline or workload has the exact intended permissions"
            },
            {
              "command": "kubectl get role,rolebinding -n production",
              "description": "List active roles and role bindings governing the production namespace",
              "example": "kubectl get role,rolebinding -n production",
              "output": "NAME                                          CREATED AT\nrole.rbac.authorization.k8s.io/mern-deployer   2026-03-01T10:00:00Z\n\nNAME                                                 ROLE                AGE\nrolebinding.rbac.authorization.k8s.io/mern-binding   Role/mern-deployer  18d",
              "whenToUse": "Auditing namespace permissions and security bindings"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "mern-rbac-and-hardened-pod.yaml",
              "code": "# 1. Dedicated ServiceAccount for Express Backend\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: mern-backend-sa\n  namespace: production\n---\n# 2. Least-privilege Role: Read configmaps and write status only\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: mern-backend-role\n  namespace: production\nrules:\n- apiGroups: [\"\"]\n  resources: [\"configmaps\"]\n  verbs: [\"get\", \"list\", \"watch\"]\n---\n# 3. Bind Role to ServiceAccount\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: mern-backend-binding\n  namespace: production\nsubjects:\n- kind: ServiceAccount\n  name: mern-backend-sa\n  namespace: production\nroleRef:\n  kind: Role\n  name: mern-backend-role\n  apiGroup: rbac.authorization.k8s.io\n---\n# 4. Hardened Express Deployment using the ServiceAccount\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-backend\n  namespace: production\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mern-backend\n  template:\n    metadata:\n      labels:\n        app: mern-backend\n    spec:\n      serviceAccountName: mern-backend-sa\n      automountServiceAccountToken: false # Disable token mount if not needed\n      securityContext:\n        runAsNonRoot: true\n        runAsUser: 10001\n        runAsGroup: 10001\n        fsGroup: 10001\n        seccompProfile:\n          type: RuntimeDefault\n      containers:\n      - name: express-api\n        image: ghcr.io/org/mern-backend:1.1.0\n        securityContext:\n          allowPrivilegeEscalation: false\n          readOnlyRootFilesystem: true\n          capabilities:\n            drop: [\"ALL\"]\n        volumeMounts:\n        - name: tmp-volume\n          mountPath: /tmp\n      volumes:\n      - name: tmp-volume\n        emptyDir: {}",
              "explanation": "Comprehensive security manifest featuring dedicated ServiceAccount, least-privilege RBAC role binding, and a hardened container securityContext meeting the Restricted Pod Security Standard."
            }
          ],
          "quiz": [
            {
              "id": "k8s-sec-q1",
              "type": "multiple-choice",
              "question": "What is the purpose of setting \"automountServiceAccountToken: false\" in a Pod spec?",
              "options": [
                "It prevents the pod from communicating with the database",
                "It prevents the API server bearer token from being mounted into /var/run/secrets, mitigating credential theft if the container is compromised",
                "It disables CoreDNS resolution",
                "It turns off container logging"
              ],
              "correctAnswer": "It prevents the API server bearer token from being mounted into /var/run/secrets, mitigating credential theft if the container is compromised",
              "explanation": "By default, every pod mounts a ServiceAccount bearer token. If an application does not need to talk to the Kubernetes API, disabling this token mount limits lateral movement if compromised.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-sec-q2",
              "type": "multiple-choice",
              "question": "What is the difference between a RoleBinding and a ClusterRoleBinding when binding a ClusterRole?",
              "options": [
                "RoleBinding applies the ClusterRole permissions only within its specific namespace; ClusterRoleBinding grants permissions across the entire cluster",
                "ClusterRoleBinding only works with system administrator accounts",
                "RoleBinding cannot bind ClusterRoles",
                "There is no difference"
              ],
              "correctAnswer": "RoleBinding applies the ClusterRole permissions only within its specific namespace; ClusterRoleBinding grants permissions across the entire cluster",
              "explanation": "A ClusterRole can define common rules (e.g. \"view\"). Binding it via a RoleBinding restricts those permissions strictly to that one namespace. Binding via ClusterRoleBinding grants them cluster-wide.",
              "difficulty": "advanced",
              "xp": 40
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Express application pod crashes immediately on startup with \"EROFS: read-only file system, open '/tmp/app.log'\".",
              "cause": "The container securityContext enforces readOnlyRootFilesystem: true, but the application attempts to write logs or temporary files to the root container filesystem.",
              "diagnosis": [
                "Check container logs: kubectl logs -l app=mern-backend",
                "Inspect pod securityContext: kubectl get deployment mern-backend -o yaml | grep -A 5 \"securityContext\"",
                "Identify which directory the application attempted to write to"
              ],
              "solution": "Mount an emptyDir volume at the target directory (e.g. mountPath: /tmp) so temporary files can be written in-memory without violating read-only root filesystem security.",
              "prevention": "Configure applications to write logs directly to stdout/stderr rather than local disk files, adhering to 12-Factor principles."
            }
          ],
          "keyTakeaways": [
            "ServiceAccounts represent in-cluster workload identities; Users are managed externally.",
            "Roles are namespaced; ClusterRoles are cluster-wide. RoleBindings attach identities to roles.",
            "Never use default ServiceAccounts for sensitive production microservices.",
            "Hardened containers enforce runAsNonRoot, readOnlyRootFilesystem, and drop ALL capabilities."
          ],
          "bestPractices": [
            "Apply the Restricted Pod Security Standard to all application namespaces.",
            "Disable automountServiceAccountToken on all workloads that do not query the Kubernetes API.",
            "Audit RBAC permissions regularly using tools like rbac-lookup or rakkess."
          ],
          "securityConsiderations": [
            "Avoid granting wildcard (\"*\") verbs or resources in RBAC roles.",
            "Never allow containers to run with allowPrivilegeEscalation: true in production."
          ],
          "commonMistakes": [
            "Granting cluster-admin permissions to CI/CD ServiceAccounts just to bypass RBAC permission errors.",
            "Running containers as the default root user inside images."
          ],
          "interviewQuestions": [
            "Explain how RBAC works in Kubernetes: define Roles, ClusterRoles, and their respective bindings.",
            "What settings would you configure in a pod's securityContext to meet the Kubernetes Restricted Pod Security Standard?"
          ],
          "references": [
            {
              "title": "Using RBAC Authorization",
              "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/",
              "type": "documentation",
              "description": "Official guide to role-based access control policies.",
              "difficulty": "advanced",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-kubectl-mastery",
            "k8s-kustomize"
          ]
        }
      ]
    },
    {
      "id": "k8s-tooling",
      "title": "Kubernetes Tooling",
      "description": "Master essential Kubernetes developer and operator tooling: advanced kubectl techniques, template-free Kustomize overlays, Helm package management, and systematic debugging workflows.",
      "icon": "🛠️",
      "difficulty": "intermediate",
      "estimatedHours": 5,
      "lessons": [
        {
          "id": "k8s-kubectl-mastery",
          "title": "kubectl Mastery",
          "summary": "Level up your terminal productivity: jsonpath queries, custom columns, declarative dry-run scaffolding, API schema exploration, and ephemeral debug containers.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-architecture",
            "k8s-deployments"
          ],
          "objectives": [
            {
              "text": "Extract and format cluster telemetry using jsonpath, custom-columns, and sort-by",
              "skill": "kubectl-formatting"
            },
            {
              "text": "Scaffold production-grade YAML manifests using --dry-run=client -o yaml",
              "skill": "yaml-scaffolding"
            },
            {
              "text": "Explore deep API object specifications in the terminal using kubectl explain",
              "skill": "schema-inspection"
            },
            {
              "text": "Troubleshoot running pods using kubectl debug with ephemeral containers",
              "skill": "ephemeral-debugging"
            }
          ],
          "sections": [
            {
              "title": "Beyond the Basics: Output Formatting & Jsonpath",
              "level": "beginner",
              "content": "Every Kubernetes practitioner knows `kubectl get pods`. But elite DevOps engineers extract precision telemetry using advanced output formatting:\n\n### 1. JSONPath Queries\nQuery specific attributes across arrays of resources:\n```bash\n# Get all Pod names and their host node IPs\nkubectl get pods -n production -o jsonpath='{range .items[*]}{.metadata.name}{\"\t\"}{.status.hostIP}{\"\n\"}{end}'\n```\n\n### 2. Custom Columns\nBuild clean, customized tables for on-call dashboards:\n```bash\nkubectl get pods -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image,STATUS:.status.phase\n```\n\n### 3. Sorting by Creation Time\nQuickly find the newest pods or crashing instances:\n```bash\nkubectl get pods -A --sort-by='.metadata.creationTimestamp'\n```"
            },
            {
              "title": "Scaffolding Manifests with --dry-run=client",
              "level": "intermediate",
              "content": "Never write boilerplate YAML from scratch! You can generate syntactically perfect, schema-valid manifests in seconds using `--dry-run=client -o yaml`:\n\n### Generating Deployments, Services, and ConfigMaps:\n```bash\n# Scaffold an Express Deployment with 3 replicas and resource limits\nkubectl create deployment mern-backend \\\n  --image=ghcr.io/org/mern-backend:1.1.0 \\\n  --replicas=3 \\\n  --port=5000 \\\n  --dry-run=client -o yaml > deployment.yaml\n\n# Scaffold a matching ClusterIP Service\nkubectl expose deployment mern-backend \\\n  --port=5000 \\\n  --target-port=5000 \\\n  --dry-run=client -o yaml > service.yaml\n```\nThis practice eliminates indentation mistakes and outdated API versions."
            },
            {
              "title": "Live Troubleshooting with kubectl debug",
              "level": "advanced",
              "content": "Production container images are typically \"distroless\" (stripped of shells, curl, netcat, or package managers) for minimal attack surface.\n\nHow do you debug an Express app when there is no `sh` or `bash` in the container?\n\nEnter **kubectl debug**:\n`kubectl debug` attaches an **ephemeral debug container** (such as `nicolaka/netshoot` or `busybox`) into the running Pod's shared network, process, and IPC namespace:\n```bash\nkubectl debug -it mern-backend-56f89b5c7f-9x2jk \\\n  --image=nicolaka/netshoot \\\n  --target=express-api\n```\nInside the debug container, you have `tcpdump`, `curl`, `dig`, `strace`, and can inspect the Express process directly via `ps aux`."
            }
          ],
          "commands": [
            {
              "command": "kubectl create deployment mern-backend --image=ghcr.io/org/backend:1.1.0 --replicas=3 --dry-run=client -o yaml",
              "description": "Imperatively scaffold a complete Deployment manifest without applying it to the cluster",
              "example": "kubectl create deployment mern-backend --image=ghcr.io/org/backend:1.1.0 --replicas=3 --dry-run=client -o yaml",
              "output": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  creationTimestamp: null\n  labels:\n    app: mern-backend\n  name: mern-backend\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mern-backend\n  template:\n    metadata:\n      labels:\n        app: mern-backend\n    spec:\n      containers:\n      - image: ghcr.io/org/backend:1.1.0\n        name: backend",
              "whenToUse": "Quickly generating clean YAML starter templates"
            },
            {
              "command": "kubectl explain pod.spec.containers.securityContext --recursive",
              "description": "Recursively print the schema hierarchy and fields of a resource definition",
              "example": "kubectl explain pod.spec.containers.securityContext --recursive | head -n 15",
              "output": "KIND:     Pod\nVERSION:  v1\nFIELD:    securityContext <SecurityContext>\nFIELDS:\n   allowPrivilegeEscalation <boolean>\n   capabilities             <Capabilities>\n      add                   <[]string>\n      drop                  <[]string>\n   privileged               <boolean>\n   readOnlyRootFilesystem   <boolean>\n   runAsGroup               <integer>\n   runAsNonRoot             <boolean>\n   runAsUser                <integer>",
              "whenToUse": "Checking valid YAML schema field names without internet access"
            },
            {
              "command": "kubectl diff -f deployment.yaml",
              "description": "Compute a real-time diff between your local file and the live cluster state",
              "example": "kubectl diff -f deployment.yaml",
              "output": "diff -u -N /tmp/live-1234 /tmp/merged-5678\n@@ -16,7 +16,7 @@\n spec:\n-  replicas: 3\n+  replicas: 5\n   template:\n     spec:\n       containers:\n-      - image: ghcr.io/org/backend:1.0.0\n+      - image: ghcr.io/org/backend:1.1.0",
              "whenToUse": "Auditing planned changes before executing kubectl apply"
            }
          ],
          "codeExamples": [
            {
              "language": "bash",
              "filename": "kubectl-power-shortcuts.sh",
              "code": "#!/usr/bin/env bash\n# Useful production aliases and helper functions\nalias k=\"kubectl\"\nalias kgp=\"kubectl get pods -o wide\"\nalias kgs=\"kubectl get svc\"\nalias kgd=\"kubectl get deployments\"\nalias kdp=\"kubectl describe pod\"\nalias kl=\"kubectl logs -f\"\n\n# Fast pod shell helper\nkexec() {\n  kubectl exec -it \"$1\" -- ${2:-sh}\n}\n\n# Find all pods restarting frequently in the cluster\nkrestarts() {\n  kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount'\n}\n\n# Print current context and namespace\nkctx() {\n  kubectl config get-contexts | grep \"^\\*\"\n}",
              "explanation": "Essential shell aliases and diagnostic functions to accelerate daily Kubernetes workflows and incident response."
            }
          ],
          "quiz": [
            {
              "id": "k8s-cmd-q1",
              "type": "multiple-choice",
              "question": "What is the purpose of the \"--dry-run=client -o yaml\" flags when running kubectl create commands?",
              "options": [
                "It applies the configuration directly to etcd without validation",
                "It prints the generated declarative YAML manifest to stdout without sending any request to the cluster",
                "It deletes the resource if it already exists",
                "It restarts the container runtime"
              ],
              "correctAnswer": "It prints the generated declarative YAML manifest to stdout without sending any request to the cluster",
              "explanation": "--dry-run=client computes the object locally on your client machine without contacting the API server. Paired with -o yaml, it provides a clean, valid template for writing manifests.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-cmd-q2",
              "type": "multiple-choice",
              "question": "How does \"kubectl debug\" allow troubleshooting distroless container images that lack a shell?",
              "options": [
                "It downloads Docker Desktop onto the worker node",
                "It injects an ephemeral container with troubleshooting utilities into the existing pod's shared namespaces",
                "It converts the container into a virtual machine",
                "It compiles bash into the running binary"
              ],
              "correctAnswer": "It injects an ephemeral container with troubleshooting utilities into the existing pod's shared namespaces",
              "explanation": "kubectl debug creates an ephemeral container inside the target pod that joins its Linux namespaces (network, PID), allowing you to use diagnostic tools without bloating production images.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "kubectl apply -f manifest.yaml warns about \"field manager conflicts\" and fails to apply changes.",
              "cause": "Server-Side Apply detected that another entity (e.g. Helm, ArgoCD, or a previous client-side apply) manages the same fields.",
              "diagnosis": [
                "Inspect managedFields in object metadata: kubectl get deployment mern-backend -o yaml | grep -A 20 \"managedFields:\""
              ],
              "solution": "Run kubectl apply --server-side --force-conflicts -f manifest.yaml to transfer ownership of the conflicting fields to the current manager.",
              "prevention": "Consistently use one deployment mechanism (e.g. GitOps / ArgoCD) rather than mixing manual kubectl apply with automated controllers."
            }
          ],
          "keyTakeaways": [
            "Advanced output formatting (jsonpath, custom-columns) turns kubectl into a powerful querying engine.",
            "Always use --dry-run=client -o yaml to scaffold boilerplate manifests quickly and cleanly.",
            "kubectl explain provides instant schema reference directly from your cluster API.",
            "kubectl debug with ephemeral containers enables non-intrusive troubleshooting of distroless pods."
          ],
          "bestPractices": [
            "Run kubectl diff before applying manifests to catch unintended changes or replica regressions.",
            "Use shell aliases and autocompletion to increase terminal velocity during incidents.",
            "Adopt plugins like stern, kubectx, and kubens via Krew."
          ],
          "securityConsiderations": [
            "Avoid running kubectl commands with cluster-admin privileges for everyday development tasks.",
            "Audit kubectl debug usage, as ephemeral containers can inspect process memory of co-located containers."
          ],
          "commonMistakes": [
            "Manually typing out complex YAML manifests from memory rather than using declarative dry-run scaffolding.",
            "Installing curl, netcat, and gdb into production Docker images rather than using ephemeral debug containers."
          ],
          "interviewQuestions": [
            "How would you extract all pod names and their respective node IPs across all namespaces in a single kubectl command?",
            "What are ephemeral containers in Kubernetes and how do they change container debugging practices?"
          ],
          "references": [
            {
              "title": "kubectl Cheat Sheet",
              "url": "https://kubernetes.io/docs/reference/kubectl/cheatsheet/",
              "type": "documentation",
              "description": "Official cheat sheet of common kubectl commands and jsonpath queries.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-kustomize",
            "k8s-helm"
          ]
        },
        {
          "id": "k8s-kustomize",
          "title": "Kustomize",
          "summary": "Template-free declarative configuration management: understand the bases and overlays pattern, strategic merge patches, JSON 6902 patches, and configMapGenerators.",
          "estimatedMinutes": 40,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-deployments",
            "k8s-kubectl-mastery"
          ],
          "objectives": [
            {
              "text": "Understand the template-free philosophy of Kustomize vs templating engines",
              "skill": "kustomize-fundamentals"
            },
            {
              "text": "Structure production repositories using the Base and Overlays pattern",
              "skill": "base-and-overlays"
            },
            {
              "text": "Apply Strategic Merge Patches and JSON 6902 Patches to customize environment configs",
              "skill": "kustomize-patches"
            },
            {
              "text": "Use configMapGenerator and secretGenerator with automatic hash-based rolling updates",
              "skill": "generator-mechanics"
            }
          ],
          "sections": [
            {
              "title": "The Template-Free Philosophy",
              "level": "beginner",
              "content": "In traditional templating engines (like Helm), YAML is treated as raw text with embedded template tags (e.g. `{{ .Values.replicaCount }}`). A missing quote or indentation error can render invalid YAML that fails during deployment.\n\n**Kustomize** takes a different approach:\n- It works with **pure, valid Kubernetes YAML** manifests.\n- It introduces **no template language**.\n- It is built directly into the Kubernetes CLI: `kubectl apply -k <directory>`.\n- It uses declarative transformation rules (patches, generators, transformers) to customize base configurations for different environments (Development, Staging, Production)."
            },
            {
              "title": "The Bases and Overlays Architecture",
              "level": "intermediate",
              "content": "In a GitOps repository, we organize our MERN stack into a clean hierarchy:\n\n```\nk8s/\n├── base/\n│   ├── kustomization.yaml\n│   ├── backend-deployment.yaml\n│   ├── backend-service.yaml\n│   └── mongo-statefulset.yaml\n└── overlays/\n    ├── dev/\n    │   ├── kustomization.yaml\n    │   └── replica-patch.yaml    # Replicas: 1, lower CPU\n    └── prod/\n        ├── kustomization.yaml\n        ├── replica-patch.yaml    # Replicas: 5, HPA enabled\n        └── ingress-patch.yaml    # Production domain & TLS\n```\n\n- **Base**: Contains the common, shared declarative manifests with sensible defaults.\n- **Overlays**: Inherit the base and define environment-specific modifications (patches, namespaces, replicas, image tags)."
            },
            {
              "title": "Patches and Generator Hash Suffixes",
              "level": "advanced",
              "content": "### 1. Strategic Merge Patch vs JSON 6902 Patch\n- **Strategic Merge Patch**: Write a partial YAML snippet that looks just like the target object. Kustomize merges the dictionaries together (e.g. bumping `replicas: 5` or overriding container `resources`).\n- **JSON 6902 Patch**: Precise surgical operations targeting specific paths using JSON Patch syntax (`op: replace`, `path: /spec/replicas`, `value: 5`).\n\n### 2. Generator Hash Suffixes: Automated Rolling Restarts\nWhen you update a ConfigMap in Kubernetes, running Pods do not automatically restart.\nKustomize solves this with **configMapGenerator**:\n```yaml\nconfigMapGenerator:\n- name: mern-config\n  literals:\n  - LOG_LEVEL=debug\n```\nKustomize appends a content hash suffix to the generated ConfigMap name (e.g. `mern-config-f59m77c8f9`) and updates the Deployment's reference.\nWhen the config changes, the hash changes, which **automatically triggers a zero-downtime rolling update** in Kubernetes!"
            }
          ],
          "commands": [
            {
              "command": "kubectl kustomize overlays/production",
              "description": "Render the complete merged YAML manifest for the production overlay without applying it",
              "example": "kubectl kustomize overlays/production",
              "output": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: prod-mern-backend\n  namespace: production\nspec:\n  replicas: 5\n...",
              "whenToUse": "Inspecting the final generated YAML before GitOps commits or manual application"
            },
            {
              "command": "kubectl apply -k overlays/development",
              "description": "Apply the development overlay manifests and patches directly to the active cluster",
              "example": "kubectl apply -k overlays/development",
              "output": "configmap/dev-mern-config-8h6m52fbk4 created\ndeployment.apps/dev-mern-backend configured\nservice/dev-mern-backend configured",
              "whenToUse": "Deploying environment-specific overlays in local kind or staging clusters"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "k8s-kustomization-prod.yaml",
              "code": "# overlays/prod/kustomization.yaml\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\n\nnamespace: production\nnamePrefix: prod-\n\n# Inherit shared base definitions\nresources:\n- ../../base\n\n# Common labels applied to all generated resources\ncommonLabels:\n  environment: production\n  app.kubernetes.io/managed-by: kustomize\n\n# Override image tag to production release\nimages:\n- name: ghcr.io/org/mern-backend\n  newTag: v1.2.0\n\n# Strategic merge patch to scale replicas and increase limits\npatchesStrategicMerge:\n- |-\n  apiVersion: apps/v1\n  kind: Deployment\n  metadata:\n    name: mern-backend\n  spec:\n    replicas: 5\n    template:\n      spec:\n        containers:\n        - name: express-api\n          resources:\n            requests:\n              cpu: 500m\n              memory: 512Mi\n            limits:\n              cpu: 1000m\n              memory: 1Gi\n\n# Generator with content hashing for automated rolling restarts\nconfigMapGenerator:\n- name: backend-config\n  literals:\n  - NODE_ENV=production\n  - PORT=5000\n  - LOG_LEVEL=warn",
              "explanation": "Production Kustomization overlay file demonstrating namespace scoping, image tag overriding, replica scaling patches, and automated hash-based ConfigMap generation."
            }
          ],
          "quiz": [
            {
              "id": "k8s-kus-q1",
              "type": "multiple-choice",
              "question": "Why does Kustomize append a content-based hash suffix to ConfigMaps generated via configMapGenerator?",
              "options": [
                "To encrypt the configuration data using SHA-256",
                "To ensure that any configuration change produces a new object name, triggering an automatic rolling update in dependent Deployments",
                "To prevent git merge conflicts",
                "To comply with RFC 1123 DNS rules"
              ],
              "correctAnswer": "To ensure that any configuration change produces a new object name, triggering an automatic rolling update in dependent Deployments",
              "explanation": "Because Deployments only trigger a rolling update when the Pod template changes, changing the ConfigMap name via a content hash guarantees that Kubernetes rolls out the new configuration.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-kus-q2",
              "type": "multiple-choice",
              "question": "What is the primary architectural difference between Kustomize and Helm?",
              "options": [
                "Kustomize only runs in the cloud; Helm runs locally",
                "Kustomize is template-free and manipulates pure YAML; Helm uses Go template strings that are evaluated at runtime",
                "Helm does not support versioning",
                "Kustomize requires a server-side daemon"
              ],
              "correctAnswer": "Kustomize is template-free and manipulates pure YAML; Helm uses Go template strings that are evaluated at runtime",
              "explanation": "Kustomize preserves pure, valid Kubernetes YAML through overlays and strategic merge patches without template syntax. Helm parses Go templates to produce YAML dynamically.",
              "difficulty": "intermediate",
              "xp": 30
            }
          ],
          "troubleshooting": [
            {
              "symptom": "kubectl apply -k fails with \"error: matches multiple resources: [apps/v1, Kind=Deployment, mern-backend]\".",
              "cause": "A patch matches multiple resources because the target specification lacks specific group, version, or name criteria, or multiple resources share identical names.",
              "diagnosis": [
                "Run: kubectl kustomize overlays/production to locate the duplicate resource collision"
              ],
              "solution": "Explicitly define target selectors with group, version, kind, and name in the patches block to uniquely identify the resource.",
              "prevention": "Maintain unique resource names across bases and avoid redundant patches."
            }
          ],
          "keyTakeaways": [
            "Kustomize is a declarative, template-free configuration tool built directly into kubectl.",
            "The Base and Overlays pattern enables DRY (Don't Repeat Yourself) multi-environment architectures.",
            "configMapGenerator automatically appends content hash suffixes, solving the config reload problem.",
            "Strategic merge patches allow concise overrides of specific fields without duplicating entire files."
          ],
          "bestPractices": [
            "Keep bases minimal and generic; push environment-specific requirements into overlays.",
            "Always run kubectl kustomize in CI pipelines to validate that overlays render valid YAML.",
            "Use commonLabels in kustomization.yaml to ensure consistent metadata across all generated objects."
          ],
          "securityConsiderations": [
            "Do not commit secretGenerator manifests containing plaintext secret literals to Git.",
            "Integrate Kustomize with SealedSecrets or ExternalSecrets for secure secret injection."
          ],
          "commonMistakes": [
            "Overusing commonLabels, which can mutate immutable spec.selector fields on existing Deployments.",
            "Nesting deep, multi-level overlays that make tracking configuration inheritance overly complex."
          ],
          "interviewQuestions": [
            "How does Kustomize solve the configuration drift problem across multiple environments without templating?",
            "What is a configMapGenerator and why is it preferred over manually creating ConfigMaps in GitOps?"
          ],
          "references": [
            {
              "title": "Kustomize Documentation",
              "url": "https://kustomize.io/",
              "type": "documentation",
              "description": "Official documentation on declarative management of Kubernetes objects with Kustomize.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-helm",
            "k8s-debugging"
          ]
        },
        {
          "id": "k8s-helm",
          "title": "Helm",
          "summary": "Package, configure, and release complex Kubernetes applications: Chart structure, Go templating syntax, values.yaml overrides, release lifecycles, and managing third-party software.",
          "estimatedMinutes": 45,
          "difficulty": "intermediate",
          "prerequisites": [
            "k8s-deployments",
            "k8s-services",
            "k8s-kustomize"
          ],
          "objectives": [
            {
              "text": "Deconstruct Helm chart directory architecture: Chart.yaml, values.yaml, and templates",
              "skill": "chart-anatomy"
            },
            {
              "text": "Master the Go template language: built-in objects, pipelines, conditionals, and loops",
              "skill": "helm-templating"
            },
            {
              "text": "Manage the Helm release lifecycle: install, upgrade --atomic, rollback, and history",
              "skill": "release-management"
            },
            {
              "text": "Package the full MERN application and install third-party production charts (Bitnami MongoDB)",
              "skill": "mern-helm-chart"
            }
          ],
          "sections": [
            {
              "title": "Helm: The Package Manager for Kubernetes",
              "level": "beginner",
              "content": "Deploying a production MERN application manually requires managing dozens of YAML manifests: Deployments, Services, Ingresses, ConfigMaps, Secrets, PVCs, HPAs, and RBAC rules. Updating an image tag or scaling replicas across environments means editing multiple files.\n\n**Helm** is the package manager for Kubernetes (analogous to `npm` for Node.js or `apt` for Ubuntu).\nIt packages related Kubernetes resources into a single versioned bundle called a **Chart**.\n\nKey Concepts:\n- **Chart**: A package of pre-configured Kubernetes resources.\n- **Values**: Configuration values that parameterize the chart (`values.yaml`).\n- **Release**: A running instance of a chart in a cluster."
            },
            {
              "title": "Chart Anatomy and Go Templating",
              "level": "intermediate",
              "content": "A standard Helm chart follows a strict directory layout:\n```\nmern-app/\n├── Chart.yaml          # Metadata: name, version, description, dependencies\n├── values.yaml         # Default configuration values\n├── templates/          # Kubernetes manifests parameterized with Go templates\n│   ├── _helpers.tpl    # Reusable template partials\n│   ├── deployment.yaml\n│   ├── service.yaml\n│   └── ingress.yaml\n└── NOTES.txt           # Post-installation instructions displayed in terminal\n```\n\n### Go Template Syntax & Pipelines:\n- **Interpolation**: `{{ .Values.replicaCount }}`\n- **Pipelines / Filters**: `{{ .Values.image.tag | default \"latest\" | quote }}`\n- **Conditionals**:\n```yaml\n{{- if .Values.ingress.enabled }}\napiVersion: networking.k8s.io/v1\nkind: Ingress\n...\n{{- end }}\n```\n- **Built-in Objects**:\n  - `.Values`: Properties passed from `values.yaml` or CLI flags.\n  - `.Release`: Information about the release (`.Release.Name`, `.Release.Namespace`).\n  - `.Chart`: Chart metadata (`.Chart.Version`, `.Chart.AppVersion`)."
            },
            {
              "title": "Managing the Release Lifecycle & Third-Party Dependencies",
              "level": "advanced",
              "content": "### Atomic Upgrades and Rollbacks\nProduction deployments should always use the `--atomic` flag:\n```bash\nhelm upgrade --install mern-prod ./mern-app \\\n  --namespace production \\\n  --values values-prod.yaml \\\n  --atomic \\\n  --timeout 5m\n```\nIf any pod fails its readiness probe or enters CrashLoopBackOff before the 5-minute timeout, Helm **automatically rolls back the entire release** to the previously healthy revision!\n\n### Managing Third-Party Software (e.g. Bitnami MongoDB)\nRather than writing complex MongoDB replication manifests from scratch, you can declare external charts as dependencies in `Chart.yaml`:\n```yaml\ndependencies:\n- name: mongodb\n  version: 15.4.0\n  repository: oci://registry-1.docker.io/bitnamicharts\n```\nRunning `helm dependency update` downloads the verified MongoDB chart into your `charts/` sub-directory."
            }
          ],
          "commands": [
            {
              "command": "helm install mern-release ./mern-app -f values-prod.yaml -n production --create-namespace",
              "description": "Deploy a new release of a Helm chart using production values",
              "example": "helm install mern-release ./mern-app -f values-prod.yaml -n production --create-namespace",
              "output": "NAME: mern-release\nLAST DEPLOYED: Mon Nov 16 10:00:00 2026\nNAMESPACE: production\nSTATUS: deployed\nREVISION: 1\nTEST SUITE: None\nNOTES:\nMERN Stack has been successfully deployed to namespace: production",
              "whenToUse": "Initial installation of an application stack"
            },
            {
              "command": "helm template ./mern-app -f values-prod.yaml",
              "description": "Render chart templates locally to stdout to inspect the final YAML without touching the cluster",
              "example": "helm template ./mern-app -f values-prod.yaml | grep -A 5 \"image:\"",
              "output": "        image: \"ghcr.io/org/mern-backend:v1.2.0\"\n        imagePullPolicy: IfNotPresent\n        ports:\n        - name: http\n          containerPort: 5000",
              "whenToUse": "Debugging template syntax errors and verifying value substitutions before deployment"
            },
            {
              "command": "helm rollback mern-release 1 -n production",
              "description": "Rollback a release to a specific previous revision number",
              "example": "helm rollback mern-release 1 -n production",
              "output": "Rollback was a success! Happy Helming!",
              "whenToUse": "Restoring service when an upgraded release fails in production"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "helm-values.yaml",
              "code": "# values.yaml - Default configuration values for MERN Chart\nreplicaCount: 3\n\nimage:\n  repository: ghcr.io/org/mern-backend\n  pullPolicy: IfNotPresent\n  tag: \"1.2.0\"\n\nservice:\n  type: ClusterIP\n  port: 5000\n\ningress:\n  enabled: true\n  className: \"nginx\"\n  annotations:\n    cert-manager.io/cluster-issuer: \"letsencrypt-prod\"\n  hosts:\n  - host: devops.example.com\n    paths:\n    - path: /api\n      pathType: Prefix\n  tls:\n  - secretName: mern-api-tls\n    hosts:\n    - devops.example.com\n\nresources:\n  requests:\n    cpu: 250m\n    memory: 256Mi\n  limits:\n    cpu: 500m\n    memory: 512Mi\n\n# Sub-chart dependency configuration for Bitnami MongoDB\nmongodb:\n  enabled: true\n  architecture: replicaset\n  replicaCount: 3\n  auth:\n    database: devops_db\n    username: mern_user",
              "explanation": "Idiomatic values.yaml parameterizing replica counts, container images, ingress routing, resource limits, and sub-chart configuration for MongoDB."
            }
          ],
          "quiz": [
            {
              "id": "k8s-hlm-q1",
              "type": "multiple-choice",
              "question": "What is the benefit of using \"helm upgrade --atomic\" during deployments?",
              "options": [
                "It accelerates the build time of Docker images",
                "If the upgrade fails or pods do not become ready within the timeout, Helm automatically purges and rolls back to the previous stable revision",
                "It splits the deployment into micro-transactions",
                "It enables atomic clock synchronization across nodes"
              ],
              "correctAnswer": "If the upgrade fails or pods do not become ready within the timeout, Helm automatically purges and rolls back to the previous stable revision",
              "explanation": "The --atomic flag guarantees all-or-nothing rollouts: if any pod fails readiness or times out, Helm initiates an automated rollback to the last successful release revision.",
              "difficulty": "intermediate",
              "xp": 35
            },
            {
              "id": "k8s-hlm-q2",
              "type": "multiple-choice",
              "question": "Which Helm command allows you to preview the rendered YAML manifests locally without contacting or modifying the Kubernetes cluster?",
              "options": [
                "helm render",
                "helm template",
                "helm preview",
                "helm compile"
              ],
              "correctAnswer": "helm template",
              "explanation": "helm template executes the Go templating engine against your values files entirely in local memory, outputting the resulting Kubernetes YAML to stdout for inspection and linting.",
              "difficulty": "beginner",
              "xp": 25
            }
          ],
          "troubleshooting": [
            {
              "symptom": "helm upgrade fails with \"Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress\".",
              "cause": "A previous Helm command was interrupted (e.g. CI pipeline cancelled or timed out), leaving the release secret in a \"pending-upgrade\" lock state.",
              "diagnosis": [
                "Check release status: helm list -a -n production",
                "Inspect Helm release secret: kubectl get secret -l owner=helm,name=mern-release -n production"
              ],
              "solution": "Find the pending release secret: kubectl get secret -n production -l status=pending-upgrade. Delete that specific pending secret to release the lock, then retry the upgrade.",
              "prevention": "Always configure sensible --timeout flags and use --atomic so timeouts trigger clean rollbacks rather than stranded locks."
            }
          ],
          "keyTakeaways": [
            "Helm packages Kubernetes resources into versioned, parameterized Charts.",
            "values.yaml defines parameters; templates generate declarative Kubernetes manifests.",
            "Use helm template and helm lint in CI/CD to validate syntax before deployment.",
            "The --atomic flag ensures automated rollback if new pods fail to reach Ready status."
          ],
          "bestPractices": [
            "Keep values.yaml self-documenting with descriptive comments for all exposed options.",
            "Version charts semantically: bump chart version on template changes; bump appVersion on container updates.",
            "Use Helm for third-party infrastructure components (Ingress, Cert-Manager, Prometheus) and combine with Kustomize for in-house microservices."
          ],
          "securityConsiderations": [
            "Sign and verify Helm chart provenance using Cosign or Helm GPG verification.",
            "Never store raw unencrypted passwords in values.yaml committed to public repositories."
          ],
          "commonMistakes": [
            "Hardcoding values inside template files instead of parameterizing them via values.yaml.",
            "Omitting quotes around template strings, causing YAML parsing errors when values evaluate to booleans or numbers."
          ],
          "interviewQuestions": [
            "Compare Helm and Kustomize: what are the architectural trade-offs, and when would you choose one over the other?",
            "How does Helm manage release state and rollbacks under the hood without a dedicated server daemon like Tiller?"
          ],
          "references": [
            {
              "title": "Helm Documentation",
              "url": "https://helm.sh/docs/",
              "type": "documentation",
              "description": "Official guide to managing Kubernetes packages with Helm.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-debugging"
          ]
        },
        {
          "id": "k8s-debugging",
          "title": "Debugging Kubernetes",
          "summary": "Systematic incident triage: build an actionable mental model to diagnose CrashLoopBackOff, ImagePullBackOff, Pending pods, OOMKilled, and connection drops.",
          "estimatedMinutes": 45,
          "difficulty": "advanced",
          "prerequisites": [
            "k8s-pods",
            "k8s-deployments",
            "k8s-services",
            "k8s-kubectl-mastery"
          ],
          "objectives": [
            {
              "text": "Execute the systematic 5-step Kubernetes diagnostic decision tree",
              "skill": "triage-workflow"
            },
            {
              "text": "Diagnose and resolve common pod failure states: Pending, ImagePullBackOff, CrashLoopBackOff",
              "skill": "failure-states"
            },
            {
              "text": "Correlate cluster events, previous container logs, and termination exit codes",
              "skill": "log-analysis"
            },
            {
              "text": "Isolate networking breakdowns between Express backend and MongoDB using port-forwarding and netshoot",
              "skill": "network-troubleshooting"
            }
          ],
          "sections": [
            {
              "title": "The Systematic 5-Step Diagnostic Decision Tree",
              "level": "beginner",
              "content": "When a production alert fires or a MERN deployment fails, novice engineers guess randomly. Senior DevOps engineers follow a rigorous, systematic diagnostic decision tree:\n\n```\n1. kubectl get pods\n   ├── Status: Pending?               ──▶ Step A: Scheduler & Storage triage\n   ├── Status: ImagePullBackOff?      ──▶ Step B: Registry & Secret triage\n   ├── Status: CrashLoopBackOff?      ──▶ Step C: Runtime & Code triage\n   └── Status: Running (0/1 Ready)?   ──▶ Step D: Health Probe triage\n\n2. kubectl describe pod <name>        ──▶ Read \"Events\" at bottom of output\n3. kubectl logs <name> --previous     ──▶ Read crash stack traces before exit\n4. kubectl get events --sort-by       ──▶ Check node/cluster-level events\n5. kubectl debug / port-forward       ──▶ Inspect network and internal state\n```"
            },
            {
              "title": "Deep Dive: The Four Most Common Failure Modes",
              "level": "intermediate",
              "content": "### 1. Pending (Pod Not Scheduled)\n- **Root Cause**: The kube-scheduler cannot find any worker node that meets the pod's requirements.\n- **Diagnosis**: `kubectl describe pod`.\n- **Common Triggers**: Insufficient node CPU/memory requests, nodeSelector/nodeAffinity mismatch, untolerated node taints, or PersistentVolumeClaim unbound.\n\n### 2. ImagePullBackOff / ErrImagePull\n- **Root Cause**: Kubelet cannot pull the container image from the container registry.\n- **Common Triggers**: Typo in image name or tag, private registry authentication missing (`imagePullSecrets` absent), or registry rate-limiting (Docker Hub 429).\n\n### 3. CrashLoopBackOff\n- **Root Cause**: The container started, but the process terminated (exited), so Kubelet restarted it with an exponential backoff delay (10s, 20s, 40s... up to 5m).\n- **Diagnosis**: Check termination reason and previous logs:\n```bash\nkubectl logs <pod-name> --previous\n```\n- **Common Triggers**: Missing environment variable (e.g. `MONGO_URI` undefined), unhandled exception in Node.js, database connection rejected, or invalid CMD/ENTRYPOINT syntax.\n\n### 4. Running (0/1 Ready)\n- **Root Cause**: The container is running, but failing its readiness probe, so no traffic is routed to it.\n- **Diagnosis**: `kubectl describe pod | grep -i readiness`."
            },
            {
              "title": "Network & Service Connectivity Triage",
              "level": "advanced",
              "content": "When our React frontend cannot communicate with the Express API, or Express cannot connect to MongoDB, follow this network triage checklist:\n\n1. **Verify Backing Endpoints**:\n   `kubectl get endpointslices -l kubernetes.io/service-name=mern-backend`\n   If empty, check label selectors in Service vs Deployment.\n\n2. **Test Port-Forwarding**:\n   Bypass Ingress and Services entirely by port-forwarding straight to the pod:\n   `kubectl port-forward pod/mern-backend-xyz 5000:5000`\n   If localhost:5000 works, the application code is fine; the bug is in Service/Ingress routing!\n\n3. **Test In-Cluster DNS**:\n   Run an ephemeral debug container:\n   `kubectl run netshoot --rm -it --image=nicolaka/netshoot -- nslookup mern-mongo-headless`\n\n4. **Verify NetworkPolicies**:\n   Check if a default-deny NetworkPolicy is silently dropping packets between the tiers."
            }
          ],
          "commands": [
            {
              "command": "kubectl logs deployment/mern-backend --tail=100 -f",
              "description": "Stream the last 100 lines of logs across all pods in a deployment simultaneously",
              "example": "kubectl logs deployment/mern-backend --tail=100 -f",
              "output": "[2026-11-16 10:14:02] Express server listening on port 5000\n[2026-11-16 10:14:05] Mongoose connected to mongodb://mern-mongo:27017/devops_db",
              "whenToUse": "Monitoring real-time application behavior during rollout or troubleshooting"
            },
            {
              "command": "kubectl logs <pod-name> --previous",
              "description": "Print the logs of the previously crashed container instance before its restart",
              "example": "kubectl logs mern-backend-56f89b5c7f-9x2jk --previous",
              "output": "Error: Cannot find module './config/database.js'\n    at Module._resolveFilename (node:internal/modules/cjs/loader:1144:15)\n    at Module._load (node:internal/modules/cjs/loader:985:27)",
              "whenToUse": "Identifying fatal startup errors in CrashLoopBackOff containers"
            },
            {
              "command": "kubectl get events --sort-by='.metadata.creationTimestamp' -A | tail -n 20",
              "description": "View the most recent warning and normal events across the entire cluster chronologically",
              "example": "kubectl get events --sort-by='.metadata.creationTimestamp' -A | tail -n 20",
              "output": "NAMESPACE    LAST SEEN   TYPE      REASON             OBJECT                              MESSAGE\nproduction   35s         Warning   FailedMount        pod/mern-mongo-0                    Unable to attach or mount volumes: timed out waiting for volume\nproduction   12s         Warning   FailedScheduling   pod/mern-backend-77                 0/3 nodes available: 3 Insufficient memory",
              "whenToUse": "Diagnosing cluster-wide scheduling, volume attachment, and node events"
            }
          ],
          "codeExamples": [
            {
              "language": "bash",
              "filename": "k8s-triage-script.sh",
              "code": "#!/usr/bin/env bash\n# Quick automated diagnostic triage script for a failing pod\nPOD_NAME=\"$1\"\nNAMESPACE=\"${2:-default}\"\n\nif [ -z \"$POD_NAME\" ]; then\n  echo \"Usage: ./k8s-triage.sh <pod-name> [namespace]\"\n  exit 1\nfi\n\necho \"==============================================\"\necho \"TRIAGE REPORT FOR: $POD_NAME ($NAMESPACE)\"\necho \"==============================================\"\n\necho \">>> 1. POD STATUS & RESTART COUNT:\"\nkubectl get pod \"$POD_NAME\" -n \"$NAMESPACE\" -o wide\n\necho -e \"\n>>> 2. TERMINATION REASON & EXIT CODE:\"\nkubectl get pod \"$POD_NAME\" -n \"$NAMESPACE\" -o jsonpath='{range .status.containerStatuses[*]}{.name}{\": LastState=\"}{.lastState}{\"\n\"}{end}'\n\necho -e \"\n>>> 3. RECENT POD EVENTS:\"\nkubectl describe pod \"$POD_NAME\" -n \"$NAMESPACE\" | grep -A 10 \"Events:\"\n\necho -e \"\n>>> 4. PREVIOUS CONTAINER CRASH LOGS:\"\nkubectl logs \"$POD_NAME\" -n \"$NAMESPACE\" --previous --tail=25 2>/dev/null || echo \"No previous logs available.\"\n\necho -e \"\n>>> 5. RESOURCE USAGE:\"\nkubectl top pod \"$POD_NAME\" -n \"$NAMESPACE\" 2>/dev/null || echo \"Metrics unavailable.\"",
              "explanation": "Production bash triage script automating the retrieval of pod status, exit codes, describe events, previous crash logs, and live metrics."
            }
          ],
          "quiz": [
            {
              "id": "k8s-dbg-q1",
              "type": "multiple-choice",
              "question": "If a Pod is in CrashLoopBackOff, what is the most effective first command to see why the process crashed?",
              "options": [
                "kubectl delete pod <name>",
                "kubectl logs <name> --previous",
                "kubectl top node",
                "kubectl scale deployment --replicas=0"
              ],
              "correctAnswer": "kubectl logs <name> --previous",
              "explanation": "When a container crashes and restarts, kubectl logs shows the fresh container. Passing --previous extracts the stdout/stderr from the terminated container instance right before it crashed.",
              "difficulty": "beginner",
              "xp": 25
            },
            {
              "id": "k8s-dbg-q2",
              "type": "multiple-choice",
              "question": "What does container exit code 137 typically indicate in Kubernetes?",
              "options": [
                "Network DNS failure",
                "The process was terminated by the Linux OOM-Killer (SIGKILL / 128 + 9 = 137) due to exceeding memory limits",
                "Invalid YAML syntax",
                "Authentication failure with the API server"
              ],
              "correctAnswer": "The process was terminated by the Linux OOM-Killer (SIGKILL / 128 + 9 = 137) due to exceeding memory limits",
              "explanation": "Exit code 137 occurs when a process is killed by signal 9 (SIGKILL: 128 + 9 = 137). In Kubernetes, this almost universally indicates the container breached its memory limit and was killed by the kernel OOM-killer.",
              "difficulty": "intermediate",
              "xp": 35
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Pod is stuck in \"ImagePullBackOff\" and describe events show \"Failed to pull image: 403 Forbidden\".",
              "cause": "The image is hosted on a private container registry (e.g. GitHub Packages / AWS ECR) and the pod lacks valid imagePullSecrets.",
              "diagnosis": [
                "Inspect pod describe events: kubectl describe pod <pod-name> | grep -i failed",
                "Check configured imagePullSecrets: kubectl get pod <pod-name> -o jsonpath=\"{.spec.imagePullSecrets}\""
              ],
              "solution": "Create a docker-registry secret: kubectl create secret docker-registry regcred --docker-server=ghcr.io --docker-username=<user> --docker-password=<token>. Add imagePullSecrets: [{name: regcred}] to the Deployment spec.",
              "prevention": "Attach imagePullSecrets to the default ServiceAccount in the namespace so all workloads inherit registry credentials automatically."
            }
          ],
          "keyTakeaways": [
            "Always follow a systematic triage tree: Status -> Events -> Previous Logs -> Ephemeral Debug.",
            "Exit code 137 = OOMKilled; Exit code 0 = Normal termination; Exit code 1 = Application crash.",
            "Use kubectl port-forward to isolate whether a failure is application-level or network/routing-level.",
            "Check EndpointSlices when services fail to route traffic to running pods."
          ],
          "bestPractices": [
            "Always inspect kubectl describe events before restarting or deleting malfunctioning pods.",
            "Set up centralized logging (Loki, Elasticsearch) so logs are preserved even after pods are deleted.",
            "Maintain a toolbox of diagnostic pods (e.g. nicolaka/netshoot) in your cluster."
          ],
          "securityConsiderations": [
            "Do not leave privileged debug pods or port-forward tunnels running unattended.",
            "Sanitize sensitive tokens and database passwords from application log outputs."
          ],
          "commonMistakes": [
            "Immediately deleting a crashing pod with kubectl delete pod, which erases transient state and diagnostic logs.",
            "Looking at live logs of a newly restarted container instead of using --previous to see why it crashed."
          ],
          "interviewQuestions": [
            "Walk through your troubleshooting steps when an on-call alert reports that an Express API pod is in CrashLoopBackOff.",
            "What does an Exit Code 137 mean, and how would you diagnose and resolve it in Kubernetes?"
          ],
          "references": [
            {
              "title": "Troubleshoot Applications in Kubernetes",
              "url": "https://kubernetes.io/docs/tasks/debug/debug-application/",
              "type": "documentation",
              "description": "Official troubleshooting guide for pods, services, and clusters.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "k8s-architecture",
            "k8s-workloads",
            "k8s-networking"
          ]
        }
      ]
    }
  ]
}
