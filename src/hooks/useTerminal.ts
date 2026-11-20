import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { TerminalLine } from '../data/types'
import type { AcademyScenario } from '../data/scenarios/types'

// ─── Virtual Filesystem ─────────────────────────────────────────────────────

export interface FSNode {
  type: 'file' | 'directory'
  content?: string
  permissions: string
  children?: Record<string, FSNode>
}

export function createDefaultFS(): FSNode {
  return {
    type: 'directory', permissions: 'rwxr-xr-x',
    children: {
      home: {
        type: 'directory', permissions: 'rwxr-xr-x',
        children: {
          operator: {
            type: 'directory', permissions: 'rwxr-xr-x',
            children: {
              'mern-app': {
                type: 'directory', permissions: 'rwxr-xr-x',
                children: {
                  'package.json': { type: 'file', permissions: 'rw-r--r--', content: '{\n  "name": "mern-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "start": "node dist/server.js"\n  }\n}' },
                  'Dockerfile': { type: 'file', permissions: 'rw-r--r--', content: 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nUSER node\nEXPOSE 5000\nCMD ["node", "dist/server.js"]' },
                  'docker-compose.yml': { type: 'file', permissions: 'rw-r--r--', content: 'version: "3.9"\nservices:\n  frontend:\n    build: ./frontend\n    ports:\n      - "3000:3000"\n  backend:\n    build: ./backend\n    ports:\n      - "5000:5000"\n    environment:\n      - MONGO_URI=mongodb://mongo:27017/app\n  mongo:\n    image: mongo:7\n    volumes:\n      - mongo-data:/data/db\nvolumes:\n  mongo-data:' },
                  src: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                    'server.ts': { type: 'file', permissions: 'rw-r--r--', content: 'import express from "express";\nconst app = express();\napp.get("/health", (req, res) => res.json({ status: "ok" }));\napp.listen(5000, () => console.log("Server on :5000"));' },
                    'App.tsx': { type: 'file', permissions: 'rw-r--r--', content: 'import React from "react";\nexport default function App() {\n  return <h1>MERN App</h1>;\n}' },
                  }},
                  frontend: { type: 'directory', permissions: 'rwxr-xr-x', children: {} },
                  backend: { type: 'directory', permissions: 'rwxr-xr-x', children: {} },
                },
              },
              'config-repo': {
                type: 'directory', permissions: 'rwxr-xr-x',
                children: {
                  apps: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                    web: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                      base: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                        'deployment.yaml': { type: 'file', permissions: 'rw-r--r--', content: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: web\n          image: ghcr.io/acme/web:1.4.0\n          ports:\n            - containerPort: 3000\n          resources:\n            requests:\n              cpu: 100m\n              memory: 128Mi\n            limits:\n              cpu: 500m\n              memory: 256Mi' },
                        'service.yaml': { type: 'file', permissions: 'rw-r--r--', content: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: web-svc\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 3000' },
                        'kustomization.yaml': { type: 'file', permissions: 'rw-r--r--', content: 'apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n  - deployment.yaml\n  - service.yaml' },
                      }},
                      overlays: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                        staging: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                          'kustomization.yaml': { type: 'file', permissions: 'rw-r--r--', content: 'apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n  - ../../base\nimages:\n  - name: ghcr.io/acme/web\n    newTag: "1.4.1"' },
                        }},
                        prod: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                          'kustomization.yaml': { type: 'file', permissions: 'rw-r--r--', content: 'apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n  - ../../base\nreplicas:\n  - name: web\n    count: 5\nimages:\n  - name: ghcr.io/acme/web\n    newTag: "1.4.0"' },
                        }},
                      }},
                    }},
                  }},
                  argocd: { type: 'directory', permissions: 'rwxr-xr-x', children: {
                    'web-app.yaml': { type: 'file', permissions: 'rw-r--r--', content: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: web-prod\n  namespace: argocd\nspec:\n  project: default\n  source:\n    repoURL: https://github.com/acme/config-repo\n    targetRevision: main\n    path: apps/web/overlays/prod\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: web\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true' },
                  }},
                  'README.md': { type: 'file', permissions: 'rw-r--r--', content: '# Config Repository\n\nThis repository contains Kubernetes manifests managed by Argo CD.\n\n## Structure\n- `apps/` - Application manifests (base + overlays)\n- `argocd/` - Argo CD Application definitions' },
                },
              },
              '.bashrc': { type: 'file', permissions: 'rw-r--r--', content: 'export PS1="\\u@\\h:\\w$ "\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias k="kubectl"' },
              '.ssh': { type: 'directory', permissions: 'rwx------', children: {
                'known_hosts': { type: 'file', permissions: 'rw-r--r--', content: 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...' },
              }},
            },
          },
        },
      },
      etc: {
        type: 'directory', permissions: 'rwxr-xr-x',
        children: {
          'hostname': { type: 'file', permissions: 'rw-r--r--', content: 'gitops-academy' },
          'os-release': { type: 'file', permissions: 'rw-r--r--', content: 'NAME="Ubuntu"\nVERSION="22.04 LTS"\nID=ubuntu' },
          nginx: { type: 'directory', permissions: 'rwxr-xr-x', children: {
            'nginx.conf': { type: 'file', permissions: 'rw-r--r--', content: 'events { worker_connections 1024; }\nhttp {\n  upstream backend {\n    server localhost:3000;\n  }\n  server {\n    listen 80;\n    location / {\n      proxy_pass http://backend;\n    }\n  }\n}' },
          }},
        },
      },
      var: {
        type: 'directory', permissions: 'rwxr-xr-x',
        children: {
          log: { type: 'directory', permissions: 'rwxr-xr-x', children: {
            'syslog': { type: 'file', permissions: 'rw-r-----', content: 'Nov 16 09:30:01 gitops-academy systemd[1]: Started MERN Application.\nNov 16 09:30:02 gitops-academy node[1234]: Server listening on port 3000\nNov 16 09:30:05 gitops-academy nginx[5678]: Starting reverse proxy' },
          }},
        },
      },
      usr: { type: 'directory', permissions: 'rwxr-xr-x', children: {
        local: { type: 'directory', permissions: 'rwxr-xr-x', children: {
          bin: { type: 'directory', permissions: 'rwxr-xr-x', children: {} },
        }},
      }},
      tmp: { type: 'directory', permissions: 'rwxrwxrwt', children: {} },
      proc: { type: 'directory', permissions: 'r-xr-xr-x', children: {
        cpuinfo: { type: 'file', permissions: 'r--r--r--', content: 'processor\t: 0\nmodel name\t: Virtual CPU\ncpu cores\t: 4' },
        meminfo: { type: 'file', permissions: 'r--r--r--', content: 'MemTotal:        8192000 kB\nMemFree:         4096000 kB\nMemAvailable:    6144000 kB' },
      }},
    },
  }
}

export function resolvePath(fs: FSNode, path: string, cwd: string): FSNode | null {
  const absolute = path.startsWith('/') ? path : `${cwd}/${path}`
  const parts = absolute.split('/').filter(Boolean)
  let current = fs
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      const parentParts = parts.slice(0, parts.indexOf(part))
      let parent = fs
      for (const pp of parentParts) {
        if (parent.children?.[pp]) parent = parent.children[pp]
        else return null
      }
      current = parent
      continue
    }
    if (current.type !== 'directory' || !current.children?.[part]) return null
    current = current.children[part]
  }
  return current
}

export function normalizePath(path: string, cwd: string): string {
  const absolute = path.startsWith('/') ? path : `${cwd}/${path}`
  const parts = absolute.split('/').filter(Boolean)
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') { resolved.pop(); continue }
    resolved.push(part)
  }
  return '/' + resolved.join('/')
}

export function listDir(node: FSNode): string[] {
  if (node.type !== 'directory' || !node.children) return []
  return Object.keys(node.children).sort()
}

