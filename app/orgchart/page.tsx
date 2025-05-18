import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../(auth)/auth';
import { OrgChart } from '@/components/OrgChart';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const cookieStore = cookies();
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const res = await fetch(`${base}/api/orgchart`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to load org chart');
  }

  const data = await res.json();

  return (
    <div className="w-full h-full p-4">
      <OrgChart agents={data.agents} relationships={data.relationships} />
    </div>
  );
}
