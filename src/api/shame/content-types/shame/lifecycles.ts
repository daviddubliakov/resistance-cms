interface DeputyRef {
  documentId: string;
}

interface ShameWithDeputats {
  id: number;
  documentId: string;
  deputats: DeputyRef[];
}

async function findShameWithDeputats(where: Record<string, unknown>) {
  return strapi.db.query('api::shame.shame').findOne({
    where,
    populate: ['deputats'],
  }) as Promise<ShameWithDeputats | null>;
}

export default {
  async afterCreate(event) {
    const created = await findShameWithDeputats({ id: event.result.id });

    for (const deputy of created?.deputats || []) {
      await syncDeputyCount(deputy.documentId);
    }
  },

  async beforeUpdate(event) {
    const numericId = event.params.where?.id;
    const existing = await findShameWithDeputats({ id: numericId });

    event.state = {
      oldDeputyIds: (existing?.deputats || []).map((d) => d.documentId),
    };
  },

  async afterUpdate(event) {
    const updated = await findShameWithDeputats({ id: event.result.id });

    const newDeputyIds = (updated?.deputats || []).map((d) => d.documentId);
    const oldDeputyIds: string[] = event.state?.oldDeputyIds || [];
    const affectedDeputyIds = new Set([...oldDeputyIds, ...newDeputyIds]);

    for (const deputyId of affectedDeputyIds) {
      await syncDeputyCount(deputyId);
    }
  },

  async beforeDelete(event) {
    const numericId = event.params.where?.id;
    const existing = await findShameWithDeputats({ id: numericId });

    event.state = {
      oldDeputyIds: (existing?.deputats || []).map((d) => d.documentId),
    };
  },

  async afterDelete(event) {
    const oldDeputyIds: string[] = event.state?.oldDeputyIds || [];
    for (const deputyId of oldDeputyIds) {
      await syncDeputyCount(deputyId);
    }
  },
};

async function syncDeputyCount(deputyId: string) {
  try {
    const count = await strapi.db.query('api::shame.shame').count({
      where: {
        deputats: { documentId: deputyId },
        publishedAt: { $notNull: true },
      },
    });

    await strapi.documents('api::deputy.deputy').update({
      documentId: deputyId,
      data: { shamesCount: count },
    });
  } catch (e) {
    console.error('Помилка лічильника:', e.message);
  }
}