export function writeFile(fs: FSNode, path: string, content: string, cwd: string = '/'): boolean {
  const absolute = path.startsWith('/') ? path : `${cwd}/${path}`
  const parts = absolute.split('/').filter(Boolean)
  if (parts.length === 0) return false
  const fileName = parts.pop()!
  let current = fs
  for (const part of parts) {
    if (!current.children) current.children = {}
    if (!current.children[part]) {
      current.children[part] = { type: 'directory', permissions: 'rwxr-xr-x', children: {} }
    }
    current = current.children[part]
    if (current.type !== 'directory') return false
  }
  if (!current.children) current.children = {}
  current.children[fileName] = {
    type: 'file',
    permissions: 'rw-r--r--',
    content,
  }
  return true
}

export function readFile(fs: FSNode, path: string, cwd: string = '/'): string | null {
  const node = resolvePath(fs, path, cwd)
  if (!node || node.type !== 'file') return null
  return node.content ?? ''
}

// ─── Command Handlers ───────────────────────────────────────────────────────

type CmdHandler = (args: string[], state: TerminalState) => TerminalLine[]

export interface TerminalState {
  cwd: string
  fs: FSNode
  env: Record<string, string>
  user: string
  hostname: string
  history: string[]
  kubeContext: string
  kubeNamespace: string
  kubeNamespaces: string[]
  kubePods: KubePod[]
  kubeDeployments: KubeDeploy[]
  kubeServices: KubeService[]
  kubeEndpoints: Record<string, string[]>
  argoApps: ArgoApp[]
  argoSynced: boolean
  gitBranch: string
  gitLog: string[]
  dockerContainers: DockerContainer[]
  dockerImages: DockerImage[]
  dockerNetworks: string[]
}

export interface KubePod {
  name: string; ready: string; status: string; restarts: number; age: string; namespace: string; image: string
}
export interface KubeDeploy {
  name: string; ready: string; upToDate: number; available: number; age: string; namespace: string
}
export interface KubeService {
  name: string; type: string; clusterIP: string; ports: string; namespace: string
}
export interface ArgoApp {
  name: string; syncStatus: string; health: string; revision: string; repo: string; path: string
}
export interface DockerContainer {
  id: string; image: string; status: string; ports: string; name: string
}
export interface DockerImage {
  repository: string; tag: string; id: string; size: string
}

function out(text: string, kind: TerminalLine['kind'] = 'output'): TerminalLine {
  return { text, kind }
}

