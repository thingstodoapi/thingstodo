# A weekend planner with Claude

Two ways to give Claude live local events:

- `weekend_planner.py`: the Python client as a tool, with the Anthropic SDK's tool runner.
- `mcp_connector.py`: no tool code at all. Claude connects to the MCP server
  through the Messages API's MCP connector.

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...
python weekend_planner.py "a fun saturday in san francisco, live music at night"
python mcp_connector.py "what's on in oakland tonight?"
```

Both use `claude-opus-5-5` with server-side fallbacks on: if the model declines a
request, the API retries it on a fallback model in the same call. Set
`THINGSTODO_API_KEY` for more than 50 searches a day.
