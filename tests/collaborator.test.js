require("custom-env").env("test");
const request = require('supertest');
const { setupStrapi } = require("./helpers/strapi");

describe("collaborator controller test", () => {
  beforeAll(async () => {
    await setupStrapi();
  });
  afterAll(() => {
    strapi.server.destroy();
  });
  it("should return list of collaborator", async () => {
    await request(strapi.server.httpServer)
      .get("/api/collaborators")
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
