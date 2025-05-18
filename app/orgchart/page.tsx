import { redirect } from 'next/navigation';
import { auth } from '../(auth)/auth';
import { OrgChart } from '@/components/OrgChart';

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/guest');
  }
  return <OrgChart />;
}
