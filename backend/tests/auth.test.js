const request = require("supertest");
const { app, io } = require("../app"); // We need the server instance
const mongoose = require("mongoose");
const User = require("../models/user");

describe("Auth API", () => {
  beforeAll(async () => {
    // Connect to a test database if possible, or just use the current one if safe
    // For this environment, we'll assume the DB is available
  });

  afterAll(async () => {
    await mongoose.connection.close();
    // Close socket.io server
    if (io) io.close();
  });

  it("should fail to login with invalid credentials", async () => {
    const res = await request(app).post("/api/v1/sign-in").send({
      username: "nonexistent",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  it("should fail to access protected route without token", async () => {
    const res = await request(app).get("/api/v1/get-user-information");
    expect(res.statusCode).toBe(403);
  });
});
