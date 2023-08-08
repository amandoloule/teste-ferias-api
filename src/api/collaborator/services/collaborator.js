'use strict';

/**
 * collaborator service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::collaborator.collaborator');
