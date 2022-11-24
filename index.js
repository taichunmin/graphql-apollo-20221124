import _ from 'lodash'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import GraphQLJSON from 'graphql-type-json'

const typeDefs = `#graphql
  scalar JSON

  type MyObject {
    myField: JSON
  }

  type Query {
    objects: [MyObject!]!
  }
`

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    objects: () => [
      { myField: { a: 1 } }, 
      { myField: { b: 2 } },
      { myField: [{ c: 3 }] },
    ],
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