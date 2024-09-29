// ./src/api/vote/middlewares/on-vote-create.ts

/**
 * `on-vote-create` middleware
 * This middleware executes logic when a new vote is created.
 */

import type { Core } from "@strapi/strapi";
import { db } from "../../..";
import { id, tx } from "@instantdb/admin";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info("In on-vote-create middleware.");

    // Retrieve the current user from the context's state
    const user = ctx.state.user;

    // check if vote document with the poll already exists
    const vote = await strapi.documents("api::vote.vote").findFirst({
      filters: {
        // Filter by the user's ID and the poll's document ID
        user: {
          id: user.id,
        },
        poll: {
          documentId: ctx.request.body.data.poll,
        } as any,
      },
      populate: ["option", "poll"],
    });

    // If the user has already voted on this poll, return a 400 (Bad Request) response
    if (vote) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        error: "Bad Request",
        message: "You have already voted on this poll.",
      };
      return;
    }

    // Proceed to the next middleware or controller
    await next();

    // Retrieve the document ID of the new vote from the response body
    const voteDocumentId = ctx.response.body.data.documentId;

    // Retrieve the document data from the response body
    const document = ctx.response.body.data;

    // Create a new record in the InstantDB database for the vote
    const res = await db
      .asUser({
        // Use the user's information to create the vote record
        email: user.email,
      })
      .transact(
        tx.votes[id()].update({
          // Use the user's information to create the vote record
          user: {
            documentId: user.documentId,
            username: user.username,
            email: user.email,
          },
          // Use the poll and option information from the vote document
          poll: {
            documentId: document.poll,
            question: document.poll.question,
          },
          // Use the option information from the vote document
          option: {
            documentId: document.option,
            value: document.option.value,
          },
          // Use the creation timestamp from the vote document
          createdAt: document.createdAt,
        })
      );

    console.log("🟢🟢🟢🟢 ~ instantDB record created", res);

    try {
      // Update the user's document in the database to connect the new vote
      await strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId, // Use the user's document ID
        data: {
          votes: {
            connect: [voteDocumentId], // Connect the new vote's ID
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
        message: "An error occurred while connecting the vote to the user.",
      };
    }
  };
};
