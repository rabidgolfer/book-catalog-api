const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { v4: uuidv4 } = require('uuid');

// Define the schema with new format additions
const schema = buildSchema(`
    type Book {
        id: ID!
        title: String!
        author: String
        publicationYear: Int
        enjoyed: Boolean!
        format: [String!]!
    }

    type Query {
        books(sortBy: String): [Book!]!
    }

    type Mutation {
        createBook(title: String!, author: String, publicationYear: Int, enjoyed: Boolean, format: [String!]): Book
        updateBookEnjoyed(id: ID!, enjoyed: Boolean!): Book
        addBookFormat(id: ID!, format: String!): Book
        deleteBook(id: ID!): Book
    }
`);

// Initialize book data with default "enjoyed" and format
let books = [{
    id: uuidv4(),
    title: 'The Hitchhiker\'s Guide to the Galaxy',
    author: 'Douglas Adams',
    publicationYear: 1979,
    enjoyed: true,
    format: ['paperback']
}];

const rootResolver = {
    books: ({ sortBy }) => {
        if (sortBy === 'title') {
            return books.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'publicationYear') {
            return books.sort((a, b) => a.publicationYear - b.publicationYear);
        } else {
            return books; // Default sorting
        }
    },
    createBook: ({ title, author, publicationYear, enjoyed = true, format = [] }) => {
        if (enjoyed === undefined) {
            throw new Error('"enjoyed" field is mandatory');
        }
        const newBook = {
            id: uuidv4(), // Generate UUID for the new book
            title,
            author,
            publicationYear,
            enjoyed
        };
        books.push(newBook);
        return newBook;
    },
    updateBookEnjoyed: ({ id, enjoyed }) => {
        const bookIndex = books.findIndex(book => book.id === id);

        if (bookIndex === -1) {
            throw new Error('Book with the provided ID not found');
        }

        books[bookIndex].enjoyed = enjoyed;
        return books[bookIndex];
    },
    addBookFormat: ({ id, format }) => {
        const validFormats = ['audiobook', 'paperback', 'hardcover'];
        if (!validFormats.includes(format)) {
            throw new Error(`Invalid format provided. Allowed formats: ${validFormats.join(', ')}`);
        }

        const bookIndex = books.findIndex(book => book.id === id);

        if (bookIndex === -1) {
            throw new Error('Book with the provided ID not found');
        }

        const book = books[bookIndex];
        // Ensure format is not already present
        if (!book.format.includes(format)) {
            book.format.push(format);
        }
        return book;
    },

    deleteBook: ({ id }) => {
        const bookIndex = books.findIndex(book => book.id === id);

        if (bookIndex === -1) {
            throw new Error('Book with the provided ID not found');
        }

        const deletedBook = books[bookIndex];
        books.splice(bookIndex, 1);
        return deletedBook;
    }

};

const app = express();

// GraphQL middleware remains unchanged
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: rootResolver,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('GraphQL server running on port 4000');
});