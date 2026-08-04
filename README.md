# mcp-artic

Art Institute of Chicago MCP — wraps the ARTIC public API (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_artworks` | Search the Art Institute of Chicago collection by keyword. Returns artwork titles, artists, dates, mediums, and image IDs. Use get_artwork to fetch full details. |
| `get_artwork` | Get complete details for an artwork by ID. Returns title, artist, date, medium, dimensions, description, credit line, and high-resolution image. |
| `get_artist` | Get an artist's biography and their artworks by ID. Returns name, birth/death dates, bio text, and linked artwork IDs. |
| `get_exhibitions` | Browse current and past exhibitions at the Art Institute. Returns exhibition titles, descriptions, and status (active or closed). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "artic": {
      "url": "https://gateway.pipeworx.io/artic/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Artic data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
