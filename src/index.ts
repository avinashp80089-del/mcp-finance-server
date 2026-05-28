import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { companyLookupHandler } from "./tools/company.js";
import { riskScoreHandler } from "./tools/risk.js";
import { sanctionsCheckHandler } from "./tools/sanctions.js";
import { docSummaryHandler } from "./tools/document.js";
import { TOOLS } from "./tools/definitions.js";

const server = new Server(
  { name: "mcp-finance-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case "company_lookup":
      return companyLookupHandler(args);
    case "risk_score":
      return riskScoreHandler(args);
    case "sanctions_check":
      return sanctionsCheckHandler(args);
    case "doc_summary":
      return docSummaryHandler(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
