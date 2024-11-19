import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import { Book } from "./models";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bookstore";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the bookstore API" });
});

app.get("/api/books", async (req: Request, res: Response): Promise<any> => {
  try {
    const books = await Book.find();
    return res.json(books);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.get("/api/books/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const book = await Book.findById(req.params.id);
    return res.json(book);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch book" });
  }
});

app.post("/api/books", async (req: Request, res: Response): Promise<any> => {
  try {
    const book = await Book.create(req.body);
    return res.json(book);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create book" });
  }
});

app.post(
  "/api/books/:id/purchase",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      if (book.stock > 0) {
        book.stock -= 1;
        await book.save();
        return res.json({ message: "Purchase successful", book });
      } else {
        return res.status(404).json({ error: "Book out of stock" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Failed to process purchase" });
    }
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
