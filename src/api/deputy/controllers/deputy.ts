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

      let mayor = null;

      if (page === 1) {
        const mayors = await strapi.documents('api::deputy.deputy').findMany({
          filters: { placeOfEmployment: { $contains: 'Міський голова' } },
          populate: ['shames', 'photo'],
          limit: 1,
        });
        if (mayors.length > 0) mayor = mayors[0];
      }

      ctx.query = {
        ...query,
        sort: 'lastName:asc',
        filters: {
          ...(query.filters || {}),
          ...(mayor ? { documentId: { $ne: mayor.documentId } } : {}),
        },
      };

      const { data, meta } = await super.find(ctx);

      if (mayor && page === 1) {
        data.unshift(mayor);
      }
      return { data, meta };
    },
  }),
);