const linuxCommands: Record<string, CmdHandler> = {
  pwd: (_args, state) => [out(state.cwd)],
  whoami: (_args, state) => [out(state.user)],
  hostname: (_args, state) => [out(state.hostname)],
  uname: (args) => {
    if (args.includes('-a')) return [out('Linux gitops-academy 5.15.0-88-generic #98-Ubuntu SMP x86_64 GNU/Linux')]
    return [out('Linux')]
  },
  echo: (args, state) => {
    const text = args.join(' ').replace(/\$(\w+)/g, (_, v) => state.env[v] || '')
    return [out(text)]
  },
  date: () => [out(new Date().toUTCString())],
  uptime: () => [out(' 09:30:01 up 42 days, 3:14, 1 user, load average: 0.15, 0.10, 0.05')],
  free: (args) => {
    if (args.includes('-h')) {
      return [
        out('              total        used        free      shared  buff/cache   available'),
        out('Mem:           8.0G        2.1G        4.0G        256M        1.9G        5.9G'),
        out('Swap:          2.0G          0B        2.0G'),
      ]
    }
    return [out('              total        used        free'), out('Mem:        8192000     2150000     4096000')]
  },
  df: (args) => {
    if (args.includes('-h')) {
      return [
        out('Filesystem      Size  Used Avail Use% Mounted on'),
        out('/dev/sda1        50G   12G   36G  25% /'),
        out('tmpfs           4.0G     0  4.0G   0% /dev/shm'),
      ]
    }
    return [out('Filesystem     1K-blocks     Used Available Use% Mounted on'), out('/dev/sda1       52428800 12582912  37748736  25% /')]
  },
  id: (_args, state) => [out(`uid=1000(${state.user}) gid=1000(${state.user}) groups=1000(${state.user}),27(sudo),999(docker)`)],
  env: (_args, state) => Object.entries(state.env).map(([k, v]) => out(`${k}=${v}`)),
  export: (args, state) => {
    const match = args[0]?.match(/^(\w+)=(.*)$/)
    if (match) { state.env[match[1]] = match[2]; return [out('', 'dim')] }
    return [out('usage: export VAR=value', 'error')]
  },
  cat: (args, state) => {
    if (!args[0]) return [out('cat: missing operand', 'error')]
    const node = resolvePath(state.fs, args[0], state.cwd)
    if (!node) return [out(`cat: ${args[0]}: No such file or directory`, 'error')]
    if (node.type === 'directory') return [out(`cat: ${args[0]}: Is a directory`, 'error')]
    return (node.content || '').split('\n').map(l => out(l))
  },
  ls: (args, state) => {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al')
    const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al')
    const target = args.find(a => !a.startsWith('-')) || state.cwd
    const node = resolvePath(state.fs, target, state.cwd)
    if (!node) return [out(`ls: cannot access '${target}': No such file or directory`, 'error')]
    if (node.type !== 'directory') return [out(target)]
    let entries = listDir(node)
    if (showAll) entries = ['.', '..', ...entries]
    if (showLong) {
      return entries.map(name => {
        if (name === '.' || name === '..') return out(`drwxr-xr-x  2 ${state.user} ${state.user}  4096 Nov 16 09:30 ${name}`)
        const child = node.children![name]
        const perm = child?.type === 'directory' ? 'd' + (child.permissions || 'rwxr-xr-x') : '-' + (child?.permissions || 'rw-r--r--')
        const size = child?.content?.length || 4096
        return out(`${perm}  1 ${state.user} ${state.user}  ${String(size).padStart(5)} Nov 16 09:30 ${name}`)
      })
    }
    return [out(entries.join('  '))]
  },
  cd: (args, state) => {
    const target = args[0] || `/home/${state.user}`
    if (target === '~') { state.cwd = `/home/${state.user}`; return [] }
    const path = normalizePath(target, state.cwd)
    const node = resolvePath(state.fs, path, '/')
    if (!node) return [out(`cd: ${target}: No such file or directory`, 'error')]
    if (node.type !== 'directory') return [out(`cd: ${target}: Not a directory`, 'error')]
    state.cwd = path
    return []
  },
  mkdir: (args, state) => {
    const name = args.find(a => !a.startsWith('-'))
    if (!name) return [out('mkdir: missing operand', 'error')]
    const parentPath = name.includes('/') ? name.substring(0, name.lastIndexOf('/')) || '/' : state.cwd
    const dirName = name.includes('/') ? name.substring(name.lastIndexOf('/') + 1) : name
    const parent = resolvePath(state.fs, parentPath, state.cwd)
    if (!parent || parent.type !== 'directory') return [out(`mkdir: cannot create directory '${name}'`, 'error')]
    if (!parent.children) parent.children = {}
    parent.children[dirName] = { type: 'directory', permissions: 'rwxr-xr-x', children: {} }
    return []
  },
  touch: (args, state) => {
    const name = args[0]
    if (!name) return [out('touch: missing operand', 'error')]
    const parent = resolvePath(state.fs, state.cwd, '/')
    if (!parent || parent.type !== 'directory') return [out('touch: error', 'error')]
    if (!parent.children) parent.children = {}
    if (!parent.children[name]) parent.children[name] = { type: 'file', permissions: 'rw-r--r--', content: '' }
    return []
  },
  head: (args, state) => {
    const file = args.find(a => !a.startsWith('-'))
    if (!file) return [out('head: missing operand', 'error')]
    const node = resolvePath(state.fs, file, state.cwd)
    if (!node || node.type !== 'file') return [out(`head: ${file}: No such file`, 'error')]
    const n = parseInt(args.find(a => a.startsWith('-n'))?.replace('-n', '') || '10')
    return (node.content || '').split('\n').slice(0, n).map(l => out(l))
  },
  tail: (args, state) => {
    const file = args.find(a => !a.startsWith('-'))
    if (!file) return [out('tail: missing operand', 'error')]
    const node = resolvePath(state.fs, file, state.cwd)
    if (!node || node.type !== 'file') return [out(`tail: ${file}: No such file`, 'error')]
    const n = parseInt(args.find(a => a.startsWith('-n'))?.replace('-n', '') || '10')
    return (node.content || '').split('\n').slice(-n).map(l => out(l))
  },
  grep: (args, state) => {
    const pattern = args[0]
    const file = args[1]
    if (!pattern) return [out('grep: missing pattern', 'error')]
    if (file) {
      const node = resolvePath(state.fs, file, state.cwd)
      if (!node || node.type !== 'file') return [out(`grep: ${file}: No such file`, 'error')]
      return (node.content || '').split('\n').filter(l => l.includes(pattern)).map(l => out(l))
    }
    return [out('grep: missing file operand', 'error')]
  },
  wc: (args, state) => {
    const file = args.find(a => !a.startsWith('-'))
    if (!file) return [out('wc: missing operand', 'error')]
    const node = resolvePath(state.fs, file, state.cwd)
    if (!node || node.type !== 'file') return [out(`wc: ${file}: No such file`, 'error')]
    const lines = (node.content || '').split('\n')
    const words = (node.content || '').split(/\s+/).filter(Boolean)
    const bytes = (node.content || '').length
    return [out(`  ${lines.length}  ${words.length}  ${bytes} ${file}`)]
  },
  find: (args) => {
    return [out(`./mern-app`), out(`./mern-app/package.json`), out(`./mern-app/Dockerfile`), out(`./mern-app/src`), out(`(simulated find output for: ${args.join(' ')})`)]
  },
  chmod: () => [out('', 'dim')],
  chown: () => [out('', 'dim')],
  cp: (args, state) => {
    if (args.length < 2) return [out('cp: missing file operand', 'error')]
    const src = readFile(state.fs, args[0], state.cwd)
    if (src === null) return [out(`cp: cannot stat '${args[0]}': No such file`, 'error')]
    writeFile(state.fs, args[1], src, state.cwd)
    return [out('', 'dim')]
  },
  mv: (args, state) => {
    if (args.length < 2) return [out('mv: missing file operand', 'error')]
    const src = readFile(state.fs, args[0], state.cwd)
    if (src === null) return [out(`mv: cannot stat '${args[0]}': No such file`, 'error')]
    writeFile(state.fs, args[1], src, state.cwd)
    return [out('', 'dim')]
  },
  rm: (args) => {
    if (args.includes('-rf') && args.includes('/')) return [out("nice try. GitOps would just reconcile it back anyway 😏", 'warning')]
    return [out('', 'dim')]
  },
  which: (args) => {
    const bins: Record<string, string> = { node: '/usr/local/bin/node', npm: '/usr/local/bin/npm', git: '/usr/bin/git', docker: '/usr/bin/docker', kubectl: '/usr/local/bin/kubectl', helm: '/usr/local/bin/helm', argocd: '/usr/local/bin/argocd', terraform: '/usr/local/bin/terraform', bash: '/bin/bash' }
    return [out(bins[args[0]] || `${args[0]} not found`)]
  },
  man: (args) => [out(`No manual entry for ${args[0] || '?'} — try \`help\` instead`, 'dim')],
  ps: (args) => {
    if (args.includes('aux')) {
      return [
        out('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND'),
        out('root         1  0.0  0.1 169340 10240 ?        Ss   09:30   0:02 /sbin/init'),
        out('root       234  0.0  0.1  72312  8192 ?        Ss   09:30   0:01 /usr/sbin/sshd'),
        out('operator  1234  0.3  1.2 892456 98304 ?        Sl   09:30   0:15 node dist/server.js'),
        out('root      5678  0.1  0.4 128456 32768 ?        Ss   09:30   0:05 nginx: master process'),
      ]
    }
    return [out('  PID TTY          TIME CMD'), out(' 9999 pts/0    00:00:00 bash')]
  },
  top: () => [out('top - 09:30:01 up 42 days, load average: 0.15, 0.10, 0.05'), out('Tasks: 128 total, 1 running, 127 sleeping'), out('(press q to exit — simulated)')],
  kill: () => [out('', 'dim')],
  systemctl: (args) => {
    const action = args[0]
    const service = args[1] || 'unknown'
    if (action === 'status') return [out(`● ${service} - Service`), out('   Active: active (running) since Mon; 42 days ago'), out('   Main PID: 1234 (node)')]
    if (action === 'start' || action === 'stop' || action === 'restart') return [out(`${action}ing ${service}...`, 'success')]
    return [out(`Usage: systemctl {start|stop|restart|status} service`, 'dim')]
  },
  curl: (args) => {
    const url = args.find(a => !a.startsWith('-')) || ''
    if (url.includes('health')) return [out('{"status":"ok"}')]
    if (url.includes('localhost')) return [out('<!DOCTYPE html><html><body>MERN App</body></html>')]
    return [out(`curl: simulated request to ${url}`)]
  },
  ping: (args) => {
    return [out(`PING ${args[0] || 'localhost'} (127.0.0.1): 64 bytes, icmp_seq=0 ttl=64 time=0.1ms`), out('--- ping statistics: 1 packets transmitted, 1 received, 0% loss')]
  },
  ip: (args) => {
    if (args[0] === 'addr' || args[0] === 'a') {
      return [
        out('1: lo: <LOOPBACK,UP> mtu 65536'),
        out('    inet 127.0.0.1/8 scope host lo'),
        out('2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500'),
        out('    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0'),
      ]
    }
    return [out('Usage: ip addr | ip route')]
  },
  ss: (args) => {
    if (args.includes('-tlnp') || args.includes('-tulnp')) {
      return [
        out('State  Recv-Q Send-Q Local Address:Port   Peer Address:Port Process'),
        out('LISTEN 0      128    0.0.0.0:22            0.0.0.0:*         sshd'),
        out('LISTEN 0      128    0.0.0.0:80            0.0.0.0:*         nginx'),
        out('LISTEN 0      128    0.0.0.0:3000          0.0.0.0:*         node'),
      ]
    }
    return [out('Usage: ss -tlnp')]
  },
  nslookup: (args) => [out(`Server:  8.8.8.8`), out(`Name:    ${args[0] || 'example.com'}`), out(`Address: 93.184.216.34`)],
}

const gitCommands: Record<string, CmdHandler> = {
  'git': (args, state) => {
    const sub = args[0]
    switch (sub) {
      case 'status':
        return [out(`On branch ${state.gitBranch}`), out("Your branch is up to date with 'origin/main'."), out(''), out('nothing to commit, working tree clean')]
      case 'log': {
        if (args.includes('--oneline')) return state.gitLog.map(l => out(l))
        return state.gitLog.map(l => out(l))
      }
      case 'branch':
        return [out(`* ${state.gitBranch}`), out('  develop'), out('  feature/auth')]
      case 'diff':
        return [out('No differences (simulated)')]
      case 'remote':
        if (args[1] === '-v') return [out('origin  https://github.com/acme/config-repo.git (fetch)'), out('origin  https://github.com/acme/config-repo.git (push)')]
        return [out('origin')]
      case 'init':
        return [out('Initialized empty Git repository in .git/', 'success')]
      case 'clone':
        return [out(`Cloning into '${args[1] || 'repo'}'...`, 'success'), out('done.')]
      case 'add':
        return [out('', 'dim')]
      case 'commit':
        return [out(`[${state.gitBranch} abc1234] ${args.find(a => !a.startsWith('-')) || 'commit'}`, 'success')]
      case 'push':
        return [out(`Enumerating objects: 5, done.`), out(`To github.com:acme/config-repo.git`), out(`   abc1234..def5678  ${state.gitBranch} -> ${state.gitBranch}`, 'success')]
      case 'pull':
        return [out('Already up to date.')]
      case 'revert':
        return [out(`[${state.gitBranch}] Revert "previous commit"`, 'success')]
      case 'tag':
        return [out('v1.0.0'), out('v1.1.0'), out('v1.4.0'), out('v1.4.1')]
      case 'stash':
        return [out('Saved working directory and index state')]
      default:
        return [out(`git: '${sub}' is not a git command. See 'git --help'.`, 'error')]
    }
  },
}

