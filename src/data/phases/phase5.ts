import type { AcademyPhase } from '../types'

export const phase5: AcademyPhase = {
  "id": "phase5",
  "number": 5,
  "title": "CI/CD & Deployment Strategies",
  "subtitle": "Automate testing, container builds, security scans, and progressive zero-downtime releases for modern web applications",
  "description": "Master modern Continuous Integration, Continuous Delivery, and Continuous Deployment with GitHub Actions, container registries, automated vulnerability scanning, GitOps config repo handoffs, and production Kubernetes deployment patterns including Rolling Updates, Blue-Green, and Canary releases.",
  "icon": "🚀",
  "difficulty": "intermediate",
  "color": "#3b82f6",
  "modules": [
    {
      "id": "cicd-fundamentals",
      "title": "CI/CD Fundamentals",
      "description": "Deconstruct modern software delivery: distinguish Continuous Integration, Delivery, and Deployment; architect DAG-based pipelines; establish robust testing pyramids; and publish immutable container artifacts.",
      "icon": "🔄",
      "difficulty": "intermediate",
      "estimatedHours": 6,
      "lessons": [
        {
          "id": "ci-vs-cd-vs-cd",
          "title": "CI vs CD vs CD",
          "summary": "Continuous Integration, Continuous Delivery, and Continuous Deployment represent distinct stages of delivery automation. Learn how they fit together, eliminate manual handoffs, and govern modern MERN stack releases.",
          "estimatedMinutes": 25,
          "difficulty": "beginner",
          "prerequisites": [],
          "objectives": [
            {
              "text": "Articulate the precise differences between Continuous Integration, Delivery, and Deployment",
              "skill": "CI/CD Architecture"
            },
            {
              "text": "Map the MERN stack release lifecycle across automated testing, staging, and production rollouts",
              "skill": "MERN Delivery"
            },
            {
              "text": "Determine appropriate automation boundaries and manual approval gates for team workflows",
              "skill": "Release Governance"
            }
          ],
          "sections": [
            {
              "title": "The Software Delivery Spectrum",
              "level": "beginner",
              "content": "Historically, software delivery was a high-ceremony, infrequent event. Developers spent weeks or months on isolated feature branches, culminating in a dreaded \"merge week\" followed by manual FTP uploads, server SSH scripts, and late-night weekend deployments.\n\nModern DevOps replaces these fragile human processes with an automated software delivery spectrum:\n\n```\n[ Developer Commit ] ──> [ Continuous Integration ] ──> [ Continuous Delivery ] ──> [ Continuous Deployment ]\n   Local Git Push           Automated Build & Test        Artifact Built & Staged        Automated Prod Release\n```\n\nEach stage increases automation, reduces feedback cycle times, and eliminates human errors. Let's inspect what each term specifically guarantees."
            },
            {
              "title": "Continuous Integration (CI): Verify Every Commit",
              "level": "beginner",
              "content": "**Continuous Integration (CI)** is the practice where developers regularly merge their code into a central trunk branch (typically `main`), triggering an automated build and test pipeline on every pull request and push.\n\nKey characteristics of true CI:\n1. **Trunk-Based Development / Short-Lived Branches**: Features are broken into small PRs merged at least daily.\n2. **Automated Verification**: Every push executes code linters (ESLint), static analysis (TypeScript `tsc`), unit tests (Jest/Vitest), and API route tests (Supertest).\n3. **Fast Feedback (<10 minutes)**: If a test fails, the build breaks immediately, notifying the author before bad code pollutes the mainline branch.\n4. **Clean Baseline**: The `main` branch is always in a green, passing state.\n\nIn the MERN stack, CI ensures that changes to an Express route (`server/routes/products.js`) or a React UI component (`client/src/App.jsx`) do not break API contracts, introduce type errors, or degrade test coverage."
            },
            {
              "title": "Continuous Delivery (CD): Always Deployable",
              "level": "intermediate",
              "content": "**Continuous Delivery (CD)** extends Continuous Integration by ensuring that every change merged to `main` is packaged into a production-ready, releasable artifact and automatically deployed to a non-production environment (such as Staging or QA).\n\nCrucially, in Continuous Delivery:\n- The deployment to **production** remains a **business decision** triggered by a human (e.g., clicking a button in GitHub Actions, approving an environment gate, or publishing a release tag).\n- The system is guaranteed to be deployable at any moment. There are no manual build steps or custom server configurations needed.\n\n```\nMerge to main ──> Run CI ──> Build Docker Image ──> Deploy to Staging ──> [Manual Approval Gate] ──> Deploy to Prod\n```\n\nContinuous Delivery is ideal for enterprise environments, regulated industries (fintech, healthcare), or teams requiring scheduled maintenance windows or marketing coordination before going live."
            },
            {
              "title": "Continuous Deployment (CD): Zero-Touch Production",
              "level": "advanced",
              "content": "**Continuous Deployment (CD)** represents the pinnacle of delivery maturity: every single commit that passes all automated quality gates in the pipeline is deployed directly into production with **zero human intervention**.\n\nDifferences from Continuous Delivery:\n- No manual approval buttons or release managers.\n- Relies completely on exhaustive automated testing (unit, integration, contract, and end-to-end Playwright tests).\n- Supported by canary or progressive deployment strategies and automated rollback mechanisms if error rates or latency spikes occur in production.\n\n| Dimension | Continuous Integration | Continuous Delivery | Continuous Deployment |\n| :--- | :--- | :--- | :--- |\n| **Trigger** | Git push / PR open | PR merge to `main` | PR merge to `main` |\n| **Output** | Test results, lint reports | Tested Docker image, deployed to Staging | Live production update |\n| **Production Gate** | N/A | Human approval / schedule | Fully automated (zero-touch) |\n| **Target Audience** | Developers | QA, Product Managers, SREs | End Users |\n| **Rollback Strategy** | Fix in branch | Manual rollback / revert commit | Automated metric-based abort |"
            },
            {
              "title": "Real-World MERN Stack Perspective",
              "level": "intermediate",
              "content": "In a real-world MERN stack project:\n- **CI Job**: Builds the Vite React frontend (`npm run build`), runs ESLint and Vitest, spins up an in-memory MongoDB runner, and tests Express endpoints with Supertest.\n- **Continuous Delivery Job**: Builds the multi-stage Docker image for the Express API and React client, pushes them to GitHub Container Registry (`ghcr.io`), updates staging manifests, and waits for a Release Lead to approve production promotion.\n- **Continuous Deployment Job**: Immediately applies updated container tags to production Kubernetes pods via GitOps reconciliation."
            }
          ],
          "commands": [
            {
              "command": "npm test -- --coverage",
              "description": "Run the local MERN test suite with coverage report before pushing to GitHub",
              "flags": [
                {
                  "flag": "--coverage",
                  "description": "Output test coverage percentages for lines, branches, and functions"
                }
              ],
              "example": "npm test -- --coverage --watchAll=false",
              "output": "PASS src/routes/auth.test.ts\\nCoverage: 92.4% Statements, 88.1% Branches",
              "whenToUse": "Run locally before pushing a commit or creating a pull request to ensure CI tests will pass"
            },
            {
              "command": "gh run list --workflow=ci.yml",
              "description": "List recent CI workflow runs using the GitHub CLI",
              "flags": [
                {
                  "flag": "--workflow",
                  "description": "Filter runs by workflow filename"
                }
              ],
              "example": "gh run list --workflow=ci.yml --limit 5",
              "output": "✓ ci.yml  feat(auth): add jwt validation  main  push  4289102  3m21s",
              "whenToUse": "Quickly inspect CI status directly from your local terminal without switching to the browser"
            },
            {
              "command": "gh run view --log-failed",
              "description": "View failed job logs from the latest GitHub Actions workflow run",
              "example": "gh run view --log-failed",
              "whenToUse": "Debug a broken CI pipeline run from the command line"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/ci-cd-overview.yml",
              "code": "name: MERN Delivery Pipeline\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  # ─── 1. Continuous Integration ──────────────────────────────\n  continuous-integration:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Checkout code\n        uses: actions/checkout@v4\n\n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n\n      - name: Install dependencies\n        run: npm ci\n\n      - name: Run Linters & Type Checks\n        run: |\n          npm run lint\n          npm run typecheck\n\n      - name: Execute Unit & Integration Tests\n        run: npm test -- --ci --coverage\n\n  # ─── 2. Continuous Delivery (Staging) ────────────────────────\n  continuous-delivery-staging:\n    needs: [continuous-integration]\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    environment: staging\n    steps:\n      - name: Build & Push Staging Docker Image\n        run: echo \"Image tagged as staging-${{ github.sha }} and pushed to GHCR\"\n\n      - name: Deploy to Staging Cluster\n        run: echo \"Staging environment updated with new image tag\"\n\n  # ─── 3. Production Gate (Delivery vs Deployment) ─────────────\n  production-deployment:\n    needs: [continuous-delivery-staging]\n    runs-on: ubuntu-latest\n    # Setting environment with required reviewers turns this into Continuous Delivery!\n    # Removing required reviewers turns this into Continuous Deployment!\n    environment: production\n    steps:\n      - name: Release to Production\n        run: echo \"Production rollout completed for SHA ${{ github.sha }}\"\n",
              "explanation": "This workflow illustrates the progression from CI (testing on PRs and main) to Delivery (automatic staging deployment) to Production (gated by GitHub Environment protection rules)."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "CI vs Continuous Delivery vs Continuous Deployment",
              "description": "Visualizing where automation stops and human gates occur across delivery models",
              "content": "graph LR\n    Dev[Developer Commit] --> CI[CI: Lint, Build, Test]\n    CI --> Artifact[Build Docker Image]\n    Artifact --> Staging[Deploy Staging]\n    Staging --> Gate{Manual Approval?}\n    Gate -- Yes (Continuous Delivery) --> Human[Human Signoff] --> Prod[Deploy Production]\n    Gate -- No (Continuous Deployment) --> AutoPromo[Automated Canary / Rollout] --> Prod"
            }
          ],
          "quiz": [
            {
              "id": "q-ci-cd-diff-1",
              "type": "multiple-choice",
              "question": "What is the primary operational difference between Continuous Delivery and Continuous Deployment?",
              "options": [
                "Continuous Delivery requires compiling code; Continuous Deployment only works for interpreted languages.",
                "In Continuous Delivery, production release requires a human decision/approval; in Continuous Deployment, passing changes reach production automatically.",
                "Continuous Delivery deploys to Kubernetes; Continuous Deployment deploys to virtual machines.",
                "Continuous Delivery does not include automated testing; Continuous Deployment does."
              ],
              "correctAnswer": "In Continuous Delivery, production release requires a human decision/approval; in Continuous Deployment, passing changes reach production automatically.",
              "explanation": "Both practices automate building, testing, and staging. The difference is the final step to production: Continuous Delivery stops before production for business signoff, whereas Continuous Deployment releases automatically.",
              "difficulty": "beginner",
              "xp": 50
            },
            {
              "id": "q-ci-cd-diff-2",
              "type": "scenario",
              "question": "Your team builds a healthcare payment gateway in the MERN stack with strict compliance requirements. Every release must be reviewed by compliance and finance before going live. Which model should you adopt?",
              "options": [
                "Continuous Integration only without any deployment automation",
                "Continuous Delivery with protected environments and manual approval gates",
                "Continuous Deployment with zero gates",
                "Manual weekend SSH deploys"
              ],
              "correctAnswer": "Continuous Delivery with protected environments and manual approval gates",
              "explanation": "Continuous Delivery automates all tests and staging deployments while providing an audited manual gate for compliance and finance sign-off before production release.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Jest test suite passes 100% locally on developer Mac/Windows laptops, but consistently fails in GitHub Actions ubuntu-latest runner.",
              "cause": "Case sensitivity discrepancies in file imports or missing OS-level environment variables (e.g. `JWT_SECRET` not set in CI runner environment).",
              "diagnosis": [
                "Check GitHub Actions step log for exact error line (e.g., 'Cannot find module ./models/User from ./controllers/auth.js')",
                "Inspect git casing: macOS filesystem is case-insensitive by default; Ubuntu Linux runner is strictly case-sensitive",
                "Inspect environment variables in CI runner vs local .env file"
              ],
              "solution": "Fix file path casing to match the exact filename on disk and supply required test environment variables under the workflow `env:` block.",
              "prevention": "Enable git config `git config core.ignorecase false` and use strict ESLint import casing rules."
            }
          ],
          "keyTakeaways": [
            "CI guarantees code quality and test passing on every branch and pull request.",
            "Continuous Delivery ensures the main branch is ALWAYS in a deployable state with tested artifacts ready in staging.",
            "Continuous Deployment takes verified commits directly to production with zero human clicks.",
            "In the MERN stack, CI protects both frontend bundles and backend API contracts before Docker container creation."
          ],
          "bestPractices": [
            "Keep CI runs under 10 minutes to maintain fast developer feedback loops.",
            "Never bypass CI on the main branch; enforce branch protection rules requiring passing checks.",
            "Separate pipeline credentials: CI should never possess production cluster admin keys."
          ],
          "securityConsiderations": [
            "Never check in `.env` files with real API keys or MongoDB credentials into Git repos.",
            "Use GitHub Actions Secrets (`secrets.API_KEY`) and limit access to trusted branch workflows."
          ],
          "commonMistakes": [
            "Treating Continuous Delivery as purely manual deployment—it must be 100% automated up to the production approval trigger.",
            "Merging massive pull requests once every two weeks instead of practicing continuous integration with small daily commits."
          ],
          "interviewQuestions": [
            "Q: What is the difference between Continuous Delivery and Continuous Deployment, and how would you decide which to use for a banking app?\\nA: Continuous Delivery automates testing and packaging up to a deployable artifact, requiring a human trigger for production. Continuous Deployment automates the final production rollout without human intervention. Banking apps with strict financial compliance typically choose Continuous Delivery for audited sign-off."
          ],
          "references": [
            {
              "title": "Continuous Delivery - Martin Fowler",
              "url": "https://martinfowler.com/bliki/ContinuousDelivery.html",
              "type": "blog",
              "description": "The foundational definition of Continuous Delivery by Martin Fowler.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "pipeline-architecture",
            "github-actions-fundamentals"
          ]
        },
        {
          "id": "pipeline-architecture",
          "title": "Pipeline Architecture",
          "summary": "Architect high-performance CI/CD pipelines. Model workflows as Directed Acyclic Graphs (DAGs), configure multi-tier caching, manage transient build artifacts, and parallelize test execution.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "ci-vs-cd-vs-cd"
          ],
          "objectives": [
            {
              "text": "Structure pipeline jobs as Directed Acyclic Graphs (DAGs) using the needs keyword",
              "skill": "Pipeline DAGs"
            },
            {
              "text": "Configure npm and BuildKit caching in GitHub Actions to slash build times",
              "skill": "Pipeline Optimization"
            },
            {
              "text": "Share compiled artifacts and test coverage reports safely between jobs",
              "skill": "Artifact Passing"
            },
            {
              "text": "Execute parallel matrix test runs across Node versions and split test suites",
              "skill": "Test Parallelism"
            }
          ],
          "sections": [
            {
              "title": "Pipeline Anatomy: Linear vs Directed Acyclic Graph (DAG)",
              "level": "intermediate",
              "content": "Early CI engines executed sequential stages: `Build -> Test -> Package -> Deploy`. If linting took 2 minutes and backend testing took 6 minutes, the whole pipeline blocked until each step finished.\n\nModern engines (like GitHub Actions, GitLab CI, and Tekton) model pipelines as **Directed Acyclic Graphs (DAGs)**. Instead of rigid stages, individual jobs declare explicit dependencies using `needs:`:\n\n```\n           ┌──> Lint Client ──┐\n           │                  ├──> Build Client (Vite) ──┐\nCheckout ──┤                  │                          ├──> E2E Tests (Playwright) ──> Dockerize\n           │                  ├──> Unit Tests (Jest) ────┤\n           └──> Lint Server ──┘                          │\n                              └──> Integration Tests ────┘\n```\n\nBenefits of DAG-based pipelines:\n- **Maximum Concurrency**: If `Lint Client` finishes, `Build Client` starts immediately without waiting for `Integration Tests`.\n- **Early Exit**: If a critical unit test fails, downstream jobs are cancelled immediately, saving runner minutes and cloud compute costs."
            },
            {
              "title": "Dependency Caching Strategies",
              "level": "intermediate",
              "content": "In a MERN stack repository, `npm install` or `npm ci` can easily consume 40% to 60% of total pipeline runtime due to downloading hundreds of megabytes of `node_modules`.\n\nTo optimize:\n1. **`actions/setup-node` Built-in Cache**:\n   ```yaml\n   - uses: actions/setup-node@v4\n     with:\n       node-version: 20\n       cache: 'npm'\n       cache-dependency-path: '**/package-lock.json'\n   ```\n2. **Explicit `actions/cache`**:\n   Caches the global npm cache directory (`~/.npm`) using a hash key:\n   `key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}`\n   with fallback restore keys:\n   `restore-keys: | ${{ runner.os }}-npm-`\n\n**Critical Rule**: Never cache `node_modules` directly! `node_modules` contains platform-dependent binaries (like `bcrypt`, `sharp`, or `esbuild`) compiled for the host OS. Caching `~/.npm` preserves downloaded tarballs while allowing `npm ci` to link and compile binaries safely in seconds."
            },
            {
              "title": "Artifact Passing Between Jobs",
              "level": "intermediate",
              "content": "Because each job in GitHub Actions executes on an isolated, ephemeral virtual machine runner, filesystem state is **not shared** between jobs.\n\nWhen a frontend job compiles React source code into static files (`client/dist`), how does a downstream packaging or deployment job access those files?\n\nUse **Actions Artifacts**:\n- **`actions/upload-artifact@v4`**: Compresses and stores files in GitHub's temporary pipeline storage.\n- **`actions/download-artifact@v4`**: Retrieves and extracts those files onto the downstream job's runner.\n\n```yaml\n# Job 1: Build Frontend\n- name: Build React SPA\n  run: npm run build --prefix client\n\n- name: Upload static bundle\n  uses: actions/upload-artifact@v4\n  with:\n    name: client-dist\n    path: client/dist/\n    retention-days: 1\n\n# Job 2: Packaging\n- name: Download static bundle\n  uses: actions/download-artifact@v4\n  with:\n    name: client-dist\n    path: client/dist/\n```"
            },
            {
              "title": "Parallelism and Matrix Builds",
              "level": "advanced",
              "content": "To ensure compatibility across supported environments or speed up long-running test suites, use **Matrix Builds**.\n\nA matrix automatically multiplies job runs across specified variables:\n```yaml\nstrategy:\n  fail-fast: false  # Don't cancel other runs if one fails\n  matrix:\n    node-version: [18.x, 20.x, 22.x]\n    shard: [1/3, 2/3, 3/3]\n```\n\nThis single job configuration spins up 9 parallel runners! In MERN backend testing, you can shard large integration suites across multiple runners, cutting a 15-minute test run down to 5 minutes."
            }
          ],
          "commands": [
            {
              "command": "npm ci",
              "description": "Install dependencies cleanly from package-lock.json in automated environments",
              "example": "npm ci",
              "output": "added 1184 packages, and audited 1185 packages in 6s",
              "whenToUse": "Always use npm ci instead of npm install in CI pipelines for deterministic, reproducible builds",
              "commonMistakes": [
                "Using npm install in CI, which modifies package-lock.json and causes non-deterministic builds"
              ]
            },
            {
              "command": "gh run watch",
              "description": "Live stream workflow execution status directly in the terminal",
              "example": "gh run watch",
              "whenToUse": "Monitor active pipeline execution and see which DAG jobs finish first"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/mern-dag-pipeline.yml",
              "code": "name: Optimized MERN DAG Pipeline\n\non:\n  push:\n    branches: [main]\n  pull_request:\n\njobs:\n  # ─── Job 1: Lint & Code Style ───────────────────────────────\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm run lint\n\n  # ─── Job 2: Client Build & Unit Tests ────────────────────────\n  client-test-build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - name: Test Client Components\n        run: npm test --prefix client -- --run\n      - name: Compile Production React Bundle\n        run: npm run build --prefix client\n      - name: Persist Client Dist\n        uses: actions/upload-artifact@v4\n        with:\n          name: client-build\n          path: client/dist/\n          retention-days: 1\n\n  # ─── Job 3: Server API Tests ─────────────────────────────────\n  server-test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - name: Test Express Backend\n        run: npm test --prefix server -- --ci\n\n  # ─── Job 4: Packaging (Waits for client and server jobs) ────\n  package-and-verify:\n    needs: [lint, client-test-build, server-test]\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Fetch Built Client Assets\n        uses: actions/download-artifact@v4\n        with:\n          name: client-build\n          path: client/dist/\n      - name: Verify Bundle Integrity\n        run: test -f client/dist/index.html && echo \"Client build verified\"\n",
              "explanation": "This DAG pipeline runs linting, client building, and server testing in parallel. The packaging job only executes once all three parallel upstream jobs succeed."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Directed Acyclic Graph Pipeline Execution",
              "description": "Showing concurrent parallel branches converging into packaging",
              "content": "graph TD\n    Trigger([Push / PR]) --> Lint[Job: Lint All Code]\n    Trigger --> Client[Job: Client Test & Build]\n    Trigger --> Server[Job: Server API Test]\n    Client --> Upload[Artifact: client-dist]\n    Lint --> Package{Job: Package & Verify}\n    Upload --> Package\n    Server --> Package\n    Package --> Complete([Pipeline Success])"
            }
          ],
          "quiz": [
            {
              "id": "q-pipe-arch-1",
              "type": "multiple-choice",
              "question": "Why should CI pipelines cache ~/.npm instead of caching node_modules directly?",
              "options": [
                "node_modules is too small to be worth caching.",
                "node_modules can contain compiled native binaries tied to specific OS architectures, causing corrupt builds if restored onto different runner environments.",
                "GitHub Actions prohibits storing folders named node_modules.",
                "npm automatically deletes node_modules on every step."
              ],
              "correctAnswer": "node_modules can contain compiled native binaries tied to specific OS architectures, causing corrupt builds if restored onto different runner environments.",
              "explanation": "Native packages (like bcrypt, esbuild, node-gyp) compile binaries during installation. Caching ~/.npm preserves downloaded package tarballs while allowing npm ci to re-link and compile cleanly in seconds.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Downstream job fails with 'Artifact client-build not found' even though upstream job uploaded it.",
              "cause": "Upstream job failed or was skipped, or artifact name string in download-artifact does not match upload-artifact exactly.",
              "diagnosis": [
                "Check if upstream job status was 'Success'. If it failed, dependent jobs configured with `if: always()` may run but fail on download.",
                "Verify exact string spelling of the `name:` key in both upload and download steps."
              ],
              "solution": "Ensure artifact names match character-for-character and verify upstream job completed successfully.",
              "prevention": "Define artifact name as a workflow-level environment variable (e.g. `env: CLIENT_DIST_NAME: client-dist-v1`)."
            }
          ],
          "keyTakeaways": [
            "DAG pipelines run independent jobs concurrently, minimizing total wall-clock runtime.",
            "Use `npm ci` for deterministic, clean package installations in CI.",
            "Artifacts bridge the filesystem gap between isolated job runners.",
            "Matrix strategies allow parallel testing across multiple runtimes and shards."
          ],
          "bestPractices": [
            "Set `retention-days: 1` on temporary build artifacts to conserve storage quota.",
            "Use `fail-fast: false` on matrix jobs when you want to see all failing versions at once."
          ],
          "securityConsiderations": [
            "Never upload sensitive files (such as `.env`, private keys, or credentials) as artifacts; uploaded artifacts can be downloaded by anyone with repo read permissions."
          ],
          "commonMistakes": [
            "Running jobs sequentially when they have no mutual dependencies.",
            "Forgetting `npm ci` cache configuration, forcing 5-minute npm downloads on every commit."
          ],
          "interviewQuestions": [
            "Q: How do you optimize a GitHub Actions pipeline that takes 25 minutes to run?\\nA: 1) Convert linear jobs into a DAG using `needs:` to run lint, frontend, and backend tests in parallel; 2) Implement npm and Docker layer caching (`type=gha`); 3) Shard test suites across matrix runners; 4) Use path filters to skip tests for unaffected packages."
          ],
          "references": [
            {
              "title": "GitHub Actions: Workflow Syntax - needs",
              "url": "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds",
              "type": "documentation",
              "description": "Official documentation on configuring job dependencies in GitHub Actions.",
              "difficulty": "intermediate",
              "priority": "recommended"
            }
          ],
          "connectsTo": [
            "testing-in-pipelines",
            "github-actions-fundamentals"
          ]
        },
        {
          "id": "testing-in-pipelines",
          "title": "Testing in Pipelines",
          "summary": "Implement the testing pyramid in CI: fast unit tests, integration tests using ephemeral MongoDB service containers, and headless Playwright end-to-end tests.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "pipeline-architecture"
          ],
          "objectives": [
            {
              "text": "Structure a testing pyramid tailored for a full-stack MERN web application",
              "skill": "Test Pyramid"
            },
            {
              "text": "Provision ephemeral MongoDB service containers inside GitHub Actions runners",
              "skill": "Service Containers"
            },
            {
              "text": "Write Express API integration tests with Supertest against live database containers",
              "skill": "API Testing"
            },
            {
              "text": "Execute headless browser E2E tests and capture failure artifacts (traces and screenshots)",
              "skill": "E2E CI Testing"
            }
          ],
          "sections": [
            {
              "title": "The CI Testing Pyramid for MERN",
              "level": "intermediate",
              "content": "A robust automated pipeline cannot rely on a single test type. If you only run unit tests, database queries and network calls remain unverified. If you only run browser E2E tests, pipeline execution becomes painfully slow, expensive, and flaky.\n\nThe **Test Pyramid** establishes the optimal balance:\n\n```\n          /\\\n         /  \\      E2E Tests (Playwright / Cypress)\n        /    \\     5% - Slow (mins), High Cost, Highest Confidence\n       /------\\\n      /        \\    Integration Tests (Supertest + MongoDB Container)\n     /          \\   25% - Medium (secs), Database & API Contracts\n    /------------\\\n   /              \\  Unit Tests (Vitest / Jest / React Testing Lib)\n  /________________\\ 70% - Sub-second, Mocked, Pure Functions & UI\n```\n\n- **Unit Tests**: Test utility functions (e.g., token generation, date formatting) and React UI components in memory without external dependencies.\n- **Integration Tests**: Test Express controllers and Mongoose models against a real, running MongoDB database instance.\n- **E2E Tests**: Launch the compiled React app and Express backend, simulating real user login, shopping cart checkout, and navigation in headless Chromium."
            },
            {
              "title": "Ephemeral MongoDB via GitHub Actions Service Containers",
              "level": "intermediate",
              "content": "How do you run integration tests in CI without connecting to a fragile external MongoDB Atlas cluster?\n\nGitHub Actions provides **Service Containers**—Docker containers running on the same network interface as the job runner:\n\n```yaml\nservices:\n  mongodb:\n    image: mongo:7.0\n    ports:\n      - 27017:27017\n    options: >-\n      --health-cmd \"mongosh --eval 'db.runCommand({ ping: 1 })'\"\n      --health-interval 10s\n      --health-timeout 5s\n      --health-retries 5\n```\n\nWhen this job runs:\n1. The runner launches `mongo:7.0`.\n2. The health check verifies the database is accepting connections.\n3. Your Express tests connect directly to `mongodb://localhost:27017/testdb`.\n4. When the job finishes, the container and database are destroyed. No test data cleanup required!"
            },
            {
              "title": "Headless E2E with Playwright in CI",
              "level": "advanced",
              "content": "End-to-end tests verify the full loop: browser DOM -> React state -> HTTP fetch -> Express middleware -> MongoDB save.\n\nRunning Playwright in CI requires:\n1. Installing browser binaries (`npx playwright install --with-deps chromium`).\n2. Starting both the Express API server and Vite frontend preview server before running tests (`webServer:` in `playwright.config.ts`).\n3. Running in headless mode.\n4. Uploading trace logs, videos, and screenshots when tests fail for instant debugging.\n\n```yaml\n- name: Run Playwright tests\n  run: npx playwright test\n  env:\n    CI: true\n\n- name: Upload Test Report & Traces on Failure\n  uses: actions/upload-artifact@v4\n  if: failure()\n  with:\n    name: playwright-report\n    path: playwright-report/\n    retention-days: 7\n```"
            }
          ],
          "commands": [
            {
              "command": "npx jest --testPathPattern=tests/integration",
              "description": "Execute integration tests targeting Express API routes",
              "example": "npx jest --testPathPattern=tests/integration --runInBand",
              "flags": [
                {
                  "flag": "--runInBand",
                  "description": "Run tests serially to avoid database concurrency conflicts"
                }
              ],
              "whenToUse": "Run in CI against the MongoDB service container"
            },
            {
              "command": "npx playwright test --reporter=html",
              "description": "Execute headless E2E tests and generate an HTML report with traces",
              "example": "npx playwright test",
              "whenToUse": "Execute full-stack browser verification in CI"
            }
          ],
          "codeExamples": [
            {
              "language": "typescript",
              "filename": "server/tests/integration/auth.test.ts",
              "code": "import request from 'supertest';\nimport mongoose from 'mongoose';\nimport app from '../../src/app';\n\nbeforeAll(async () => {\n  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test-db';\n  await mongoose.connect(mongoUri);\n});\n\nafterAll(async () => {\n  await mongoose.connection.dropDatabase();\n  await mongoose.connection.close();\n});\n\ndescribe('POST /api/v1/auth/register', () => {\n  it('should register a new user and return a JWT', async () => {\n    const res = await request(app)\n      .post('/api/v1/auth/register')\n      .send({\n        email: 'developer@example.com',\n        password: 'SecurePassword123!',\n      });\n\n    expect(res.status).toBe(201);\n    expect(res.body).toHaveProperty('token');\n    expect(res.body.user.email).toBe('developer@example.com');\n  });\n});\n",
              "explanation": "This Supertest integration test connects to the local MongoDB service container, performs a real HTTP POST request against Express routes, and verifies both HTTP status code and JSON payload."
            },
            {
              "language": "yaml",
              "filename": ".github/workflows/test-pipeline.yml",
              "code": "name: Comprehensive Test Pipeline\n\non: [push, pull_request]\n\njobs:\n  integration-tests:\n    runs-on: ubuntu-latest\n    services:\n      mongodb:\n        image: mongo:7.0\n        ports:\n          - 27017:27017\n        options: >-\n          --health-cmd \"mongosh --eval 'db.runCommand({ ping: 1 })'\"\n          --health-interval 10s\n          --health-timeout 5s\n          --health-retries 5\n\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: 'npm'\n\n      - run: npm ci\n\n      - name: Run Integration Tests with Live Mongo\n        run: npm run test:integration\n        env:\n          MONGO_URI: mongodb://localhost:27017/ci-test-db\n          JWT_SECRET: super-secret-ci-key\n",
              "explanation": "Configures a MongoDB 7.0 service container and injects the MONGO_URI into the runner so Express integration tests connect seamlessly to an ephemeral instance."
            }
          ],
          "diagrams": [
            {
              "type": "architecture",
              "title": "GitHub Actions Service Container Network",
              "description": "How the CI runner interacts with the ephemeral MongoDB container",
              "content": "graph LR\n    subgraph GitHub Actions Runner VM\n        NodeProcess[Node.js Test Process / Supertest]\n        subgraph Docker Engine\n            MongoContainer[mongo:7.0 Container]\n        end\n        NodeProcess -- localhost:27017 --> MongoContainer\n    end"
            }
          ],
          "quiz": [
            {
              "id": "q-test-pipe-1",
              "type": "multiple-choice",
              "question": "What is the primary advantage of using a GitHub Actions Service Container for MongoDB instead of a shared remote MongoDB Atlas cluster for CI?",
              "options": [
                "Service containers are slower but cost more money.",
                "Service containers provide complete test isolation, zero cross-pipeline data contamination, and need no credentials or internet access.",
                "Service containers cannot be monitored.",
                "Remote Atlas clusters cannot run on Linux."
              ],
              "correctAnswer": "Service containers provide complete test isolation, zero cross-pipeline data contamination, and need no credentials or internet access.",
              "explanation": "Service containers boot fresh per job run, eliminating race conditions between concurrent CI branches writing to the same remote database.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Integration tests fail immediately with 'MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017'.",
              "cause": "Tests executed before the MongoDB service container finished initializing its listening socket.",
              "diagnosis": [
                "Inspect whether a health check option was defined in the workflow `services.mongodb` block.",
                "Verify port mapping `ports: ['27017:27017']` is present."
              ],
              "solution": "Add an explicit `--health-cmd` using `mongosh --eval 'db.runCommand({ ping: 1 })'` so GitHub Actions pauses test execution until Mongo is ready.",
              "prevention": "Always specify health check parameters on database service containers in CI workflows."
            }
          ],
          "keyTakeaways": [
            "The test pyramid balances rapid feedback from unit tests with high confidence from integration tests.",
            "GitHub Actions service containers provide ephemeral, disposable databases for zero-cost integration testing.",
            "Use `--runInBand` when running integration tests against a shared test database to prevent race conditions.",
            "Always upload Playwright failure traces (`if: failure()`) to diagnose flaky browser tests."
          ],
          "bestPractices": [
            "Set timeouts on tests to prevent a hanging database connection from exhausting your CI minutes quota.",
            "Seed minimal fixture data rather than copying full production database dumps into CI."
          ],
          "securityConsiderations": [
            "Never connect CI test runs to production databases, even in read-only mode."
          ],
          "commonMistakes": [
            "Connecting multiple concurrent CI runs to the same shared test database, causing intermittent duplicate key errors.",
            "Failing to close Mongoose connections in `afterAll`, causing Jest to hang indefinitely."
          ],
          "interviewQuestions": [
            "Q: How do you handle database testing in CI pipelines without flakiness?\\nA: Spin up an ephemeral database container using GitHub Actions service containers, execute tests against localhost with unique database names or transactional rollbacks, and use health checks to ensure the database is fully initialized before tests start."
          ],
          "references": [
            {
              "title": "GitHub Actions: Creating PostgreSQL/MongoDB service containers",
              "url": "https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers",
              "type": "documentation",
              "description": "Official guide on using containerized services in GitHub Actions.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "artifact-management",
            "building-docker-images-in-ci"
          ]
        },
        {
          "id": "artifact-management",
          "title": "Artifact Management",
          "summary": "Master the cardinal rule of DevOps: build once, deploy everywhere. Package production MERN containers, implement semantic and commit-SHA tagging, and pin cryptographic image digests.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "pipeline-architecture"
          ],
          "objectives": [
            {
              "text": "Apply the 'Build once, deploy everywhere' immutability principle",
              "skill": "Artifact Immutability"
            },
            {
              "text": "Create multi-stage Dockerfiles for Express APIs and React Nginx frontends",
              "skill": "Multi-stage Docker"
            },
            {
              "text": "Implement deterministic tagging using git commit SHAs and Semantic Versioning",
              "skill": "Image Tagging"
            },
            {
              "text": "Pin container images by cryptographic SHA-256 digests for zero-trust security",
              "skill": "Digest Pinning"
            }
          ],
          "sections": [
            {
              "title": "The Golden Rule: Build Once, Deploy Everywhere",
              "level": "intermediate",
              "content": "The single most dangerous anti-pattern in CI/CD is rebuilding container images or binaries as code moves across environments:\n\n```\n[ Git Commit ] ──> Build Dev Image ──> Deploy Dev\n               ──> Build Staging Image ──> Deploy Staging (Dangerous! May pull different npm packages!)\n               ──> Build Prod Image ──> Deploy Prod (Catastrophic! Different artifact from what was tested!)\n```\n\nWhy is rebuilding an anti-pattern?\n- Even if your `Dockerfile` is identical, running `npm install` 3 days later might pull a sub-dependency with a new patch version, introducing an unverified bug.\n- Build environments can change (updated base alpine image, different build timestamps).\n\n**The Immutable Artifact Principle**:\nYou build the container image **once** during CI. That exact binary container image is tested, deployed to Staging, validated, and promoted to Production without modifying a single byte. Environment-specific configuration is injected via Kubernetes ConfigMaps and Secrets at runtime."
            },
            {
              "title": "Container Registries and GHCR",
              "level": "intermediate",
              "content": "A **Container Registry** stores, versions, and serves container images. Modern registries include:\n- **GitHub Container Registry (GHCR)** (`ghcr.io`): Integrated directly into GitHub repositories and permissions.\n- **Docker Hub** (`docker.io`): Public and private image hosting.\n- **Cloud Registries**: AWS ECR, Google Artifact Registry, Azure ACR.\n\nAuthenticating with GHCR in GitHub Actions requires no external credentials—use the built-in `${{ secrets.GITHUB_TOKEN }}`:\n\n```yaml\n- name: Log in to GHCR\n  uses: docker/login-action@v3\n  with:\n    registry: ghcr.io\n    username: ${{ github.actor }}\n    password: ${{ secrets.GITHUB_TOKEN }}\n```"
            },
            {
              "title": "Tagging Strategies: Commit SHA vs SemVer vs :latest",
              "level": "intermediate",
              "content": "Container tags point to image manifests. Selecting the right tagging strategy is essential for auditability and rollback capability:\n\n1. **Commit SHA Tagging (`ghcr.io/org/mern-api:sha-7a1b2c3`)**:\n   - **Recommended for CI/CD**.\n   - Directly links running container pods to the exact Git commit that produced them.\n   - Provides deterministic tracebacks.\n\n2. **Semantic Versioning (`v1.4.2`)**:\n   - Recommended for stable releases, public APIs, and production milestones.\n   - Follows `MAJOR.MINOR.PATCH`.\n\n3. **The `:latest` Anti-Pattern**:\n   - In production Kubernetes, using `:latest` is dangerous:\n     - Kubernetes caches images by default (`imagePullPolicy: IfNotPresent`), so pods on different nodes may run completely different code under the same `:latest` tag!\n     - Rollbacks become impossible because the history of previous `:latest` images is lost."
            },
            {
              "title": "Cryptographic Pinning: SHA-256 Digests",
              "level": "advanced",
              "content": "Tags are mutable pointers: someone with write permissions can push a new image over an existing `v1.0.0` tag.\n\nFor absolute zero-trust environments, pin images by their **immutable cryptographic digest**:\n```yaml\nimage: ghcr.io/my-org/mern-api@sha256:4b227e7d6cf4c431bda4f814b7e8c3395b772b15db28392ef89a19451921f06f\n```\n\nEven if the registry tag is overwritten, deleted, or compromised, Kubernetes will only execute a container matching the exact SHA-256 cryptographic hash."
            }
          ],
          "commands": [
            {
              "command": "docker images --digests",
              "description": "List local container images including their immutable SHA-256 digests",
              "example": "docker images --digests ghcr.io/my-org/mern-api",
              "output": "REPOSITORY                 TAG      DIGEST                                                                    IMAGE ID\\nghcr.io/my-org/mern-api   v1.2.0   sha256:4b227e7d6cf4c431bda4f814b7e8c3395b772b15db28392ef89a19451921f06f   d28198f12a",
              "whenToUse": "Inspect image digest before pinning in production Kubernetes manifests"
            },
            {
              "command": "crane digest ghcr.io/my-org/mern-api:sha-latest",
              "description": "Fetch the remote image digest without pulling the entire image layers to disk",
              "example": "crane digest ghcr.io/my-org/mern-api:v1.0.0",
              "output": "sha256:4b227e7d6cf4c431bda4f814b7e8c3395b772b15db28392ef89a19451921f06f",
              "whenToUse": "Retrieve image digests in automated GitOps handoff scripts"
            }
          ],
          "codeExamples": [
            {
              "language": "dockerfile",
              "filename": "server/Dockerfile",
              "code": "# ─── Stage 1: Build & Dependencies ──────────────────────────\nFROM node:20-alpine AS builder\nWORKDIR /app\n\n# Copy dependency manifests first to leverage layer cache\nCOPY package*.json ./\nRUN npm ci\n\n# Copy source code and compile TypeScript\nCOPY . .\nRUN npm run build\nRUN npm prune --production\n\n# ─── Stage 2: Minimal Production Runtime ────────────────────\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\n\n# Run as non-root user for security\nUSER node\n\n# Copy only production dependencies and compiled JS from builder\nCOPY --chown=node:node --from=builder /app/node_modules ./node_modules\nCOPY --chown=node:node --from=builder /app/dist ./dist\nCOPY --chown=node:node --from=builder /app/package.json ./package.json\n\nEXPOSE 5000\nCMD [\"node\", \"dist/server.js\"]\n",
              "explanation": "Production multi-stage Dockerfile for Node.js Express backend. Dev dependencies, TypeScript compilers, and source files are discarded; only compiled JS and production node_modules survive into the final image, running as unprivileged user 'node'."
            },
            {
              "language": "dockerfile",
              "filename": "client/Dockerfile",
              "code": "# ─── Stage 1: Compile React SPA ─────────────────────────────\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# ─── Stage 2: High-Performance Nginx Web Server ────────────\nFROM nginx:1.25-alpine AS runner\n# Copy custom Nginx configuration supporting SPA client routing\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\n# Copy static bundle from builder\nCOPY --from=builder /app/dist /usr/share/nginx/html\n\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]\n",
              "explanation": "Multi-stage Dockerfile for React Vite SPA. The output is a tiny (<25MB) Nginx container serving static HTML, CSS, and JS with zero Node.js runtime overhead."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Immutable Container Artifact Lifecycle",
              "description": "Build once in CI and promote across environments",
              "content": "graph LR\n    Code[Git Commit SHA: 7a1b2c3] --> Build[Docker Build in CI]\n    Build --> Tag[Tag: sha-7a1b2c3 + v1.2.0]\n    Tag --> Push[Push to Registry GHCR]\n    Push --> Staging[Deploy to Staging]\n    Staging --> Verify{Tests Pass?}\n    Verify -- Yes --> Prod[Deploy EXACT same image to Production]\n    Verify -- No --> Abort[Discard Release]"
            }
          ],
          "quiz": [
            {
              "id": "q-art-mgmt-1",
              "type": "multiple-choice",
              "question": "Why should you never deploy container images tagged with ':latest' to production Kubernetes clusters?",
              "options": [
                ":latest images are automatically deleted by registries after 24 hours.",
                ":latest is a mutable pointer; nodes may run different versions due to image caching, and rollbacks to previous states become impossible.",
                ":latest tags require root privileges to run.",
                "Kubernetes rejects manifests containing the word latest."
              ],
              "correctAnswer": ":latest is a mutable pointer; nodes may run different versions due to image caching, and rollbacks to previous states become impossible.",
              "explanation": "Because :latest is overwritten on every build, Kubernetes cannot detect when code changes under the same tag, making releases non-deterministic and breaking rollbacks.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Kubernetes fails to pull image from GHCR with 'ErrImagePull: rpc error: code = Unknown desc = failed to pull and unpack image: failed to resolve reference: 403 Forbidden'.",
              "cause": "The Kubernetes cluster lacks an imagePullSecret containing valid GitHub credentials to pull from a private GHCR repository.",
              "diagnosis": [
                "Run `kubectl describe pod <pod-name>` and inspect the Events section for 403 Forbidden.",
                "Check if repository package visibility in GitHub is private."
              ],
              "solution": "Create a Kubernetes secret of type `docker-registry` containing a GitHub Personal Access Token (PAT) with `read:packages` scope, and reference it in the Deployment spec under `imagePullSecrets`.",
              "prevention": "Ensure all private registry namespaces have corresponding imagePullSecrets configured in base Kubernetes manifests."
            }
          ],
          "keyTakeaways": [
            "Never rebuild images between environments; promote the exact same binary artifact.",
            "Tag images with the git commit SHA (`sha-${{ github.sha }}`) for deterministic tracebacks.",
            "Multi-stage Docker builds dramatically reduce attack surface and container size.",
            "Pinning cryptographic digests (`@sha256:...`) ensures zero-trust artifact immutability."
          ],
          "bestPractices": [
            "Always run application containers as non-root users (`USER node`).",
            "Configure image retention policies in your container registry to automatically purge untagged PR build images after 30 days."
          ],
          "securityConsiderations": [
            "Do not bundle production secrets, `.env` files, or private SSH keys into Docker layers; they can be extracted with `docker history`."
          ],
          "commonMistakes": [
            "Using `latest` as the deployment tag in staging or production manifests.",
            "Including build tools (gcc, python, devDependencies) in the final production runtime container."
          ],
          "interviewQuestions": [
            "Q: What does 'Build once, deploy everywhere' mean and why is it important?\\nA: It means compiling code and creating container images exactly once in CI. That identical immutable artifact is promoted through Dev, Staging, and Production. Rebuilding between environments risks pulling different upstream dependency versions, creating bugs that were never tested in staging."
          ],
          "references": [
            {
              "title": "Open Containers Initiative (OCI) Image Specification",
              "url": "https://github.com/opencontainers/image-spec",
              "type": "specification",
              "description": "The open standard specification for container images and manifests.",
              "difficulty": "advanced",
              "priority": "recommended"
            }
          ],
          "connectsTo": [
            "building-docker-images-in-ci",
            "the-gitops-handoff"
          ]
        }
      ]
    },
    {
      "id": "github-actions",
      "title": "GitHub Actions",
      "description": "Master GitHub Actions for the MERN stack: construct event-driven workflows, build multi-platform Docker images with Buildx caching, automate Trivy vulnerability scans, and implement secure GitOps repo handoffs.",
      "icon": "⚡",
      "difficulty": "intermediate",
      "estimatedHours": 7,
      "lessons": [
        {
          "id": "github-actions-fundamentals",
          "title": "GitHub Actions Fundamentals",
          "summary": "Master the core building blocks of GitHub Actions: workflow configuration, event triggers, runner architectures, step execution, contexts, and environment secret protection.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "pipeline-architecture"
          ],
          "objectives": [
            {
              "text": "Write production-ready workflow files under .github/workflows/ conforming to GitHub syntax",
              "skill": "Workflow Syntax"
            },
            {
              "text": "Configure branch, tag, and path-based event filters to trigger targeted builds",
              "skill": "Event Triggers"
            },
            {
              "text": "Manage sensitive environment secrets and enforce production approval rules",
              "skill": "Secrets & Environments"
            },
            {
              "text": "Pass dynamic parameters between steps and jobs using runner context expressions",
              "skill": "Contexts & Outputs"
            }
          ],
          "sections": [
            {
              "title": "The Hierarchy: Workflows, Events, Jobs, and Steps",
              "level": "intermediate",
              "content": "GitHub Actions automates your software development workflows directly from your GitHub repository. The execution hierarchy consists of four core concepts:\n\n1. **Workflow**: An automated procedure declared in a YAML file inside `.github/workflows/`.\n2. **Event (Trigger)**: A specific activity that triggers the workflow (e.g. `push`, `pull_request`, `workflow_dispatch`, or a cron `schedule`).\n3. **Job**: A set of steps that execute on the same runner VM. By default, jobs run in parallel unless linked with `needs:`.\n4. **Step**: An individual task within a job. A step can run shell commands (`run:`) or execute a reusable action (`uses:`).\n\n```\nWorkflow (.github/workflows/ci.yml)\n  ├── Event Trigger (on: push to main)\n  ├── Job 1: test-server (runs-on: ubuntu-latest)\n  │     ├── Step 1: actions/checkout@v4\n  │     ├── Step 2: actions/setup-node@v4\n  │     └── Step 3: npm test\n  └── Job 2: test-client (runs-on: ubuntu-latest)\n        ├── Step 1: actions/checkout@v4\n        └── Step 2: npm run build\n```"
            },
            {
              "title": "Triggers and Path Filtering in Monorepos",
              "level": "intermediate",
              "content": "In a MERN stack repository containing both frontend (`client/`) and backend (`server/`), you do not want to re-run 10 minutes of server integration tests when someone only edits a CSS file in `client/`.\n\nUse **path filtering**:\n```yaml\non:\n  push:\n    branches: [main]\n    paths:\n      - 'server/**'\n      - 'package.json'\n      - '.github/workflows/server-ci.yml'\n```\n\nCommon triggers:\n- `push`: Triggered when commits are pushed directly or merged into branches.\n- `pull_request`: Triggered on PR opened, synchronize (new push to PR branch), or reopened.\n- `workflow_dispatch`: Enables manual execution from the GitHub Web UI or CLI with custom input parameters.\n- `schedule`: Cron-based triggers for nightly builds or scheduled security scans."
            },
            {
              "title": "Runners: GitHub-Hosted vs Self-Hosted",
              "level": "intermediate",
              "content": "Every job requires a runner operating system:\n- **GitHub-Hosted Runners** (`runs-on: ubuntu-latest`, `windows-latest`, `macos-latest`):\n  - Fresh, ephemeral virtual machine for every job run.\n  - Pre-installed with Docker, Git, Node.js, Python, AWS CLI, and kubectl.\n  - Automatically destroyed upon job completion—zero security contamination between runs.\n- **Self-Hosted Runners**:\n  - Machines you manage in your own VPC, bare metal, or Kubernetes cluster.\n  - Best for accessing private corporate networks, hardware acceleration (GPUs), or saving on high-volume runner minutes."
            },
            {
              "title": "Secrets, Environments, and Protection Rules",
              "level": "advanced",
              "content": "Security is paramount. Never commit database credentials, JWT secrets, or cloud API tokens into Git repositories.\n\nGitHub provides two tiers of secret storage:\n1. **Repository Secrets (`${{ secrets.MONGO_URI }}`)**: Accessible by any workflow in the repository on any branch.\n2. **Environment Secrets (`environment: production`)**:\n   - Tied to a designated environment.\n   - Enforce **protection rules**: required reviewers must manually click \"Approve and deploy\" before the job runs.\n   - Restrict branches: only the `main` branch can access production secrets!"
            }
          ],
          "commands": [
            {
              "command": "gh secret set MONGO_URI --repo my-org/mern-app",
              "description": "Securely set an encrypted repository secret from the terminal",
              "example": "gh secret set MONGO_URI --body 'mongodb+srv://user:pass@cluster.mongodb.net/prod'",
              "whenToUse": "Provision secrets without pasting credentials into web interfaces"
            },
            {
              "command": "gh workflow run ci.yml -f environment=staging",
              "description": "Manually trigger a workflow_dispatch event with input parameters",
              "example": "gh workflow run ci.yml -f environment=staging",
              "whenToUse": "Trigger ad-hoc builds, smoke tests, or out-of-schedule deployments"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/ci.yml",
              "code": "name: Production MERN CI Pipeline\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n  workflow_dispatch:\n    inputs:\n      run_e2e:\n        description: 'Force execution of end-to-end browser tests'\n        type: boolean\n        default: false\n\npermissions:\n  contents: read\n  pull-requests: write\n\njobs:\n  # ─── Job: Validate Server ──────────────────────────────────\n  test-server:\n    runs-on: ubuntu-latest\n    defaults:\n      run:\n        working-directory: server\n    steps:\n      - name: Checkout Code\n        uses: actions/checkout@v4\n\n      - name: Setup Node.js 20\n        uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: 'npm'\n          cache-dependency-path: server/package-lock.json\n\n      - name: Install Dependencies\n        run: npm ci\n\n      - name: Run ESLint\n        run: npm run lint\n\n      - name: Run Server Unit Tests\n        run: npm test -- --coverage\n        env:\n          JWT_SECRET: test-jwt-secret-for-ci\n\n      - name: Set Output Version\n        id: server-meta\n        run: echo \"version=$(node -p \"require('./package.json').version\")\" >> $GITHUB_OUTPUT\n\n  # ─── Job: Validate Client ──────────────────────────────────\n  test-client:\n    runs-on: ubuntu-latest\n    defaults:\n      run:\n        working-directory: client\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: 'npm'\n          cache-dependency-path: client/package-lock.json\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run test:unit\n      - name: Build Vite SPA\n        run: npm run build\n",
              "explanation": "Production GitHub Actions configuration for a MERN stack monorepo with working-directory defaults, path-specific package caching, and step output variables."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "GitHub Actions Workflow Execution Flow",
              "description": "Trigger events down to runners and steps",
              "content": "graph TD\n    Trigger([Push to main / PR]) --> RunnerVM[GitHub-Hosted Runner: ubuntu-latest]\n    subgraph Job Execution\n        RunnerVM --> Step1[Step 1: actions/checkout@v4]\n        Step1 --> Step2[Step 2: actions/setup-node@v4]\n        Step2 --> Step3[Step 3: npm ci]\n        Step3 --> Step4[Step 4: npm test]\n        Step4 --> Step5[Step 5: Output Variables]\n    end\n    Step5 --> Status([Report Commit Status: Passed / Failed])"
            }
          ],
          "quiz": [
            {
              "id": "q-gha-fund-1",
              "type": "multiple-choice",
              "question": "How do you pass dynamic variable values from one step to subsequent steps in the same GitHub Actions job?",
              "options": [
                "Set a global bash variable with export VAR=value",
                "Write to the file pointed to by the $GITHUB_OUTPUT environment variable (e.g. echo 'key=value' >> $GITHUB_OUTPUT)",
                "Create a file named .env in the root directory",
                "Commit the variable to a temporary git branch"
              ],
              "correctAnswer": "Write to the file pointed to by the $GITHUB_OUTPUT environment variable (e.g. echo 'key=value' >> $GITHUB_OUTPUT)",
              "explanation": "GitHub Actions reads outputs by appending key=value pairs to the runner environment file $GITHUB_OUTPUT, which steps can reference via steps.<step_id>.outputs.<key>.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Workflow fails with 'Error: Resource not accessible by integration' when attempting to comment on a pull request or write a package.",
              "cause": "GitHub repository default permissions are set to read-only for security reasons.",
              "diagnosis": [
                "Check repository Settings -> Actions -> General -> Workflow permissions.",
                "Inspect the workflow YAML for an explicit `permissions:` block."
              ],
              "solution": "Add granular permissions at the top of your workflow YAML: `permissions: contents: read, pull-requests: write, packages: write`.",
              "prevention": "Always explicitly declare the minimum required permissions in each workflow file rather than relying on repository-wide defaults."
            }
          ],
          "keyTakeaways": [
            "Workflows contain one or more jobs running on fresh VM runners.",
            "Use path filtering (`paths:`) in monorepos to prevent redundant CI executions.",
            "Ephemeral GitHub-hosted runners eliminate security contamination between jobs.",
            "Protect production releases using GitHub Environments with required reviewers."
          ],
          "bestPractices": [
            "Pin all third-party GitHub Actions to specific full-length commit SHAs or verified major versions (e.g. `actions/checkout@v4`).",
            "Always set `set -eo pipefail` (default in GitHub Actions bash) so piping failures cause step errors."
          ],
          "securityConsiderations": [
            "Never print secrets in step `run:` scripts; use GitHub secret masking."
          ],
          "commonMistakes": [
            "Hardcoding API keys or database URLs directly into the YAML file instead of using secrets.",
            "Forgetting to set `working-directory` when working with separate `client/` and `server/` subfolders."
          ],
          "interviewQuestions": [
            "Q: What are GitHub Environments and why are they superior to plain repository secrets for production deployments?\\nA: GitHub Environments allow you to bind secrets to specific target environments and enforce protection rules, such as requiring manual human review/approval, waiting timers, and branch restrictions (e.g., only allowing deployments from the main branch)."
          ],
          "references": [
            {
              "title": "GitHub Actions Documentation",
              "url": "https://docs.github.com/en/actions",
              "type": "documentation",
              "description": "Comprehensive reference for GitHub Actions syntax, workflows, and events.",
              "difficulty": "beginner",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "building-docker-images-in-ci",
            "image-security-scanning"
          ]
        },
        {
          "id": "building-docker-images-in-ci",
          "title": "Building Docker Images in CI",
          "summary": "Build high-speed, production-grade container images in GitHub Actions using Docker Buildx, BuildKit layer caching (type=gha), multi-platform emulation, and automated metadata tagging.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "artifact-management",
            "github-actions-fundamentals"
          ],
          "objectives": [
            {
              "text": "Configure Docker Buildx and QEMU inside GitHub Actions runners",
              "skill": "Docker Buildx"
            },
            {
              "text": "Implement GitHub Actions cache backend (type=gha) to accelerate container builds",
              "skill": "BuildKit Caching"
            },
            {
              "text": "Compile multi-architecture container images (linux/amd64 and linux/arm64)",
              "skill": "Multi-Platform Builds"
            },
            {
              "text": "Automate Docker tag generation from git refs with docker/metadata-action",
              "skill": "Container Tagging"
            }
          ],
          "sections": [
            {
              "title": "The BuildKit and Buildx Advantage in CI",
              "level": "intermediate",
              "content": "Traditional `docker build` was designed for local development on a single laptop where layers persist on the local daemon. In CI runners, every job starts on a completely blank virtual machine with zero local Docker cache.\n\nWithout caching, every single CI build runs `RUN npm ci` from scratch, wasting 5 to 10 minutes per commit.\n\n**Docker Buildx** (powered by Moby BuildKit) solves this:\n- **Remote Cache Backends**: Export and import layer caches directly to GitHub Actions cache storage (`type=gha`) or an OCI registry (`type=registry`).\n- **Parallel Stage Execution**: Non-dependent multi-stage build targets compile simultaneously.\n- **Cross-Platform Emulation**: Build ARM64 images on standard AMD64 runners using QEMU."
            },
            {
              "title": "Accelerating Builds with GitHub Actions Cache (type=gha)",
              "level": "intermediate",
              "content": "BuildKit's `type=gha` cache exports your intermediate Docker build layers into GitHub Actions cache storage. On subsequent pushes, BuildKit restores those layers before compiling:\n\n```yaml\n- name: Build and push Express API\n  uses: docker/build-push-action@v5\n  with:\n    context: ./server\n    push: true\n    tags: ${{ steps.meta.outputs.tags }}\n    cache-from: type=gha\n    cache-to: type=gha,mode=max\n```\n\n- `cache-from: type=gha`: Checks GitHub Actions cache storage for existing cached layers.\n- `cache-to: type=gha,mode=max`: Caches all intermediate stages (including builder stages like `RUN npm ci`), not just the final runner stage.\n\nThis single configuration turns a 6-minute build into a 25-second cache hit!"
            },
            {
              "title": "Multi-Platform Builds (AMD64 & ARM64)",
              "level": "advanced",
              "content": "Modern production clusters frequently run on ARM64 processors (such as AWS Graviton or GCP Tau T2A) for superior price-performance, while developers frequently develop on Apple Silicon (M1/M2/M3/M4) or x86_64 PCs.\n\nTo create an image that runs anywhere, use **QEMU** emulation:\n```yaml\n- name: Set up QEMU\n  uses: docker/setup-qemu-action@v3\n\n- name: Set up Docker Buildx\n  uses: docker/setup-buildx-action@v3\n\n- name: Build Multi-Arch Image\n  uses: docker/build-push-action@v5\n  with:\n    platforms: linux/amd64,linux/arm64\n    ...\n```\n\nBuildx builds both architectures, creates an OCI multi-arch manifest list, and pushes a single unified tag to GHCR. Kubernetes automatically pulls the architecture matching the host node!"
            },
            {
              "title": "Automating Tags with docker/metadata-action",
              "level": "intermediate",
              "content": "Manually constructing Docker tags with bash string manipulation is error-prone. Use official `docker/metadata-action` to generate standardized tags:\n- Commit SHA: `ghcr.io/org/mern-api:sha-1a2b3c4`\n- Git Tag / SemVer: `ghcr.io/org/mern-api:1.4.0`, `ghcr.io/org/mern-api:1.4`\n- Branch: `ghcr.io/org/mern-api:main`\n- Pull Request: `ghcr.io/org/mern-api:pr-42`"
            }
          ],
          "commands": [
            {
              "command": "docker buildx ls",
              "description": "List all configured Buildx builder instances and supported platforms",
              "example": "docker buildx ls",
              "output": "NAME/NODE       DRIVER/ENDPOINT             STATUS   PLATFORMS\\nbuilder-ci *   docker-container\\n  builder-ci0  unix:///var/run/docker.sock running  linux/amd64, linux/arm64, linux/riscv64",
              "whenToUse": "Verify active Buildx builder capabilities"
            },
            {
              "command": "docker buildx imagetools inspect ghcr.io/my-org/mern-api:v1.0.0",
              "description": "Inspect remote multi-platform manifest list without pulling image layers",
              "example": "docker buildx imagetools inspect ghcr.io/my-org/mern-api:v1.0.0",
              "output": "Name:      ghcr.io/my-org/mern-api:v1.0.0\\nMediaType: application/vnd.oci.image.index.v1+json\\nManifests:\\n  Platform: linux/amd64\\n  Platform: linux/arm64",
              "whenToUse": "Confirm multi-architecture support in registry images"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/docker-publish.yml",
              "code": "name: Publish MERN Docker Images\n\non:\n  push:\n    branches: [main]\n    tags: ['v*.*.*']\n\nenv:\n  REGISTRY: ghcr.io\n  IMAGE_NAME: ${{ github.repository }}-api\n\njobs:\n  build-and-push-api:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n\n    steps:\n      - name: Checkout repository\n        uses: actions/checkout@v4\n\n      - name: Set up QEMU for multi-arch\n        uses: docker/setup-qemu-action@v3\n\n      - name: Set up Docker Buildx\n        uses: docker/setup-buildx-action@v3\n\n      - name: Log in to GitHub Container Registry\n        uses: docker/login-action@v3\n        with:\n          registry: ${{ env.REGISTRY }}\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n\n      - name: Extract Docker metadata\n        id: meta\n        uses: docker/metadata-action@v5\n        with:\n          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}\n          tags: |\n            type=sha,prefix=sha-\n            type=semver,pattern={{version}}\n            type=semver,pattern={{major}}.{{minor}}\n            type=ref,event=branch\n\n      - name: Build and push Docker image\n        uses: docker/build-push-action@v5\n        with:\n          context: ./server\n          file: ./server/Dockerfile\n          platforms: linux/amd64,linux/arm64\n          push: true\n          tags: ${{ steps.meta.outputs.tags }}\n          labels: ${{ steps.meta.outputs.labels }}\n          cache-from: type=gha\n          cache-to: type=gha,mode=max\n",
              "explanation": "Complete GitHub Actions workflow that logs into GHCR, sets up QEMU and Buildx, extracts standardized tags, and pushes multi-architecture cached images."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Buildx Layer Caching Architecture",
              "description": "How BuildKit uses the GHA cache backend to speed up builds",
              "content": "graph LR\n    Runner[GitHub Runner: Buildx Engine]\n    GHACache[(GitHub Actions Cache Storage)]\n    GHCR[(GitHub Container Registry)]\n\n    Runner -- 1. cache-from (Download layers) --> GHACache\n    Runner -- 2. Re-use cached layers for npm ci --> Runner\n    Runner -- 3. Compile only changed source files --> Runner\n    Runner -- 4. cache-to: mode=max --> GHACache\n    Runner -- 5. Push multi-arch manifest --> GHCR"
            }
          ],
          "quiz": [
            {
              "id": "q-bld-dock-1",
              "type": "multiple-choice",
              "question": "What is the purpose of setting 'cache-to: type=gha,mode=max' when using docker/build-push-action?",
              "options": [
                "It limits the cache size to the maximum allowed by GitHub.",
                "It caches all intermediate build layers (including builder stages) in GitHub Actions cache storage, ensuring fast cache hits on subsequent runs.",
                "It automatically compresses images using gzip maximum compression.",
                "It deletes old cache entries immediately."
              ],
              "correctAnswer": "It caches all intermediate build layers (including builder stages) in GitHub Actions cache storage, ensuring fast cache hits on subsequent runs.",
              "explanation": "By default, mode=min only caches the final stage layers. Setting mode=max instructs BuildKit to cache intermediate stages like compilation and dependency installation.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Build step fails with 'ERROR: failed to solve: failed to push: unexpected status 403 Forbidden' during docker/build-push-action.",
              "cause": "The default GitHub GITHUB_TOKEN lacks `packages: write` permission to push images to GHCR.",
              "diagnosis": [
                "Check workflow YAML `permissions:` block.",
                "Verify if the repository package setting allows Actions write access."
              ],
              "solution": "Add `packages: write` under the job's `permissions:` block in the workflow file.",
              "prevention": "Include explicit permissions blocks in all workflows that publish packages or container images."
            }
          ],
          "keyTakeaways": [
            "Docker Buildx with BuildKit enables caching and multi-platform compilation in CI.",
            "The `type=gha` cache backend prevents re-running long `npm ci` steps across commits.",
            "QEMU enables building ARM64 images on standard AMD64 runners without special hardware.",
            "`docker/metadata-action` provides standardized, automated tagging based on git commit SHAs and tags."
          ],
          "bestPractices": [
            "Order Dockerfile commands from least frequently changing (`COPY package*.json`) to most frequently changing (`COPY src/`) to maximize layer cache hits.",
            "Always set `mode=max` when using multi-stage Dockerfiles with BuildKit cache."
          ],
          "securityConsiderations": [
            "Ensure build-time secrets (such as private npm tokens) are passed using BuildKit secrets mounting (`--mount=type=secret`) rather than build args."
          ],
          "commonMistakes": [
            "Using default `docker build` instead of `docker/build-push-action`, losing all cache benefits on ephemeral runners.",
            "Pushing images without commit SHA tags, making it impossible to trace the exact source code running in a container."
          ],
          "interviewQuestions": [
            "Q: How do you build multi-platform Docker images for both AMD64 and ARM64 in GitHub Actions?\\nA: Set up QEMU via `docker/setup-qemu-action` to provide CPU architecture emulation, set up Buildx via `docker/setup-buildx-action`, and specify `platforms: linux/amd64,linux/arm64` in `docker/build-push-action`. BuildKit compiles both variants and outputs an OCI manifest list."
          ],
          "references": [
            {
              "title": "Docker Buildx Documentation",
              "url": "https://docs.docker.com/build/buildx/",
              "type": "documentation",
              "description": "Comprehensive guide on advanced Docker builds and BuildKit.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "image-security-scanning",
            "the-gitops-handoff"
          ]
        },
        {
          "id": "image-security-scanning",
          "title": "Image Security Scanning",
          "summary": "Shift security left: integrate Trivy container vulnerability scanning into GitHub Actions, generate SARIF reports for GitHub Code Scanning, and enforce automated release quality gates.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "building-docker-images-in-ci"
          ],
          "objectives": [
            {
              "text": "Integrate Trivy container scanning into automated GitHub Actions pipelines",
              "skill": "Trivy Scanning"
            },
            {
              "text": "Configure severity thresholds to block builds on CRITICAL and HIGH CVEs",
              "skill": "Security Quality Gates"
            },
            {
              "text": "Publish scan results in SARIF format to the GitHub Security Code Scanning tab",
              "skill": "SARIF Reporting"
            },
            {
              "text": "Remediate container vulnerabilities using minimal and distroless base images",
              "skill": "Container Hardening"
            }
          ],
          "sections": [
            {
              "title": "Shifting Security Left in the Container Pipeline",
              "level": "intermediate",
              "content": "Traditional security reviews occurred once a quarter or right before major releases, discovering hundreds of known vulnerabilities (Common Vulnerabilities and Exposures, or CVEs) when it was too late and expensive to fix them.\n\n**Shifting Left** brings security directly into the developer's daily pull request workflow:\n- Container base OS images (Debian, Alpine) and runtime libraries (`openssl`, `glibc`) are scanned for known exploits.\n- Node.js dependencies (`package-lock.json`) are scanned for supply-chain vulnerabilities (e.g. vulnerable versions of `axios`, `express`, or `jsonwebtoken`).\n- Scans run automatically before the image is pushed or promoted. If a CRITICAL CVE is detected, the pipeline fails immediately."
            },
            {
              "title": "Trivy: Comprehensive Container Scanner",
              "level": "intermediate",
              "content": "**Trivy** (by Aqua Security) is the industry-standard open-source vulnerability and misconfiguration scanner:\n- Scans OS packages (Alpine, Debian, RHEL) and application language packages (npm, pip, go).\n- Extremely fast: downloads an optimized vulnerability database cache in seconds.\n- Detects exposed secrets (API keys, private keys) and Dockerfile misconfigurations (e.g., running as root).\n\nRunning Trivy locally:\n```bash\ntrivy image --severity HIGH,CRITICAL mern-api:v1.0.0\n```"
            },
            {
              "title": "Quality Gates and the --ignore-unfixed Flag",
              "level": "advanced",
              "content": "When configuring automated pipeline failure gates, you must avoid blocking developer deployments on CVEs that have no fix available upstream in the Linux distribution:\n\n```yaml\n- name: Scan MERN Image with Trivy\n  uses: aquasecurity/trivy-action@master\n  with:\n    image-ref: 'ghcr.io/my-org/mern-api:sha-${{ github.sha }}'\n    format: 'table'\n    exit-code: '1'           # Fails the CI job\n    ignore-unfixed: true     # Only block if an upstream fix exists!\n    severity: 'CRITICAL,HIGH'\n```\n\n- `exit-code: '1'`: Fails the job if vulnerabilities meeting the criteria are found.\n- `ignore-unfixed: true`: Prevents builds from being held hostage by zero-day vulnerabilities where distro maintainers haven't published a patched package yet."
            },
            {
              "title": "Exporting to GitHub Security Tab (SARIF)",
              "level": "intermediate",
              "content": "Trivy can output findings in **SARIF (Static Analysis Results Interchange Format)**. GitHub Actions can upload this file to the repository's native **Security -> Code scanning** tab:\n\n```yaml\n- name: Generate SARIF Security Report\n  uses: aquasecurity/trivy-action@master\n  with:\n    image-ref: 'ghcr.io/my-org/mern-api:sha-${{ github.sha }}'\n    format: 'sarif'\n    output: 'trivy-results.sarif'\n\n- name: Upload to GitHub Code Scanning\n  uses: github/codeql-action/upload-sarif@v3\n  with:\n    sarif_file: 'trivy-results.sarif'\n```\n\nThis presents vulnerabilities directly in the GitHub PR review UI, showing the affected line, CVE severity score, and recommended fix."
            },
            {
              "title": "Hardening: The Distroless Advantage",
              "level": "advanced",
              "content": "The most effective way to eliminate container vulnerabilities is to remove unused binaries.\n\nStandard `node:20` images contain full Debian OS distributions with package managers (`apt`), shells (`bash`, `sh`), and curl.\n\n**Google Distroless Images** (`gcr.io/distroless/nodejs20-debian12`):\n- Contain **only** your application and its minimal runtime dependencies.\n- No package manager, no shell, no utilities.\n- An attacker who discovers a remote code execution vulnerability cannot launch a reverse bash shell or download external binaries!\n- Reduces base image vulnerabilities from 100+ down to near zero."
            }
          ],
          "commands": [
            {
              "command": "trivy image --severity HIGH,CRITICAL --ignore-unfixed mern-api:latest",
              "description": "Scan a local or remote container image for High and Critical vulnerabilities",
              "example": "trivy image --severity HIGH,CRITICAL --ignore-unfixed node:20-alpine",
              "output": "Total: 0 (HIGH: 0, CRITICAL: 0)",
              "whenToUse": "Run locally before pushing a new base image version"
            },
            {
              "command": "trivy fs --scanners vuln,secret,config .",
              "description": "Scan the current filesystem for vulnerable npm packages, exposed secrets, and misconfigs",
              "example": "trivy fs --scanners vuln,secret,config server/",
              "whenToUse": "Pre-commit local security audit"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/security-scan.yml",
              "code": "name: Container Security Scanning\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  trivy-security-audit:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      security-events: write  # Required to upload SARIF report\n\n    steps:\n      - name: Checkout Code\n        uses: actions/checkout@v4\n\n      - name: Build Local Image for Scanning\n        run: docker build -t mern-api:scan-target ./server\n\n      - name: Run Trivy Vulnerability Scanner (SARIF)\n        uses: aquasecurity/trivy-action@master\n        with:\n          image-ref: 'mern-api:scan-target'\n          format: 'sarif'\n          output: 'trivy-results.sarif'\n          severity: 'HIGH,CRITICAL'\n          ignore-unfixed: true\n\n      - name: Upload SARIF to GitHub Security Tab\n        uses: github/codeql-action/upload-sarif@v3\n        if: always()\n        with:\n          sarif_file: 'trivy-results.sarif'\n\n      - name: Enforce Blocking Quality Gate\n        uses: aquasecurity/trivy-action@master\n        with:\n          image-ref: 'mern-api:scan-target'\n          format: 'table'\n          exit-code: '1'\n          severity: 'CRITICAL'\n          ignore-unfixed: true\n",
              "explanation": "Two-phase Trivy workflow: first generates a SARIF report uploaded to GitHub Security tab, then executes a blocking quality gate that fails the build on unpatched CRITICAL CVEs."
            },
            {
              "language": "dockerfile",
              "filename": "server/Dockerfile.distroless",
              "code": "# ─── Builder Stage ──────────────────────────────────────────\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nRUN npm prune --production\n\n# ─── Distroless Runtime Stage (No Shell, No Root) ───────────\nFROM gcr.io/distroless/nodejs20-debian12\nWORKDIR /app\nENV NODE_ENV=production\n\n# Copy built application\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/package.json ./package.json\n\nEXPOSE 5000\nCMD [\"dist/server.js\"]\n",
              "explanation": "Hardened Express API container using Google Distroless runtime. Eliminates shell access and reduces CVE count to near zero."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Shift-Left Vulnerability Scanning Pipeline",
              "description": "How security gates block vulnerable containers before deployment",
              "content": "graph TD\n    Commit[Developer PR] --> Build[Build Docker Image]\n    Build --> Trivy[Trivy Vulnerability Scan]\n    Trivy --> Check{Vulnerabilities Found?}\n    Check -- Critical CVE Found --> Fail[Fail Pipeline & Notify Dev]\n    Fail --> Fix[Update Base Image / npm audit fix]\n    Fix --> Commit\n    Check -- Clean / Low Risk --> Pass[Upload SARIF Report]\n    Pass --> Registry[Push to GHCR & Deploy]"
            }
          ],
          "quiz": [
            {
              "id": "q-sec-scan-1",
              "type": "multiple-choice",
              "question": "Why is the '--ignore-unfixed' flag recommended when configuring automated pipeline blocking gates with Trivy?",
              "options": [
                "It ignores vulnerabilities that have already been fixed.",
                "It prevents pipelines from failing on vulnerabilities that have no official security patch available upstream, avoiding artificial deployment blockers.",
                "It disables scanning for application packages.",
                "It automatically patches code in the repository."
              ],
              "correctAnswer": "It prevents pipelines from failing on vulnerabilities that have no official security patch available upstream, avoiding artificial deployment blockers.",
              "explanation": "If a zero-day CVE is discovered with no patched package available from Debian/Alpine maintainers, failing the build would prevent any releases. The flag focuses gates on actionable, fixable vulnerabilities.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Trivy scan step times out in GitHub Actions after downloading the vulnerability DB for 10 minutes.",
              "cause": "GitHub runner hit rate limits against GitHub Releases or network throttling while fetching the vulnerability database.",
              "diagnosis": [
                "Check runner network connectivity.",
                "Inspect step logs for 'failed to download vulnerability DB'."
              ],
              "solution": "Enable Trivy DB caching or pass a GitHub Token (`GITHUB_TOKEN`) to the action so Trivy requests use authenticated GitHub API rate limits.",
              "prevention": "Cache `/tmp/trivy` directory between workflow runs using `actions/cache`."
            }
          ],
          "keyTakeaways": [
            "Shift security left by scanning container images during pull requests rather than after deployment.",
            "Trivy scans both OS packages and application language dependencies (npm) in seconds.",
            "Exporting SARIF reports surfaces vulnerabilities directly in GitHub Code Scanning.",
            "Distroless images dramatically reduce attack surfaces by eliminating shells and system utilities."
          ],
          "bestPractices": [
            "Run scheduled nightly scans on production images to catch newly disclosed CVEs in dormant code.",
            "Set `exit-code: 1` on CRITICAL CVEs with `ignore-unfixed: true`."
          ],
          "securityConsiderations": [
            "Never run containers as root; use `USER node` or distroless non-root runtimes."
          ],
          "commonMistakes": [
            "Scanning only source files and ignoring the final container base image layers.",
            "Failing builds on LOW severity CVEs, leading to developer alert fatigue."
          ],
          "interviewQuestions": [
            "Q: How do you design a container vulnerability management strategy in CI/CD without blocking delivery?\\nA: Integrate automated scanners like Trivy in CI; fail builds only on actionable CRITICAL/HIGH vulnerabilities with available fixes (`--ignore-unfixed`); upload full SARIF reports to GitHub Security for tracking; and adopt minimal/distroless base images to minimize the baseline vulnerability count."
          ],
          "references": [
            {
              "title": "Trivy Documentation - Aqua Security",
              "url": "https://aquasecurity.github.io/trivy/",
              "type": "documentation",
              "description": "Official documentation for the Trivy vulnerability scanner.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "the-gitops-handoff",
            "rolling-deployments"
          ]
        },
        {
          "id": "the-gitops-handoff",
          "title": "The GitOps Handoff",
          "summary": "Bridge CI and CD cleanly. Decouple pipeline concerns by ensuring CI builds and tests artifacts, then hands off deployment to GitOps by committing updated image tags to the declarative config repository.",
          "estimatedMinutes": 35,
          "difficulty": "intermediate",
          "prerequisites": [
            "building-docker-images-in-ci",
            "image-security-scanning"
          ],
          "objectives": [
            {
              "text": "Enforce strict separation between CI (test & build) and CD (GitOps reconciliation)",
              "skill": "CI/CD Separation"
            },
            {
              "text": "Structure a two-repository architecture: App Code Repo vs GitOps Config Repo",
              "skill": "Repository Architecture"
            },
            {
              "text": "Automate Kustomize image tag updates (kustomize edit set image) inside GitHub Actions",
              "skill": "Kustomize Handoff"
            },
            {
              "text": "Authenticate CI to push to the GitOps config repo using fine-grained tokens or GitHub Apps",
              "skill": "Secure Automation"
            }
          ],
          "sections": [
            {
              "title": "Why CI Must Never Run 'kubectl apply'",
              "level": "intermediate",
              "content": "In legacy \"Push\" deployment pipelines, CI runners hold production cluster admin credentials and run commands like `kubectl apply -f deployment.yaml` or `helm upgrade --install`.\n\nWhy this is an anti-pattern:\n1. **Security Vulnerability**: A compromised npm package or malicious PR could steal cluster admin tokens from the CI runner environment.\n2. **Cluster Firewall Ingress**: Your production Kubernetes API server must be publicly exposed to the internet so GitHub runners can reach it.\n3. **No Single Source of Truth**: If an engineer manually edits the cluster (`kubectl edit`), the change is undetected until the next CI run, causing silent drift.\n4. **Partial Failures**: If the CI runner loses network connectivity mid-apply, the cluster is left in an inconsistent half-deployed state.\n\n**The GitOps Solution**:\nCI builds the container image, pushes it to GHCR, and writes the new image tag to a **GitOps configuration repository**. An in-cluster agent (like ArgoCD) continuously monitors that config repo and synchronizes reality from the inside out."
            },
            {
              "title": "The Two-Repository Architecture",
              "level": "intermediate",
              "content": "Best practice separates application code from Kubernetes operational config into two distinct repositories:\n\n```\n1. Application Repo (mern-app):\n   ├── client/                  # React source\n   ├── server/                  # Express source\n   ├── Dockerfile\n   └── .github/workflows/       # CI, test, build, push, GitOps handoff\n\n2. GitOps Config Repo (mern-gitops):\n   ├── base/                    # Base K8s manifests (Deployments, Services)\n   └── overlays/\n       ├── staging/             # Staging kustomization.yaml\n       └── production/          # Production kustomization.yaml\n```\n\nBenefits:\n- Clean git commit histories: daily code commits don't pollute infrastructure audit logs.\n- Independent access controls: developers have write access to `mern-app`; only senior engineers or automated bots can merge to `mern-gitops/overlays/production`."
            },
            {
              "title": "The Handoff Workflow with Kustomize",
              "level": "advanced",
              "content": "When the CI pipeline in `mern-app` passes all tests and pushes `ghcr.io/org/mern-api:sha-7a1b2c3`, it executes the GitOps handoff:\n\n1. Checks out the `mern-gitops` repository using a scoped GitHub Deploy Key or GitHub App token.\n2. Uses the **Kustomize CLI** to declaratively update the image tag:\n   ```bash\n   cd overlays/staging\n   kustomize edit set image mern-api=ghcr.io/org/mern-api:sha-7a1b2c3\n   ```\n3. Commits the modified `kustomization.yaml` with a traceable commit message:\n   `git commit -m \"chore(deps): promote mern-api to sha-7a1b2c3 from run ${{ github.run_id }}\"`\n4. Pushes the commit to `main` (for staging) or opens an automated Pull Request (for production).\n5. ArgoCD detects the new commit in `mern-gitops` and reconciles the cluster!"
            },
            {
              "title": "Authentication: GitHub Apps vs Personal Access Tokens",
              "level": "intermediate",
              "content": "How does CI in Repo A push a commit to Repo B?\n- **Avoid**: Personal Access Tokens (PATs) tied to individual user accounts (they break when employees leave and have broad account-wide permissions).\n- **Good**: Repository Deploy Keys with write access configured specifically on `mern-gitops`.\n- **Best**: A dedicated **GitHub App** with repository-scoped permissions. The workflow generates a short-lived installation token valid for only 60 minutes."
            }
          ],
          "commands": [
            {
              "command": "kustomize edit set image mern-api=ghcr.io/org/mern-api:sha-7a1b2c3",
              "description": "Declaratively update the container image tag in kustomization.yaml",
              "example": "kustomize edit set image mern-api=ghcr.io/org/mern-api:sha-7a1b2c3",
              "whenToUse": "Execute inside CI workflow scripts during GitOps handoff"
            },
            {
              "command": "yq eval '.spec.template.spec.containers[0].image = \"ghcr.io/org/mern-api:v1.2.0\"' -i deployment.yaml",
              "description": "Directly update image fields in raw Kubernetes YAML files using yq",
              "example": "yq eval '.spec.template.spec.containers[0].image = \"ghcr.io/org/mern-api:v1.2.0\"' -i deployment.yaml",
              "whenToUse": "Update manifest values in non-Kustomize setups"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/gitops-promote.yml",
              "code": "name: GitOps Handoff Promotion\n\non:\n  workflow_run:\n    workflows: [\"Publish MERN Docker Images\"]\n    types: [completed]\n    branches: [main]\n\njobs:\n  promote-staging:\n    if: ${{ github.event.workflow_run.conclusion == 'success' }}\n    runs-on: ubuntu-latest\n    steps:\n      - name: Checkout GitOps Config Repository\n        uses: actions/checkout@v4\n        with:\n          repository: 'my-org/mern-gitops'\n          token: ${{ secrets.GITOPS_PROMOTION_TOKEN }}\n          path: gitops-repo\n\n      - name: Setup Kustomize\n        uses: imranismail/setup-kustomize@v3\n\n      - name: Update Staging Image Tag\n        run: |\n          cd gitops-repo/overlays/staging\n          kustomize edit set image mern-api=ghcr.io/my-org/mern-api:sha-${{ github.event.workflow_run.head_sha }}\n\n      - name: Commit and Push Staging Manifests\n        run: |\n          cd gitops-repo\n          git config user.name \"gitops-bot\"\n          git config user.email \"bot@my-org.com\"\n          git add overlays/staging/kustomization.yaml\n          git diff --quiet && git diff --staged --quiet || (\n            git commit -m \"chore(staging): promote mern-api to sha-${{ github.event.workflow_run.head_sha }}\" \\\n                       -m \"Triggered by workflow run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            git push origin main\n          )\n",
              "explanation": "Production GitHub Actions workflow that executes upon successful image publishing. It checks out the separate GitOps configuration repository, uses Kustomize to update the image tag for staging, and pushes the commit to trigger ArgoCD reconciliation."
            },
            {
              "language": "yaml",
              "filename": "mern-gitops/overlays/staging/kustomization.yaml",
              "code": "apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\n\nresources:\n  - ../../base\n\nnamespace: staging\n\nimages:\n  - name: mern-api\n    newName: ghcr.io/my-org/mern-api\n    newTag: sha-7a1b2c3\n",
              "explanation": "The declarative target file in the GitOps repo modified by the CI handoff step."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "The CI to GitOps Handoff Loop",
              "description": "How CI hands off deployment to GitOps without cluster credentials",
              "content": "sequenceDiagram\n    participant Dev as Developer\n    participant AppRepo as mern-app (Code)\n    participant CI as GitHub Actions\n    participant Reg as Container Registry (GHCR)\n    participant ConfigRepo as mern-gitops (Manifests)\n    participant Argo as ArgoCD (Inside Cluster)\n    participant K8s as Kubernetes Cluster\n\n    Dev->>AppRepo: git push to main\n    AppRepo->>CI: Trigger CI Pipeline\n    CI->>CI: Run Tests & Linters\n    CI->>Reg: Build & Push Docker Image (sha-7a1b2c3)\n    CI->>ConfigRepo: Commit updated kustomization.yaml (sha-7a1b2c3)\n    Note over CI,ConfigRepo: Handoff Complete! CI Exits!\n    Argo->>ConfigRepo: Poll / Webhook detects new commit\n    Argo->>K8s: Reconcile Pods to match ConfigRepo"
            }
          ],
          "quiz": [
            {
              "id": "q-gitops-hand-1",
              "type": "multiple-choice",
              "question": "In a GitOps architecture, what action should the CI pipeline perform when a Docker image is built and tested successfully?",
              "options": [
                "SSH into production worker nodes and run docker pull.",
                "Execute kubectl apply -f deployment.yaml using cluster admin credentials.",
                "Commit the new image tag into the GitOps configuration repository and push.",
                "Send an email to the on-call SRE asking them to deploy."
              ],
              "correctAnswer": "Commit the new image tag into the GitOps configuration repository and push.",
              "explanation": "CI should never interact directly with the cluster. It updates the desired state in the GitOps config repository, leaving the deployment to the in-cluster GitOps controller.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "GitOps handoff step fails with 'fatal: Authentication failed' when pushing to the mern-gitops repository.",
              "cause": "The default GITHUB_TOKEN only has permissions for the current repository, not external repositories.",
              "diagnosis": [
                "Check which secret is passed to `actions/checkout` under `token:`.",
                "Verify the secret exists and has write access to the target config repository."
              ],
              "solution": "Generate a fine-grained Personal Access Token or GitHub App Installation Token with 'Contents: Read and write' on the mern-gitops repository, and pass it via secrets.GITOPS_PROMOTION_TOKEN.",
              "prevention": "Never rely on the default repository-scoped GITHUB_TOKEN for multi-repository automation."
            }
          ],
          "keyTakeaways": [
            "CI builds and tests artifacts; GitOps reconciles desired state with the cluster.",
            "CI should never hold cluster admin credentials or execute kubectl apply directly.",
            "Maintain separate repositories for application code and GitOps Kubernetes manifests.",
            "Kustomize (`kustomize edit set image`) provides a safe, declarative mechanism to update image tags in CI."
          ],
          "bestPractices": [
            "Include traceable metadata in the config repo commit message (link back to the source app commit SHA and workflow run URL).",
            "For production promotions, have CI open an automated Pull Request rather than committing directly to main."
          ],
          "securityConsiderations": [
            "Use short-lived GitHub App tokens with narrowly scoped write permissions on the config repository."
          ],
          "commonMistakes": [
            "Mixing application code and Kubernetes manifests in a single repository without path filtering, creating infinite CI loops when CI commits back to the repo.",
            "Granting CI runners full AWS/K8s cluster administrative privileges."
          ],
          "interviewQuestions": [
            "Q: Why is separating CI from CD fundamental to GitOps, and how do they communicate?\\nA: Separating CI from CD eliminates cluster credentials from the CI runner, preserves the cluster inside its private network, and enforces Git as the single source of truth. They communicate through Git: CI publishes the tested image to a registry and commits the new tag to the GitOps config repo; the in-cluster CD controller (ArgoCD) detects the commit and pulls changes into the cluster."
          ],
          "references": [
            {
              "title": "OpenGitOps Principles",
              "url": "https://opengitops.net/",
              "type": "specification",
              "description": "The official CNCF OpenGitOps standards and principles.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "rolling-deployments",
            "blue-green-deployments"
          ]
        }
      ]
    },
    {
      "id": "deployment-strategies",
      "title": "Deployment Strategies",
      "description": "Master zero-downtime deployment strategies on Kubernetes: tune rolling updates, implement Blue-Green environments, automate Canary progressive delivery with Argo Rollouts and Prometheus, and decouple deployment from release using feature flags.",
      "icon": "🌐",
      "difficulty": "advanced",
      "estimatedHours": 7,
      "lessons": [
        {
          "id": "rolling-deployments",
          "title": "Rolling Deployments",
          "summary": "Master the Kubernetes native Deployment rollout mechanism: tune maxSurge and maxUnavailable, configure readiness probes, and write graceful shutdown logic in Node.js Express to achieve true zero downtime.",
          "estimatedMinutes": 35,
          "difficulty": "advanced",
          "prerequisites": [
            "the-gitops-handoff"
          ],
          "objectives": [
            {
              "text": "Understand the Kubernetes Deployment controller's dual-ReplicaSet rolling update algorithm",
              "skill": "Kubernetes Rolling Updates"
            },
            {
              "text": "Tune maxSurge and maxUnavailable parameters to guarantee zero dropped HTTP requests",
              "skill": "Rollout Tuning"
            },
            {
              "text": "Configure readiness, liveness, and startup probes for Express.js applications",
              "skill": "K8s Health Probes"
            },
            {
              "text": "Implement SIGTERM graceful connection draining and Mongoose disconnect logic in Node.js",
              "skill": "Graceful Shutdown"
            }
          ],
          "sections": [
            {
              "title": "Anatomy of a Kubernetes Rolling Update",
              "level": "intermediate",
              "content": "The default deployment strategy in Kubernetes is the **RollingUpdate**. When you update the container image in a Deployment, Kubernetes does not terminate all old pods at once. Instead, it manages two ReplicaSets simultaneously:\n\n1. **Old ReplicaSet (v1)**: Scaled down incrementally.\n2. **New ReplicaSet (v2)**: Scaled up incrementally.\n\n```\nInitial State:\n  ReplicaSet v1: [ Pod 1 ] [ Pod 2 ] [ Pod 3 ] (100% Traffic)\n  ReplicaSet v2: (Empty)\n\nDuring Rollout (maxSurge: 1, maxUnavailable: 0):\n  Step 1: ReplicaSet v2 creates [ Pod 4 (v2) ].\n  Step 2: Kubernetes waits for Pod 4 readinessProbe to return HTTP 200.\n  Step 3: Pod 4 joins the Service endpoints and receives live traffic.\n  Step 4: Kubernetes sends SIGTERM to [ Pod 1 (v1) ] and terminates it.\n  Step 5: Repeat for Pod 2 and Pod 3 until all pods run v2.\n```"
            },
            {
              "title": "Tuning maxSurge and maxUnavailable",
              "level": "advanced",
              "content": "The pacing of a rolling update is governed by two parameters under `spec.strategy.rollingUpdate`:\n\n1. **`maxSurge`**: The maximum number (or percentage) of pods that can be created **above** the desired replica count.\n   - Example: 4 replicas with `maxSurge: 25%` allows up to 5 pods during the rollout.\n2. **`maxUnavailable`**: The maximum number (or percentage) of pods that can be unavailable during the update.\n   - Example: 4 replicas with `maxUnavailable: 25%` allows 1 pod to be terminated before replacement pods are ready.\n\n**The Golden Zero-Downtime Rule**:\nTo guarantee that your application NEVER drops capacity during high traffic:\n```yaml\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 25%        # Create extra new pods first\n    maxUnavailable: 0    # NEVER terminate an old pod until a new pod is healthy!\n```"
            },
            {
              "title": "The Decisive Role of Probes",
              "level": "intermediate",
              "content": "A zero-downtime rolling update is completely impossible without proper health probes:\n- **`readinessProbe`**: Answers \"Can this pod accept customer traffic right now?\"\n  - If a new MERN API pod takes 4 seconds to boot and connect to MongoDB, the readiness probe returns HTTP 503 during boot.\n  - Kubernetes will **not** route traffic to this pod until the probe returns HTTP 200!\n- **`livenessProbe`**: Answers \"Is this container deadlocked or corrupt?\"\n  - If it fails, Kubernetes kills and restarts the container.\n  - **Warning**: Never check external dependencies (like MongoDB) in a liveness probe! If MongoDB suffers an outage, all your backend API pods will crash-loop simultaneously, causing a cascading cluster outage.\n- **`startupProbe`**: Gives slow-starting legacy apps grace time before liveness checks begin."
            },
            {
              "title": "Node.js Express Graceful Shutdown",
              "level": "advanced",
              "content": "When Kubernetes terminates an old pod, it removes the pod from Service endpoints and sends a `SIGTERM` signal to PID 1.\n\nIf your Express server immediately calls `process.exit(0)`, in-flight customer HTTP requests will be violently severed, resulting in dropped connections (`ECONNRESET`).\n\nYou must implement **Graceful Shutdown**:\n1. Intercept `process.on('SIGTERM')`.\n2. Stop accepting new connections (`server.close()`).\n3. Set a preStop sleep hook in Kubernetes (`sleep 5`) to allow iptables/kube-proxy routing tables across all cluster nodes to update.\n4. Allow existing requests 10-15 seconds to complete.\n5. Close the Mongoose database connection (`mongoose.connection.close()`).\n6. Exit cleanly with code 0."
            }
          ],
          "commands": [
            {
              "command": "kubectl rollout status deployment/mern-api",
              "description": "Watch rolling update progress until all new pods pass readiness checks",
              "example": "kubectl rollout status deployment/mern-api --timeout=120s",
              "output": "Waiting for deployment 'mern-api' rollout to finish: 1 of 3 updated replicas are available...\\ndeployment 'mern-api' successfully rolled out",
              "whenToUse": "Block CI/CD deployment jobs until the rolling update successfully stabilizes"
            },
            {
              "command": "kubectl rollout undo deployment/mern-api",
              "description": "Instantly abort and rollback a rolling update to the previous ReplicaSet",
              "example": "kubectl rollout undo deployment/mern-api",
              "output": "deployment.apps/mern-api rolled back",
              "whenToUse": "Emergency manual rollback if the new release exhibits errors in production"
            },
            {
              "command": "kubectl rollout history deployment/mern-api",
              "description": "View revision history and applied change causes",
              "example": "kubectl rollout history deployment/mern-api",
              "whenToUse": "Audit past rollout revisions"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "k8s/deployment.yaml",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-api\n  namespace: production\n  labels:\n    app: mern-api\nspec:\n  replicas: 4\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 25%\n      maxUnavailable: 0\n  selector:\n    matchLabels:\n      app: mern-api\n  template:\n    metadata:\n      labels:\n        app: mern-api\n    spec:\n      terminationGracePeriodSeconds: 30\n      containers:\n        - name: mern-api\n          image: ghcr.io/my-org/mern-api:sha-7a1b2c3\n          ports:\n            - containerPort: 5000\n          lifecycle:\n            preStop:\n              exec:\n                # Give kube-proxy 5 seconds to remove pod IP from endpoint slices\n                command: [\"/bin/sh\", \"-c\", \"sleep 5\"]\n          readinessProbe:\n            httpGet:\n              path: /healthz/ready\n              port: 5000\n            initialDelaySeconds: 5\n            periodSeconds: 5\n            failureThreshold: 2\n          livenessProbe:\n            httpGet:\n              path: /healthz/live\n              port: 5000\n            initialDelaySeconds: 15\n            periodSeconds: 10\n            failureThreshold: 3\n          resources:\n            requests:\n              cpu: 100m\n              memory: 128Mi\n            limits:\n              cpu: 500m\n              memory: 512Mi\n",
              "explanation": "Zero-downtime Kubernetes Deployment specification with maxUnavailable: 0, preStop hook, tuned readiness/liveness probes, and resource constraints."
            },
            {
              "language": "typescript",
              "filename": "server/src/server.ts",
              "code": "import app from './app';\nimport mongoose from 'mongoose';\nimport http from 'http';\n\nconst PORT = process.env.PORT || 5000;\nconst server = http.createServer(app);\n\nserver.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});\n\n// ─── Graceful Shutdown Handler ──────────────────────────────\nlet isShuttingDown = false;\n\n// Readiness endpoint returns 503 immediately when shutting down\napp.get('/healthz/ready', (req, res) => {\n  if (isShuttingDown || mongoose.connection.readyState !== 1) {\n    return res.status(503).json({ status: 'shutting down or db disconnected' });\n  }\n  return res.status(200).json({ status: 'ready' });\n});\n\napp.get('/healthz/live', (req, res) => {\n  return res.status(200).json({ status: 'alive' });\n});\n\nfunction handleShutdown(signal: string) {\n  console.log(`Received ${signal}. Starting graceful shutdown...`);\n  isShuttingDown = true;\n\n  // 1. Stop accepting new connections\n  server.close(async () => {\n    console.log('HTTP server closed. No longer accepting new connections.');\n    try {\n      // 2. Close database connections cleanly\n      await mongoose.connection.close(false);\n      console.log('MongoDB connection closed cleanly.');\n      process.exit(0);\n    } catch (err) {\n      console.error('Error closing database connections:', err);\n      process.exit(1);\n    }\n  });\n\n  // 3. Force exit if cleanup takes longer than 25 seconds\n  setTimeout(() => {\n    console.error('Forcefully terminating process after 25s timeout.');\n    process.exit(1);\n  }, 25000).unref();\n}\n\nprocess.on('SIGTERM', () => handleShutdown('SIGTERM'));\nprocess.on('SIGINT', () => handleShutdown('SIGINT'));\n",
              "explanation": "Complete Node.js Express server shutdown handler with readiness health checks, in-flight connection draining, and clean Mongoose teardown."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Rolling Update Pod State Transition",
              "description": "Gradual replacement of old pods with new pods",
              "content": "graph LR\n    subgraph Step 1: Surge\n        Old1[v1: Running]\n        Old2[v1: Running]\n        Old3[v1: Running]\n        New1[v2: Starting / Probing]\n    end\n    subgraph Step 2: Traffic Shift\n        Old1_1[v1: SIGTERM Draining]\n        Old2_1[v1: Running]\n        Old3_1[v1: Running]\n        New1_1[v2: Ready & Serving]\n    end\n    subgraph Step 3: Complete\n        New1_F[v2: Serving]\n        New2_F[v2: Serving]\n        New3_F[v2: Serving]\n    end\n    Step 1 --> Step 2 --> Step 3"
            }
          ],
          "quiz": [
            {
              "id": "q-roll-dep-1",
              "type": "multiple-choice",
              "question": "Why is setting 'maxUnavailable: 0' critical during a rolling update for a capacity-constrained production service?",
              "options": [
                "It speeds up the rollout by 500%.",
                "It ensures Kubernetes never terminates any healthy existing pod until a replacement pod is completely started and passes its readiness probe, maintaining 100% capacity.",
                "It disables Kubernetes health checks.",
                "It forces all pods to share the same IP address."
              ],
              "correctAnswer": "It ensures Kubernetes never terminates any healthy existing pod until a replacement pod is completely started and passes its readiness probe, maintaining 100% capacity.",
              "explanation": "With maxUnavailable: 0, Kubernetes first creates new pods (surge), waits for them to be ready, and only then terminates old pods. Service capacity never drops below 100%.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Deployment rollout hangs indefinitely with 'Waiting for deployment mern-api rollout to finish: 1 of 4 updated replicas are available...'.",
              "cause": "The new pod's readinessProbe is failing, preventing Kubernetes from marking the pod ready or progressing with the update.",
              "diagnosis": [
                "Run `kubectl get pods -l app=mern-api` to identify the new failing pod.",
                "Run `kubectl describe pod <pod-name>` and inspect the Events section for 'Readiness probe failed: HTTP probe failed with statuscode: 503'.",
                "Check pod logs with `kubectl logs <pod-name>` for application startup errors (e.g. invalid MongoDB connection string)."
              ],
              "solution": "Fix the root cause (e.g., provide correct database credentials via ConfigMap/Secret) or abort the rollout with `kubectl rollout undo deployment/mern-api`.",
              "prevention": "Test container startup and health probe endpoints in staging before promoting to production."
            }
          ],
          "keyTakeaways": [
            "RollingUpdate is the default zero-downtime deployment strategy in Kubernetes.",
            "Always set `maxUnavailable: 0` when maintaining full capacity during updates is required.",
            "Readiness probes prevent Kubernetes from routing traffic to unready pods.",
            "Node.js apps must handle `SIGTERM` and sleep in `preStop` to avoid severed HTTP connections."
          ],
          "bestPractices": [
            "Configure `preStop: exec: command: ['sleep', '5']` to give network ingress controllers time to drain endpoints.",
            "Never check external databases in `livenessProbe` to avoid cascading failure loops."
          ],
          "securityConsiderations": [
            "Set resource requests and limits on all containers so surging pods do not exhaust node CPU or memory."
          ],
          "commonMistakes": [
            "Omitting readiness probes, causing Kubernetes to immediately route traffic to booting Node.js pods before they can handle requests.",
            "Calling `process.exit()` immediately on SIGTERM without draining active client requests."
          ],
          "interviewQuestions": [
            "Q: What happens under the hood when a pod is terminated during a rolling update, and how do you prevent dropped requests?\\nA: Kubernetes simultaneously removes the pod IP from EndpointSlices and sends SIGTERM to the container. Because IP removal takes several seconds to propagate across all node iptables, active traffic may still reach the pod. To prevent dropped requests: 1) add a `preStop` hook with `sleep 5` so network rules update; 2) handle `SIGTERM` in Express to stop accepting new requests while draining existing ones (`server.close()`); and 3) ensure `terminationGracePeriodSeconds` is long enough (e.g. 30s)."
          ],
          "references": [
            {
              "title": "Kubernetes Documentation: Deployments",
              "url": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
              "type": "documentation",
              "description": "Official Kubernetes specification for Deployment objects and rolling update strategies.",
              "difficulty": "intermediate",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "blue-green-deployments",
            "canary-releases"
          ]
        },
        {
          "id": "blue-green-deployments",
          "title": "Blue-Green Deployments",
          "summary": "Eliminate release risk with Blue-Green deployments: run two identical environments in parallel, smoke test the new version in production, and switch traffic instantaneously via Kubernetes Services or Argo Rollouts.",
          "estimatedMinutes": 35,
          "difficulty": "advanced",
          "prerequisites": [
            "rolling-deployments"
          ],
          "objectives": [
            {
              "text": "Understand the architecture and trade-offs of Blue-Green deployment patterns",
              "skill": "Blue-Green Architecture"
            },
            {
              "text": "Implement instant traffic switching using Kubernetes Services and label selectors",
              "skill": "Traffic Switching"
            },
            {
              "text": "Handle database schema compatibility using the Expand-and-Contract migration pattern",
              "skill": "Schema Evolution"
            },
            {
              "text": "Automate Blue-Green rollouts and verification using Argo Rollouts CRDs",
              "skill": "Argo Rollouts"
            }
          ],
          "sections": [
            {
              "title": "Blue-Green Deployment Architecture",
              "level": "intermediate",
              "content": "While a rolling update replaces pods gradually over several minutes, a **Blue-Green Deployment** maintains two complete, isolated environments in parallel:\n\n1. **Blue (Active)**: Currently serving 100% of live production traffic.\n2. **Green (Preview / Inactive)**: Running the newly built version of the application.\n\n```\n                          ┌──> [ Active Service ] ──> Blue Environment (v1.0.0) [Live Users]\n[ Ingress / Load Balancer ]\n                          └──> [ Preview Service ] ──> Green Environment (v2.0.0) [Internal QA/SRE]\n```\n\nHow the release works:\n1. Green is spun up with the new container image.\n2. Internal SREs run automated smoke tests and security validations against the **Preview Service**.\n3. Once verified, the **Active Service** selector is updated to point to Green.\n4. User traffic switches to Green in **under 1 second**!\n5. If an anomaly is detected, switching back to Blue takes another single second."
            },
            {
              "title": "Instant Traffic Switching via Service Selectors",
              "level": "intermediate",
              "content": "In pure Kubernetes, you can implement Blue-Green using two Deployments and one Service:\n\n```yaml\n# Blue Deployment\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mern-api-blue\nspec:\n  template:\n    metadata:\n      labels:\n        app: mern-api\n        color: blue\n\n# Active Service routing to Blue\napiVersion: v1\nkind: Service\nmetadata:\n  name: mern-api-active\nspec:\n  selector:\n    app: mern-api\n    color: blue   # Change to \"green\" to instantly switch traffic!\n```\n\nRunning `kubectl patch service mern-api-active -p '{\"spec\":{\"selector\":{\"color\":\"green\"}}}'` immediately redirects all incoming HTTP requests to the Green pods."
            },
            {
              "title": "The Database Migration Challenge: Expand-and-Contract",
              "level": "advanced",
              "content": "The biggest pitfall in Blue-Green deployments is the shared database. Because Blue (v1) and Green (v2) run simultaneously against the same MongoDB cluster, **you cannot make breaking database schema changes**!\n\nIf Green renames a MongoDB collection field from `userName` to `username` and deletes `userName`, Blue will immediately crash while still serving 100% of live users.\n\n**The Expand-and-Contract (Parallel Run) Pattern**:\n1. **Phase 1 (Expand)**: Add the new field `username` while keeping `userName`. Code writes to both fields; reads from the new field if present, fallback to old.\n2. **Phase 2 (Deploy Green)**: Deploy Green (v2). Both Blue and Green function seamlessly because the schema supports both. Switch traffic to Green.\n3. **Phase 3 (Contract)**: After Blue is decommissioned, run a background migration to backfill old records and remove the legacy `userName` field."
            },
            {
              "title": "Automating Blue-Green with Argo Rollouts",
              "level": "advanced",
              "content": "Managing two Deployments and editing Services manually is tedious. **Argo Rollouts** provides a Kubernetes Custom Resource (`Rollout`) that natively handles the entire Blue-Green lifecycle:\n- Automatically manages active and preview ReplicaSets.\n- Directs preview traffic to a preview Service for automated testing.\n- Supports `autoPromotionEnabled: false` so human approval is required before the switch.\n- Automatically scales down the old Blue ReplicaSet after a configured safety delay (`scaleDownDelaySeconds: 300`)."
            }
          ],
          "commands": [
            {
              "command": "kubectl argo rollouts promote mern-api-rollout",
              "description": "Approve and execute the traffic switch from Blue to Green in Argo Rollouts",
              "example": "kubectl argo rollouts promote mern-api-rollout",
              "output": "rollout 'mern-api-rollout' promoted",
              "whenToUse": "Switch production traffic to the verified Green preview environment"
            },
            {
              "command": "kubectl argo rollouts abort mern-api-rollout",
              "description": "Instantly abort Green rollout and revert active traffic back to Blue",
              "example": "kubectl argo rollouts abort mern-api-rollout",
              "output": "rollout 'mern-api-rollout' aborted",
              "whenToUse": "Emergency abort if Green exhibits errors during preview or immediately after promotion"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "k8s/bluegreen-rollout.yaml",
              "code": "apiVersion: argoproj.io/v1alpha1\nkind: Rollout\nmetadata:\n  name: mern-api-rollout\n  namespace: production\nspec:\n  replicas: 4\n  revisionHistoryLimit: 3\n  selector:\n    matchLabels:\n      app: mern-api\n  strategy:\n    blueGreen:\n      # Active service receives live production user traffic\n      activeService: mern-api-active\n      # Preview service used for QA and smoke testing before traffic switch\n      previewService: mern-api-preview\n      # Require manual promotion approval before switching active service\n      autoPromotionEnabled: false\n      # Keep old blue pods alive for 10 minutes after switch for instant rollback\n      scaleDownDelaySeconds: 600\n  template:\n    metadata:\n      labels:\n        app: mern-api\n    spec:\n      containers:\n        - name: mern-api\n          image: ghcr.io/my-org/mern-api:v2.0.0\n          ports:\n            - containerPort: 5000\n          readinessProbe:\n            httpGet:\n              path: /healthz/ready\n              port: 5000\n",
              "explanation": "Argo Rollouts Blue-Green configuration with designated active and preview services, manual promotion approval gate, and a 10-minute scaleDownDelaySeconds safety window."
            },
            {
              "language": "yaml",
              "filename": "k8s/services.yaml",
              "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: mern-api-active\n  namespace: production\nspec:\n  ports:\n    - port: 80\n      targetPort: 5000\n  selector:\n    app: mern-api\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: mern-api-preview\n  namespace: production\nspec:\n  ports:\n    - port: 80\n      targetPort: 5000\n  selector:\n    app: mern-api\n",
              "explanation": "Kubernetes Active and Preview services managed dynamically by the Argo Rollouts controller."
            }
          ],
          "diagrams": [
            {
              "type": "architecture",
              "title": "Blue-Green Deployment Traffic Switching",
              "description": "How the Active and Preview services route traffic between environments",
              "content": "graph TD\n    Client[Production Users] --> Ingress[Ingress Controller]\n    InternalQA[Internal QA / Smoketests] --> PrevIngress[Preview Ingress]\n\n    Ingress --> ActiveSvc[Service: mern-api-active]\n    PrevIngress --> PrevSvc[Service: mern-api-preview]\n\n    ActiveSvc -- 1. Currently Serving --> BluePods[Blue Environment: v1.0.0]\n    PrevSvc -- 2. Smoke Testing --> GreenPods[Green Environment: v2.0.0]\n\n    ActiveSvc -. 3. Flip Selector on Promote .-> GreenPods"
            }
          ],
          "quiz": [
            {
              "id": "q-bg-dep-1",
              "type": "multiple-choice",
              "question": "What is the primary operational trade-off of running Blue-Green deployments compared to Rolling updates?",
              "options": [
                "Blue-Green deployments do not support Docker images.",
                "Blue-Green requires double the compute/pod resource capacity during the release window while both environments run in parallel.",
                "Blue-Green takes 2 hours to switch traffic.",
                "Blue-Green cannot be rolled back."
              ],
              "correctAnswer": "Blue-Green requires double the compute/pod resource capacity during the release window while both environments run in parallel.",
              "explanation": "Because two complete copies of the application run simultaneously, your cluster must have sufficient CPU and memory capacity to host 2x the normal replica count during the rollout window.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Immediately after promoting Green, live production users report 500 Internal Server Errors from MongoDB queries.",
              "cause": "Green introduced a non-backward-compatible database migration, breaking queries from existing connections.",
              "diagnosis": [
                "Check MongoDB logs for missing field errors or failed index constraints.",
                "Inspect application error logs."
              ],
              "solution": "Execute an immediate 1-second abort rollback (`kubectl argo rollouts abort mern-api-rollout`) to flip active traffic back to Blue.",
              "prevention": "Strictly enforce the Expand-and-Contract database migration pattern for all schema changes in Blue-Green pipelines."
            }
          ],
          "keyTakeaways": [
            "Blue-Green provides instant traffic switching (<1s) and instantaneous rollback capabilities.",
            "Preview Services allow full production smoke testing before exposing code to end users.",
            "Database migrations must be backward-compatible (Expand-and-Contract pattern).",
            "Argo Rollouts automates replica scaling and service selector management."
          ],
          "bestPractices": [
            "Keep `scaleDownDelaySeconds` at 300 to 600 seconds so the old Blue environment remains hot and ready for instant rollback if issues appear post-launch.",
            "Automate end-to-end smoke tests against the preview service before approving promotion."
          ],
          "securityConsiderations": [
            "Protect the Preview Service ingress with internal VPN or OAuth proxies so unreleased features are not exposed to the public internet."
          ],
          "commonMistakes": [
            "Executing breaking database migrations at the same time Green is deployed.",
            "Failing to account for cluster node capacity when scaling up the second environment."
          ],
          "interviewQuestions": [
            "Q: How do you handle database migrations in a Blue-Green deployment architecture?\\nA: Use the Expand/Contract pattern. In the Expand phase, add new columns/fields without removing old ones, and make application code support both formats. Deploy Green against this backward-compatible schema. Once Green is promoted and verified, enter the Contract phase where legacy columns are safely purged."
          ],
          "references": [
            {
              "title": "Argo Rollouts: Blue-Green Strategy",
              "url": "https://argoproj.github.io/argo-rollouts/features/bluegreen/",
              "type": "documentation",
              "description": "Official documentation for implementing Blue-Green deployments with Argo Rollouts.",
              "difficulty": "advanced",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "canary-releases",
            "release-management"
          ]
        },
        {
          "id": "canary-releases",
          "title": "Canary Releases",
          "summary": "Master progressive delivery: gradually route real user traffic to new versions (5%, 20%, 50%), evaluate live Prometheus telemetry via Argo Rollouts AnalysisTemplates, and auto-abort on failure.",
          "estimatedMinutes": 40,
          "difficulty": "advanced",
          "prerequisites": [
            "blue-green-deployments"
          ],
          "exerciseId": "canary-rollout",
          "objectives": [
            {
              "text": "Design progressive canary delivery workflows to minimize release blast radius",
              "skill": "Canary Strategies"
            },
            {
              "text": "Configure weighted traffic routing with Argo Rollouts and Ingress controllers",
              "skill": "Traffic Weighting"
            },
            {
              "text": "Write Prometheus metric queries in AnalysisTemplates for automated canary verification",
              "skill": "Metric Analysis"
            },
            {
              "text": "Implement automated rollback thresholds based on HTTP error rates and latency",
              "skill": "Automated Abort"
            }
          ],
          "sections": [
            {
              "title": "Why Canary?: Minimizing Blast Radius",
              "level": "intermediate",
              "content": "The term 'canary' originates from coal miners who brought caged canaries into mines—if dangerous odorless gases leaked, the canary would succumb first, warning the miners to evacuate.\n\nIn software delivery, a **Canary Release** deploys the new version of your application alongside the stable version, but routes only a tiny percentage (e.g. 2% or 5%) of real production traffic to it.\n\nWhy Canary is superior for high-scale applications:\n- **Blast Radius Containment**: If a catastrophic memory leak or database bug exists, only 2% of users experience it, rather than 100%.\n- **Real Production Verification**: Synthetic tests can never completely simulate unpredictable production user behavior, network conditions, and diverse payloads.\n- **Automated Metric Promotion**: Decisions are driven by live Prometheus telemetry (HTTP 5xx error rates, p95/p99 latency) rather than human guesswork."
            },
            {
              "title": "Traffic Weighting Mechanics",
              "level": "advanced",
              "content": "How is 5% of traffic routed to the canary?\n1. **Pod Ratio (Basic)**: 19 old pods and 1 new pod = 5% traffic split. (Expensive and coarse-grained).\n2. **Ingress Controller Annotation (NGINX / AWS ALB)**: NGINX Ingress uses `nginx.ingress.kubernetes.io/canary-weight: \"5\"`. The ingress proxy splits HTTP requests at the load balancer level regardless of pod count.\n3. **Service Mesh (Istio / Linkerd)**: VirtualServices split traffic cleanly at the sidecar proxy level.\n\n**Argo Rollouts** integrates natively with NGINX Ingress, ALB, and Service Meshes, adjusting the canary percentage dynamically according to configured steps!"
            },
            {
              "title": "Step-Based Canary Progression",
              "level": "intermediate",
              "content": "In an Argo Rollout, you define explicit rollout steps:\n\n```yaml\nstrategy:\n  canary:\n    steps:\n      - setWeight: 5\n      - pause: { duration: 10m }   # Wait 10 minutes at 5% traffic\n      - setWeight: 20\n      - pause: { duration: 30m }   # Wait 30 minutes at 20% traffic\n      - setWeight: 50\n      - pause: { duration: 1h }    # Wait 1 hour at 50% traffic\n```\n\nDuring each pause, Prometheus metrics are evaluated. If error rates remain normal, Argo Rollouts automatically advances to the next step until 100% is reached."
            },
            {
              "title": "Automated Metric Analysis with Prometheus",
              "level": "advanced",
              "content": "The real power of Argo Rollouts is **AnalysisTemplates**. An AnalysisTemplate queries Prometheus repeatedly during the rollout:\n\n```yaml\napiVersion: argoproj.io/v1alpha1\nkind: AnalysisTemplate\nmetadata:\n  name: http-success-rate\nspec:\n  metrics:\n    - name: success-rate\n      interval: 1m\n      successCondition: result[0] >= 0.99   # 99% success rate required\n      failureLimit: 3                       # Abort after 3 consecutive failures\n      provider:\n        prometheus:\n          address: http://prometheus-k8s.monitoring:9090\n          query: |\n            sum(rate(http_requests_total{status=~\"2..|3..\", app=\"mern-api\"}[2m]))\n            /\n            sum(rate(http_requests_total{app=\"mern-api\"}[2m]))\n```\n\nIf a bug causes the canary's HTTP 500 error rate to spike above 1%, the analysis fails, Argo Rollouts instantly aborts the rollout, resets traffic weight to 0%, and alerts the on-call team!"
            }
          ],
          "commands": [
            {
              "command": "kubectl argo rollouts get rollout mern-api-canary --watch",
              "description": "Watch live canary step progression, traffic weighting, and analysis runs",
              "example": "kubectl argo rollouts get rollout mern-api-canary --watch",
              "whenToUse": "Monitor an active canary deployment in real time"
            },
            {
              "command": "kubectl argo rollouts set image mern-api-canary mern-api=ghcr.io/org/mern-api:v2.1.0",
              "description": "Trigger a new canary rollout by updating the container image",
              "example": "kubectl argo rollouts set image mern-api-canary mern-api=ghcr.io/org/mern-api:v2.1.0",
              "whenToUse": "Deploy an updated image tag through the canary pipeline"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": "k8s/canary-rollout.yaml",
              "code": "apiVersion: argoproj.io/v1alpha1\nkind: Rollout\nmetadata:\n  name: mern-api-canary\n  namespace: production\nspec:\n  replicas: 10\n  strategy:\n    canary:\n      analysis:\n        templates:\n          - templateName: http-success-rate\n        args:\n          - name: service-name\n            value: mern-api-canary\n      steps:\n        - setWeight: 10\n        - pause: { duration: 5m }\n        - setWeight: 25\n        - pause: { duration: 15m }\n        - setWeight: 50\n        - pause: { duration: 30m }\n  template:\n    metadata:\n      labels:\n        app: mern-api\n    spec:\n      containers:\n        - name: mern-api\n          image: ghcr.io/my-org/mern-api:v2.1.0\n          ports:\n            - containerPort: 5000\n          readinessProbe:\n            httpGet:\n              path: /healthz/ready\n              port: 5000\n",
              "explanation": "Argo Rollouts Canary specification with progressive traffic weights (10% -> 25% -> 50%) and background Prometheus analysis."
            },
            {
              "language": "yaml",
              "filename": "k8s/analysis-template.yaml",
              "code": "apiVersion: argoproj.io/v1alpha1\nkind: AnalysisTemplate\nmetadata:\n  name: http-success-rate\n  namespace: production\nspec:\n  metrics:\n    - name: success-rate\n      interval: 30s\n      successCondition: result[0] >= 0.99\n      failureLimit: 2\n      provider:\n        prometheus:\n          address: http://prometheus.monitoring.svc.cluster.local:9090\n          query: |\n            sum(rate(http_requests_total{status=~\"2..\", app=\"mern-api\"}[1m]))\n            /\n            sum(rate(http_requests_total{app=\"mern-api\"}[1m]))\n",
              "explanation": "Prometheus AnalysisTemplate checking that at least 99% of requests return HTTP 2xx status codes during the canary evaluation."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Canary Traffic Progression Curve",
              "description": "Gradual shifting of live traffic based on Prometheus analysis",
              "content": "graph LR\n    Start([Deploy v2.1.0]) --> W10[10% Traffic]\n    W10 -- Prometheus: Error < 1% (5m) --> W25[25% Traffic]\n    W25 -- Prometheus: Error < 1% (15m) --> W50[50% Traffic]\n    W50 -- Prometheus: Error < 1% (30m) --> W100[100% Traffic - Complete!]\n\n    W10 -. Error > 1% .-> Abort[Auto-Abort & Reset to v2.0.0]\n    W25 -. Error > 1% .-> Abort\n    W50 -. Error > 1% .-> Abort"
            }
          ],
          "quiz": [
            {
              "id": "q-can-rel-1",
              "type": "multiple-choice",
              "question": "What happens if a Prometheus AnalysisTemplate query fails its successCondition during a canary rollout in Argo Rollouts?",
              "options": [
                "Argo Rollouts ignores the error and immediately routes 100% traffic.",
                "The rollout is automatically aborted, the canary traffic weight is immediately reset to 0%, and stable pods continue serving all traffic without customer disruption.",
                "Kubernetes restarts all cluster worker nodes.",
                "The deployment is permanently deleted."
              ],
              "correctAnswer": "The rollout is automatically aborted, the canary traffic weight is immediately reset to 0%, and stable pods continue serving all traffic without customer disruption.",
              "explanation": "Automated analysis provides hands-off safety. If metrics fail validation thresholds, Argo Rollouts aborts the canary instantly, protecting 95%+ of users from experiencing bugs.",
              "difficulty": "advanced",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "Canary analysis fails immediately with 'Unable to resolve prometheus host: http://prometheus.monitoring:9090'.",
              "cause": "Incorrect DNS address for the in-cluster Prometheus server service.",
              "diagnosis": [
                "Run `kubectl get svc -n monitoring` to inspect the exact service name and namespace for Prometheus.",
                "Verify if Prometheus runs in the `monitoring` or `default` namespace."
              ],
              "solution": "Update the AnalysisTemplate `address:` field to the fully qualified in-cluster domain name (e.g. `http://prometheus-operated.monitoring.svc.cluster.local:9090`).",
              "prevention": "Test Prometheus metric queries via curl from a test pod before deploying AnalysisTemplates."
            }
          ],
          "keyTakeaways": [
            "Canary releases expose minimal real users to new versions, containing blast radius.",
            "Automate promotion using telemetry: HTTP error rate, p95 latency, and CPU saturation.",
            "Argo Rollouts provides declarative canary step weights and automatic rollback triggers.",
            "Use CodeLab exercise 'canary-rollout' to practice configuring and debugging progressive rollouts."
          ],
          "bestPractices": [
            "Ensure your application emits standard Prometheus metrics (such as `http_requests_total`).",
            "Keep initial canary percentages low (5% to 10%) for at least 15 minutes to catch memory leaks and race conditions."
          ],
          "securityConsiderations": [
            "Ensure Prometheus query endpoints in AnalysisTemplates do not require external credentials and are routed over secure internal cluster networks."
          ],
          "commonMistakes": [
            "Setting canary evaluation intervals too short (e.g. 5 seconds) before statistically significant traffic volume has reached the new pods.",
            "Failing to set a failureLimit on AnalysisTemplates, causing transient 1-second network blips to abort healthy rollouts."
          ],
          "interviewQuestions": [
            "Q: How do you design an automated Canary deployment system that aborts without human intervention?\\nA: Use Argo Rollouts configured with a Canary strategy and integrate an AnalysisTemplate connected to Prometheus. Define success metrics (e.g. error rate < 0.5%, p95 latency < 250ms). Argo Rollouts adjusts traffic weight incrementally (5%, 20%, 50%) and runs analysis queries. If the failure threshold is exceeded, Argo Rollouts immediately sets weight to 0% and marks the rollout aborted."
          ],
          "references": [
            {
              "title": "Argo Rollouts: Canary Strategy",
              "url": "https://argoproj.github.io/argo-rollouts/features/canary/",
              "type": "documentation",
              "description": "Comprehensive guide to configuring Canary deployments and AnalysisTemplates in Argo Rollouts.",
              "difficulty": "advanced",
              "priority": "required"
            }
          ],
          "connectsTo": [
            "release-management"
          ]
        },
        {
          "id": "release-management",
          "title": "Release Management",
          "summary": "Decouple deployment from release: master Semantic Versioning (SemVer), enforce Conventional Commits, automate GitHub Releases and changelogs, and implement runtime Feature Flags in the MERN stack.",
          "estimatedMinutes": 30,
          "difficulty": "intermediate",
          "prerequisites": [
            "rolling-deployments"
          ],
          "objectives": [
            {
              "text": "Differentiate between code deployment (infrastructure) and feature release (business)",
              "skill": "Release Decoupling"
            },
            {
              "text": "Adopt Conventional Commits to automate Semantic Versioning in CI/CD pipelines",
              "skill": "Conventional Commits"
            },
            {
              "text": "Automate changelog and GitHub Release publishing via semantic-release",
              "skill": "Automated Releases"
            },
            {
              "text": "Implement runtime feature flags in Express middleware and React client context",
              "skill": "Feature Flags"
            }
          ],
          "sections": [
            {
              "title": "Deploying is NOT Releasing",
              "level": "intermediate",
              "content": "The most profound mindset shift in modern release engineering is decoupling **Deployment** from **Release**:\n\n- **Deployment**: A technical operation. Installing software onto servers or pods and routing network traffic to them. Owned by SREs and CI/CD pipelines.\n- **Release**: A business operation. Making a capability or user experience visible and available to customers. Owned by Product Managers and Marketing.\n\nIn legacy workflows, deployment and release happened at the exact same moment—shipping code to production instantly exposed new features to all users. If a feature had a bug, SREs had to scramble an emergency code rollback.\n\nBy decoupling them:\n- Code is deployed to production continuously behind **Feature Flags** (toggles).\n- The code runs dormant in production for days, verified with internal accounts.\n- When the product team is ready, the feature flag is toggled on with zero deployment required!"
            },
            {
              "title": "Semantic Versioning (SemVer) 2.0.0",
              "level": "intermediate",
              "content": "Semantic Versioning provides a standardized contract: `MAJOR.MINOR.PATCH` (e.g. `2.4.1`):\n\n1. **MAJOR (`2.0.0`)**: Incompatible API breaking changes (e.g., removing a REST endpoint, altering JWT authentication schema).\n2. **MINOR (`1.5.0`)**: Adding backward-compatible functionality (e.g., adding a new `/api/v1/search` filter parameter).\n3. **PATCH (`1.4.2`)**: Backward-compatible bug fixes (e.g., fixing a memory leak in Mongoose query pagination)."
            },
            {
              "title": "Conventional Commits & Automated Releases",
              "level": "intermediate",
              "content": "How do you eliminate manual version numbering and manual changelog writing?\n\nEnforce **Conventional Commits**:\n- `feat: add passwordless magic link login` -> Triggers **MINOR** bump (`1.3.0 -> 1.4.0`)\n- `fix: resolve race condition in token refresh` -> Triggers **PATCH** bump (`1.4.0 -> 1.4.1`)\n- `feat!: migrate from MongoDB 6 to 7 with breaking schema` -> Triggers **MAJOR** bump (`1.4.1 -> 2.0.0`)\n\nUsing tools like **`semantic-release`** in GitHub Actions:\n1. Analyzes commit history since the last release.\n2. Calculates the next SemVer version automatically.\n3. Generates release notes and updates `CHANGELOG.md`.\n4. Creates a Git tag and publishes a formal GitHub Release."
            },
            {
              "title": "Feature Flags in the MERN Stack",
              "level": "advanced",
              "content": "Implementing feature flags allows progressive rollout at the application layer:\n\n**Backend (Express Middleware)**:\n```typescript\nexport function requireFeature(flagName: string) {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const isEnabled = featureFlagService.isEnabled(flagName, { userId: req.user?.id });\n    if (!isEnabled) {\n      return res.status(404).json({ error: 'Endpoint not available' });\n    }\n    next();\n  };\n}\n```\n\n**Frontend (React Context & Hooks)**:\n```tsx\nexport function CheckoutButton() {\n  const { isEnabled } = useFeatureFlag('one-click-checkout');\n\n  if (isEnabled) {\n    return <OneClickCheckout />;\n  }\n  return <StandardMultiStepCheckout />;\n}\n```\n\nIf a bug is discovered in production, the product manager turns off the flag in the dashboard. The feature disappears immediately for all users without rolling back a single container or pod!"
            }
          ],
          "commands": [
            {
              "command": "npx semantic-release --dry-run",
              "description": "Preview next calculated SemVer version and changelog without publishing",
              "example": "npx semantic-release --dry-run",
              "output": "[semantic-release] Analysis of 4 commits resulted in next release version 1.4.0",
              "whenToUse": "Test semantic release rules locally before pushing to CI"
            },
            {
              "command": "git commit -m 'feat(auth): support oauth2 google login'",
              "description": "Create a Conventional Commit that automatically triggers a MINOR release bump",
              "example": "git commit -m 'fix(cart): prevent negative item quantity'",
              "whenToUse": "Commit message standard for automated release workflows"
            }
          ],
          "codeExamples": [
            {
              "language": "yaml",
              "filename": ".github/workflows/release.yml",
              "code": "name: Automated Semantic Release\n\non:\n  push:\n    branches: [main]\n\njobs:\n  release:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: write\n      issues: write\n      pull-requests: write\n\n    steps:\n      - name: Checkout Code\n        uses: actions/checkout@v4\n        with:\n          fetch-depth: 0   # Full git history required for changelog analysis\n\n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: 'npm'\n\n      - name: Install Dependencies\n        run: npm ci\n\n      - name: Run Semantic Release\n        env:\n          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n        run: npx semantic-release\n",
              "explanation": "GitHub Actions workflow running semantic-release on every merge to main to compute SemVer, generate CHANGELOG.md, and create GitHub Releases."
            },
            {
              "language": "typescript",
              "filename": "client/src/components/FeatureFlag.tsx",
              "code": "import React from 'react';\nimport { useFeatureFlags } from '../context/FeatureFlagContext';\n\ninterface FeatureFlagProps {\n  name: string;\n  fallback?: React.ReactNode;\n  children: React.ReactNode;\n}\n\nexport const FeatureFlag: React.FC<FeatureFlagProps> = ({ name, fallback = null, children }) => {\n  const { isEnabled } = useFeatureFlags();\n\n  if (!isEnabled(name)) {\n    return <>{fallback}</>;\n  }\n\n  return <>{children}</>;\n};\n",
              "explanation": "Reusable React component for toggling UI elements dynamically based on runtime feature flags."
            }
          ],
          "diagrams": [
            {
              "type": "flow",
              "title": "Decoupled Deploy vs Release Architecture",
              "description": "Separating infrastructure deployment from feature activation",
              "content": "graph LR\n    Dev[Developer PR] --> CI[CI Pipeline]\n    CI --> Deploy[Deploy to Production Pods]\n    Deploy --> Dormant[Code Running Dormant Behind Feature Flag]\n\n    PM[Product Manager / Ops] -- Toggle Flag ON --> FlagService[Feature Flag Control]\n    FlagService -- Immediate Activation --> Users[End Users See Feature]\n\n    Bug[Bug Discovered!] -. Toggle Flag OFF .-> FlagService\n    FlagService -. Instant Kill-switch (0s downtime) .-> Users"
            }
          ],
          "quiz": [
            {
              "id": "q-rel-mgmt-1",
              "type": "multiple-choice",
              "question": "What is the primary benefit of decoupling code deployment from feature release using Feature Flags?",
              "options": [
                "It eliminates the need for unit testing.",
                "It allows engineering to continuously deploy code safely to production without forcing unverified features onto users, enabling instant kill-switches without emergency pod rollbacks.",
                "It makes JavaScript compile faster.",
                "It allows databases to run without storage."
              ],
              "correctAnswer": "It allows engineering to continuously deploy code safely to production without forcing unverified features onto users, enabling instant kill-switches without emergency pod rollbacks.",
              "explanation": "Decoupling deployment from release allows teams to ship code continuously while controlling feature exposure via runtime toggles, providing an instant kill-switch if defects occur.",
              "difficulty": "intermediate",
              "xp": 50
            }
          ],
          "troubleshooting": [
            {
              "symptom": "semantic-release fails with '[semantic-release] There are no relevant changes, so no new version is released'.",
              "cause": "Commits merged to main did not adhere to the Conventional Commits specification (e.g. used 'update files' instead of 'feat:' or 'fix:').",
              "diagnosis": [
                "Inspect git log with `git log -n 5 --oneline`.",
                "Check commit message prefixes."
              ],
              "solution": "Configure a pre-commit git hook with commitlint (`@commitlint/cli`) to enforce Conventional Commits formatting before developers push.",
              "prevention": "Enforce PR title linting in GitHub Actions using action `amannn/action-semantic-pull-request`."
            }
          ],
          "keyTakeaways": [
            "Deploying is installing software; releasing is making features visible to users.",
            "Adopt Conventional Commits to automate Semantic Versioning and changelog generation.",
            "Feature flags provide instant kill-switches in production without code rollbacks.",
            "`semantic-release` eliminates manual release ceremony and creates audited GitHub Releases."
          ],
          "bestPractices": [
            "Clean up expired feature flags quarterly to prevent code debt accumulation.",
            "Enforce PR title linting to ensure all squashed merges follow Conventional Commits format."
          ],
          "securityConsiderations": [
            "Do not evaluate sensitive authorization rules purely via client-side React feature flags; always enforce feature restrictions in backend Express API middleware as well."
          ],
          "commonMistakes": [
            "Treating deployment and release as synonymous, forcing high-stress emergency rollbacks when bugs occur.",
            "Hardcoding version numbers manually in `package.json`, causing merge conflicts across branches."
          ],
          "interviewQuestions": [
            "Q: What is the difference between deployment and release, and how do feature flags fit into modern CI/CD?\\nA: Deployment is the automated process of putting tested code onto infrastructure (pods, servers). Release is the business decision to expose that functionality to end users. Feature flags decouple the two by letting teams continuously deploy dormant code to production, test it with internal users, and progressively release it to customers without requiring another deployment or risk of rollback."
          ],
          "references": [
            {
              "title": "Semantic Versioning 2.0.0 Specification",
              "url": "https://semver.org/",
              "type": "specification",
              "description": "Official specification for Semantic Versioning rules.",
              "difficulty": "beginner",
              "priority": "required"
            },
            {
              "title": "Conventional Commits Specification",
              "url": "https://www.conventionalcommits.org/",
              "type": "specification",
              "description": "Specification for adding human and machine-readable meaning to commit messages.",
              "difficulty": "beginner",
              "priority": "recommended"
            }
          ],
          "connectsTo": [
            "rolling-deployments",
            "canary-releases"
          ]
        }
      ]
    }
  ]
}
