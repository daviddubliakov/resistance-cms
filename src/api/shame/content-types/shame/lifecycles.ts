export default {
  async afterCreate(event) {
    const { result } = event;
    const deputy = result.deputats?.[0] || result.deputats;
    if (deputy?.documentId) {
      await changeCounter(deputy.documentId, 1); // Додали зашквар -> +1
    }
  },

  async beforeUpdate(event) {
    const docId = event.params.where?.documentId || event.params.where?.id;
    const existing: any = await strapi.documents('api::shame.shame').findOne({
      documentId: docId as string,
      populate: ['deputats'],
    });
    event.state = { oldDeputyId: existing?.deputats?.[0]?.documentId };
  },

  async afterUpdate(event) {
    const { result, state } = event;
    const newDeputyId = result.deputats?.[0]?.documentId;
    const oldDeputyId = state?.oldDeputyId;

    // Якщо депутат змінився
    if (oldDeputyId !== newDeputyId) {
      if (oldDeputyId) await changeCounter(oldDeputyId, -1); // Відняли у старого
      if (newDeputyId) await changeCounter(newDeputyId, 1); // Додали новому
    }
  },

  async beforeDelete(event) {
    const docId = event.params.where?.documentId || event.params.where?.id;
    const existing: any = await strapi.documents('api::shame.shame').findOne({
      documentId: docId as string,
      populate: ['deputats'],
    });
    event.state = { oldDeputyId: existing?.deputats?.[0]?.documentId };
  },

  async afterDelete(event) {
    if (event.state?.oldDeputyId) {
      await changeCounter(event.state.oldDeputyId, -1); // Видалили зашквар -> -1
    }
  },
};

async function changeCounter(deputyId: string, diff: number) {
  try {
    const deputy: any = await strapi.documents('api::deputy.deputy').findOne({
      documentId: deputyId,
      fields: ['shamesCount'],
    });

    const currentCount = deputy?.shamesCount || 0;
    const newCount = Math.max(0, currentCount + diff);

    await strapi.documents('api::deputy.deputy').update({
      documentId: deputyId,
      data: { shamesCount: newCount },
    });
  } catch (e) {
    console.error('Помилка лічильника:', e.message);
  }
}
