import _ from 'lodash'
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

const typeDefs = `#graphql
  scalar Odd

  type Query {
    echoOdd(odd: Odd!): Odd!
  }
`

const oddValueValidator = value => {
  if (!_.isInteger(value) || (value & 1) === 0) throw new GraphQLError('Provided value is not an odd integer', { extensions: { code: 'BAD_USER_INPUT' } })
  return value
}

const resolvers = {
  Odd: new GraphQLScalarType({
    name: 'Odd',
    description: 'Odd custom scalar type',
    parseValue: oddValueValidator,
    serialize: oddValueValidator,
    parseLiteral: ast => {
      if (ast.kind !== Kind.INT) throw new GraphQLError('Provided value is not an odd integer', { extensions: { code: 'BAD_USER_INPUT' } })
      return oddValueValidator(_.parseInt(ast.value))
    },
  }),
  Query: {
    echoOdd (root, { odd }) { return odd },
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