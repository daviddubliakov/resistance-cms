export default {
  async afterCreate(event) {
    await updateDeputyShameCount(event.result.documentId);
  },

  async afterUpdate(event) {
    const docId = event.result?.documentId || event.params?.where?.documentId;
    if (docId) {
      await updateDeputyShameCount(docId);
    }
  },
};

async function updateDeputyShameCount(docId: string) {
  try {
    const count = await strapi.db.query('api::shame.shame').count({
      where: {
        deputats: { documentId: docId },
        publishedAt: { $notNull: true },
      },
    });

    await strapi.db.query('api::deputy.deputy').updateMany({
      where: { documentId: docId },
      data: { shamesCount: count },
    });
  } catch (err) {
    console.error('❌ Помилка оновлення без циклу:', err.message);
  }
}
