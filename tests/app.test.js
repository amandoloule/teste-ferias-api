require("custom-env").env("test");
const { setupStrapi } = require("./helpers/strapi");

/** this test is called once before any test is called */
beforeAll(async () => {
  await setupStrapi();
});

test("strapi is defined", () => {
  expect(strapi).toBeDefined();
});
