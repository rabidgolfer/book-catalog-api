// run npx jest to have these tests each execute

const request = require('supertest');
const app = require('./index'); // Path to your main application file
const { gql } = require('graphql-request');


// Write a basic test:
test('Server is running', async () => {
  const response = await request(app).get('/graphql');
  expect(response.status).toBe(200);
});


// Write a GraphQL query test:
test('Querying books returns a list', async () => {
    const query = gql`
      query {
        books {
          title
          author
        }
      }
    `;
  
    const response = await request(app)
      .post('/graphql')
      .send({ query });
  
    expect(response.body.data.books).toBeDefined();
    expect(response.body.data.books).toHaveLength(1); // Assuming initial data has one book
    expect(response.body.data.books[0].title).toBe('The Hitchhiker\'s Guide to the Galaxy');
  });


  // Write a GraphQL mutation test:
  test('Creating a book adds it to the list', async () => {
    const mutation = gql`
      mutation {
        createBook(
          title: "The Lord of the Rings"
          author: "J.R.R. Tolkien"
          publicationYear: 1954
        ) {
          id
          title
          author
        }
      }
    `;
  
    const response = await request(app)
      .post('/graphql')
      .send({ query: mutation });
  
    expect(response.body.data.createBook).toBeDefined();
    expect(response.body.data.createBook.title).toBe('The Lord of the Rings');
  
    // Check if the added book is now in the list
    const query = gql`
      query {
        books {
          title
          author
        }
      }
    `;
  
    const booksResponse = await request(app)
      .post('/graphql')
      .send({ query });
  
    expect(booksResponse.body.data.books).toHaveLength(2);
  });
  