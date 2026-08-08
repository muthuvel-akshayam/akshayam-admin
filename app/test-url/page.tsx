import { getProfiles } from '../../services/admin/profile.service';

export const dynamic = 'force-dynamic';

export default async function TestPage() {
  const res = await getProfiles({}, 1, 50);
  return (
    <pre>{JSON.stringify(res.data.map((p: any) => ({ name: p.name, jathagamUrl: p.jathagamUrl })), null, 2)}</pre>
  );
}
