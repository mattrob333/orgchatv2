# agents.md

## Purpose
This file defines modular tasks for Codex agents implementing **OrgChart AI** features based on the PRD. Each agent will work independently and submit focused pull requests.

## Agents Overview

| Agent Name | Description | Files/Modules | Dependencies |
|------------|-------------|---------------|--------------|
| SchemaAgent | Add database tables for digital twins and org chart relationships | lib/db/schema.ts, lib/db/migrations | - |
| OrgChartAPIAgent | Serve org chart JSON via API | app/api/orgchart/route.ts, lib/db/queries.ts | SchemaAgent |
| OrgChartUIAgent | Interactive org chart page with pan/zoom | app/orgchart/page.tsx, components/OrgChart.tsx | OrgChartAPIAgent |
| NodeChatAgent | "Chat" and "Settings" buttons on each node | components/OrgChart.tsx, components/OrgNode.tsx | OrgChartUIAgent |
| ChatRoutingAgent | Route chat requests to selected agent using its model & prompt | app/(chat)/api/chat/route.ts, lib/ai/prompts.ts | SchemaAgent |
| AdminUIAgent | Admin pages to manage agents and prompts | app/admin/** | SchemaAgent, ChatRoutingAgent |
| KBUploadsAgent | Upload documents and store embeddings for RAG | lib/ai/rag.ts, app/api/agents/[id]/documents/** | SchemaAgent |
| CalendarSyncAgent | Import calendar events for an agent | app/api/agents/[id]/calendar/** | SchemaAgent |
| TaskSyncAgent | Import task data for an agent | app/api/agents/[id]/tasks/** | SchemaAgent |
| ChatLogsAgent | Page for users to review their clone's chat history | app/logs/** | ChatRoutingAgent |
| AccessControlAgent | Implement role-based permissions (admin vs user) | auth setup, middleware.ts | AdminUIAgent |

---

### Agent: SchemaAgent
**Description**
Create database schema for AI clones and org chart structure.

**Task Scope & Instructions**
- Extend `lib/db/schema.ts` with tables for `Agent` (id, name, title, department, userId, systemPrompt, modelId, avatarUrl) and `OrgRelationship` (parentId, childId).
- Generate migrations in `lib/db/migrations`.
- Update `lib/db/queries.ts` with CRUD helpers for agents and org relationships.

**Acceptance Criteria**
- Migrations run without error.
- Queries can create/read/update/delete agents and relationships.

**Dependencies**
- None

---

### Agent: OrgChartAPIAgent
**Description**
Expose org chart data through a REST endpoint.

**Task Scope & Instructions**
- Create `app/api/orgchart/route.ts` with GET handler returning all agents and relationships as JSON.
- Use helpers from `lib/db/queries.ts`.
- Include pagination to handle up to 200 nodes.

**Acceptance Criteria**
- `GET /api/orgchart` responds with array of agents and relationships.
- Unit test verifies HTTP 200 and expected structure.

**Dependencies**
- SchemaAgent

---

### Agent: OrgChartUIAgent
**Description**
Render interactive org chart in the frontend.

**Task Scope & Instructions**
- Create `app/orgchart/page.tsx` and `components/OrgChart.tsx`.
- Fetch data from `/api/orgchart` and display nodes with name, title, department and avatar.
- Implement pan and zoom controls.

**Acceptance Criteria**
- Page loads org chart within 3 seconds for 200 nodes.
- Nodes are clickable.

**Dependencies**
- OrgChartAPIAgent

---

### Agent: NodeChatAgent
**Description**
Add Chat and Settings controls to each org chart node.

**Task Scope & Instructions**
- Extend `components/OrgChart.tsx` with per-node "Chat" and "Settings" buttons.
- Clicking "Chat" navigates to `/chat/[agentId]`.
- "Settings" should link to admin configuration if the user is an admin.

**Acceptance Criteria**
- Buttons visible on hover.
- Clicking chat opens the correct chat page.

**Dependencies**
- OrgChartUIAgent

---

### Agent: ChatRoutingAgent
**Description**
Handle chat requests for a specific agent.

**Task Scope & Instructions**
- Modify `app/(chat)/api/chat/route.ts` to accept `agentId`.
- Load agent configuration (prompt, model) from DB using `lib/db/queries.ts`.
- Use these settings when calling the AI provider.

**Acceptance Criteria**
- Messages routed to the selected agent return responses using its model and prompt.
- Existing chat tests continue to pass.

**Dependencies**
- SchemaAgent

---

### Agent: AdminUIAgent
**Description**
Build admin interface for managing agents.

**Task Scope & Instructions**
- Create pages under `app/admin` for listing, creating, and editing agents.
- Allow editing system prompts, model selection, and knowledge base sources.
- Restrict access to users with admin role.

**Acceptance Criteria**
- Admin can CRUD agents from the UI.
- Form validations exist for required fields.

**Dependencies**
- SchemaAgent
- ChatRoutingAgent

---

### Agent: KBUploadsAgent
**Description**
Enable document upload for an agent's knowledge base and store embeddings.

**Task Scope & Instructions**
- Add API routes under `app/api/agents/[id]/documents` for upload and retrieval.
- Store files with Vercel Blob and embeddings in vector DB (pgvector or similar).
- Update chat route to perform RAG on these documents before calling the LLM.

**Acceptance Criteria**
- Documents upload successfully and are retrievable.
- RAG results appear in chat responses when relevant.

**Dependencies**
- SchemaAgent
- ChatRoutingAgent

---

### Agent: CalendarSyncAgent
**Description**
Import calendar events into an agent's knowledge base.

**Task Scope & Instructions**
- Provide utility to parse iCal feed or connect to Google Calendar API.
- Store upcoming events linked to an agent.
- Expose API endpoints for manual sync.

**Acceptance Criteria**
- Calendar events can be fetched and stored.
- Chat answers questions about availability using this data.

**Dependencies**
- SchemaAgent
- KBUploadsAgent

---

### Agent: TaskSyncAgent
**Description**
Sync tasks from Jira/Asana/Trello for an agent.

**Task Scope & Instructions**
- Create service to import tasks via API or CSV.
- Store tasks linked to an agent for RAG.
- Allow manual refresh through admin UI.

**Acceptance Criteria**
- Tasks are stored and retrievable.
- Chat can reference task status when asked.

**Dependencies**
- SchemaAgent
- KBUploadsAgent

---

### Agent: ChatLogsAgent
**Description**
Allow humans to review their clone's conversation history.

**Task Scope & Instructions**
- Create pages under `app/logs` to display chats for the signed-in user's agent.
- Only the agent owner and admins may access these logs.

**Acceptance Criteria**
- Users can see past conversations with their clone.

**Dependencies**
- ChatRoutingAgent

---

### Agent: AccessControlAgent
**Description**
Implement role-based permissions.

**Task Scope & Instructions**
- Extend Auth.js setup and middleware to distinguish admin vs regular user.
- Enforce role checks in admin and log routes.

**Acceptance Criteria**
- Unauthorized users cannot access admin pages.
- Unit test verifies middleware redirects.

**Dependencies**
- AdminUIAgent

