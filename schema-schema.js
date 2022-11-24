import _ from 'lodash'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: Author
  }

  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }

  type Query {
    books: [Book!]!
    authors: [Author!]!
  }
`

const books = [
  { id: 1, title: 'The Awakening', authorId: 1 },
  { id: 2, title: 'City of Glass', authorId: 2 },
]

const authors = [
  { id: 1, name: 'Kate Chopin' },
  { id: 2, name: 'Paul Auster' },
]

const resolvers = {
  Query: {
    books: () => books,
    authors: () => authors,
  },
  Book: {
    author: (parent, args, context) => {
      return _.find(authors, ['id', parent.authorId])
    },
  },
  Author: {
    books: (parent, args, context) => {
      return _.filter(books, ['authorId', parent.id])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`🚀  Server ready at: ${url}`)