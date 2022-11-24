import _ from 'lodash'
import { GraphQLScalarType, Kind } from 'graphql'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime() // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value) // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(_.parseInt(ast.value)) // Convert hard-coded AST string to integer and then to Date
    }
    return null // Invalid hard-coded value (not an integer)
  },
})

const events = [
  { id: 1, date: new Date('2019-01-01') },
  { id: 1, date: new Date('2019-01-02') },
]

const typeDefs = `#graphql
  scalar Date

  type Event {
    id: ID!
    date: Date!
  }

  type Query {
    events: [Event!]!
  }
`

const resolvers = {
  Date: dateScalar,
  Query: {
    events: () => events,
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