const dockerCommands: Record<string, CmdHandler> = {
  'docker': (args, state) => {
    const sub = args[0]
    switch (sub) {
      case 'ps':
        if (state.dockerContainers.length === 0) return [out('CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES')]
        return [
          out('CONTAINER ID   IMAGE                      STATUS          PORTS                    NAMES'),
          ...state.dockerContainers.map(c => out(`${c.id}   ${c.image.padEnd(24)} ${c.status.padEnd(14)} ${c.ports.padEnd(22)} ${c.name}`))
        ]
      case 'images':
        return [
          out('REPOSITORY               TAG       IMAGE ID       SIZE'),
          ...state.dockerImages.map(i => out(`${i.repository.padEnd(24)} ${i.tag.padEnd(9)} ${i.id}   ${i.size}`))
        ]
      case 'build': {
        const tagArg = args.find((_, i) => args[i-1] === '-t') || args.find(a => a.startsWith('-t'))?.replace('-t', '').trim() || 'mern-backend:1.0.0'
        const parts = tagArg.split(':')
        const repository = parts[0]
        const tag = parts[1] || 'latest'
        
        // Resolve target directory or file
        const targetDir = args.find(a => !a.startsWith('-') && a !== tagArg && a !== 'build') || '.'
        const dockerfilePath = targetDir === '.' ? 'Dockerfile' : `${targetDir}/Dockerfile`
        const dockerfileNode = resolvePath(state.fs, dockerfilePath, state.cwd) || resolvePath(state.fs, 'Dockerfile', state.cwd)
        
        if (!dockerfileNode) {
          return [
            out('Sending build context to Docker daemon  2.56kB'),
            out(`error: failed to solve: failed to read dockerfile: open ${dockerfilePath}: no such file or directory`, 'error')
          ]
        }

        // Add or replace image in state
        state.dockerImages = state.dockerImages.filter(i => !(i.repository === repository && i.tag === tag))
        state.dockerImages.unshift({
          repository,
          tag,
          id: 'sha256:' + Math.random().toString(36).substring(2, 8),
          size: '138MB'
        })

        return [
          out('Sending build context to Docker daemon  4.12kB'),
          out('Step 1/8 : FROM node:20-alpine AS build'),
          out(' ---> 6f8e21a3b5c7'),
          out('Step 2/8 : WORKDIR /app'),
          out('Step 3/8 : COPY package*.json ./'),
          out('Step 4/8 : RUN npm ci'),
          out('Step 5/8 : COPY . .'),
          out('Step 6/8 : USER node'),
          out('Step 7/8 : EXPOSE 5000'),
          out('Step 8/8 : CMD ["node", "dist/server.js"]'),
          out(`Successfully built ${state.dockerImages[0].id.slice(7)}`, 'success'),
          out(`Successfully tagged ${repository}:${tag}`, 'success')
        ]
      }
      case 'run': {
        const containerName = args.find((_, i) => args[i-1] === '--name') || `container-${Math.random().toString(36).substring(2, 6)}`
        const netName = args.find((_, i) => args[i-1] === '--network')
        if (netName && !state.dockerNetworks.includes(netName)) {
          state.dockerNetworks.push(netName)
        }
        const img = args.find(a => !a.startsWith('-') && a !== 'run') || 'ghcr.io/acme/api:1.4.0'
        state.dockerContainers.unshift({
          id: Math.random().toString(36).substring(2, 14),
          image: img,
          status: 'Up 1 second',
          ports: '0.0.0.0:5000->5000/tcp',
          name: containerName
        })
        return [out(`Container started: ${state.dockerContainers[0].id}`, 'success')]
      }
      case 'stop':
        return [out(args[1] || 'container', 'success')]
      case 'rm':
        return [out(args[1] || 'container', 'success')]
      case 'pull':
        return [out(`Pulling ${args[1] || 'image'}...`), out('Status: Downloaded newer image', 'success')]
      case 'push':
        return [out(`Pushing ${args[1] || 'image'}...`), out('Pushed successfully', 'success')]
      case 'logs': {
        const containerName = args[1]
        if (containerName === 'mern-backend' && state.env['MONGO_URI']?.includes('localhost')) {
          return [
            out('2024-01-01T00:00:00Z [info] Starting MERN API server on port 5000...'),
            out('2024-01-01T00:00:01Z [error] MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017', 'error'),
            out('2024-01-01T00:00:01Z [error] Database connection failed. Retrying in 5s...', 'error')
          ]
        }
        return [out('2024-01-01T00:00:00Z Server listening on port 5000'), out('2024-01-01T00:00:01Z Connected to MongoDB at mongodb://mongo:27017/app', 'success')]
      }
      case 'exec':
        return [out('(interactive exec session simulated)')]
      case 'inspect':
        return [out('[\n  {\n    "Id": "abc123",\n    "State": { "Status": "running" },\n    "NetworkSettings": { "IPAddress": "172.17.0.2" }\n  }\n]')]
      case 'network': {
        const netSub = args[1]
        if (netSub === 'ls') {
          const list = [
            out('NETWORK ID     NAME        DRIVER    SCOPE'),
            out('abc123def456   bridge      bridge    local'),
            out('def456abc123   host        host      local'),
            out('789abcdef012   none        null      local'),
          ]
          for (const net of state.dockerNetworks) {
            if (!['bridge', 'host', 'none'].includes(net)) {
              list.push(out(`${Math.random().toString(36).substring(2, 14)}   ${net.padEnd(12)}bridge    local`))
            }
          }
          return list
        }
        if (netSub === 'create') {
          const netName = args[2] || 'mern-net'
          if (!state.dockerNetworks.includes(netName)) {
            state.dockerNetworks.push(netName)
          }
          return [out(Math.random().toString(36).substring(2, 18), 'success')]
        }
        if (netSub === 'connect') {
          const netName = args[2] || 'mern-net'
          const cName = args[3] || 'target'
          if (!state.dockerNetworks.includes(netName)) {
            state.dockerNetworks.push(netName)
          }
          return [out(`Container ${cName} connected to network ${netName}`, 'success')]
        }
        return [out('Usage: docker network {ls|create|connect|rm} [OPTIONS]')]
      }
      case 'volume':
        if (args[1] === 'ls') return [out('DRIVER    VOLUME NAME'), out('local     mongo-data'), out('local     app-logs')]
        return [out('docker volume: command simulated')]
      case 'compose':
        if (args[1] === 'up') return [out('Creating network "mern-net"'), out('Creating mongo ... done'), out('Creating backend ... done'), out('Creating frontend ... done', 'success')]
        if (args[1] === 'down') return [out('Stopping frontend ... done'), out('Stopping backend ... done'), out('Stopping mongo ... done'), out('Removing containers... done', 'success')]
        if (args[1] === 'ps') return [out('NAME       SERVICE    STATUS    PORTS'), out('frontend   frontend   running   0.0.0.0:3000->3000/tcp'), out('backend    backend    running   0.0.0.0:5000->5000/tcp'), out('mongo      mongo      running   27017/tcp')]
        return [out(`docker compose ${args[1]}: simulated`)]
      default:
        return [out(`docker: '${sub}' is not a docker command`, 'error')]
    }
  },
}

