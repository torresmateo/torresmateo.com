// Data for "An MCP Tool Call, Deconstructed".
// Two setup timelines (first contact, session start) plus three per-prompt
// storylines, one protocol. Every step is grounded in the 2026-07-28 draft
// revision of the MCP spec:
// https://modelcontextprotocol.io/specification/draft

export type ActorId = 'user' | 'host' | 'model' | 'client' | 'auth' | 'server' | 'cal';

export interface Actor {
	id: ActorId;
	label: string;
	sublabel: string;
	icon: string;
}

export const ACTORS: Record<ActorId, Actor> = {
	user: { id: 'user', label: 'You', sublabel: 'the human', icon: '🧑' },
	host: { id: 'host', label: 'Harness', sublabel: 'host app', icon: '🖥️' },
	model: { id: 'model', label: 'Model', sublabel: 'LLM API', icon: '🧠' },
	client: { id: 'client', label: 'MCP client', sublabel: 'inside the harness', icon: '🔌' },
	auth: { id: 'auth', label: 'Auth server', sublabel: 'OAuth 2.1', icon: '🔑' },
	server: { id: 'server', label: 'MCP server', sublabel: 'Pinehill Cabins', icon: '⚙️' },
	cal: { id: 'cal', label: 'CalConnect', sublabel: 'third-party service', icon: '📅' },
};

export interface NewBadge {
	label: string;
	href: string;
}

/** The reply half of a request/response pair, drawn as a dashed return arrow. */
export interface StepResponse {
	short: string; // label on the return arrow
	payloadLabel?: string;
	payload?: string;
}

export interface Step {
	n: number;
	act: string;
	/**
	 * 'message': something crossing the wire between two parties (an arrow).
	 * 'note': something that happens inside one or two components, outside the
	 * protocol proper (a dashed box pinned to the lanes in `at`).
	 */
	kind?: 'message' | 'note';
	from?: ActorId;
	to?: ActorId;
	at?: ActorId[];
	icon?: string; // for notes: what is happening (actor lanes show where)
	title: string;
	short: string; // label drawn on the timeline row
	summary: string; // HTML
	payloadLabel?: string;
	payload?: string;
	/** Present when this event is a request/response pair rather than one-way. */
	response?: StepResponse;
	news?: NewBadge[];
	specHref?: string;
	specLabel?: string;
}

export interface ActInfo {
	id: string;
	numeral: string;
	title: string;
	intro: string; // HTML, shown above the act inside the explorer
}

export interface Scenario {
	id: string;
	letter: string;
	label: string;
	prompt: string;
	blurb: string;
	actors: ActorId[];
	acts: ActInfo[];
	steps: Step[];
}

// Each "New:/Changed:" badge links to the SEP's GitHub PR (the authoritative
// proposal) rather than the generic changelog. The per-step `specHref` covers
// the spec section.
const sep = (n: number) => `https://github.com/modelcontextprotocol/modelcontextprotocol/pull/${n}`;

// Shared identity block, referenced from several payloads.
const META_BLOCK = `"_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {
        "name": "AgentApp",
        "version": "3.2.0"
      },
      "io.modelcontextprotocol/clientCapabilities": {
        "elicitation": { "form": {}, "url": {} },
        "extensions": { "io.modelcontextprotocol/tasks": {} }
      }
    }`;

// ═══════════════════════════════════════════════════════════════════════════
// Storyline A: a tool without auth
// ═══════════════════════════════════════════════════════════════════════════

