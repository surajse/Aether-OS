# 🌌 AetherOS (OpenDots)

> **The Universal Open-Source Sovereign Agent Operating System & Generative UI Canvas.**  
> *Always-on, persistent, self-healing AI agents (Dots) on your own hardware or cloud — with zero vendor lock-in, ambient calm computing, and multi-protocol unification.*

[![CI](https://github.com/surajse/Aether-OS/actions/workflows/ci.yml/badge.svg)](https://github.com/surajse/Aether-OS/actions/workflows/ci.yml)
[![License: MIT / Apache 2.0](https://img.shields.io/badge/License-MIT%20%2F%20Apache%202.0-blue.svg)](LICENSE)
[![Protocols: MCP + AG-UI + A2UI](https://img.shields.io/badge/Protocols-MCP%20%7C%20AG--UI%20%7C%20A2UI-green.svg)](#protocols)
[![Local-First](https://img.shields.io/badge/Architecture-Local--First%20Sovereign-purple.svg)](#architecture)
[![Vibe-Coding Ready](https://img.shields.io/badge/Cursor%20AI-Vibe--Coding%20Harness-orange.svg)](#cursor-vibe-coding)

---

## 🚀 Why AetherOS?

In late 2026, the AI industry shifted from ephemeral chat into **always-on persistent agents**:
* **OpenAI** launched **Dots** (cloud-only VMs, proprietary closed-source, \$50–\$200/mo subscription).
* **xAI** launched **Grok Bots & Marketplace** (cloud-locked within the X ecosystem).
* **CopilotKit** introduced the **AG-UI / A2UI** streaming specification.
* **Nous Research** released **Hermes Agent** with self-improving skill creation loops.
* **Rakazo** demonstrated rising demand for self-hosted persistent teammates.

**AetherOS (OpenDots)** combines all of these frontiers into a single, sovereign, open-source platform that runs locally or on private cloud infrastructure with complete data ownership.

```
                      ┌───────────────────────────────────────┐
                      │              HUMAN USER               │
                      │  (Calm HUD + Generative UI Canvas)    │
                      └──────────────────┬────────────────────┘
                                         │ AG-UI / A2UI (17 Events)
                                         ▼
                      ┌───────────────────────────────────────┐
                      │          AETHER-OS KERNEL             │
                      │  - Cognitive Attentional Governor     │
                      │  - Event-Sourced SQLite State Machine │
                      │  - Cascading Model Router (12ms)      │
                      │  - Self-Healing Test Runner           │
                      └──────────────────┬────────────────────┘
                                         │ MCP & Local IPC
                                         ▼
                      ┌───────────────────────────────────────┐
                      │          SOVEREIGN SANDBOX            │
                      │  - Path-Chrooted Process Jail         │
                      │  - Ephemeral Docker / MicroVM         │
                      │  - Zero-Knowledge Secret Proxy        │
                      └───────────────────────────────────────┘
```

---

## ✨ Key Features

1. **Always-On Background Persistence**: Agents run continuously in local Docker containers or background process jails without dying when your browser tab closes.
2. **Cognitive Attentional Governor**: Eliminates approval fatigue. Agents calculate an **Attention Debt Index**: low-risk actions proceed automatically, while high-risk changes batch into a calm executive digest.
3. **Dual-Plane Generative UI Canvas**: Replaces clunky text chat with live, interactive diff viewers, visual execution trees, and one-click action review cards.
4. **Universal Protocol Bus**: Native support for **Model Context Protocol (MCP)**, **AG-UI / A2UI** streaming events, and **A2A** agent-to-agent negotiation.
5. **Cascading Model Router (12ms Failover)**: Hot-swap dynamically across Anthropic (Claude 3.7), OpenAI (GPT-4o/o3), and local Ollama (Llama 3.2 / Qwen 2.5) with zero downtime.
6. **Tri-Memory Knowledge Subsystem**: Combines an immutable constitutional core, an append-only episodic timeline, and a temporal knowledge graph to eliminate vector RAG drift.
7. **Self-Healing Code Engine**: The kernel catches compiler and test errors, generates repair contracts, and auto-repairs itself with zero human intervention.

---

## ⚡ Quick Start

### 1. Zero-Install Windows Launch (PowerShell / CMD)
```cmd
# Run tests
test.bat

# Start Daemon & Web UI
start-node.bat
```
* **Calm HUD Dashboard**: [http://localhost:3000](http://localhost:3000)
* **REST & AG-UI SSE Stream**: [http://localhost:4099](http://localhost:4099)
* **Health Check**: [http://localhost:4099/health](http://localhost:4099/health)

### 2. Using the Sovereign CLI
```powershell
# List active sovereign skills and MCP tools
node packages/cli/bin/aether.js skills

# Audit workspace dependencies for supply chain risks
node packages/cli/bin/aether.js audit

# Run AST security review on any target file
node packages/cli/bin/aether.js review packages/types/src/index.ts

# Execute an autonomous goal with self-healing verification
node packages/cli/bin/aether.js run "Check workspace health and verify all invariants"
```

### 3. Docker Deployment (One-Click)
```bash
docker compose up -d
```

---

## 📦 Monorepo Architecture

| Package | Role |
| :--- | :--- |
| [`@aether/types`](./packages/types) | Canonical Zod schemas for states, tasks, reviews, and AG-UI events |
| [`@aether/core`](./packages/core) | Event-sourced runtime state machine, orchestrator, attention governor |
| [`@aether/sandbox`](./packages/sandbox) | Path-chroot process jail, risk classifier, execution sandbox |
| [`@aether/gateway`](./packages/gateway) | Multi-provider model router with cascading 12ms failover (Ollama/Claude/GPT) |
| [`@aether/protocol`](./packages/protocol) | AG-UI / A2UI SSE streaming server, MCP client manager, REST API |
| [`@aether/memory`](./packages/memory) | Tri-memory subsystem (Episodic SQLite timeline + Temporal Knowledge Graph) |
| [`@aether/skills`](./packages/skills) | Built-in sovereign tool library (filesystem, shell, security auditor) |
| [`@aether/cli`](./packages/cli) | CLI binary (`aether start`, `aether run`, `aether audit`, `aether skills`) |
| [`@aether/web`](./packages/web) | Next.js 15 Calm HUD, dual-plane canvas, live diffs, and review modals |

---

## 📖 Complete Master Blueprint & 100 Debate Questions

For the complete technical specification, system architecture, PRD, MVP details, the **100 Physiological & Logical Debate Questions and Answers**, and the copy-paste Cursor AI vibe-coding prompts, read:

👉 **[AETHER_OS_OPEN_DOTS_BLUEPRINT.md](./AETHER_OS_OPEN_DOTS_BLUEPRINT.md)**

---

## 🛠️ Vibe Coding with Cursor AI ("Just Press Continue")

This repository is built for autonomous vibe coding with Cursor AI:

1. Open this repository in Cursor AI.
2. The included [`.cursorrules`](./.cursorrules) file automatically enforces strict TypeScript typing, anti-hallucination checks, and test-driven development.
3. Copy the prompt sequences from Section 8 of `AETHER_OS_OPEN_DOTS_BLUEPRINT.md`.
4. If Cursor AI ever pauses or hits a roadblock, simply type:
   ```text
   continue
   ```
   The agent will read its test suite, isolate the error, repair the code, and keep building!

---

## 📜 License

Licensed under either of:
* Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))
* MIT license ([LICENSE-MIT](LICENSE-MIT))
at your option.
