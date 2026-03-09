// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Початок синхронізації shamesCount...');

    try {
      const deputies = await strapi.documents('api::deputy.deputy').findMany({
        fields: ['id', 'documentId'],
      });

      if (!deputies.length) {
        console.log('ℹ️ Депутатів не знайдено.');
        return;
      }

      for (const deputy of deputies) {
        const shames = await strapi.documents('api::shame.shame').findMany({
          filters: {
            deputats: {
              id: deputy.id,
            },
          },
          fields: ['id'],
        });

        const count = shames.length;

        await strapi.documents('api::deputy.deputy').update({
          documentId: deputy.documentId,
          data: {
            shamesCount: count,
          },
        });

        console.log(
          `✅ ID: ${deputy.id} | Поле: deputats | Зашкварів: ${count}`,
        );
      }

      console.log('🏁 Синхронізація завершена успішно!');
    } catch (err) {
      console.error(
        '❌ Помилка під час синхронізації:',
        err.details || err.message,
      );
    }
  },
};
