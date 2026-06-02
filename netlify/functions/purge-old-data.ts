// Runs daily. Calls the app's purge endpoint, which permanently
// deletes pledge/quiz/enquiry personal data older than 90 days (DPDP retention).
export default async () => {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error('purge-old-data: NEXT_PUBLIC_APP_URL or CRON_SECRET not set');
    return new Response('Not configured', { status: 500 });
  }

  const res = await fetch(`${base.replace(/\/$/, '')}/api/cron/purge`, {
    method: 'POST',
    headers: { authorization: `Bearer ${secret}` },
  });

  const body = await res.text();
  console.log('purge-old-data result:', res.status, body);
  return new Response(body, { status: res.status });
};

export const config = {
  schedule: '@daily',
};
