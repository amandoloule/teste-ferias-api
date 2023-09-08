"use strict";

/**
 * period controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { isBefore, isAfter, differenceInMonths } = require("date-fns");
const { sanitize } = require("@strapi/utils");

module.exports = createCoreController("api::period.period", ({ strapi }) => ({
  async create(ctx) {
    const { params, request } = ctx;
    const { start_date, end_date, collaborator } = request.body.data;

    const existingPeriods = await strapi.services["api::period.period"].find({
      filters: { collaborator: collaborator },
    });

    const newPeriodStart = new Date(start_date);
    const newPeriodEnd = new Date(end_date);

    for (const period of existingPeriods.results) {
      const existingStart = new Date(period.start_date);
      const existingEnd = new Date(period.end_date);

      if (
        (isBefore(newPeriodStart, existingEnd) &&
          isAfter(newPeriodEnd, existingStart)) ||
        (isAfter(newPeriodStart, existingStart) &&
          isBefore(newPeriodStart, existingEnd))
      ) {
        return ctx.badRequest("Períodos de férias não podem se sobrepor");
      }
    }

    const collaboratorInfo = await strapi.services[
      "api::collaborator.collaborator"
    ].findOne(collaborator);

    if (!collaboratorInfo) {
      return ctx.badRequest("Colaborador não encontrado");
    }

    const hireDate = new Date(collaboratorInfo.contract_dt);

    if (differenceInMonths(newPeriodStart, hireDate) < 12) {
      return ctx.badRequest(
        "O primeiro período de férias deve começar pelo menos 12 meses após a data de contratação."
      );
    }

    const entity = await strapi.services["api::period.period"].create(
      request.body
    );

    // Sanitize the entity before sending it as a response
    const model = strapi.getModel("api::period.period");
    const sanitizedEntity = await sanitize.contentAPI.output(entity, model);

    return ctx.send(sanitizedEntity);
  },
}));
