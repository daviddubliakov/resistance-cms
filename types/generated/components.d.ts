import type { Schema, Struct } from '@strapi/strapi';

export interface OtherIncomesOtherIncomes extends Struct.ComponentSchema {
  collectionName: 'components_other_incomes_other_incomes';
  info: {
    displayName: 'otherIncomes';
    icon: 'database';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RelatedBusinessessRelatedBusinessess
  extends Struct.ComponentSchema {
  collectionName: 'components_related_businessess_related_businessesses';
  info: {
    displayName: 'relatedBusinessess';
    icon: 'briefcase';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ResourceResource extends Struct.ComponentSchema {
  collectionName: 'components_resource_resources';
  info: {
    displayName: 'resource';
    icon: 'cursor';
  };
  attributes: {
    subtitle: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'other-incomes.other-incomes': OtherIncomesOtherIncomes;
      'related-businessess.related-businessess': RelatedBusinessessRelatedBusinessess;
      'resource.resource': ResourceResource;
    }
  }
}
