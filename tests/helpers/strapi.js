// @ts-nocheck
const Strapi = require("@strapi/strapi");

let instance;
const setupStrapi = async () => {
  if (!instance) {
    instance = await Strapi();
    await instance.load();
    instance.server.mount();
  }
  return instance;
};

module.exports = { setupStrapi };
