export interface InfraGuide {
  id: string
  tool: string
  title: string
  summary: string
  platforms: {
    os: 'windows' | 'macos' | 'linux'
    instructions: string[]
    commands: string[]
  }[]
  verificationCommand: string
  expectedOutput: string
  scriptSnippet?: {
    filename: string
    code: string
  }
}

export const realInfraGuides: InfraGuide[] = [
  {
    id: 'guide-docker',
    tool: 'Docker & Docker Compose',
    title: 'Install Real Docker Engine & Docker Compose',
    summary: 'Set up an authentic local container runtime to build, run, and inspect your MERN containers.',
    platforms: [
      {
        os: 'windows',
        instructions: [
          'Install Docker Desktop for Windows with WSL 2 backend enabled.',
          'Open PowerShell as Administrator and run the install script.',
          'Ensure `Use the WSL 2 based engine` is checked in Docker Desktop Settings > General.',
        ],
        commands: [
          'winget install Docker.DockerDesktop',
          'wsl --update',
          'docker --version',
          'docker compose version',
        ],
      },
      {
        os: 'macos',
        instructions: [
          'Install Docker Desktop for Mac using Homebrew or DMG download.',
          'Enable Rosetta 2 if using Apple Silicon for legacy x86_64 container emulation.',
        ],
        commands: [
          'brew install --cask docker',
          'open /Applications/Docker.app',
          'docker --version',
          'docker compose version',
        ],
      },
      {
        os: 'linux',
        instructions: [
          'Install Docker Engine using the official Docker apt/yum repository.',
          'Add your user to the `docker` group to run commands without sudo.',
        ],
        commands: [
          'curl -fsSL https://get.docker.com | sh',
          'sudo usermod -aG docker $USER && newgrp docker',
          'docker --version',
          'docker compose version',
        ],
      },
    ],
    verificationCommand: 'docker run --rm hello-world',
    expectedOutput: 'Hello from Docker! This message shows that your installation appears to be working correctly.',
    scriptSnippet: {
      filename: 'verify-docker.sh',
      code: `#!/usr/bin/env bash
set -e
echo "Testing local Docker installation..."
docker run --rm node:20-alpine node -e "console.log('Node.js in Docker OK!')"
echo "Testing Docker Compose..."
docker compose version
echo "Docker is ready for MERN containerization!"`,
    },
  },

  {
    id: 'guide-kind',
    tool: 'kind (Kubernetes in Docker)',
    title: 'Provision a Multi-Node Kubernetes Cluster with kind',
    summary: 'Spin up real multi-node Kubernetes clusters locally inside Docker containers with port mapping for Ingress controllers.',
    platforms: [
      {
        os: 'windows',
        instructions: [
          'Install `kind` and `kubectl` using winget or Chocolatey.',
          'Create `kind-cluster.yaml` configuring extra port mappings for ports 80 and 443.',
        ],
        commands: [
          'winget install Kubernetes.kind',
          'winget install Kubernetes.kubectl',
          'kind create cluster --config kind-config.yaml',
        ],
      },
      {
        os: 'macos',
        instructions: ['Install `kind` and `kubectl` using Homebrew.'],
        commands: [
          'brew install kind kubectl',
          'kind create cluster --config kind-config.yaml',
        ],
      },
      {
        os: 'linux',
        instructions: ['Download the official standalone kind binary and move to `/usr/local/bin`.'],
        commands: [
          '[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64',
          'chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind',
          'kind create cluster --config kind-config.yaml',
        ],
      },
    ],
    verificationCommand: 'kubectl get nodes -o wide',
    expectedOutput: 'NAME                 STATUS   ROLES           AGE   VERSION\nkind-control-plane   Ready    control-plane   2m    v1.29.2\nkind-worker          Ready    <none>          2m    v1.29.2\nkind-worker2         Ready    <none>          2m    v1.29.2',
    scriptSnippet: {
      filename: 'kind-config.yaml',
      code: `kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
  - role: worker
  - role: worker`,
    },
  },

  {
    id: 'guide-argocd',
    tool: 'Argo CD',
    title: 'Bootstrap Real Argo CD on Local kind Cluster',
    summary: 'Deploy the complete Argo CD control plane locally, set up ingress/port-forwarding, and install the `argocd` CLI.',
    platforms: [
      {
        os: 'windows',
        instructions: [
          'Install `argocd` CLI using winget or download the binary.',
          'Apply official manifests to cluster and forward port 8080.',
        ],
        commands: [
          'winget install Argo.ArgoCD',
          'kubectl create namespace argocd',
          'kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.10.0/manifests/install.yaml',
          'kubectl -n argocd wait --for=condition=ready pod --all --timeout=180s',
        ],
      },
      {
        os: 'macos',
        instructions: ['Install `argocd` CLI via Homebrew.'],
        commands: [
          'brew install argocd',
          'kubectl create namespace argocd',
          'kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.10.0/manifests/install.yaml',
          'kubectl -n argocd wait --for=condition=ready pod --all --timeout=180s',
        ],
      },
      {
        os: 'linux',
        instructions: ['Download Linux binary and deploy manifests.'],
        commands: [
          'curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64',
          'sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd && rm argocd-linux-amd64',
          'kubectl create namespace argocd',
          'kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.10.0/manifests/install.yaml',
        ],
      },
    ],
    verificationCommand: 'argocd version --client',
    expectedOutput: 'argocd: v2.10.0+...',
    scriptSnippet: {
      filename: 'bootstrap-argocd.sh',
      code: `#!/usr/bin/env bash
set -e
echo "1. Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

echo "2. Applying Argo CD installation manifests..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.10.0/manifests/install.yaml

echo "3. Waiting for controller pods..."
kubectl wait -n argocd --for=condition=ready pod -l app.kubernetes.io/name=argocd-server --timeout=120s

echo "4. Retrieving initial admin password..."
PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

echo "============================================="
echo "Argo CD UI: https://localhost:8080"
echo "Username:   admin"
echo "Password:   $PASSWORD"
echo "============================================="
echo "Run: kubectl port-forward svc/argocd-server -n argocd 8080:443"`,
    },
  },

  {
    id: 'guide-helm-terraform',
    tool: 'Helm & Terraform / OpenTofu',
    title: 'Install Helm 3 and Terraform/OpenTofu',
    summary: 'Equip your workstation with cloud-native package management and infrastructure as code CLI tooling.',
    platforms: [
      {
        os: 'windows',
        instructions: ['Install via winget or chocolatey in PowerShell.'],
        commands: [
          'winget install Helm.Helm',
          'winget install Hashicorp.Terraform',
          'helm version',
          'terraform version',
        ],
      },
      {
        os: 'macos',
        instructions: ['Install via Homebrew.'],
        commands: [
          'brew install helm terraform',
          'helm version',
          'terraform version',
        ],
      },
      {
        os: 'linux',
        instructions: ['Install Helm and OpenTofu using official package repositories.'],
        commands: [
          'curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash',
          'curl -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh && sh install-opentofu.sh --install-method deb',
          'helm version',
          'tofu version',
        ],
      },
    ],
    verificationCommand: 'helm version && terraform version',
    expectedOutput: 'version.BuildInfo{Version:"v3.14.0", ...}\nTerraform v1.7.0...',
  },
]
