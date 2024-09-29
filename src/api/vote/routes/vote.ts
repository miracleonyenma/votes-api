// ./src/api/vote/routes/vote.ts

/**
 * vote router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::vote.vote", {
  config: {
    create: {
      // add the `on-vote-create` middleware to the `create` action
      middlewares: ["api::vote.on-vote-create"],
    },
  },
});