const STEPS_OPEN: Step[] = [
	{
		n: 1,
		act: 'before',
		from: 'user',
		to: 'host',
		title: 'The prompt arrives',
		short: 'prompt',
		summary: `One read-only question. Everything below this point is machinery
			reacting to it. The harness owns this moment: it decides what context to
			assemble, which servers are relevant, and what the model gets to see.`,
		payloadLabel: 'The entire input',
		payload: `Which Pinehill cabins are free July 24 to 26?`,
	},
	{
		n: 2,
		act: 'before',
		kind: 'note',
		at: ['client'],
		icon: '🗂️',
		title: 'Tool definitions come from cache',
		short: 'tool schemas served from cache',
		summary: `Nothing crosses the wire here, which is exactly the point. The
			MCP client fetched the tool list from the Pinehill server at session start, and the server stamped that <code>tools/list</code> response with a
			freshness hint. One hour has not passed, so the client serves the
			schemas from its own cache. <code>ttlMs</code> and
			<code>cacheScope</code> are new fields that make list results cacheable,
			and deterministic tool ordering keeps the model's prompt cache warm
			too.`,
		payloadLabel: 'The cached tools/list result',
		payload: `{
  "resultType": "complete",
  "ttlMs": 3600000,
  "cacheScope": "private",
  "tools": [
    {
      "name": "check_availability",
      "description": "List available Pinehill cabins for a date range.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "checkIn":  { "type": "string", "format": "date" },
          "checkOut": { "type": "string", "format": "date" }
        },
        "required": ["checkIn", "checkOut"]
      }
    },
    {
      "name": "book_cabin",
      "description": "Book a cabin at any Pinehill property.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "property":      { "type": "string" },
          "checkIn":       { "type": "string", "format": "date" },
          "checkOut":      { "type": "string", "format": "date" },
          "paymentMethod": { "type": "string" },
          "calendar":      { "type": "string", "enum": ["google_calendar", "outlook", "calconnect"] }
        },
        "required": ["property", "checkIn", "checkOut"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "confirmation": { "type": "string" },
          "property":     { "type": "string" },
          "checkIn":      { "type": "string", "format": "date" },
          "checkOut":     { "type": "string", "format": "date" },
          "total":        { "type": "number" },
          "currency":     { "type": "string" },
          "earlyCheckIn": { "type": "string" }
        },
        "required": ["confirmation", "property", "checkIn", "checkOut", "total", "currency"]
      }
    }
  ]
}`,
		news: [
			{ label: 'New: ttlMs + cacheScope (SEP-2549)', href: sep(2549) },
			{ label: 'New: resultType on every result (SEP-2322)', href: sep(2322) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/server/tools',
		specLabel: 'Spec: Tools',
	},
	{
		n: 3,
		act: 'before',
		from: 'host',
		to: 'model',
		title: 'The model sees the prompt and the schemas',
		short: 'prompt + tool schemas',
		summary: `The harness sends the conversation plus the available tool
			definitions to the LLM provider. Note what the model does <em>not</em>
			see: no server URLs, no protocol details. The model only knows that a
			tool named <code>check_availability</code> exists and what arguments it
			takes. MCP stops at the harness boundary; the model API is a different
			protocol entirely.`,
	},
	{
		n: 4,
		act: 'before',
		from: 'model',
		to: 'host',
		title: 'The model decides to call the tool',
		short: 'tool_use: check_availability',
		summary: `The model answers with a structured tool call instead of text,
			with the arguments filled from the prompt. This is still not MCP: it is
			the model provider's tool calling format. The harness now has to
			translate this intent into a protocol request.`,
		payloadLabel: 'The tool_use block',
		payload: `{
  "type": "tool_use",
  "id": "toolu_01",
  "name": "check_availability",
  "input": {
    "checkIn": "2026-07-24",
    "checkOut": "2026-07-26"
  }
}`,
	},
	{
		n: 5,
		act: 'before',
		kind: 'note',
		at: ['user', 'host'],
		icon: '✅',
		title: 'The consent gate',
		short: 'you approve the tool call',
		summary: `Before anything touches the wire, the harness asks you. The spec
			assigns this responsibility to the host: users must explicitly consent
			before any tool runs. Many harnesses let you pre-approve read-only tools
			like this one, but that policy decision still lives in the harness, never
			in the protocol.`,
		specHref: 'https://modelcontextprotocol.io/specification/draft#security-and-trust--safety',
		specLabel: 'Spec: Security principles',
	},
	{
		n: 6,
		act: 'call',
		from: 'client',
		to: 'server',
		title: 'The whole protocol in one request',
		short: 'tools/call (no auth)',
		summary: `This is MCP at its most minimal, and in the 2026-07-28 draft it
			really is <em>one</em> request. No <code>initialize</code> handshake, no
			session, and, because Pinehill leaves availability public, no
			<code>Authorization</code> header either. Authorization is optional in
			MCP. The request carries its own protocol version, identity, and
			capabilities in <code>_meta</code>, and mirrors its method and tool name
			into HTTP headers so intermediaries can route without parsing JSON.`,
		payloadLabel: 'The full request',
		payload: `POST /mcp HTTP/1.1
Host: cabins.example.com
Accept: application/json, text/event-stream
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: check_availability

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "check_availability",
    "arguments": {
      "checkIn": "2026-07-24",
      "checkOut": "2026-07-26"
    },
    ${META_BLOCK}
  }
}`,
		news: [
			{ label: 'New: stateless, no initialize (SEP-2575)', href: sep(2575) },
			{ label: 'New: Mcp-Method / Mcp-Name headers (SEP-2243)', href: sep(2243) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/transports/streamable-http',
		specLabel: 'Spec: Streamable HTTP',
	},
	{
		n: 7,
		act: 'call',
		from: 'server',
		to: 'client',
		title: 'A plain JSON answer',
		short: 'result: complete',
		summary: `The server decides per request whether to answer with a single
			JSON object or an SSE stream. A fast lookup needs no streaming, so this
			one comes back as plain JSON. The result carries human-readable content
			for the model and <code>structuredContent</code> for anything downstream
			that would rather not parse prose.`,
		payloadLabel: 'The response',
		payload: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "complete",
    "content": [
      { "type": "text",
        "text": "2 cabins available Jul 24-26: Lakeside ($412.50 total) and Ridge ($318.00 total)." }
    ],
    "structuredContent": {
      "available": [
        { "id": "pinehill-lakeside", "total": 412.5, "currency": "USD" },
        { "id": "pinehill-ridge",    "total": 318.0, "currency": "USD" }
      ]
    }
  }
}`,
	},
	{
		n: 8,
		act: 'return',
		from: 'host',
		to: 'model',
		title: 'The result rejoins the conversation',
		short: 'tool_result to model',
		summary: `The harness folds the tool result back into the conversation and
			calls the model again. From the model's point of view, steps 5 through 7
			collapse into a single <code>tool_result</code> block, and its reply is
			ordinary assistant text.`,
		payloadLabel: 'The tool_result block',
		payload: `{
  "role": "user",
  "content": [
    { "type": "tool_result", "tool_use_id": "toolu_01",
      "content": "2 cabins available Jul 24-26: Lakeside ($412.50 total) and Ridge ($318.00 total)." }
  ]
}`,
		response: {
			short: 'assistant text',
		},
	},
	{
		n: 9,
		act: 'return',
		from: 'host',
		to: 'user',
		title: 'The reply',
		short: 'final answer',
		summary: `The model writes the answer and the harness shows it to you. Two
			cabins, two round trips to the model, one stateless request on the wire.
			This is the skeleton every other storyline decorates.`,
		payloadLabel: 'What you read',
		payload: `Two cabins are free July 24 to 26: the Lakeside cabin
($412.50 total) and the Ridge cabin ($318.00 total).`,
	},
];

// ═══════════════════════════════════════════════════════════════════════════
// Setup timeline 1: first contact (runs once, the day you add the server)
// ═══════════════════════════════════════════════════════════════════════════

const STEPS_MEET: Step[] = [
	{
		n: 1,
		act: 'probe',
		kind: 'note',
		at: ['user', 'host'],
		icon: '🛠️',
		title: 'You add Pinehill to your harness',
		short: 'you add the server to your MCP config',
		summary: `At this moment, Pinehill is one URL in a config file. That is all
			a server ever starts as. No spec governs this file; it is pure harness
			territory. Everything else about the server, its protocol version, its
			capabilities, and the authorization server guarding it, gets discovered
			from that URL.`,
		payloadLabel: 'The entire configuration',
		payload: `// ~/.config/agentapp/mcp.json
{
  "mcpServers": {
    "pinehill": {
      "url": "https://cabins.example.com/mcp"
    }
  }
}`,
	},
	{
		n: 2,
		act: 'probe',
		from: 'client',
		to: 'server',
		title: 'Asking the server what it speaks',
		short: 'server/discover',
		summary: `The one discovery RPC in the protocol, and it is new: every
			server must implement <code>server/discover</code>, and a client may
			call it before anything else to learn the supported protocol versions
			and capabilities up front. It also doubles as a backward-compatibility
			probe: a server that chokes on it is speaking an older,
			handshake-era version of MCP.`,
		payloadLabel: 'The request',
		payload: `POST /mcp HTTP/1.1
Host: cabins.example.com
Accept: application/json, text/event-stream
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: server/discover

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "server/discover",
  "params": {
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'versions + capabilities',
			payloadLabel: 'The response',
			payload: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "complete",
    "serverInfo": { "name": "pinehill-cabins", "version": "2.1.0" },
    "protocolVersions": ["2026-07-28"],
    "capabilities": {
      "tools": { "listChanged": true },
      "extensions": { "io.modelcontextprotocol/tasks": {} }
    }
  }
}`,
		},
		news: [
			{ label: 'New: server/discover', href: 'https://modelcontextprotocol.io/specification/draft/server/discover' },
			{ label: 'SEP-2575', href: 'https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575' },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/architecture',
		specLabel: 'Spec: Architecture',
	},
	{
		n: 3,
		act: 'probe',
		from: 'client',
		to: 'server',
		title: 'Is this server guarded?',
		short: 'protected resource metadata',
		summary: `The client fetches the protected resource metadata document
			(RFC 9728) from its well-known location. It names the authorization
			server that can issue tokens for this MCP server, and the scopes on
			offer. The MCP server declares who it trusts; it does not issue tokens
			itself. A lazier client could skip this and wait for its first 401,
			whose <code>WWW-Authenticate</code> header points at this same document.
			Harnesses front-load it because a sign-in dialog is friendlier the day
			you add a server than in the middle of a task.`,
		payloadLabel: 'The request',
		payload: `GET /.well-known/oauth-protected-resource HTTP/1.1
Host: cabins.example.com`,
		response: {
			short: 'authorization server + scopes',
			payloadLabel: 'Protected resource metadata',
			payload: `{
  "resource": "https://cabins.example.com/mcp",
  "authorization_servers": ["https://auth.pinehill.example"],
  "scopes_supported": ["bookings:read", "bookings:write"]
}`,
		},
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/authorization',
		specLabel: 'Spec: Authorization',
	},
	{
		n: 4,
		act: 'probe',
		from: 'client',
		to: 'auth',
		title: 'Reading the auth server’s capabilities',
		short: 'AS metadata discovery',
		summary: `Next stop is the authorization server's own metadata (RFC 8414).
			Two flags matter for what happens next:
			<code>client_id_metadata_document_supported</code> means the client will
			not need to register at all, and
			<code>authorization_response_iss_parameter_supported</code> announces
			that responses will carry an issuer identifier the client must verify.
			The client records the <code>issuer</code> value now; step 9 depends on
			it being authentic.`,
		payloadLabel: 'The request',
		payload: `GET /.well-known/oauth-authorization-server HTTP/1.1
Host: auth.pinehill.example`,
		response: {
			short: 'endpoints + policy flags',
			payloadLabel: 'Authorization server metadata',
			payload: `{
  "issuer": "https://auth.pinehill.example",
  "authorization_endpoint": "https://auth.pinehill.example/authorize",
  "token_endpoint": "https://auth.pinehill.example/token",
  "client_id_metadata_document_supported": true,
  "authorization_response_iss_parameter_supported": true,
  "code_challenge_methods_supported": ["S256"]
}`,
		},
	},
	{
		n: 5,
		act: 'introduce',
		kind: 'note',
		at: ['client'],
		icon: '🪪',
		title: 'Registration without registering',
		short: 'the client_id is a URL (CIMD)',
		summary: `Here is one of my favorite changes in this release. The client
			never registers. Its <code>client_id</code> is an HTTPS URL pointing at
			a JSON document the client hosts about itself: a Client ID Metadata
			Document. The spec has two other registration mechanisms, and this
			timeline shows neither: pre-registered credentials (for clients and
			servers with an existing relationship) and Dynamic Client Registration,
			the old POST-to-register dance, which is now deprecated and kept only
			for backwards compatibility. CIMD is the recommended path when a client
			and server have never met, which is the normal case in MCP. A CIMD
			identity is also portable: if Pinehill ever switches auth servers,
			nothing needs to be re-registered.`,
		payloadLabel: 'The client metadata document',
		payload: `// hosted by the client at
// https://agentapp.example/oauth/client-metadata.json

{
  "client_id": "https://agentapp.example/oauth/client-metadata.json",
  "client_name": "AgentApp",
  "redirect_uris": ["http://127.0.0.1:33418/callback"],
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none"
}`,
		news: [
			{ label: 'Deprecated: DCR', href: 'https://modelcontextprotocol.io/specification/draft/deprecated#deprecated' },
			{ label: 'PR #2858', href: 'https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2858' },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/authorization/client-registration',
		specLabel: 'Spec: Client registration',
	},
	{
		n: 6,
		act: 'introduce',
		from: 'client',
		to: 'user',
		title: 'Your browser opens',
		short: 'authorization request (PKCE)',
		summary: `The client builds the authorization URL and hands it to your
			browser. Three protections travel with it: a PKCE challenge (so an
			intercepted code is useless), a <code>resource</code> parameter naming
			the exact MCP server this token is for (RFC 8707, so the token cannot
			be replayed elsewhere), and the scopes. With no 401 challenge to guide
			it yet, the client asks for the <code>scopes_supported</code> it read
			in step 3, exactly as the spec's scope selection strategy prescribes.`,
		payloadLabel: 'The authorization URL',
		payload: `https://auth.pinehill.example/authorize
  ?response_type=code
  &client_id=https%3A%2F%2Fagentapp.example%2Foauth%2Fclient-metadata.json
  &redirect_uri=http%3A%2F%2F127.0.0.1%3A33418%2Fcallback
  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  &code_challenge_method=S256
  &resource=https%3A%2F%2Fcabins.example.com%2Fmcp
  &scope=bookings%3Aread%20bookings%3Awrite
  &state=af0ifjsldkj`,
	},
	{
		n: 7,
		act: 'introduce',
		from: 'auth',
		to: 'client',
		title: 'The auth server reads your metadata',
		short: 'AS fetches client-metadata.json',
		summary: `The authorization server sees a URL-shaped <code>client_id</code>
			in the request and fetches the document behind it. It checks that the
			<code>client_id</code> inside matches the URL exactly and that the
			redirect URI from the authorization request is on the document's list.
			This fetch is the entire "registration": publish a JSON file, and every
			authorization server in the world can look you up.`,
		payloadLabel: 'The fetch',
		payload: `GET /oauth/client-metadata.json HTTP/1.1
Host: agentapp.example`,
		response: {
			short: 'the metadata document',
			payloadLabel: 'What comes back, and what gets validated',
			payload: `{
  "client_id": "https://agentapp.example/oauth/client-metadata.json",
  "client_name": "AgentApp",
  "client_uri": "https://agentapp.example",
  "redirect_uris": ["http://127.0.0.1:33418/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "scope": "mcp"
}

// the AS validates:
//  1. document is valid JSON with required fields
//  2. client_id inside === the URL it fetched
//  3. redirect_uri from the request is in redirect_uris`,
		},
		news: [
			{ label: 'Deprecated: DCR', href: 'https://modelcontextprotocol.io/specification/draft/deprecated#deprecated' },
			{ label: 'PR #2858', href: 'https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2858' },
		],
	},
	{
		n: 8,
		act: 'introduce',
		from: 'user',
		to: 'auth',
		title: 'You approve, once',
		short: 'user consents at AS',
		summary: `The consent page shows the client name from the metadata
			document fetched in step 7. You log in and approve. This is the only
			appearance your Pinehill credentials make in any of these timelines,
			and the harness never sees them; that is the entire point of the OAuth
			arrangement.`,
	},
	{
		n: 9,
		act: 'introduce',
		from: 'auth',
		to: 'client',
		title: 'The code comes back, with proof of origin',
		short: 'callback + iss check',
		summary: `The redirect lands on the client's local callback with the
			authorization code and an <code>iss</code> parameter. Before redeeming
			the code anywhere, the client compares <code>iss</code> against the
			issuer it recorded in step 4, byte for byte. This closes a mix-up
			attack where a malicious authorization server tricks a client into
			sending a code to the wrong token endpoint.`,
		payloadLabel: 'The callback',
		payload: `http://127.0.0.1:33418/callback
  ?code=SplxlOBeZQQYbYS6WxSbIA
  &state=af0ifjsldkj
  &iss=https%3A%2F%2Fauth.pinehill.example

// client check, before anything else:
assert(params.iss === recordedIssuer)`,
		news: [
			{ label: 'New: iss validation required (SEP-2468)', href: sep(2468) },
		],
	},
	{
		n: 10,
		act: 'introduce',
		from: 'client',
		to: 'auth',
		title: 'Code becomes token, token gets a home',
		short: 'token exchange + storage',
		summary: `The client trades the code (plus the PKCE verifier and the same
			<code>resource</code> parameter) for an access token and a refresh
			token. Where they land matters: the client's token store is keyed by
			the authorization server's issuer identifier. If the Pinehill server
			ever points at a different auth server, these credentials must never be
			reused there. That binding is now a hard requirement. From here on, the
			token rides silently on every request, and the refresh token keeps this
			whole timeline from ever running again.`,
		payloadLabel: 'The token request',
		payload: `POST /token HTTP/1.1
Host: auth.pinehill.example
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=SplxlOBeZQQYbYS6WxSbIA
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
&client_id=https%3A%2F%2Fagentapp.example%2Foauth%2Fclient-metadata.json
&redirect_uri=http%3A%2F%2F127.0.0.1%3A33418%2Fcallback
&resource=https%3A%2F%2Fcabins.example.com%2Fmcp`,
		response: {
			short: 'access + refresh token',
			payloadLabel: 'Token response, and where it goes',
			payload: `{
  "access_token": "eyJhbGciOiJFUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "8xLOxBtZp8",
  "scope": "bookings:read bookings:write"
}

// token store (client side, encrypted at rest)
{
  "https://auth.pinehill.example": {
    "resource": "https://cabins.example.com/mcp",
    "access_token": "eyJhbGciOiJFUzI1NiIs...",
    "refresh_token": "8xLOxBtZp8"
  }
}`,
		},
		news: [
			{ label: 'New: credentials keyed by issuer (SEP-2352)', href: sep(2352) },
		],
	},
];

// ═══════════════════════════════════════════════════════════════════════════
// Setup timeline 2: session start (runs when the harness boots)
// ═══════════════════════════════════════════════════════════════════════════

const STEPS_CONTEXT: Step[] = [
	{
		n: 1,
		act: 'session',
		kind: 'note',
		at: ['host'],
		icon: '📄',
		title: 'A new session begins',
		short: 'harness reads its MCP config',
		summary: `You open the harness and it reads its config: which servers this
			session may talk to. Like the file itself, this moment belongs entirely
			to the harness. The protocol has nothing to say about how servers are
			chosen, and that is a feature: the host decides what exists, the
			protocol only decides how to talk to it.`,
		payloadLabel: 'What the harness reads',
		payload: `// ~/.config/agentapp/mcp.json
{
  "mcpServers": {
    "pinehill": {
      "url": "https://cabins.example.com/mcp"
    }
  }
}`,
	},
	{
		n: 2,
		act: 'session',
		from: 'client',
		to: 'server',
		title: 'Tool discovery, stateless like everything else',
		short: 'tools/list',
		summary: `The client asks the server what tools it has. Under every
			previous revision this request would have been illegal: you had to
			<code>initialize</code> first, negotiate capabilities, and possibly
			carry a session id. All of that is gone. The request is entirely
			self-contained, with the protocol version, client identity, and client
			capabilities riding in <code>_meta</code>, and the token from first
			contact in the <code>Authorization</code> header.`,
		payloadLabel: 'The full request',
		payload: `POST /mcp HTTP/1.1
Host: cabins.example.com
Authorization: Bearer eyJhbGciOiJFUzI1NiIs...
Accept: application/json, text/event-stream
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/list

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {
    ${META_BLOCK}
  }
}`,
		news: [
			{ label: 'New: stateless, no initialize (SEP-2575)', href: sep(2575) },
			{ label: 'New: Mcp-Method header (SEP-2243)', href: sep(2243) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/transports/streamable-http',
		specLabel: 'Spec: Streamable HTTP',
	},
	{
		n: 3,
		act: 'session',
		from: 'server',
		to: 'client',
		title: 'A tool list with a shelf life',
		short: 'tools + ttlMs',
		summary: `The response carries the tool schemas plus two new fields:
			<code>ttlMs</code>, a freshness hint that lets the client cache instead
			of re-asking, and <code>cacheScope</code>, which says whether shared
			intermediaries may cache it too. The spec also asks servers to return
			tools in a deterministic order, for an unglamorous but very real
			reason: stable ordering keeps the model provider's prompt cache warm.`,
		payloadLabel: 'The tools/list result',
		payload: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "complete",
    "ttlMs": 3600000,
    "cacheScope": "private",
    "tools": [
      {
        "name": "book_cabin",
        "description": "Book a cabin at any Pinehill property.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "property":      { "type": "string" },
            "checkIn":       { "type": "string", "format": "date" },
            "checkOut":      { "type": "string", "format": "date" },
            "paymentMethod": { "type": "string" },
            "calendar":      { "type": "string", "enum": ["google_calendar", "outlook", "calconnect"] }
          },
          "required": ["property", "checkIn", "checkOut"]
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "confirmation": { "type": "string" },
            "property":     { "type": "string" },
            "checkIn":      { "type": "string", "format": "date" },
            "checkOut":     { "type": "string", "format": "date" },
            "total":        { "type": "number" },
            "currency":     { "type": "string" },
            "earlyCheckIn": { "type": "string" }
          },
          "required": ["confirmation", "property", "checkIn", "checkOut", "total", "currency"]
        }
      },
      {
        "name": "check_availability",
        "description": "List available Pinehill cabins for a date range.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "checkIn":  { "type": "string", "format": "date" },
            "checkOut": { "type": "string", "format": "date" }
          },
          "required": ["checkIn", "checkOut"]
        }
      }
    ]
  }
}`,
		news: [
			{ label: 'New: ttlMs + cacheScope (SEP-2549)', href: sep(2549) },
			{ label: 'New: resultType on every result (SEP-2322)', href: sep(2322) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/server/tools',
		specLabel: 'Spec: Tools',
	},
	{
		n: 4,
		act: 'session',
		kind: 'note',
		at: ['client'],
		icon: '🗂️',
		title: 'Cached for the next hour',
		short: 'schemas cached until ttl lapses',
		summary: `The client files the schemas away with their expiry. This little
			note is why none of the three storylines below re-fetch the tool list:
			for the next hour, tool discovery is free. When the ttl lapses, or a
			<code>tools/list_changed</code> notification arrives on a subscription,
			the client asks again.`,
	},
	{
		n: 5,
		act: 'session',
		kind: 'note',
		at: ['host', 'model'],
		icon: '🧾',
		title: 'The schemas join the model’s world',
		short: 'tool schemas enter the system prompt',
		summary: `The handoff. The harness folds the tool definitions into what the
			model will see, and this is the exact boundary where MCP ends: the
			model never speaks the protocol, never sees a URL or a token. The first
			time it learns Pinehill exists is as a JSON schema sitting in its
			context. Everything the model will ever know about this server passes
			through this note.`,
		payloadLabel: 'What the model will receive (provider format)',
		payload: `{
  "system": "You are AgentApp. You can call tools when useful.",
  "tools": [
    {
      "name": "book_cabin",
      "input_schema": {
        "type": "object",
        "properties": {
          "property":      { "type": "string" },
          "checkIn":       { "type": "string", "format": "date" },
          "checkOut":      { "type": "string", "format": "date" },
          "paymentMethod": { "type": "string" },
          "calendar":      { "type": "string", "enum": ["google_calendar", "outlook", "calconnect"] }
        },
        "required": ["property", "checkIn", "checkOut"]
      }
    },
    {
      "name": "check_availability",
      "input_schema": {
        "type": "object",
        "properties": {
          "checkIn":  { "type": "string", "format": "date" },
          "checkOut": { "type": "string", "format": "date" }
        },
        "required": ["checkIn", "checkOut"]
      }
    }
  ]
}`,
	},
];

// ═══════════════════════════════════════════════════════════════════════════
// Storyline B: a tool behind server auth
// ═══════════════════════════════════════════════════════════════════════════

const STEPS_SERVER: Step[] = [
	{
		n: 1,
		act: 'before',
		from: 'user',
		to: 'host',
		title: 'The prompt arrives',
		short: 'prompt',
		summary: `One sentence from you, and this time it spends money. Everything
			below this point is machinery reacting to it. The harness owns this
			moment: it decides what context to assemble, which servers are relevant,
			and what the model gets to see.`,
		payloadLabel: 'The entire input',
		payload: `Book the lakeside cabin at Pinehill for the team offsite,
