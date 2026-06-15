import { Hono } from 'hono';
import { cors } from "hono/cors"

const STAKING_API = 'https://staking.real.finance/api/trpc';

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  // Proxy: pool-wide info + price snapshot (cached 12hrs via cache headers)
  .get('/staking/info', async (c) => {
    try {
      const [infoRes, priceRes] = await Promise.all([
        fetch(`${STAKING_API}/staking.info`),
        fetch(`${STAKING_API}/prices.snapshot`),
      ]);
      const [infoData, priceData] = await Promise.all([infoRes.json(), priceRes.json()]);
      const info = (infoData as any).result?.data?.json;
      const price = (priceData as any).result?.data?.json;
      c.header('Cache-Control', 'public, max-age=43200'); // 12hr cache
      return c.json({ info, price }, 200);
    } catch (e) {
      return c.json({ error: 'Failed to fetch pool info' }, 500);
    }
  })
  // Proxy: per-wallet data
  .get('/staking/wallet/:address', async (c) => {
    const address = c.req.param('address').toLowerCase();
    if (!address.match(/^0x[a-f0-9]{40}$/)) {
      return c.json({ error: 'Invalid Ethereum address' }, 400);
    }
    try {
      const input = encodeURIComponent(JSON.stringify({ json: { wallet: address } }));
      const res = await fetch(`${STAKING_API}/staking.user?input=${input}`);
      const data = await res.json() as any;
      if (data.error) {
        return c.json({ error: data.error.json?.message ?? 'Not found' }, 404);
      }
      const wallet = data.result?.data?.json;
      return c.json({ wallet }, 200);
    } catch (e) {
      return c.json({ error: 'Failed to fetch wallet data' }, 500);
    }
  });

export type AppType = typeof app;
export default app;
