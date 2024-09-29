// ./src/api/poll/controllers/poll.ts

/**
 * poll controller
 * This controller extends the default functionality for the poll API.
 */

import { factories } from "@strapi/strapi";

// Export the customized poll controller
export default factories.createCoreController(
  "api::poll.poll", // Define the controller for the "poll" API
  ({ strapi }) => ({
    // Custom find method that retrieves multiple polls with additional user and vote data
    async find(ctx) {
      // Call the base "find" method from the core controller
      const response = await super.find(ctx);

      // For each poll in the response data, fetch related documents with detailed user and vote information
      await Promise.all(
        response.data.map(async (poll) => {
          // Retrieve the poll document with populated fields for votes and user data
          const pollDocument = await strapi
            .documents("api::poll.poll") // Access the "poll" collection
            .findOne({
              documentId: poll.documentId, // Find by the poll's document ID
              populate: {
                votes: {
                  populate: {
                    option: {
                      fields: ["id", "value"], // Include "id" and "value" for each option
                    },
                    user: {
                      fields: ["id", "username", "email"], // Include "id", "username", and "email" for each user
                    },
                  },
                },
                user: {
                  fields: ["id", "username", "email"], // Include poll creator's "id", "username", and "email"
                },
              },
            });

          // Add the user details to the poll response
          poll.user = {
            id: pollDocument.user.id,
            documentId: pollDocument.user.documentId,
            username: pollDocument.user.username,
            email: pollDocument.user.email,
          };

          // Assign the populated votes data to the poll
          poll.votes = pollDocument.votes;
        })
      );

      // Return the modified response with additional data
      return response;
    },

    // Custom findOne method to retrieve a single poll by its ID with populated user and vote information
    async findOne(ctx) {
      // Call the base "findOne" method from the core controller
      const response = await super.findOne(ctx);

      // Fetch the poll document and its associated user and vote data
      const pollDocument = await strapi.documents("api::poll.poll").findOne({
        documentId: response.data.documentId, // Use the poll's document ID to find it
        populate: {
          votes: {
            populate: {
              option: {
                fields: ["id", "value"], // Include vote option details
              },
              user: {
                fields: ["id", "username", "email"], // Include user details for each vote
              },
            },
          },
          user: {
            fields: ["id", "username", "email"], // Include poll creator's details
          },
        },
      });

      // Attach the user details to the response
      response.data.user = {
        id: pollDocument.user.id,
        documentId: pollDocument.user.documentId,
        username: pollDocument.user.username,
        email: pollDocument.user.email,
      };

      // Attach the votes to the response
      response.data.votes = pollDocument.votes;

      // Return the modified response with user and vote information
      return response;
    },
  })
);
