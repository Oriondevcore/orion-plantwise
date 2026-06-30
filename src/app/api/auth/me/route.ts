const AUTH_API = 'https://helpme-api.orion269.workers.dev/api/auth';

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('Authorization');
    if (!auth) {
      return Response.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    const res = await fetch(`${AUTH_API}/me`, {
      headers: { Authorization: auth },
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ status: 'error', message: 'Auth service unavailable' }, { status: 503 });
  }
}
