/**
 * deputy controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::deputy.deputy',
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = { ...ctx.query, sort: 'lastName:asc' };

      const { data, meta } = await super.find(ctx);
      if (!data || data.length === 0) return { data, meta };

      const mayorIndex = data.findIndex((deputy) => {
        const employment = deputy.attributes.placeOfEmployment || '';
        return employment.includes('Міський голова');
      });

      if (mayorIndex !== -1) {
        const [mayor] = data.splice(mayorIndex, 1);
        data.unshift(mayor);
      }

      return { data, meta };
    },
  }),
);