const kubeCommands: Record<string, CmdHandler> = {
  'kubectl': (args, state) => {
    const sub = args[0]
    const ns = args.find((_, i) => args[i-1] === '-n') || state.kubeNamespace
    
    switch (sub) {
      case 'get': {
        const resource = args[1]
        if (resource === 'pods' || resource === 'pod' || resource === 'po') {
          const pods = state.kubePods.filter(p => p.namespace === ns)
          if (pods.length === 0) return [out(`No resources found in ${ns} namespace.`)]
          const wide = args.includes('-o') && args.includes('wide')
          return [
            out(`NAME${' '.repeat(20)}READY   STATUS    RESTARTS   AGE${wide ? '   NODE' : ''}`),
            ...pods.map(p => out(`${p.name.padEnd(24)}${p.ready.padEnd(8)}${p.status.padEnd(10)}${String(p.restarts).padEnd(11)}${p.age}${wide ? '   node-1' : ''}`))
          ]
        }
        if (resource === 'deployments' || resource === 'deploy') {
          const deps = state.kubeDeployments.filter(d => d.namespace === ns)
          return [out('NAME    READY   UP-TO-DATE   AVAILABLE   AGE'), ...deps.map(d => out(`${d.name.padEnd(8)}${d.ready.padEnd(8)}${String(d.upToDate).padEnd(13)}${String(d.available).padEnd(12)}${d.age}`))]
        }
        if (resource === 'services' || resource === 'svc') {
          const svcs = state.kubeServices.filter(s => s.namespace === ns)
          return [out('NAME       TYPE        CLUSTER-IP    PORTS   AGE'), ...svcs.map(s => out(`${s.name.padEnd(11)}${s.type.padEnd(12)}${s.clusterIP.padEnd(14)}${s.ports.padEnd(8)}5m`))]
        }
        if (resource === 'endpoints' || resource === 'ep') {
          const svcName = args[2]
          if (svcName) {
            const eps = state.kubeEndpoints[svcName] || []
            return [
              out('NAME       ENDPOINTS                                            AGE'),
              out(`${svcName.padEnd(11)}${(eps.length > 0 ? eps.join(',') : '<none>').padEnd(52)}10m`)
            ]
          }
          const svcs = state.kubeServices.filter(s => s.namespace === ns)
          return [
            out('NAME       ENDPOINTS                                            AGE'),
            ...svcs.map(s => {
              const eps = state.kubeEndpoints[s.name] || []
              return out(`${s.name.padEnd(11)}${(eps.length > 0 ? eps.join(',') : '<none>').padEnd(52)}10m`)
            })
          ]
        }
        if (resource === 'nodes' || resource === 'node') {
          return [out('NAME     STATUS   ROLES           AGE   VERSION'), out('node-1   Ready    control-plane   42d   v1.29.0')]
        }
        if (resource === 'namespaces' || resource === 'ns') {
          return [
            out('NAME              STATUS   AGE'),
            ...state.kubeNamespaces.map(n => out(`${n.padEnd(18)}Active   42d`))
          ]
        }
        if (resource === 'all') {
          return [
            ...kubeCommands['kubectl'](['get', 'pods', '-n', ns], state),
            out(''),
            ...kubeCommands['kubectl'](['get', 'deploy', '-n', ns], state),
            out(''),
            ...kubeCommands['kubectl'](['get', 'svc', '-n', ns], state),
          ]
        }
        if (resource === 'configmaps' || resource === 'cm') return [out('NAME               DATA   AGE'), out('web-config         3      5m')]
        if (resource === 'secrets') return [out('NAME                  TYPE                                  DATA   AGE'), out('web-secrets           Opaque                                2      5m')]
        if (resource === 'ingress' || resource === 'ing') return [out('NAME   CLASS   HOSTS       ADDRESS       PORTS     AGE'), out('web    nginx   app.local   192.168.1.1   80, 443   5m')]
        if (resource === 'pv') return [out('NAME       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM            STORAGECLASS'), out('mongo-pv   10Gi       RWO            Retain           Bound    web/mongo-pvc    standard')]
        if (resource === 'pvc') return [out('NAME        STATUS   VOLUME     CAPACITY   ACCESS MODES   STORAGECLASS'), out('mongo-pvc   Bound    mongo-pv   10Gi       RWO            standard')]
        return [out(`No resources found for '${resource}'.`)]
      }
      case 'describe': {
        const resource = args[1]
        const name = args[2] || 'web-svc'
        if (resource === 'svc' || resource === 'service') {
          const eps = state.kubeEndpoints[name] || []
          return [
            out(`Name:              ${name}`),
            out(`Namespace:         ${ns}`),
            out(`Labels:            app=${name}`),
            out(`Selector:          ${eps.length > 0 ? 'app=web' : 'app=web-api'}`),
            out(`Type:              ClusterIP`),
            out(`IP:                10.96.45.12`),
            out(`Port:              http  80/TCP`),
            out(`TargetPort:        3000/TCP`),
            out(`Endpoints:         ${eps.length > 0 ? eps.join(', ') : '<none>'}`),
            out(`Session Affinity:  None`),
            out(`Events:            <none>`),
          ]
        }
        return [
          out(`Name:         ${name}`),
          out(`Namespace:    ${ns}`),
          out(`Labels:       app=${name}`),
          out(`Annotations:  <none>`),
          out(`Status:       Running`),
          out(`IP:           10.244.0.12`),
          out(`Events:`),
          out(`  Normal  Scheduled  5m   default-scheduler  Successfully assigned`),
          out(`  Normal  Pulled     5m   kubelet            Container image already present`),
          out(`  Normal  Created    5m   kubelet            Created container ${resource}`),
          out(`  Normal  Started    5m   kubelet            Started container ${resource}`),
        ]
      }
      case 'apply': {
        const file = args.find((_, i) => args[i-1] === '-f') || args.find(a => !a.startsWith('-') && a !== 'apply')
        const fileContent = file ? (readFile(state.fs, file, state.cwd) || '') : ''
        
        // Handle deployment apply
        if (file?.includes('deployment') || fileContent.includes('kind: Deployment')) {
          const depName = fileContent.match(/name:\s*([a-zA-Z0-9_-]+)/)?.[1] || 'web'
          const existingDep = state.kubeDeployments.find(d => d.name === depName && d.namespace === ns)
          if (!existingDep) {
            state.kubeDeployments.push({
              name: depName, ready: '3/3', upToDate: 3, available: 3, age: '1m', namespace: ns
            })
          }
          const existingPods = state.kubePods.filter(p => p.namespace === ns && p.name.startsWith(depName))
          if (existingPods.length < 3) {
            state.kubePods.push(
              { name: `${depName}-7d9f-1`, ready: '1/1', status: 'Running', restarts: 0, age: '1m', namespace: ns, image: 'ghcr.io/acme/web:1.4.0' },
              { name: `${depName}-7d9f-2`, ready: '1/1', status: 'Running', restarts: 0, age: '1m', namespace: ns, image: 'ghcr.io/acme/web:1.4.0' },
              { name: `${depName}-7d9f-3`, ready: '1/1', status: 'Running', restarts: 0, age: '1m', namespace: ns, image: 'ghcr.io/acme/web:1.4.0' },
            )
          }
          return [out(`deployment.apps/${depName} configured`, 'success')]
        }

        // Handle service apply
        if (file?.includes('service') || fileContent.includes('kind: Service')) {
          const svcName = fileContent.match(/name:\s*([a-zA-Z0-9_-]+)/)?.[1] || 'web-svc'
          const existingSvc = state.kubeServices.find(s => s.name === svcName && s.namespace === ns)
          if (!existingSvc) {
            state.kubeServices.push({
              name: svcName, type: 'ClusterIP', clusterIP: '10.96.45.12', ports: '80/TCP', namespace: ns
            })
          }
          if (fileContent.includes('app: web') && !fileContent.includes('app: web-api')) {
            state.kubeEndpoints[svcName] = ['10.244.0.12:3000', '10.244.0.13:3000', '10.244.0.14:3000']
          }
          return [out(`service/${svcName} configured`, 'success')]
        }

        // Handle Argo CD Application apply
        if (file?.includes('web-app') || fileContent.includes('kind: Application')) {
          const appName = fileContent.match(/name:\s*([a-zA-Z0-9_-]+)/)?.[1] || 'web-prod'
          const existingApp = state.argoApps.find(a => a.name === appName)
          if (!existingApp) {
            state.argoApps.push({
              name: appName,
              syncStatus: 'OutOfSync',
              health: 'Healthy',
              revision: 'a1b2c3d',
              repo: 'https://github.com/acme/config-repo',
              path: 'apps/web/overlays/prod'
            })
          }
          return [out(`application.argoproj.io/${appName} configured`, 'success')]
        }

        return [out(`${file || 'resource'} configured`, 'success')]
      }
      case 'create': {
        const res = args[1]
        const name = args[2]
        if (res === 'namespace' || res === 'ns') {
          if (!state.kubeNamespaces.includes(name)) {
            state.kubeNamespaces.push(name)
          }
          return [out(`namespace/${name} created`, 'success')]
        }
        return [out(`${res}/${name} created`, 'success')]
      }
      case 'patch': {
        const resource = args[1]
        const name = args[2] || 'web-svc'
        const patchString = args.join(' ')
        if ((resource === 'svc' || resource === 'service' || resource === 'web-svc') && patchString.includes('web')) {
          state.kubeEndpoints['web-svc'] = ['10.244.0.12:3000', '10.244.0.13:3000', '10.244.0.14:3000']
          return [out(`service/${name} patched`, 'success')]
        }
        return [out(`${resource}/${name} patched`, 'success')]
      }
      case 'edit': {
        const resource = args[1]
        const name = args[2] || 'web-svc'
        if (resource === 'svc' || resource === 'service' || name === 'web-svc') {
          state.kubeEndpoints['web-svc'] = ['10.244.0.12:3000', '10.244.0.13:3000', '10.244.0.14:3000']
          return [out(`service/${name} edited`, 'success')]
        }
        return [out(`${resource}/${name} edited (simulated)`, 'success')]
      }
      case 'delete': return [out(`${args[1]} "${args[2]}" deleted`, 'success')]
      case 'logs': return [out('2024-01-01T00:00:00Z Server listening on port 3000'), out('2024-01-01T00:00:01Z Connected to MongoDB'), out('2024-01-01T00:00:05Z GET /health 200 2ms')]
      case 'exec': return [out('(interactive exec session — simulated)')]
      case 'port-forward': return [out(`Forwarding from 127.0.0.1:${args[2]?.split(':')[0] || '8080'} -> ${args[2]?.split(':')[1] || '3000'}`)]
      case 'rollout': {
        if (args[1] === 'status') return [out('deployment "web" successfully rolled out', 'success')]
        if (args[1] === 'undo') return [out('deployment.apps/web rolled back', 'success')]
        if (args[1] === 'history') return [out('REVISION  CHANGE-CAUSE'), out('1         <none>'), out('2         image update to 1.4.0'), out('3         image update to 1.4.1')]
        return [out(`rollout ${args[1]}: simulated`)]
      }
      case 'scale': {
        const count = parseInt(args.find((_, i) => args[i-1] === '--replicas') || '1', 10)
        const dep = state.kubeDeployments.find(d => d.name === 'web')
        if (dep) {
          dep.ready = `${count}/${count}`
          dep.upToDate = count
          dep.available = count
        }
        return [out(`deployment.apps/${args[1]?.replace('deploy/', '') || 'web'} scaled`, 'success')]
      }
      case 'config': {
        if (args[1] === 'get-contexts') return [out('CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE'), out(`*         ${state.kubeContext}   local      admin      ${ns}`)]
        if (args[1] === 'current-context') return [out(state.kubeContext)]
        return [out('config: simulated')]
      }
      case 'cluster-info': return [out('Kubernetes control plane is running at https://127.0.0.1:6443'), out('CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy')]
      case 'top': {
        if (args[1] === 'pods') return [out('NAME                    CPU(cores)   MEMORY(bytes)'), out('web-7d9f-aa             15m          64Mi'), out('web-7d9f-bb             12m          58Mi')]
        if (args[1] === 'nodes') return [out('NAME     CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%'), out('node-1   250m         12%    1024Mi          25%')]
        return [out('Usage: kubectl top {pods|nodes}')]
      }
      case 'explain': return [out(`KIND:     ${args[1] || 'Deployment'}`), out('VERSION:  apps/v1'), out(''), out('DESCRIPTION:'), out('     A Deployment provides declarative updates for Pods and ReplicaSets.')]
      case 'kustomize': return [out('(Kustomize output — use kustomize build <dir>)')]
      default: return [out(`kubectl: unknown command "${sub}"`, 'error')]
    }
  },
  'k': (args, state) => kubeCommands['kubectl'](args, state), // alias
}

