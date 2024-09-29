// ./src/api/poll/middlewares/on-poll-create.ts

/**
 * `on-poll-create` middleware
 * This middleware executes logic when a new poll is created.
 */

import type { Core } from "@strapi/strapi";

// Export the middleware function, accepting config and Strapi instance
export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Return an asynchronous function that takes in context (ctx) and next middleware
  return async (ctx, next) => {
    // Log a message indicating we are in the on-poll-create middleware
    strapi.log.info("In on-poll-create middleware.");

    // Retrieve the current user from the context's state
    const user = ctx.state.user;

    // Proceed to the next middleware or controller
    await next();

    try {
      // Update the user's document in the database to connect the new poll
      await strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId, // Use the user's document ID
        data: {
          polls: {
            connect: [ctx.response.body.data.documentId], // Connect the new poll's ID
          } as any, // Type assertion to any for compatibility
        },
      });
    } catch (error) {
      // Log the error to the console
      console.log(error);

      // Set the response status to 400 (Bad Request)
      ctx.response.status = 400;

      // Provide a response body with error details
      ctx.response.body = {
        statusCode: 400,
        error: "Bad Request",
        message: "An error occurred while connecting the poll to the user.",
      };
    }
  };
};
