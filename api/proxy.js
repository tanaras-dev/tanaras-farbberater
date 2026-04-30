module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed =
    origin === 'https://tanaras.de' ||
    origin === 'https://www.tanaras.de' ||
    origin.endsWith('.myshopify.com') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.shopifypreview.com');

  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
};
