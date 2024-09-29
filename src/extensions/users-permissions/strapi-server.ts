// ./src/extensions/users-permissions/strapi-server.ts

// Import the initialized InstantDB instance (db) to interact with the database
import { db } from "../..";

// Export a function that modifies the default plugin (users-permissions)
module.exports = (plugin) => {
  // Store references to the original register and callback controllers for later use
  const register = plugin.controllers.auth.register;
  const callback = plugin.controllers.auth.callback;

  // Override the default register method to include InstantDB token creation
  plugin.controllers.auth.register = async (ctx) => {
    // Extract the user's email from the registration request body
    const { email } = ctx.request.body;

    // Create an authentication token for the user in InstantDB using their email
    const token = await db.auth.createToken(email);

    // Call the original register function to handle the default registration process
    await register(ctx);

    // Access the response body after registration
    const body = ctx.response.body;

    // Add the InstantDB token to the response body
    body.instantdbToken = token;
  };

  // Override the default callback method (used for login) to include InstantDB token creation
  plugin.controllers.auth.callback = async (ctx) => {
    // Extract the identifier (usually the email or username) from the login request body
    const { identifier } = ctx.request.body;

    // Create an authentication token for the user in InstantDB using the identifier
    const token = await db.auth.createToken(identifier);

    // Call the original callback function to handle the default login process
    await callback(ctx);

    // Access the response body after login
    const body = ctx.response.body;

    // Add the InstantDB token to the response body
    body.instantdbToken = token;
  };

  // Return the modified plugin object with the updated controller methods
  return plugin;
};