const argoCommands: Record<string, CmdHandler> = {
  'argocd': (args, state) => {
    const sub = args[0]
    if (sub === 'app') {
      const action = args[1]
      switch (action) {
        case 'list':
          return [
            out('NAME       CLUSTER                         NAMESPACE  PROJECT   STATUS     HEALTH    SYNCPOLICY'),
            ...state.argoApps.map(a => out(
              `${a.name.padEnd(11)}${('https://kubernetes.default.svc').padEnd(32)}${'web'.padEnd(11)}${'default'.padEnd(10)}${a.syncStatus.padEnd(11)}${a.health.padEnd(10)}Auto(Prune)`
            ))
          ]
        case 'get': {
          const appName = args[2]
          const app = state.argoApps.find(a => a.name === appName) || state.argoApps[0]
          if (!app) return [out('Application not found', 'error')]
          return [
            out(`Name:               ${app.name}`),
            out(`Project:            default`),
            out(`Server:             https://kubernetes.default.svc`),
            out(`Namespace:          web`),
            out(`URL:                https://argocd.local/applications/${app.name}`),
            out(`Repo:               ${app.repo}`),
            out(`Target:             main`),
            out(`Path:               ${app.path}`),
            out(`Sync Status:        ${app.syncStatus}`),
            out(`Health Status:      ${app.health}`),
            out(`Revision:           ${app.revision}`),
          ]
        }
        case 'diff': {
          if (state.argoSynced) return [out('No differences. App is Synced.', 'success')]
          return [
            out('===== Deployment/web ====='),
            out('  spec:'),
            out('    replicas:'),
            out('-     1   (live cluster)', 'error'),
            out('+     5   (git / desired)', 'success'),
          ]
        }
        case 'set': {
          const appName = args[2] || 'web-prod'
          if (args.includes('--self-heal')) {
            return [out(`Application '${appName}' updated (syncPolicy.automated.selfHeal = true)`, 'success')]
          }
          return [out(`Application '${appName}' updated`, 'success')]
        }
        case 'sync': {
          const appName = args[2]
          state.argoSynced = true
          state.argoApps = state.argoApps.map(a => 
            a.name === (appName || a.name) ? { ...a, syncStatus: 'Synced', health: 'Healthy', revision: '9f2c1a4' } : a
          )
          state.kubeDeployments = state.kubeDeployments.map(d =>
            d.name === 'web' ? { ...d, ready: '5/5', upToDate: 5, available: 5 } : d
          )
          state.kubePods = [
            { name: 'web-8a0c-aa', ready: '1/1', status: 'Running', restarts: 0, age: '10s', namespace: 'web', image: 'ghcr.io/acme/web:1.4.1' },
            { name: 'web-8a0c-bb', ready: '1/1', status: 'Running', restarts: 0, age: '10s', namespace: 'web', image: 'ghcr.io/acme/web:1.4.1' },
            { name: 'web-8a0c-cc', ready: '1/1', status: 'Running', restarts: 0, age: '10s', namespace: 'web', image: 'ghcr.io/acme/web:1.4.1' },
            { name: 'web-8a0c-dd', ready: '1/1', status: 'Running', restarts: 0, age: '10s', namespace: 'web', image: 'ghcr.io/acme/web:1.4.1' },
            { name: 'web-8a0c-ee', ready: '1/1', status: 'Running', restarts: 0, age: '10s', namespace: 'web', image: 'ghcr.io/acme/web:1.4.1' },
          ]
          return [
            out('Syncing app...'),
            out('  Deployment/web   reconciled (replicas: 5)'),
            out('  rollout: web-7d9f → web-8a0c   (1.4.1)'),
            out('app is now Synced ✓ Healthy', 'success'),
          ]
        }
        case 'history':
          return [out('ID  DATE                  REVISION'), out('1   2024-01-01 09:00:00   a1b2c3d'), out('2   2024-01-02 10:00:00   d4e5f6a'), out('3   2024-01-03 11:00:00   9f2c1a4')]
        case 'rollback':
          return [out('Rolling back to revision...'), out('Rollback successful', 'success')]
        case 'delete':
          return [out(`Application '${args[2]}' deleted`, 'success')]
        case 'create':
          return [out(`Application '${args.find(a => a.startsWith('--name'))?.split('=')[1] || 'app'}' created`, 'success')]
        default:
          return [out(`argocd app: unknown command '${action}'`, 'error')]
      }
    }
    if (sub === 'login') return [out("'admin:login' logged in successfully", 'success')]
    if (sub === 'cluster') {
      if (args[1] === 'list') return [out('SERVER                          NAME        VERSION  STATUS'), out('https://kubernetes.default.svc   in-cluster  1.29.0   Successful')]
      return [out('argocd cluster: simulated')]
    }
    if (sub === 'repo') {
      if (args[1] === 'list') return [out('TYPE  NAME  REPO                                      INSECURE  OCI'), out('git         https://github.com/acme/config-repo.git   false     false')]
      return [out('argocd repo: simulated')]
    }
    if (sub === 'proj' || sub === 'project') {
      if (args[1] === 'list') return [out('NAME      DESCRIPTION  DESTINATIONS  SOURCES  CLUSTER-RESOURCE-WHITELIST'), out('default                *,*           *        */*')]
      return [out('argocd project: simulated')]
    }
    if (sub === 'version') return [out('argocd: v2.10.0+abc123')]
    return [out(`argocd: unknown command '${sub}'`, 'error')]
  },
}

