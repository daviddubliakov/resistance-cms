export default {
  async afterCreate(event) {
    await checkAndUpdateMyCount(event.result);
  },

  async afterUpdate(event) {
    await checkAndUpdateMyCount(event.result);
  },
  async afterDelete(event) {
    await checkAndUpdateMyCount(event);
  },
};

async function checkAndUpdateMyCount(result: any) {
  if (!result?.documentId) return;
  const docId = result.documentId;

  try {
    const shames = await strapi.documents('api::shame.shame').findMany({
      filters: { deputats: { documentId: docId } },
      fields: ['id'],
    });

    const actualCount = shames.length;
    const currentSavedCount = result.shamesCount || 0;

    if (actualCount !== currentSavedCount) {
      await strapi.documents('api::deputy.deputy').update({
        documentId: docId,
        data: { shamesCount: actualCount },
      });
      console.log(
        `🔄 [Deputy-Sync] Депутат ${docId}: оновлено лічильник на ${actualCount}`,
      );
    }
  } catch (err) {
    console.error(`❌ [Deputy-Sync] Помилка:`, err.message);
  }
}
