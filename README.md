# mcp-finance-server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes financial intelligence tools to Claude and other MCP-compatible AI clients.

Plug this server into Claude Desktop or any MCP client and the AI can perform KYB lookups, AML risk scoring, sanctions screening, and document intelligence on demand — all through natural language.

---

## Tools

| Tool | Description |
|---|---|
| `company_lookup` | Retrieve company registration, jurisdiction, UBO data |
| `risk_score` | Composite AML/KYB risk score (0–100) with factor breakdown |
| `sanctions_check` | Screen against OFAC SDN, UN SC, EU Consolidated, UK OFSI |
| `doc_summary` | Extract risk flags, entities, amounts, dates from financial documents |

---

## Quickstart

```bash
npm install
npm run build
```

**Claude Desktop config** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "finance": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-finance-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop — the tools appear automatically.

---

## Example Prompts

> *"Look up Global Trade Partners and score their AML risk."*

> *"Screen Omar Al-Rashid against all sanctions lists."*

> *"Summarize this invoice and flag any risk indicators."*

---

## Development

```bash
npm run dev       # run with tsx (no build step)
npm test          # vitest
npm run typecheck # tsc --noEmit
```

---

## Stack

- TypeScript · Node.js 20+
- `@modelcontextprotocol/sdk` — official Anthropic MCP SDK
- Zod — schema validation
- Vitest — testing
