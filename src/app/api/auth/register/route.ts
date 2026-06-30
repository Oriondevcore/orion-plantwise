const AUTH_API = 'https://helpme-api.orion269.workers.dev/api/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${AUTH_API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ status: 'error', message: 'Auth service unavailable' }, { status: 503 });
  }
}
