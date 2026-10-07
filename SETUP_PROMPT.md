# 🌌 AetherOS (OpenDots) — The Canonical Setup Prompt & Guide

> **"Setup, configure, and launch your sovereign, always-on AI agent operating system in under 60 seconds."**

This document serves as both a human-readable setup guide and a structured prompt for AI coding agents (Cursor AI, Claude Code, Windsurf, Copilot) to automatically initialize, verify, and run **AetherOS**.

---

## ⚡ Section 1: Automated Agent Setup Prompt

*(If you are an AI coding assistant instructed to "Set up Aether-OS", execute the following checklist sequentially):*

```text
AetherOS Agent Setup Directives:
1. Verify system environment: Node.js (>= 20.0.0), Git, and pnpm (or npm).
2. Ensure workspace dependencies are installed: run `pnpm install` (or `npm install`).
3. Compile all 9 monorepo packages: run `pnpm build` (or `./build.bat`).
4. Validate system invariants with test suite: run `pnpm test:run` (or `./test.bat`). Ensure 47/47 tests pass.
5. Ensure `.env` exists by copying `.env.example` if `.env` is absent.
6. Verify localhost health by checking ports 4099 (daemon) and 3000 (web UI).
7. If any test or build error occurs, inspect stderr, isolate the failing file, apply the fix, re-test, and proceed without hallucination.
```

---

## 📋 Section 2: Prerequisites

| Tool | Minimum Version | Required? | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` | **Yes** | Runtime for monorepo packages & CLI |
| **pnpm** (or npm) | `>= 9.0.0` | **Yes** | Monorepo workspace package manager |
| **Git** | Any modern version | **Yes** | Version control & shadow worktree sandboxing |
| **Ollama** | Optional | No | For 100% offline, free local AI execution (Llama 3.2 / Qwen) |
| **Docker** | Optional | No | For one-command isolated container deployment |

---

## 🚀 Section 3: One-Click Setup (Windows)

AetherOS includes ready-to-run `.bat` batch files for Windows environments:

### 1. Install & Build
```cmd
.\setup.bat
```
*Installs workspace dependencies and compiles all 9 monorepo packages (`@aether/types`, `@aether/core`, `@aether/sandbox`, `@aether/gateway`, `@aether/protocol`, `@aether/memory`, `@aether/skills`, `@aether/cli`, `@aether/web`).*

### 2. Verify Everything (Tests)
```cmd
.\test.bat
```
*Executes all 11 Vitest test suites (47 tests). Must exit with code 0.*

### 3. Launch Full Stack (Backend + Web HUD)
```cmd
.\start-all.bat
```
*Starts both the Sovereign Daemon (`http://localhost:4099`) and Next.js Calm HUD (`http://localhost:3000`) in parallel and opens your default browser automatically!*

---

## 🐧 Section 4: Cross-Platform Setup (Linux, macOS, WSL)

If you are on Linux or macOS:

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages
pnpm build

# 3. Run test suites
pnpm test:run

# 4. Copy environment configuration
cp .env.example .env

# 5. Start the backend daemon
node packages/cli/bin/aether.js start 4099

# 6. In a second terminal, start the Next.js Web UI
cd packages/web && pnpm start -p 3000
```

---

## 🐳 Section 5: One-Click Docker Deployment

Run AetherOS without installing Node.js or local dependencies:

```bash
docker compose up -d
```
* **Web Ambient Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend Protocol Daemon**: [http://localhost:4099](http://localhost:4099)
* **Health Check**: [http://localhost:4099/health](http://localhost:4099/health)

---

## ⚙️ Section 6: Model Configuration (`.env`)

AetherOS uses a **Cascading Model Router** with 12ms failover. Open your `.env` file to configure your preferred providers:

```env
# 1. Anthropic (Recommended for deep architecture and self-healing reasoning)
ANTHROPIC_API_KEY=sk-ant-api03-...

# 2. OpenAI (GPT-4o / GPT-6 Astra)
OPENAI_API_KEY=sk-proj-...

# 3. Sovereign Local Ollama (100% Free, Private, Offline)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

> [!TIP]
> **Zero Cost / Offline Mode**: If you leave `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` empty, AetherOS automatically routes tasks to your local **Ollama** instance or built-in sovereign mock runners with zero cloud charges!

---

## 🛠️ Section 7: Verifying the Setup via CLI

Once installed, verify that your local node is fully operational:

```powershell
# 1. Inspect system status, invariants, and memory
node packages/cli/bin/aether.js status

# 2. List all registered sovereign skills and MCP tools
node packages/cli/bin/aether.js skills

# 3. Run security audit on workspace packages
node packages/cli/bin/aether.js audit

# 4. Execute an autonomous test goal
node packages/cli/bin/aether.js run "Verify workspace health and summarize invariants"
```

---

## 🌐 Section 8: Live Ports & Endpoints

| Service | Port | Endpoint URL | Description |
| :--- | :--- | :--- | :--- |
| **Calm HUD Web Dashboard** | `3000` | [http://localhost:3000](http://localhost:3000) | Dual-plane generative UI canvas, live diffs, and review modals |
| **Backend Protocol Server** | `4099` | [http://localhost:4099](http://localhost:4099) | AG-UI SSE streaming server and agent runtime daemon |
| **Health Check** | `4099` | [http://localhost:4099/health](http://localhost:4099/health) | Uptime and heartbeat verification (`{ "status": "healthy" }`) |
| **Sovereign Skills API** | `4099` | [http://localhost:4099/api/skills](http://localhost:4099/api/skills) | JSON list of active MCP tools and parameters |
| **Live SSE Stream** | `4099` | [http://localhost:4099/api/agents/:id/stream](http://localhost:4099/api/agents/default-agent/stream) | 17-Event AG-UI generative streaming connection |

---

## 🔄 Section 9: The "Just Press Continue" Protocol

If you are using Cursor AI or an autonomous coding agent to extend AetherOS:
1. Open this repository in your IDE.
2. The included [`.cursorrules`](./.cursorrules) file automatically enforces:
   - Zero hallucinated file paths.
   - Independent verification test gates.
   - Strict TypeScript types from `@aether/types`.
3. If the coding agent ever pauses or encounters an error, simply type:
   ```text
   continue
   ```
   The agent will read compiler/test logs, fix the bug, re-run tests, and continue building automatically!
