/**
 * Art Institute of Chicago MCP — wraps the ARTIC public API (free, no auth)
 *
 * Tools:
 * - search_artworks: Full-text search across the collection
 * - get_artwork: Detailed record for a single artwork by ID
 * - get_artist: Artist record by ID
 * - get_exhibitions: Current and recent exhibitions
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://api.artic.edu/api/v1';

// --- Raw API types ---

type RawArtworkSummary = {
  id: number;
  title: string;
  artist_display: string | null;
  date_display: string | null;
  medium_display: string | null;
  image_id: string | null;
};

type RawArtworkDetail = RawArtworkSummary & {
  dimensions: string | null;
  credit_line: string | null;
  description: string | null;
};

type RawArtist = {
  id: number;
  title: string;
  birth_date: number | null;
  death_date: number | null;
  description: string | null;
  artwork_ids: number[];
};

type RawExhibition = {
  id: number;
  title: string;
  short_description: string | null;
  status: string | null;
};

type SearchResponse = {
  data: RawArtworkSummary[];
  pagination: { total: number };
};

type SingleResponse<T> = {
  data: T;
};

type ListResponse<T> = {
  data: T[];
  pagination: { total: number };
};

// --- Tool definitions ---

const tools: McpToolExport['tools'] = [
  {
    name: 'search_artworks',
    description:
      'Search the Art Institute of Chicago collection by keyword. Returns a list of artworks with title, artist, date, medium, and image ID.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (e.g., "monet water lilies")' },
        limit: {
          type: 'number',
          description: 'Number of results to return (1-100, default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_artwork',
    description:
      'Get full details for a single artwork by its numeric ID. Returns title, artist, date, medium, dimensions, credit line, description, and image ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ARTIC artwork ID (e.g., 27992)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_artist',
    description:
      'Get an artist record by numeric ID. Returns name, birth/death dates, description, and a list of artwork IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ARTIC artist ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_exhibitions',
    description:
      'List current and recent exhibitions at the Art Institute of Chicago. Returns title, short description, and status for each exhibition.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of exhibitions to return (1-100, default 10)',
        },
      },
      required: [],
    },
  },
];

// --- callTool dispatcher ---

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_artworks':
      return searchArtworks(args.query as string, (args.limit as number) ?? 10);
    case 'get_artwork':
      return getArtwork(args.id as number);
    case 'get_artist':
      return getArtist(args.id as number);
    case 'get_exhibitions':
      return getExhibitions((args.limit as number) ?? 10);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Tool implementations ---

async function searchArtworks(query: string, limit: number) {
  const params = new URLSearchParams({
    q: query,
    limit: String(Math.min(100, Math.max(1, limit))),
    fields: 'id,title,artist_display,date_display,medium_display,image_id',
  });

  const res = await fetch(`${BASE_URL}/artworks/search?${params}`);
  if (!res.ok) throw new Error(`ARTIC error: ${res.status}`);

  const data = (await res.json()) as SearchResponse;

  return {
    total: data.pagination.total,
    artworks: data.data.map((a) => ({
      id: a.id,
      title: a.title,
      artist: a.artist_display,
      date: a.date_display,
      medium: a.medium_display,
      image_id: a.image_id,
      image_url: a.image_id
        ? `https://www.artic.edu/iiif/2/${a.image_id}/full/843,/0/default.jpg`
        : null,
    })),
  };
}

async function getArtwork(id: number) {
  const params = new URLSearchParams({
    fields: 'id,title,artist_display,date_display,medium_display,dimensions,credit_line,image_id,description',
  });

  const res = await fetch(`${BASE_URL}/artworks/${id}?${params}`);
  if (!res.ok) throw new Error(`ARTIC error: ${res.status}`);

  const data = (await res.json()) as SingleResponse<RawArtworkDetail>;
  const a = data.data;

  return {
    id: a.id,
    title: a.title,
    artist: a.artist_display,
    date: a.date_display,
    medium: a.medium_display,
    dimensions: a.dimensions,
    credit_line: a.credit_line,
    description: a.description,
    image_id: a.image_id,
    image_url: a.image_id
      ? `https://www.artic.edu/iiif/2/${a.image_id}/full/843,/0/default.jpg`
      : null,
  };
}

async function getArtist(id: number) {
  const res = await fetch(`${BASE_URL}/artists/${id}`);
  if (!res.ok) throw new Error(`ARTIC error: ${res.status}`);

  const data = (await res.json()) as SingleResponse<RawArtist>;
  const a = data.data;

  return {
    id: a.id,
    name: a.title,
    birth_date: a.birth_date,
    death_date: a.death_date,
    description: a.description,
    artwork_ids: a.artwork_ids,
  };
}

async function getExhibitions(limit: number) {
  const params = new URLSearchParams({
    limit: String(Math.min(100, Math.max(1, limit))),
    fields: 'id,title,short_description,status',
  });

  const res = await fetch(`${BASE_URL}/exhibitions?${params}`);
  if (!res.ok) throw new Error(`ARTIC error: ${res.status}`);

  const data = (await res.json()) as ListResponse<RawExhibition>;

  return {
    total: data.pagination.total,
    exhibitions: data.data.map((e) => ({
      id: e.id,
      title: e.title,
      short_description: e.short_description,
      status: e.status,
    })),
  };
}

export default { tools, callTool } satisfies McpToolExport;
