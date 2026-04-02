# @pipeworx/mcp-artic

MCP server for the [Art Institute of Chicago API](https://api.artic.edu) — search artworks, get artwork and artist details, and browse exhibitions. Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `search_artworks` | Full-text search across the collection |
| `get_artwork` | Detailed record for a single artwork by ID |
| `get_artist` | Artist record by ID |
| `get_exhibitions` | Current and recent exhibitions |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "artic": {
      "type": "url",
      "url": "https://gateway.pipeworx.io/artic"
    }
  }
}
```

## CLI Usage

```bash
npx @anthropic-ai/mcp-client https://gateway.pipeworx.io/artic
```

## License

MIT
