import { auth } from '@/app/(auth)/auth';
import { NextRequest } from 'next/server';
import { getAgents, getOrgRelationships } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const offset = (page - 1) * limit;

  try {
    const agents = await getAgents({ limit, offset });
    const relationships = await getOrgRelationships();
    return Response.json({ agents, relationships });
  } catch (_) {
    return Response.json('Failed to fetch org chart', { status: 500 });
  }
}
