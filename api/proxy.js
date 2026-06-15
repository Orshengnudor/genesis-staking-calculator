const STAKING_API = 'https://staking.real.finance/api/trpc';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, input } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const url = input 
    ? `${STAKING_API}/${path}?input=${input}`
    : `${STAKING_API}/${path}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'public, max-age=43200');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Upstream fetch failed' });
  }
}
