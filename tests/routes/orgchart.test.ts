import { expect, test } from '../fixtures';
import {
  createAgent,
  createOrgRelationship,
} from '@/lib/db/queries';

export const AGENT_MODEL = 'chat-model';


test.describe.serial('/api/orgchart', () => {
  test('returns agents and relationships', async ({ adaContext }) => {
    const [parent] = await createAgent({
      name: 'Alice',
      title: 'CEO',
      department: 'Executive',
      userId: null,
      systemPrompt: null,
      modelId: AGENT_MODEL,
      avatarUrl: null,
    });
    const [child] = await createAgent({
      name: 'Bob',
      title: 'Engineer',
      department: 'Engineering',
      userId: null,
      systemPrompt: null,
      modelId: AGENT_MODEL,
      avatarUrl: null,
    });
    await createOrgRelationship({ parentId: parent.id, childId: child.id });

    const response = await adaContext.request.get('/api/orgchart');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('agents');
    expect(body).toHaveProperty('relationships');

    const agentIds = body.agents.map((a: any) => a.id);
    expect(agentIds).toContain(parent.id);
    expect(agentIds).toContain(child.id);

    const hasRelationship = body.relationships.some(
      (r: any) => r.parentId === parent.id && r.childId === child.id,
    );
    expect(hasRelationship).toBe(true);
  });
});

