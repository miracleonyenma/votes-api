// ./src/api/poll/routes/poll.ts

/**
 * poll router
 * This file defines the routing for the poll API, setting up routes and middlewares.
 */

import { factories } from "@strapi/strapi";

// Export the core router for the "poll" API using Strapi's factories
export default factories.createCoreRouter("api::poll.poll", {
  config: {
    // Configuration options for the router
    create: {
      // Attach the `on-poll-create` middleware to the create route
      middlewares: ["api::poll.on-poll-create"],
    },
  },
});
