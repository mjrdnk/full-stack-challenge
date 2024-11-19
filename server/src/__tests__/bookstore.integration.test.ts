import mongoose from "mongoose";
import request from "supertest";
import app from "../server";
import { Book } from "../models";

describe("Bookstore API Integration Tests", () => {
  beforeAll(async () => {
    // Disconnect first if there's an existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    // Connect to a test database
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/bookstore_test"
    );
  });

  beforeEach(async () => {
    await Book.deleteMany({});
  });

  afterAll(async () => {
    await Book.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/books/:id", () => {
    it("should handle invalid ObjectId format", async () => {
      const response = await request(app).get("/api/books/invalid-id");

      // This test will fail because we're not validating ObjectId
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid book ID");
    });

    it("should handle non-existent book", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/books/${validObjectId}`);

      // This test will fail because we're not handling null responses
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found");
    });
  });

  describe("POST /api/books/:id/purchase", () => {
    it("should prevent purchase when stock is 0", async () => {
      // Create a book with 0 stock
      const book = await Book.create({
        title: "Test Book",
        author: "Test Author",
        price: 10.99,
        stock: 0,
      });

      const response = await request(app).post(
        `/api/books/${book._id}/purchase`
      );

      // This test will fail because the current implementation doesn't properly check stock
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found or out of stock");
    });

    it("should handle race conditions during purchase", async () => {
      // Create a book with 1 stock
      const book = await Book.create({
        title: "Test Book",
        author: "Test Author",
        price: 10.99,
        stock: 1,
      });

      // Simulate concurrent requests
      const purchasePromises = [
        request(app).post(`/api/books/${book._id}/purchase`),
        request(app).post(`/api/books/${book._id}/purchase`),
      ];

      const responses = await Promise.all(purchasePromises);
      const updatedBook = await Book.findById(book._id);

      // This test will fail because we're not handling concurrent purchases properly
      expect(updatedBook?.stock).toBe(0);
      expect(responses.filter((r) => r.status === 200)).toHaveLength(1);
      expect(responses.filter((r) => r.status === 404)).toHaveLength(1);
    });
  });

  describe("Schema Validation", () => {
    it("should prevent negative price", async () => {
      const bookData = {
        title: "Test Book",
        author: "Test Author",
        price: -10.99,
        stock: 5,
      };

      const book = new Book(bookData);

      // This test will fail because we haven't added price validation
      await expect(book.validate()).rejects.toThrow();
    });

    it("should prevent negative stock", async () => {
      const bookData = {
        title: "Test Book",
        author: "Test Author",
        price: 10.99,
        stock: -5,
      };

      const book = new Book(bookData);

      // This test will fail because we haven't added stock validation
      await expect(book.validate()).rejects.toThrow();
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle multiple simultaneous purchases atomically", async () => {
      const book = await Book.create({
        title: "Test Book",
        author: "Test Author",
        price: 10.99,
        stock: 3,
      });

      // Create 5 concurrent purchase requests (more than available stock)
      const purchasePromises = Array(5)
        .fill(null)
        .map(() => request(app).post(`/api/books/${book._id}/purchase`));

      const responses = await Promise.all(purchasePromises);
      const updatedBook = await Book.findById(book._id);

      // These assertions will fail with the current implementation
      expect(updatedBook?.stock).toBe(0);
      expect(responses.filter((r) => r.status === 200)).toHaveLength(3); // Only 3 should succeed
      expect(responses.filter((r) => r.status === 404)).toHaveLength(2); // 2 should fail
    });
  });
});
