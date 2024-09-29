// ./src/index.ts

// import type { Core } from '@strapi/strapi';

import { init } from "@instantdb/admin";

type InstantDBSchema = {
  votes: {
    user: {
      documentId: string;
      username: string;
      email: string;
    };
    poll: {
      question: string;
      documentId: string;
    };
    option: {
      value: string;
      documentId: string;
    };
    createdAt: string;
  };
};

export const db = init<InstantDBSchema>({
  appId: process.env.INSTANT_APP_ID,
  adminToken: process.env.INSTANT_ADMIN_TOKEN,
});

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
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
