"use strict";

const periodExtension = require("./extensions/period-extension");

/** 

* Enable action on a controller for a specific role 
* @param {*} type The role type 
* @param {*} apiName The name of the API where the controller action lives 
* @param {*} controller The controller where the action lives 
* @param {*} action The action itself 
*/
const enablePermission = async (type, apiName, controller, action) => {
  try {
    // Get the role entity
    const role = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type },
        populate: ["permissions"],
      });

    const actionId = `api::${apiName}.${controller}.${action}`;

    // Get the permissions associated with the role
    const rolePermission = role.permissions.find(
      (permission) => permission.action === actionId
    );

    if (!rolePermission) {
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: {
          action: actionId,
          role: role.id,
        },
      });
    }
  } catch (e) {
    strapi.log.error(
      `Bootstrap script: Could not update settings. ${controller} -   ${action}`
    );
  }
};

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    periodExtension.register({ strapi });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap(/*{ strapi }*/) {
    await enablePermission("public", "collaborator", "collaborator", "find");
    await enablePermission("public", "collaborator", "collaborator", "findOne");
    await enablePermission("public", "collaborator", "collaborator", "create");
    await enablePermission("public", "collaborator", "collaborator", "update");
    await enablePermission("public", "collaborator", "collaborator", "delete");

    await enablePermission("public", "period", "period", "find");
    await enablePermission("public", "period", "period", "findOne");
    await enablePermission("public", "period", "period", "create");
    await enablePermission("public", "period", "period", "update");
    await enablePermission("public", "period", "period", "delete");
  },
};
