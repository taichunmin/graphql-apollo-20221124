import _ from 'lodash'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

const typeDefs = `#graphql
  union SearchResult = Book | Author

  type Book {
    title: String!
  }

  type Author {
    name: String!
  }

  type Query {
    search(contains: String!): [SearchResult!]
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
    search: (root, { contains }, context) => {
      return _.filter([...books, ...authors], ({ title, name }) => {
        return title ? title.includes(contains) : name.includes(contains)
      })
    },
  },
  SearchResult: {
    __resolveType: (obj, context) => {
      if (_.hasIn(obj, 'name')) return 'Author'
      if (_.hasIn(obj, 'title')) return 'Book'
      return null
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