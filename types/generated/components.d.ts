import type { Schema, Struct } from '@strapi/strapi';

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
      'resource.resource': ResourceResource;
    }
  }
}