const helmCommands: Record<string, CmdHandler> = {
  'helm': (args) => {
    const sub = args[0]
    switch (sub) {
      case 'version': return [out('version.BuildInfo{Version:"v3.14.0"}')]
      case 'list': return [out('NAME    NAMESPACE  REVISION  STATUS    CHART        APP VERSION'), out('web     web        3         deployed  web-0.1.0    1.4.1')]
      case 'template': return [out('---\n# Source: web/templates/deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3')]
      case 'install': return [out(`NAME: ${args[1] || 'release'}`), out('STATUS: deployed', 'success')]
      case 'upgrade': return [out(`Release "${args[1]}" has been upgraded.`, 'success')]
      case 'uninstall': return [out(`release "${args[1]}" uninstalled`, 'success')]
      case 'repo':
        if (args[1] === 'add') return [out(`"${args[2]}" has been added`, 'success')]
        if (args[1] === 'update') return [out('Update Complete. ⎈Happy Helming!⎈', 'success')]
        if (args[1] === 'list') return [out('NAME          URL'), out('bitnami       https://charts.bitnami.com/bitnami')]
        return [out('helm repo: simulated')]
      case 'search': return [out('NAME              CHART VERSION   APP VERSION   DESCRIPTION'), out('bitnami/mongodb   14.0.0          7.0           MongoDB on K8s')]
      case 'show': return [out('# web\n\nA Helm chart for the MERN web application')]
      case 'create': return [out(`Creating ${args[1] || 'chart'}`, 'success')]
      default: return [out(`helm: unknown command '${sub}'`, 'error')]
    }
  },
}

const terraformCommands: Record<string, CmdHandler> = {
  'terraform': (args) => {
    const sub = args[0]
    switch (sub) {
      case 'init': return [out('Initializing the backend...'), out('Initializing provider plugins...'), out(''), out('Terraform has been successfully initialized!', 'success')]
      case 'plan': return [out('Terraform will perform the following actions:'), out(''), out('  # aws_eks_cluster.main will be created'), out('  + resource "aws_eks_cluster" "main" {'), out('      + name = "production"'), out('    }'), out(''), out('Plan: 1 to add, 0 to change, 0 to destroy.')]
      case 'apply': return [out('aws_eks_cluster.main: Creating...'), out('aws_eks_cluster.main: Creation complete after 10m'), out(''), out('Apply complete! Resources: 1 added, 0 changed, 0 destroyed.', 'success')]
      case 'destroy': return [out('Plan: 0 to add, 0 to change, 1 to destroy.'), out('Destroy complete!', 'success')]
      case 'fmt': return [out('main.tf')]
      case 'validate': return [out('Success! The configuration is valid.', 'success')]
      case 'state': return [out('aws_eks_cluster.main')]
      case 'output': return [out('cluster_endpoint = "https://ABCDEF.gr7.us-east-1.eks.amazonaws.com"')]
      case 'version': return [out('Terraform v1.7.0')]
      default: return [out(`terraform: unknown command '${sub}'`, 'error')]
    }
  },
}

const allCommands: Record<string, CmdHandler> = {
  ...linuxCommands,
  ...gitCommands,
  ...dockerCommands,
  ...kubeCommands,
  ...argoCommands,
  ...helmCommands,
  ...terraformCommands,
  'kustomize': (args) => {
    if (args[0] === 'build') return [out('apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 5\n  template:\n    spec:\n      containers:\n        - image: ghcr.io/acme/web:1.4.1')]
    return [out('Usage: kustomize build <dir>')]
  },
  'clear': () => [],
  'help': () => [
    out('Available command families:', 'info'),
    out(''),
    out('  Linux:     ls, cd, pwd, cat, cp, mv, grep, find, chmod, ps, top, df, free, ss, curl, ping', 'dim'),
    out('  Git:       git status/log/branch/diff/commit/push/pull/revert/tag', 'dim'),
    out('  Docker:    docker ps/images/build/run/stop/logs/compose/network/volume', 'dim'),
    out('  K8s:       kubectl get/describe/apply/create/patch/edit/delete/logs/exec/rollout/scale/top', 'dim'),
    out('  Helm:      helm list/template/install/upgrade/repo/search', 'dim'),
    out('  Argo CD:   argocd app list/get/diff/sync/set/history/rollback', 'dim'),
    out('  Terraform: terraform init/plan/apply/destroy/state', 'dim'),
    out('  Kustomize: kustomize build', 'dim'),
    out(''),
    out('  clear      clear the screen', 'dim'),
    out('  help       show this help', 'dim'),
    out('  reset      reset the terminal environment', 'dim'),
  ],
  'reset': () => [out('Terminal environment reset.', 'success')],
}

// ─── Default State ──────────────────────────────────────────────────────────

