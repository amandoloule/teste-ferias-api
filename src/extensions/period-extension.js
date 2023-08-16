/*
* Validações
*/

const { isBefore, isAfter, differenceInMonths } = require("date-fns");

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin("graphql").service("extension");
    const { toEntityResponse } = strapi
      .plugin("graphql")
      .service("format").returnTypes;

    extensionService.use(({ nexus }) => ({
      resolvers: {
        Mutation: {
          createPeriod: async (root, args, context) => {
            const { start_date, end_date, collaborator } = args.data;

            const existingPeriods = await strapi.services[
              "api::period.period"
            ].find({ filters: { collaborator: collaborator } });

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
                throw new Error("Períodos de férias não podem se sobrepor");
              }
            }

            const collaboratorInfo = await strapi.services[
              "api::collaborator.collaborator"
            ].findOne(collaborator);

            if (!collaboratorInfo) {
              throw new Error("Colaborador não encontrado");
            }

            const hireDate = new Date(collaboratorInfo.contract_dt);

            if (differenceInMonths(newPeriodStart, hireDate) < 12) {
              throw new Error(
                "O primeiro período de férias deve começar pelo menos 12 meses após a data de contratação."
              );
            }

            try {
              const entity = await strapi.services["api::period.period"].create(
                {
                  data: {
                    start_date,
                    end_date,
                    collaborator,
                  },
                }
              );

              const formattedData = toEntityResponse(entity, {
                args,
                resourceUID: "api::period.period",
              });

              return formattedData;
            } catch (error) {
              return {
                data: null,
              };
            }
          },
        },
      },
    }));
  },
};
