/**
 * deputy controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::deputy.deputy',
  ({ strapi }) => ({
    async find(ctx) {
      const query = ctx.query as any;
      const page = parseInt(query.pagination?.page) || 1;
      const pageSize = parseInt(query.pagination?.pageSize) || 25;

      const mayors = await strapi.documents('api::deputy.deputy').findMany({
        filters: { placeOfEmployment: { $contains: 'Міський голова' } },
        populate: ['shames', 'photo'],
        limit: 1,
      });
      const mayor = mayors.length > 0 ? mayors[0] : null;

      // The mayor takes one slot on page 1, so the regular query fetches
      // one item less there and every later page's window shifts back by
      // one to stay continuous with what page 1 already showed.
      const start = mayor ? Math.max((page - 1) * pageSize - 1, 0) : (page - 1) * pageSize;
      const limit = mayor && page === 1 ? pageSize - 1 : pageSize;

      ctx.query = {
        ...query,
        sort: 'lastName:asc',
        filters: {
          ...(query.filters || {}),
          ...(mayor ? { documentId: { $ne: mayor.documentId } } : {}),
        },
        pagination: { start, limit },
      };

      const { data, meta } = await super.find(ctx);

      if (mayor) {
        meta.pagination.page = page;
        meta.pagination.pageSize = pageSize;
        meta.pagination.total += 1;
        meta.pagination.pageCount = Math.ceil(meta.pagination.total / pageSize);

        if (page === 1) {
          data.unshift(mayor);
        }
      }
      return { data, meta };
    },
  }),
);