export function createDefaultState(): TerminalState {
  return {
    cwd: '/home/operator',
    fs: createDefaultFS(),
    env: {
      HOME: '/home/operator',
      USER: 'operator',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      SHELL: '/bin/bash',
      TERM: 'xterm-256color',
      EDITOR: 'vim',
      KUBECONFIG: '/home/operator/.kube/config',
      NODE_ENV: 'production',
      MONGO_URI: 'mongodb://mongo:27017/app',
    },
    user: 'operator',
    hostname: 'gitops-academy',
    history: [],
    kubeContext: 'kind-gitops-lab',
    kubeNamespace: 'web',
    kubeNamespaces: ['default', 'kube-system', 'argocd', 'web'],
    kubePods: [
      { name: 'web-7d9f-aa', ready: '1/1', status: 'Running', restarts: 0, age: '5m', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
      { name: 'web-7d9f-bb', ready: '1/1', status: 'Running', restarts: 0, age: '5m', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
      { name: 'web-7d9f-cc', ready: '1/1', status: 'Running', restarts: 0, age: '5m', namespace: 'web', image: 'ghcr.io/acme/web:1.4.0' },
      { name: 'mongo-0', ready: '1/1', status: 'Running', restarts: 0, age: '30m', namespace: 'web', image: 'mongo:7' },
    ],
    kubeDeployments: [
      { name: 'web', ready: '3/3', upToDate: 3, available: 3, age: '5m', namespace: 'web' },
    ],
    kubeServices: [
      { name: 'web-svc', type: 'ClusterIP', clusterIP: '10.96.45.12', ports: '80/TCP', namespace: 'web' },
      { name: 'mongo', type: 'ClusterIP', clusterIP: '10.96.45.13', ports: '27017/TCP', namespace: 'web' },
    ],
    kubeEndpoints: {
      'web-svc': ['10.244.0.12:3000', '10.244.0.13:3000', '10.244.0.14:3000'],
      'mongo': ['10.244.0.15:27017'],
    },
    argoApps: [
      { name: 'web-prod', syncStatus: 'OutOfSync', health: 'Healthy', revision: 'a1b2c3d', repo: 'https://github.com/acme/config-repo', path: 'apps/web/overlays/prod' },
    ],
    argoSynced: false,
    gitBranch: 'main',
    gitLog: [
      '9f2c1a4 (HEAD -> main) chore: bump web to 1.4.1',
      'a1b2c3d feat: add /metrics endpoint',
      'd4e5f6a fix: handle null user in auth middleware',
      'b7c8d9e feat: add health check endpoint',
      'e1f2a3b chore: initial MERN app setup',
    ],
    dockerContainers: [
      { id: 'a1b2c3d4e5f6', image: 'ghcr.io/acme/web:1.4.0', status: 'Up 5 minutes', ports: '0.0.0.0:3000->3000/tcp', name: 'mern-frontend' },
      { id: 'f6e5d4c3b2a1', image: 'ghcr.io/acme/api:1.4.0', status: 'Up 5 minutes', ports: '0.0.0.0:5000->5000/tcp', name: 'mern-backend' },
      { id: '1a2b3c4d5e6f', image: 'mongo:7', status: 'Up 30 minutes', ports: '27017/tcp', name: 'mern-mongo' },
    ],
    dockerImages: [
      { repository: 'ghcr.io/acme/web', tag: '1.4.0', id: 'sha256:abc123', size: '145MB' },
      { repository: 'ghcr.io/acme/api', tag: '1.4.0', id: 'sha256:def456', size: '182MB' },
      { repository: 'mongo', tag: '7', id: 'sha256:789abc', size: '750MB' },
      { repository: 'node', tag: '20-alpine', id: 'sha256:321fed', size: '126MB' },
      { repository: 'nginx', tag: 'alpine', id: 'sha256:654cba', size: '42MB' },
    ],
    dockerNetworks: ['bridge', 'host', 'none'],
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseTerminalOptions {
  labEnvironment?: string
  scenario?: AcademyScenario
  onCommandExecuted?: (state: TerminalState, cmd: string) => void
}

export function useTerminal(options?: string | UseTerminalOptions) {
  const labEnv = typeof options === 'string' ? options : options?.labEnvironment
  const scenario = typeof options === 'object' ? options?.scenario : undefined
  const onCommandExecuted = typeof options === 'object' ? options?.onCommandExecuted : undefined

  const stateRef = useRef<TerminalState>(createDefaultState())

  const [lines, setLines] = useState<TerminalLine[]>(() => {
    const list: TerminalLine[] = [
      { text: '🖥️  DevOps Academy Terminal — simulated environment', kind: 'info' },
      { text: "Type `help` to see available commands, or start exploring.", kind: 'dim' },
    ]
    if (labEnv) {
      list.push({ text: `Lab environment: ${labEnv}`, kind: 'dim' })
    }
    return list
  })
  
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Initialize or reload scenario when passed
  useEffect(() => {
    if (scenario) {
      stateRef.current = createDefaultState()
      scenario.setupEnvironment(stateRef.current)
      if (scenario.initialFiles) {
        for (const file of scenario.initialFiles) {
          writeFile(stateRef.current.fs, file.path, file.content, '/home/operator')
        }
      }
      setLines([
        { text: `🚀 Scenario: ${scenario.title} [${scenario.type.toUpperCase()}]`, kind: 'info' },
        { text: scenario.summary, kind: 'dim' },
        { text: "Type commands or 'help' to begin.", kind: 'dim' },
      ])
    }
  }, [scenario])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const execute = useCallback((raw: string) => {
    const cmd = raw.trim()
    const inputLine: TerminalLine = {
      text: `${stateRef.current.user}@${stateRef.current.hostname}:${stateRef.current.cwd}$ ${raw}`,
      kind: 'input',
    }
    
    if (!cmd) {
      setLines(prev => [...prev, inputLine])
      return
    }

    stateRef.current.history.push(cmd)

    // Handle clear specially
    if (cmd === 'clear') {
      setLines([])
      return
    }

    // Handle reset
    if (cmd === 'reset') {
      stateRef.current = createDefaultState()
      if (scenario) {
        scenario.setupEnvironment(stateRef.current)
        if (scenario.initialFiles) {
          for (const file of scenario.initialFiles) {
            writeFile(stateRef.current.fs, file.path, file.content, '/home/operator')
          }
        }
      }
      setLines([
        { text: 'Terminal environment reset.', kind: 'success' },
        { text: "Type `help` to see available commands.", kind: 'dim' },
      ])
      return
    }

    // Simple shell redirection support: echo "content" > file
    if (cmd.includes(' > ')) {
      const [cmdPart, targetFile] = cmd.split(' > ').map(s => s.trim())
      if (cmdPart.startsWith('echo ')) {
        const text = cmdPart.slice(5).replace(/^['"]|['"]$/g, '')
        writeFile(stateRef.current.fs, targetFile, text, stateRef.current.cwd)
        setLines(prev => [...prev, inputLine])
        onCommandExecuted?.(stateRef.current, cmd)
        return
      }
    }

    // Parse command and arguments
    const parts = cmd.split(/\s+/)
    const binary = parts[0]
    const cmdArgs = parts.slice(1)

    // Check for compound commands (git status, docker ps, etc.)
    const compoundKey = `${binary} ${cmdArgs[0]}`.trim()
    
    let result: TerminalLine[]

    if (binary === 'sudo') {
      const sudoCmd = parts.slice(1)
      const sudoBinary = sudoCmd[0]
      const sudoArgs = sudoCmd.slice(1)
      if (allCommands[sudoBinary]) {
        result = allCommands[sudoBinary](sudoArgs, stateRef.current)
      } else {
        result = [out(`${sudoBinary}: command not found`, 'error')]
      }
    } else if (allCommands[binary]) {
      result = allCommands[binary](cmdArgs, stateRef.current)
    } else if (allCommands[compoundKey]) {
      result = allCommands[compoundKey](cmdArgs.slice(1), stateRef.current)
    } else {
      result = [out(`${binary}: command not found. Type 'help' for available commands.`, 'error')]
    }

    setLines(prev => [...prev, inputLine, ...result])
    onCommandExecuted?.(stateRef.current, cmd)
  }, [scenario, onCommandExecuted])

  const resetEnvironment = useCallback((customScenario?: AcademyScenario) => {
    stateRef.current = createDefaultState()
    const targetSc = customScenario || scenario
    if (targetSc) {
      targetSc.setupEnvironment(stateRef.current)
      if (targetSc.initialFiles) {
        for (const file of targetSc.initialFiles) {
          writeFile(stateRef.current.fs, file.path, file.content, '/home/operator')
        }
      }
      setLines([
        { text: `🔄 Environment reset: ${targetSc.title}`, kind: 'success' },
        { text: targetSc.summary, kind: 'dim' },
      ])
    } else {
      setLines([
        { text: 'Terminal environment reset to default state.', kind: 'success' },
        { text: "Type 'help' to see available commands.", kind: 'dim' },
      ])
    }
  }, [scenario])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input)
      setInput('')
      setHistoryIndex(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const hist = stateRef.current.history
      if (hist.length === 0) return
      const idx = historyIndex === -1 ? hist.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(idx)
      setInput(hist[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const hist = stateRef.current.history
      const idx = historyIndex + 1
      if (idx >= hist.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(idx)
        setInput(hist[idx])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const parts = input.split(/\s+/)
      const last = parts[parts.length - 1]
      if (last && stateRef.current.cwd) {
        const dir = resolvePath(stateRef.current.fs, stateRef.current.cwd, '/')
        if (dir?.children) {
          const matches = Object.keys(dir.children).filter(k => k.startsWith(last))
          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0]
            setInput(parts.join(' '))
          }
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }, [input, historyIndex, execute])

  const prompt = useMemo(() => {
    const s = stateRef.current
    const cwdDisplay = s.cwd.replace(`/home/${s.user}`, '~')
    return `${s.user}@${s.hostname}:${cwdDisplay}$`
  }, [lines])

  return {
    lines,
    input,
    setInput,
    handleKeyDown,
    bodyRef,
    prompt,
    execute,
    clearLines: () => setLines([]),
    resetEnvironment,
    state: stateRef.current,
  }
}
