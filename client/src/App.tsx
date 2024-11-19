import React from "react";

import { IBook } from "common/dist";

function App() {
  const titleRef = React.useRef<HTMLInputElement>(null);
  const authorRef = React.useRef<HTMLInputElement>(null);
  const priceRef = React.useRef<HTMLInputElement>(null);
  const stockRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [books, setBooks] = React.useState<IBook[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      setError(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    (async () => {
      await fetchBooks();
    })();
  }, []);

  const getBookById = async (id: string) => {
    const response = await fetch(`http://localhost:5001/api/books/${id}`);
    const data = await response.json();
    return data;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = titleRef.current?.value;
    const author = authorRef.current?.value;
    const price = priceRef.current?.value;
    const stock = stockRef.current?.value;

    try {
      await fetch("http://localhost:5001/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, author, price, stock }),
      });
      await fetchBooks();
    } catch (error) {
      setError(JSON.stringify(error));
    }
  };

  return loading ? (
    <p>Loading...</p>
  ) : (
    <div>
      <p>Books:</p>
      {books.length > 0 ? (
        <ul>
          {books.map((book) => {
            return (
              <li key={book.title}>
                <div>
                  <p>Title: {book.title}</p>
                  <p>Author: {book.author}</p>
                  <p>Price: ${book.price}</p>
                  <p>Stock: {book.stock}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No books found</p>
      )}

      <form onSubmit={async (event) => await handleSubmit(event)}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          ref={titleRef}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          required
          ref={authorRef}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          required
          ref={priceRef}
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          required
          ref={stockRef}
        />
        <button>Add new book</button>
      </form>

      {error ? <p>error: {error}</p> : null}
    </div>
  );
}

export default App;