July 24 to 26, on the company card.`,
	},
	{
		n: 2,
		act: 'before',
		kind: 'note',
		at: ['client'],
		icon: '🗂️',
		title: 'Tool definitions come from cache',
		short: 'tool schemas served from cache',
		summary: `The harness needs tool schemas to hand to the model, and nothing
			crosses the wire to get them. The MCP client fetched the tool list from
			the Pinehill server at session start, and the server stamped that
			<code>tools/list</code> response with a freshness hint. One hour has not
			passed, so the client serves the schemas from its own cache.
			<code>ttlMs</code> and <code>cacheScope</code> are new fields that make
			list results cacheable, and deterministic tool ordering keeps the
			model's prompt cache warm too.`,
		payloadLabel: 'The cached tools/list result',
		payload: `{
  "resultType": "complete",
  "ttlMs": 3600000,
  "cacheScope": "private",
  "tools": [
    {
      "name": "book_cabin",
      "description": "Book a cabin at any Pinehill property.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "property":      { "type": "string" },
          "checkIn":       { "type": "string", "format": "date" },
          "checkOut":      { "type": "string", "format": "date" },
          "paymentMethod": { "type": "string" }
        },
        "required": ["property", "checkIn", "checkOut"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "confirmation": { "type": "string" },
          "property":     { "type": "string" },
          "checkIn":      { "type": "string", "format": "date" },
          "checkOut":     { "type": "string", "format": "date" },
          "total":        { "type": "number" },
          "currency":     { "type": "string" },
          "earlyCheckIn": { "type": "string" }
        },
        "required": ["confirmation", "property", "checkIn", "checkOut", "total", "currency"]
      }
    },
    {
      "name": "check_availability",
      "description": "List available Pinehill cabins for a date range.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "checkIn":  { "type": "string", "format": "date" },
          "checkOut": { "type": "string", "format": "date" }
        },
        "required": ["checkIn", "checkOut"]
      }
    }
  ]
}`,
		news: [
			{ label: 'New: ttlMs + cacheScope (SEP-2549)', href: sep(2549) },
			{ label: 'New: resultType on every result (SEP-2322)', href: sep(2322) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/server/tools',
		specLabel: 'Spec: Tools',
	},
	{
		n: 3,
		act: 'before',
		from: 'host',
		to: 'model',
		title: 'The model sees the prompt and the schemas',
		short: 'prompt + tool schemas',
		summary: `The harness sends the conversation plus the <em>full</em> tool
			catalog to the LLM provider, both <code>book_cabin</code> and
			<code>check_availability</code>, not just the one this task happens to need.
			The harness has no way to know in advance which tool the model will pick, so
			it forwards all of them every time; choosing is the model's job. Note what
			the model does <em>not</em> see: no tokens, no server URLs, no protocol
			details. MCP stops at the harness boundary; the model API is a different
			protocol entirely.`,
		payloadLabel: 'The model request (provider format)',
		payload: `{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "Book the lakeside cabin at Pinehill for the team offsite, July 24 to 26, on the company card."
    }
  ],
  "tools": [
    {
      "name": "book_cabin",
      "description": "Book a cabin at any Pinehill property.",
      "input_schema": {
        "type": "object",
        "properties": {
          "property":      { "type": "string" },
          "checkIn":       { "type": "string", "format": "date" },
          "checkOut":      { "type": "string", "format": "date" },
          "paymentMethod": { "type": "string" },
          "calendar":      { "type": "string", "enum": ["google_calendar", "outlook", "calconnect"] }
        },
        "required": ["property", "checkIn", "checkOut"]
      }
    },
    {
      "name": "check_availability",
      "description": "List available Pinehill cabins for a date range.",
      "input_schema": {
        "type": "object",
        "properties": {
          "checkIn":  { "type": "string", "format": "date" },
          "checkOut": { "type": "string", "format": "date" }
        },
        "required": ["checkIn", "checkOut"]
      }
    }
  ]
}`,
	},
	{
		n: 4,
		act: 'before',
		from: 'model',
		to: 'host',
		title: 'The model decides to call the tool',
		short: 'tool_use: book_cabin',
		summary: `The model answers with a structured tool call instead of text. It
			filled the arguments from the prompt. This is still not MCP: it is the
			model provider's tool calling format. The harness now has to translate
			this intent into a protocol request.`,
		payloadLabel: 'The tool_use block',
		payload: `{
  "type": "tool_use",
  "id": "toolu_01",
  "name": "book_cabin",
  "input": {
    "property": "pinehill-lakeside",
    "checkIn": "2026-07-24",
    "checkOut": "2026-07-26",
    "paymentMethod": "company_card"
  }
}`,
	},
	{
		n: 5,
		act: 'before',
		kind: 'note',
		at: ['user', 'host'],
		icon: '✅',
		title: 'The consent gate',
		short: 'you approve the tool call',
		summary: `Before anything touches the wire, the harness asks you. The spec
			is explicit that this responsibility belongs to the host: users must
			explicitly consent before any tool runs, and tool descriptions are
			untrusted input unless they come from a trusted server. You click
			approve. The MCP client takes over from here.`,
		specHref: 'https://modelcontextprotocol.io/specification/draft#security-and-trust--safety',
		specLabel: 'Spec: Security principles',
	},
	{
		n: 6,
		act: 'call',
		from: 'client',
		to: 'server',
		title: 'The real tools/call, no handshake needed',
		short: 'tools/call (stateless)',
		summary: `This is the single most important message in the post, so it is
			worth reading in full. Notice what is <em>missing</em>: there was no
			<code>initialize</code> handshake, no session to join, no connection
			warm-up. The request is entirely self-contained. The protocol version,
			client identity, and client capabilities ride in <code>_meta</code> on
			this very request. The headers mirror body fields so load balancers can
			route on <code>Mcp-Method</code> and <code>Mcp-Name</code> without
			parsing JSON, and the server must reject the request if they disagree
			with the body. The trace context in <code>_meta</code> lets Pinehill's
			observability stack join this request to the harness's trace. The
			token earned at first contact rides in the Authorization header; had
			it expired, the client would refresh silently, and a 401 would simply
			rerun the first-contact dance.`,
		payloadLabel: 'The full request',
		payload: `POST /mcp HTTP/1.1
Host: cabins.example.com
Authorization: Bearer eyJhbGciOiJFUzI1NiIs...
Accept: application/json, text/event-stream
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: book_cabin

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "book_cabin",
    "arguments": {
      "property": "pinehill-lakeside",
      "checkIn": "2026-07-24",
      "checkOut": "2026-07-26",
      "paymentMethod": "company_card"
    },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {
        "name": "AgentApp",
        "version": "3.2.0"
      },
      "io.modelcontextprotocol/clientCapabilities": {
        "elicitation": { "form": {}, "url": {} },
        "extensions": { "io.modelcontextprotocol/tasks": {} }
      },
      "progressToken": "bk-1",
      "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
    }
  }
}`,
		news: [
			{ label: 'New: stateless, no initialize (SEP-2575)', href: sep(2575) },
			{ label: 'New: Mcp-Method / Mcp-Name headers (SEP-2243)', href: sep(2243) },
			{ label: 'New: trace context in _meta (SEP-414)', href: sep(414) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/transports/streamable-http',
		specLabel: 'Spec: Streamable HTTP',
	},
	{
		n: 7,
		act: 'call',
		from: 'server',
		to: 'client',
		title: 'The response is a stream',
		short: 'SSE: progress',
		summary: `The server chooses to answer with a Server-Sent Events stream
			scoped to this one request. Progress notifications flow here because the
			client sent a <code>progressToken</code>. If this stream breaks, there is
			no resuming it: the client re-issues the request with a new id.
			Redelivery via <code>Last-Event-ID</code> left the protocol in this
			revision.`,
		payloadLabel: 'The stream so far',
		payload: `HTTP/1.1 200 OK
Content-Type: text/event-stream
X-Accel-Buffering: no

data: {"jsonrpc":"2.0","method":"notifications/progress",
       "params":{"progressToken":"bk-1","progress":1,
       "message":"Checking availability for Jul 24-26"}}`,
		news: [
			{ label: 'Changed: no stream resumability (SEP-2575)', href: sep(2575) },
		],
	},
	{
		n: 8,
		act: 'call',
		from: 'server',
		to: 'client',
		title: 'The server needs a human',
		short: 'result: input_required',
		summary: `The cabin is available, but the server needs two things before it
			books, and it bundles both into one <code>InputRequiredResult</code>: a
			<em>form</em> elicitation for the reservation options it can safely collect
			in-band (early check-in), and a <em>URL</em> elicitation for the payment.
			Payment goes through URL mode on purpose. Card details are exactly the
			confidential data the spec says must never pass through the MCP client or
			the model, so the server sends you to its own secure page rather than
			asking for them in a form. In every previous MCP version the server would
			have sent its own <code>elicitation/create</code> request back up the
			stream; it cannot do that anymore. Instead it ends the request with
			<code>resultType: "input_required"</code> plus a <code>requestState</code>
			blob, the server's encrypted memory of this half-finished booking, handed
			to the client for safekeeping. The server can now forget the request
			entirely, and any replica can pick up the retry.`,
		payloadLabel: 'The InputRequiredResult',
		payload: `data: {
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "input_required",
    "inputRequests": {
      "reservation_options": {
        "method": "elicitation/create",
        "params": {
          "mode": "form",
          "message": "Lakeside cabin is available Jul 24-26. Any extras for the reservation?",
          "requestedSchema": {
            "type": "object",
            "properties": {
              "earlyCheckIn": {
                "type": "boolean",
                "title": "Request early check-in"
              }
            }
          }
        }
      },
      "payment": {
        "method": "elicitation/create",
        "params": {
          "mode": "url",
          "url": "https://cabins.example.com/pay?e=3d9f1c",
          "message": "Confirm and pay for the booking ($412.50) on Pinehill's secure page."
        }
      }
    },
    "requestState": "v1.gcm.9yKX0jPmYQ4kFhk3...hT2w"
  }
}`,
		news: [
			{ label: 'New: MRTR replaces server-initiated requests (SEP-2322)', href: sep(2322) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/patterns/mrtr',
		specLabel: 'Spec: Multi Round-Trip Requests',
	},
	{
		n: 9,
		act: 'mrtr',
		kind: 'note',
		at: ['user', 'host'],
		icon: '📝',
		title: 'The form and the payment link reach you',
		short: 'you pick options and pay',
		summary: `The MCP client hands both elicitations to the harness, which renders
			them however it likes: a dialog, a terminal prompt, a mobile notification.
			You tick the early-check-in box and open the payment link, which takes you
			to Pinehill's own secure page to complete the charge. The card number is
			entered there, never in the harness, so it never reaches the MCP client or
			the model. The model is not in this loop at all, and the form's requested
			schema is restricted to flat primitives precisely so any harness can render
			it.`,
		payloadLabel: 'Your answers, as ElicitResults',
		payload: `{
  "reservation_options": {
    "action": "accept",
    "content": { "earlyCheckIn": true }
  },
  "payment": {
    "action": "accept"
  }
}`,
	},
	{
		n: 10,
		act: 'mrtr',
		from: 'client',
		to: 'server',
		title: 'The same call, retried with answers',
		short: 'tools/call retry + requestState',
		summary: `The client retries the original <code>tools/call</code> with a
			new JSON-RPC id, the original arguments, your answers keyed exactly as
			the server asked, and the <code>requestState</code> blob echoed back
			untouched. The client must not peek inside it. The server that receives
			this retry might be a different process on a different machine than the
			one that answered in step 8. It does not matter. Everything it needs is
			in the request.`,
		payloadLabel: 'The retry',
		payload: `{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "book_cabin",
    "arguments": {
      "property": "pinehill-lakeside",
      "checkIn": "2026-07-24",
      "checkOut": "2026-07-26",
      "paymentMethod": "company_card"
    },
    "inputResponses": {
      "reservation_options": {
        "action": "accept",
        "content": { "earlyCheckIn": true }
      },
      "payment": {
        "action": "accept"
      }
    },
    "requestState": "v1.gcm.9yKX0jPmYQ4kFhk3...hT2w",
    ${META_BLOCK}
  }
}`,
		news: [
			{ label: 'New: MRTR retry with inputResponses (SEP-2322)', href: sep(2322) },
		],
	},
	{
		n: 11,
		act: 'tail',
		from: 'server',
		to: 'client',
		title: 'A task instead of an answer',
		short: 'result: task handle',
		summary: `Pinehill requires the property manager to confirm bookings, and
			that can take minutes. Holding an HTTP connection open that long is
			asking for a timeout. Because the client declared the tasks extension in
			its capabilities back in step 6, the server may answer with a durable
			task handle instead of a result. Tasks moved out of the core protocol
			into the <code>io.modelcontextprotocol/tasks</code> extension in this
			release, redesigned around polling.`,
		payloadLabel: 'The CreateTaskResult',
		payload: `{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "resultType": "task",
    "taskId": "task-7f3a2b",
    "status": "working",
    "statusMessage": "Booking sent to the property for confirmation",
    "createdAt": "2026-07-09T15:04:02Z",
    "lastUpdatedAt": "2026-07-09T15:04:02Z",
    "ttlMs": 86400000,
    "pollIntervalMs": 5000
  }
}`,
		news: [
			{ label: 'New: tasks as an extension (SEP-2663)', href: sep(2663) },
		],
		specHref: 'https://modelcontextprotocol.io/extensions/tasks/overview',
		specLabel: 'Extension: Tasks',
	},
	{
		n: 12,
		act: 'tail',
		from: 'client',
		to: 'server',
		title: 'Polling, politely',
		short: 'tasks/get → working',
		summary: `The client polls <code>tasks/get</code> at the suggested
			interval. Each poll is an ordinary stateless request carrying the same
			<code>_meta</code> identity block as everything else. The task id is a
			durable handle: if the harness crashes and restarts, it can resume
			polling with the same id. The blocking <code>tasks/result</code> method
			from the previous revision is gone.`,
		payloadLabel: 'The poll',
		payload: `{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tasks/get",
  "params": {
    "taskId": "task-7f3a2b",
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'status: working',
			payloadLabel: 'The answer',
			payload: `{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resultType": "complete",
    "taskId": "task-7f3a2b",
    "status": "working",
    "statusMessage": "Waiting for property manager",
    "createdAt": "2026-07-09T15:04:02Z",
    "lastUpdatedAt": "2026-07-09T15:04:07Z",
    "ttlMs": 86400000,
    "pollIntervalMs": 5000
  }
}`,
		},
	},
	{
		n: 13,
		act: 'tail',
		kind: 'note',
		at: ['server'],
		icon: '⏳',
		title: 'A human at Pinehill approves',
		short: 'a human at Pinehill approves',
		summary: `Nothing about this step is in any protocol, and that is why it is
			on the timeline. The property manager gets a notification, finishes
			their coffee, and clicks approve. The task machinery exists so that this
			entirely human pause does not hold an HTTP connection hostage. Between
			polls, the only trace of your booking anywhere in Pinehill's
			infrastructure is the durable task record.`,
	},
	{
		n: 14,
		act: 'tail',
		from: 'client',
		to: 'server',
		title: 'The booking lands',
		short: 'tasks/get (final poll)',
		summary: `A few polls later the task reaches a terminal state. The
			<code>result</code> field contains exactly what the original
			<code>tools/call</code> would have returned synchronously: human-readable
			content plus <code>structuredContent</code> that downstream code can
			consume without parsing prose.`,
		payloadLabel: 'The final poll',
		payload: `{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tasks/get",
  "params": {
    "taskId": "task-7f3a2b",
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'completed + result',
			payloadLabel: 'The final task state',
		payload: `{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "resultType": "complete",
    "taskId": "task-7f3a2b",
    "status": "completed",
    "statusMessage": "Booking confirmed by the property",
    "createdAt": "2026-07-09T15:04:02Z",
    "lastUpdatedAt": "2026-07-09T15:06:31Z",
    "ttlMs": 86400000,
    "result": {
      "resultType": "complete",
      "content": [
        { "type": "text",
          "text": "Booked: Lakeside cabin, Jul 24-26. Confirmation PH-58291. Early check-in requested." }
      ],
      "structuredContent": {
        "confirmation": "PH-58291",
        "property": "pinehill-lakeside",
        "checkIn": "2026-07-24",
        "checkOut": "2026-07-26",
        "total": 412.5,
        "currency": "USD",
        "earlyCheckIn": "requested"
      }
    }
  }
}`,
		},
	},
	{
		n: 15,
		act: 'tail',
		from: 'host',
		to: 'model',
		title: 'The result rejoins the conversation',
		short: 'tool_result to model',
		summary: `The harness folds the tool result back into the conversation and
			calls the model again. From the model's point of view, the whole
			adventure between steps 4 and 14 collapses into a single
			<code>tool_result</code> block. OAuth, elicitation, task polling: none of
			it exists in the model's world.`,
		payloadLabel: 'What the model sees',
		payload: `{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01",
      "content": "Booked: Lakeside cabin, Jul 24-26. Confirmation PH-58291. Early check-in requested."
    }
  ]
}`,
		response: {
			short: 'the confirmation text',
		},
	},
	{
		n: 16,
		act: 'tail',
		from: 'host',
		to: 'user',
		title: 'The reply',
		short: 'final answer',
		summary: `The model writes the confirmation message and the harness shows
			it to you. Fifteen events, three protocols (a model API,
			MCP, and SSE), three human checkpoints (you twice, a property
			manager once), and one durable task, all folded into what reads like a
			single chat message.`,
		payloadLabel: 'What you read',
		payload: `Done! I booked the Lakeside cabin at Pinehill for July 24 to 26
on the company card. Total was $412.50, confirmation code
PH-58291, and I requested early check-in for the team.`,
	},
];

// ═══════════════════════════════════════════════════════════════════════════
// Storyline C: third-party auth via URL mode elicitation
// ═══════════════════════════════════════════════════════════════════════════

const STEPS_THIRD: Step[] = [
	{
		n: 1,
		act: 'before',
		from: 'user',
		to: 'host',
		title: 'The prompt arrives',
		short: 'prompt',
		summary: `The booking part of this prompt is storyline B territory. The new
			words are "put it on the team calendar." The prompt never says <em>which</em>
			calendar; that comes from the user's saved preferences in the next step, and
			it turns out to be CalConnect, a service Pinehill integrates with but does
			not control. Someone will have to grant Pinehill access to it, and that
			someone is you.`,
		payloadLabel: 'The entire input',
		payload: `Book the lakeside cabin for the offsite and put it
on the team calendar.`,
	},
	{
		n: 2,
		act: 'before',
		from: 'host',
		to: 'model',
		title: 'Cache hit, and a preference the model can act on',
		short: 'prompt + tool schemas + prefs',
		summary: `Same opening as the other storylines, compressed: the tool schemas
			come out of the client's cache (still fresh, thanks to <code>ttlMs</code>),
			and the harness hands the model the full catalog, both Pinehill tools, as it
			always does (<code>check_availability</code> is shown here too, though this
			task will not use it). Two things the model sees together matter today.
			Pinehill's <code>book_cabin</code> takes a <code>calendar</code> parameter
			naming which calendar service to use, an enum of the providers Pinehill can
			integrate with; and the user's saved preferences, carried in the system
			prompt, say the team schedules on CalConnect. That pairing is what lets the
			next step fill the parameter with <code>calconnect</code> rather than Google
			Calendar or Outlook. The model is not guessing; it is following a stated
			preference.`,
		payloadLabel: 'What the model sees (provider format)',
		payload: `{
  "system": "You are AgentApp. The user's team uses CalConnect for shared calendars; prefer it for any calendar action. The company card is on file for payments.",
  "tools": [
    {
      "name": "book_cabin",
      "input_schema": {
        "type": "object",
        "properties": {
          "property":      { "type": "string" },
          "checkIn":       { "type": "string", "format": "date" },
          "checkOut":      { "type": "string", "format": "date" },
          "paymentMethod": { "type": "string" },
          "calendar":      { "type": "string", "enum": ["google_calendar", "outlook", "calconnect"] }
        },
        "required": ["property", "checkIn", "checkOut"]
      }
    },
    {
      "name": "check_availability",
      "input_schema": {
        "type": "object",
        "properties": {
          "checkIn":  { "type": "string", "format": "date" },
          "checkOut": { "type": "string", "format": "date" }
        },
        "required": ["checkIn", "checkOut"]
      }
    }
  ]
}`,
	},
	{
		n: 3,
		act: 'before',
		from: 'model',
		to: 'host',
		title: 'The model decides to call the tool',
		short: 'tool_use: book_cabin',
		summary: `One tool call covers both halves of the request. The model sets
			<code>calendar</code> to <code>calconnect</code>, the value it read from the
			user's preferences, not a guess and not the only option the tool offered.
			Whether Pinehill can actually reach that CalConnect account is not the
			model's problem: it emitted intent, and the protocol will sort out the
			permission.`,
		payloadLabel: 'The tool_use block',
		payload: `{
  "type": "tool_use",
  "id": "toolu_01",
  "name": "book_cabin",
  "input": {
    "property": "pinehill-lakeside",
    "checkIn": "2026-07-24",
    "checkOut": "2026-07-26",
    "paymentMethod": "company_card",
    "calendar": "calconnect"
  }
}`,
	},
	{
		n: 4,
		act: 'before',
		kind: 'note',
		at: ['user', 'host'],
		icon: '✅',
		title: 'The consent gate',
		short: 'you approve the tool call',
		summary: `You approve the tool call. Keep count of how many times you
			appear in this storyline: this is the first of four, which is exactly
			the point of running agents against systems that spend money and touch
			shared calendars.`,
	},
	{
		n: 5,
		act: 'call',
		from: 'client',
		to: 'server',
		title: 'tools/call with a warm token',
		short: 'tools/call (token reused)',
		summary: `You authorized this client back at first contact (the first setup
			timeline), so there is no 401 detour. The client looks up its token store
			by the auth server's issuer, refreshes if needed, and attaches the
			bearer token. The request is stateless as always, and the capability block
			earns its keep today: the client declares <code>form</code> and
			<code>url</code> elicitation <em>and</em> the tasks extension, because this
			one call will use all three before it is done. Servers must never send an
			elicitation mode, or a task, the client did not declare.`,
		payloadLabel: 'The full request',
		payload: `POST /mcp HTTP/1.1
Host: cabins.example.com
Authorization: Bearer eyJhbGciOiJFUzI1NiIs...
Accept: application/json, text/event-stream
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: book_cabin

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "book_cabin",
    "arguments": {
      "property": "pinehill-lakeside",
      "checkIn": "2026-07-24",
      "checkOut": "2026-07-26",
      "paymentMethod": "company_card",
      "calendar": "calconnect"
    },
    ${META_BLOCK}
  }
}`,
		news: [
			{ label: 'New: stateless, no initialize (SEP-2575)', href: sep(2575) },
		],
	},
	{
		n: 6,
		act: 'call',
		from: 'server',
		to: 'client',
		title: 'First it needs your preferences',
		short: 'input_required: form (prefs)',
		summary: `The cabin is available, but before it sets anything up the server asks
			for the reservation preferences the model did not specify. These are
			ordinary, non-sensitive choices, so they go as a <em>form</em> elicitation,
			delivered the modern way: an <code>InputRequiredResult</code> on the
			<code>tools/call</code> itself, with a <code>requestState</code> blob the
			server hands the client for safekeeping. No payment and no calendar yet;
			those are confidential, and they come later, from inside the task.`,
		payloadLabel: 'The InputRequiredResult',
		payload: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "input_required",
    "inputRequests": {
      "booking_prefs": {
        "method": "elicitation/create",
        "params": {
          "mode": "form",
          "message": "Lakeside cabin is available Jul 24-26. A few preferences for the team:",
          "requestedSchema": {
            "type": "object",
            "properties": {
              "earlyCheckIn": {
                "type": "boolean",
                "title": "Request early check-in"
              },
              "groundFloor": {
                "type": "boolean",
                "title": "Prefer a ground-floor unit"
              }
            }
          }
        }
      }
    },
    "requestState": "v1.gcm.Qm9va2luZ1N0YXRl...c3Rz"
  }
}`,
		news: [
			{ label: 'New: MRTR replaces server-initiated requests (SEP-2322)', href: sep(2322) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/basic/patterns/mrtr',
		specLabel: 'Spec: Multi Round-Trip Requests',
	},
	{
		n: 7,
		act: 'call',
		from: 'client',
		to: 'server',
		title: 'You pick, the client retries',
		short: 'tools/call retry + prefs',
		summary: `The harness renders the form, you tick early check-in, and the client
			retries the original call with your answer keyed under
			<code>booking_prefs</code> and the <code>requestState</code> echoed back
			untouched. This is the pre-task exchange, resolved in-band on a
			<code>tools/call</code> retry: everything the server needs to <em>start</em>
			the work is now in hand.`,
		payloadLabel: 'The retry',
		payload: `{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "book_cabin",
    "arguments": {
      "property": "pinehill-lakeside",
      "checkIn": "2026-07-24",
      "checkOut": "2026-07-26",
      "paymentMethod": "company_card",
      "calendar": "calconnect"
    },
    "inputResponses": {
      "booking_prefs": {
        "action": "accept",
        "content": { "earlyCheckIn": true, "groundFloor": false }
      }
    },
    "requestState": "v1.gcm.Qm9va2luZ1N0YXRl...c3Rz",
    ${META_BLOCK}
  }
}`,
		news: [
			{ label: 'New: MRTR retry with inputResponses (SEP-2322)', href: sep(2322) },
		],
	},
	{
		n: 8,
		act: 'call',
		from: 'server',
		to: 'client',
		title: 'A task, not an answer',
		short: 'result: task handle',
		summary: `Booking the offsite is not instant: a property manager has to approve
			a group reservation, and payment and calendar access still have to be
			collected. Rather than hold the connection open, the server answers with a
			<code>CreateTaskResult</code> (<code>resultType: "task"</code>). The client
			declared the tasks extension back in step 5, so this is allowed. From here
			the conversation is polling, and the remaining asks arrive <em>from inside
			the task</em>.`,
		payloadLabel: 'The CreateTaskResult',
		payload: `{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "resultType": "task",
    "taskId": "task-9c2e",
    "status": "working",
    "statusMessage": "Sent to the property for approval",
    "createdAt": "2026-07-09T15:20:00Z",
    "lastUpdatedAt": "2026-07-09T15:20:00Z",
    "ttlMs": 86400000,
    "pollIntervalMs": 5000
  }
}`,
		news: [
			{ label: 'New: tasks as an extension (SEP-2663)', href: sep(2663) },
		],
		specHref: 'https://modelcontextprotocol.io/extensions/tasks/overview',
		specLabel: 'Extension: Tasks',
	},
	{
		n: 9,
		act: 'task',
		kind: 'note',
		at: ['server'],
		icon: '⏳',
		title: 'A human at Pinehill approves',
		short: 'a human at Pinehill approves',
		summary: `The task exists so this pause does not hold a connection hostage. A
			property manager reviews the group booking and approves it. This is a
			<em>different</em> human from you: the approval happens entirely on
			Pinehill's side, invisible to the harness. Once it clears, the task finally
			has something to ask you for, and it moves to <code>input_required</code>.`,
	},
	{
		n: 10,
		act: 'task',
		from: 'client',
		to: 'server',
		title: 'The poll comes back asking for payment',
		short: 'tasks/get → input_required: payment',
		summary: `The client has been polling <code>tasks/get</code> at the suggested
			interval. This time the task is no longer just <em>working</em>: it is
			<code>input_required</code> and carries an <code>inputRequests</code> map,
			the same shape you saw on the <code>tools/call</code> earlier, now surfaced
			through the task. The request inside is the payment, in URL mode, because
			card details must never pass through the client or the model.`,
		payloadLabel: 'The poll',
		payload: `{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tasks/get",
  "params": {
    "taskId": "task-9c2e",
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'input_required: payment',
			payloadLabel: 'The task, needing input',
			payload: `{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resultType": "complete",
    "taskId": "task-9c2e",
    "status": "input_required",
    "createdAt": "2026-07-09T15:20:00Z",
    "lastUpdatedAt": "2026-07-09T15:22:10Z",
    "ttlMs": 86400000,
    "inputRequests": {
      "payment": {
        "method": "elicitation/create",
        "params": {
          "mode": "url",
          "url": "https://cabins.example.com/pay?e=8f31a0",
          "message": "Approved. Pay for the booking ($412.50) on Pinehill's secure page."
        }
      }
    }
  }
}`,
		},
		news: [
			{ label: 'New: task input_required + inputRequests (SEP-2663)', href: sep(2663) },
		],
		specHref: 'https://modelcontextprotocol.io/extensions/tasks/overview',
		specLabel: 'Extension: Tasks',
	},
	{
		n: 11,
		act: 'task',
		from: 'client',
		to: 'server',
		title: 'You pay, the client updates the task',
		short: 'tasks/update: payment',
		summary: `The harness shows you the full URL, you open Pinehill's secure page in
			a real browser, and you pay. The card number is entered there, never in the
			harness, so it never reaches the MCP client or the model. Mid-task input
			does not go back on a <code>tools/call</code> retry the way the pre-task
			form did; it goes on <code>tasks/update</code>, keyed to the outstanding
			request. The server acknowledges with an empty result and the task returns
			to <em>working</em>.`,
		payloadLabel: 'The update',
		payload: `{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tasks/update",
  "params": {
    "taskId": "task-9c2e",
    "inputResponses": {
      "payment": {
        "action": "accept"
      }
    },
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'ack (working)',
			payloadLabel: 'The acknowledgement',
			payload: `{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "resultType": "complete"
  }
}`,
		},
		news: [
			{ label: 'New: tasks/update carries inputResponses (SEP-2663)', href: sep(2663) },
		],
	},
	{
		n: 12,
		act: 'task',
		from: 'client',
		to: 'server',
		title: 'The next poll asks for the calendar',
		short: 'tasks/get → input_required: calendar',
		summary: `Payment cleared, the task went back to work, and the next poll finds
			it <code>input_required</code> again, this time for calendar access. Same
			mechanism, second round: a URL elicitation inside the task's
			<code>inputRequests</code>. The URL points at Pinehill's own connect page,
			not CalConnect directly, which is the phishing defense you are about to
			see.`,
		payloadLabel: 'The poll',
		payload: `{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tasks/get",
  "params": {
    "taskId": "task-9c2e",
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'input_required: calendar',
			payloadLabel: 'The task, needing input again',
			payload: `{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "resultType": "complete",
    "taskId": "task-9c2e",
    "status": "input_required",
    "createdAt": "2026-07-09T15:20:00Z",
    "lastUpdatedAt": "2026-07-09T15:23:40Z",
    "ttlMs": 86400000,
    "inputRequests": {
      "connect_calendar": {
        "method": "elicitation/create",
        "params": {
          "mode": "url",
          "url": "https://cabins.example.com/connect?flow=calconnect&e=8f31a0",
          "message": "Connect your CalConnect calendar so Pinehill can add the offsite."
        }
      }
    }
  }
}`,
		},
	},
	{
		n: 13,
		act: 'task',
		from: 'user',
		to: 'cal',
		title: 'The OAuth flow you never see in the chat',
		short: 'browser: third-party OAuth',
		summary: `Your browser lands on Pinehill's connect page first, and that
			ordering is deliberate. The page checks that the person opening the link
			is the same Pinehill user who triggered the elicitation (a session
			cookie matched against the identity from the MCP authorization). Without
			that check, an attacker could send their elicitation URL to a victim and
			harvest the resulting grant. Only then does Pinehill redirect you to
			CalConnect's authorization endpoint, where you approve calendar access.
			In this leg Pinehill is the OAuth <em>client</em> and CalConnect is the
			authorization server; the MCP protocol is nowhere in sight.`,
	},
	{
		n: 14,
		act: 'task',
		from: 'server',
		to: 'cal',
		title: 'The token Pinehill keeps to itself',
		short: 'code exchange (server-side)',
		summary: `CalConnect redirects back to Pinehill's own
			<code>redirect_uri</code>, and Pinehill exchanges the code for tokens
			<em>server-side</em>, binding them to your Pinehill identity. Two hard
			rules from the spec meet here: the third-party credentials must never
			transit the MCP client, and the server must never reuse the MCP client's
			token against CalConnect (that would be token passthrough, which is
			forbidden). Two different tokens, two different trust relationships,
			stored on two different machines.`,
		payloadLabel: 'The token request (never seen by the MCP client)',
		payload: `POST /token HTTP/1.1
Host: auth.calconnect.example

grant_type=authorization_code
&code=cAl9xKt...
&redirect_uri=https%3A%2F%2Fcabins.example.com%2Foauth%2Fcallback
&client_id=pinehill-server`,
		response: {
			short: 'CalConnect tokens',
			payloadLabel: 'What Pinehill stores',
			payload: `{
  "access_token": "cc_at_71b...",
  "refresh_token": "rt_5v8...",
  "token_type": "Bearer"
}

// stored by Pinehill, bound to YOUR Pinehill identity (sub claim)
{ "user": "sub:9214", "calconnect_refresh_token": "rt_5v8..." }`,
		},
	},
	{
		n: 15,
		act: 'task',
		from: 'client',
		to: 'server',
		title: 'The update that unblocks the task',
		short: 'tasks/update: calendar',
		summary: `Back in the harness, you confirm you finished in the browser, and the
			client sends a second <code>tasks/update</code>: an <code>ElicitResult</code>
			for the URL request that says only <code>action: "accept"</code> (URL results
			carry no content). The server checks its own records, finds the grant it just
			stored, acknowledges, and the task goes back to <em>working</em> with
			everything it needs. There is no <code>elicitationId</code> and no
			<code>notifications/elicitation/complete</code> anymore; the
			<code>tasks/update</code> is the completion signal.`,
		payloadLabel: 'The update',
		payload: `{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tasks/update",
  "params": {
    "taskId": "task-9c2e",
    "inputResponses": {
      "connect_calendar": {
        "action": "accept"
      }
    },
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'ack (working)',
			payloadLabel: 'The acknowledgement',
			payload: `{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "resultType": "complete"
  }
}`,
		},
		news: [
			{ label: 'Changed: retry replaces elicitation/complete (MRTR, SEP-2322)', href: sep(2322) },
		],
		specHref: 'https://modelcontextprotocol.io/specification/draft/client/elicitation',
		specLabel: 'Spec: Elicitation (URL mode)',
	},
	{
		n: 16,
		act: 'return',
		from: 'client',
		to: 'server',
		title: 'Booked, and on the calendar',
		short: 'tasks/get → completed',
		summary: `A few polls later the task reaches a terminal state. The nested
			<code>result</code> holds exactly what the original <code>tools/call</code>
			would have returned synchronously: the booking confirmation plus
			<code>structuredContent</code> a downstream tool can use, including the
			CalConnect event id. One task, two mid-flight elicitations, both halves of
			the prompt closed.`,
		payloadLabel: 'The final task state',
		payload: `{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tasks/get",
  "params": {
    "taskId": "task-9c2e",
    ${META_BLOCK}
  }
}`,
		response: {
			short: 'completed + result',
			payloadLabel: 'The completed task',
			payload: `{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "resultType": "complete",
    "taskId": "task-9c2e",
    "status": "completed",
    "createdAt": "2026-07-09T15:20:00Z",
    "lastUpdatedAt": "2026-07-09T15:24:05Z",
    "ttlMs": 86400000,
    "result": {
      "resultType": "complete",
      "content": [
        { "type": "text",
          "text": "Booked: Lakeside cabin, Jul 24-26 (PH-58291). Added to the team calendar." }
      ],
      "structuredContent": {
        "confirmation": "PH-58291",
        "total": 412.5,
        "currency": "USD",
        "calendarEventId": "calconnect:evt_88d1"
      }
    }
  }
}`,
		},
	},
	{
		n: 17,
		act: 'return',
		from: 'host',
		to: 'model',
		title: 'The result rejoins the conversation',
		short: 'tool_result to model',
		summary: `The harness folds the result back into the conversation. From the
			model's point of view, the whole adventure, the task, the approval, the two
			mid-flight elicitations, the second OAuth relationship between Pinehill and
			CalConnect, collapses into a single <code>tool_result</code>. Neither the
			model nor the MCP client ever held a CalConnect credential. That ignorance is
			the security feature.`,
		response: {
			short: 'assistant text',
		},
	},
	{
		n: 18,
		act: 'return',
		from: 'host',
		to: 'user',
		title: 'The reply',
		short: 'final answer',
		summary: `Eighteen events on this timeline: a form up front, a durable task, a
			property manager's approval, two URL elicitations delivered mid-task, and a
			third-party OAuth dance, all folded into two sentences. The interesting count
			is still the tokens: your harness holds one for Pinehill, Pinehill holds one
			for CalConnect, and no party ever holds both.`,
		payloadLabel: 'What you read',
		payload: `Booked the Lakeside cabin for July 24 to 26 ($412.50,
confirmation PH-58291) and added the offsite to the team
calendar.`,
	},
];

// ═══════════════════════════════════════════════════════════════════════════
// Scenario registry
// ═══════════════════════════════════════════════════════════════════════════

export const SCENARIOS: Scenario[] = [
	{
		id: 'open',
		letter: 'A',
		label: 'No auth',
		prompt: 'Which Pinehill cabins are free July 24 to 26?',
		blurb: 'A public tool and the bare skeleton of the stateless protocol.',
		actors: ['user', 'host', 'model', 'client', 'server'],
		acts: [
			{
				id: 'before',
				numeral: 'I',
				title: 'Before the wire',
				intro: `No MCP traffic yet. The harness gathers schemas from cache,
					lets the model decide, and gets your consent.`,
			},
			{
				id: 'call',
				numeral: 'II',
				title: 'The call',
				intro: `One request out, one response back. This pair of messages is
					the entire protocol footprint of the storyline.`,
			},
			{
				id: 'return',
				numeral: 'III',
				title: 'The return',
				intro: `The result flows back through the model to you.`,
			},
		],
		steps: STEPS_OPEN,
	},
	{
		id: 'server',
		letter: 'B',
		label: 'Server auth',
		prompt: 'Book the lakeside cabin at Pinehill for the team offsite, July 24 to 26, on the company card.',
		blurb: 'The token from setup, a form plus a URL-mode payment, and a durable task.',
		actors: ['user', 'host', 'model', 'client', 'server'],
		acts: [
			{
				id: 'before',
				numeral: 'I',
				title: 'Before the wire',
				intro: `The same opening as storyline A: cache, model, consent. The
					difference starts the moment the client touches the server.`,
			},
			{
				id: 'call',
				numeral: 'II',
				title: 'The call',
				intro: `The client attaches the token it earned back at first contact.
					Step 6 is the release in miniature; read it slowly.`,
			},
			{
				id: 'mrtr',
				numeral: 'III',
				title: 'The server asks back',
				intro: `The server needs your confirmation, and servers can no longer
					send requests to clients. Watch how the draft solves this with an
					interim result and a retry.`,
			},
			{
				id: 'tail',
				numeral: 'IV',
				title: 'The long tail',
				intro: `The booking needs minutes, so the answer becomes a durable
					task, and the result eventually rejoins the conversation.`,
			},
		],
		steps: STEPS_SERVER,
	},
	{
		id: 'third',
		letter: 'C',
		label: 'Third-party auth',
		prompt: 'Book the lakeside cabin for the offsite and put it on the team calendar.',
		blurb: 'A long-running task that asks for payment, then calendar access, mid-flight.',
		actors: ['user', 'host', 'model', 'client', 'server', 'cal'],
		acts: [
			{
				id: 'before',
				numeral: 'I',
				title: 'Before the wire',
				intro: `The familiar opening, compressed. The interesting word in the
					prompt is "calendar": it belongs to a service Pinehill does not
					control.`,
			},
			{
				id: 'call',
				numeral: 'II',
				title: 'The call becomes a task',
				intro: `The client holds a Pinehill token from storyline B, so the call
					goes straight through. The server collects your preferences up front,
					then hands back a durable task instead of an answer.`,
			},
			{
				id: 'task',
				numeral: 'III',
				title: 'The task, and what it asks for',
				intro: `A human approves the booking, and then the task asks you for two
					things mid-flight, one at a time: payment, then calendar access. Each
					arrives as a URL elicitation inside a tasks/get response and is
					answered with tasks/update.`,
			},
			{
				id: 'return',
				numeral: 'IV',
				title: 'The return',
				intro: `The task reaches completed, and one result closes both halves of
					the prompt.`,
			},
		],
		steps: STEPS_THIRD,
	},
];

// Setup timelines: rendered standalone in the post, ahead of the explorer.
export const SETUP_SCENARIOS: Scenario[] = [
	{
		id: 'meet',
		letter: 'S1',
		label: 'First contact',
		prompt: '',
		blurb: 'Runs once, the day you add the server.',
		actors: ['user', 'host', 'client', 'auth', 'server'],
		acts: [
			{
				id: 'probe',
				numeral: 'I',
				title: 'Sizing up the server',
				intro: `One URL in a config file becomes a protocol version, a
					capability list, and the address of the authorization server that
					guards it.`,
			},
			{
				id: 'introduce',
				numeral: 'II',
				title: 'Introducing yourself',
				intro: `The client has never met this authorization server, and it
					never will register with it. Its identity is a URL the auth server
					can read on demand.`,
			},
		],
		steps: STEPS_MEET,
	},
	{
		id: 'context',
		letter: 'S2',
		label: 'Session start',
		prompt: '',
		blurb: 'Runs every time the harness boots.',
		actors: ['host', 'model', 'client', 'server'],
		acts: [
			{
				id: 'session',
				numeral: 'I',
				title: 'Session start',
				intro: `This runs when the harness boots, before you type anything.
					You are not in it, and the model only appears at the very end.`,
			},
		],
		steps: STEPS_CONTEXT,
	},
];

export const getScenario = (id: string) =>
	[...SCENARIOS, ...SETUP_SCENARIOS].find((s) => s.id === id)!;

export const scenarioStepsForAct = (scenario: Scenario, actId: string) =>
	scenario.steps.filter((s) => s.act === actId);

export const newStepCount = (scenario: Scenario) =>
	scenario.steps.filter((s) => s.news?.length).length;
