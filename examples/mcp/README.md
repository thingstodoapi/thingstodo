# Use it from Claude, Cursor or any MCP client

The server is at `https://api.thingstodoapi.com/mcp` (Streamable HTTP). It
works without a key, up to 50 calls a day. With a free key from
[thingstodoapi.com/signup](https://thingstodoapi.com/signup/), put it in the
path: `https://api.thingstodoapi.com/mcp/YOUR_KEY`, or send it as
`Authorization: Bearer YOUR_KEY`.

Tools: `search_events` (plain words, plus optional place, dates, category),
`get_event`, `list_coverage`. It's also in the
[official MCP Registry](https://registry.modelcontextprotocol.io) as
`com.thingstodoapi/events`.

**Claude Code**

```bash
claude mcp add --transport http thingstodo https://api.thingstodoapi.com/mcp
```

**Claude.ai and Claude Desktop**: Settings → Connectors → Add custom connector,
with the URL above.

**Cursor, VS Code and other clients that read `mcp.json`**

```json
{
  "mcpServers": {
    "thingstodo": { "url": "https://api.thingstodoapi.com/mcp" }
  }
}
```

Then ask: "what's on in Oakland this weekend?", "find a pop-up or market near
the Mission on Saturday", "plan a date night Friday with live music".
