const skyOrigin = 'https://diwali-wishes.haha-hardikk.chatgpt.site';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const origin = req.headers.origin;
  if (origin && origin !== `https://${req.headers.host}`) {
    return res.status(403).json({ error: 'Please release your lantern from this website.' });
  }
  const body = req.method === 'POST' ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})) : undefined;
  if (body && Buffer.byteLength(body) > 1024) return res.status(413).json({ error: 'Request too large' });
  try {
    const response = await fetch(`${skyOrigin}/api/lanterns`, {
      method: req.method,
      headers: { 'Content-Type': 'application/json', Origin: skyOrigin },
      body,
      signal: AbortSignal.timeout(8000),
      redirect: 'error'
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(503).json({ error: 'The shared sky is taking a moment. Please try again.' });
  }
}
