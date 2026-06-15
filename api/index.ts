import app from '../packages/web/src/api/index';
import { handle } from 'hono/vercel';

export const config = { runtime: 'edge' };
export default handle(app);
