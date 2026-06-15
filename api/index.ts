import app from '../packages/web/src/api/index';

export const config = { runtime: 'edge' };

export default {
  fetch: app.fetch.bind(app),
};
