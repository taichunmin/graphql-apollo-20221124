import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { createServer } from 'http'
import { expressMiddleware } from '@apollo/server/express4'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'

const typeDefs = `#graphql
  type Query {
    hello: String
  }

  type Subscription {
    numberIncremented: Int
  }
`

const sleep = t => new Promise(r => setTimeout(r, t))

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
  Subscription: {
    numberIncremented: {
      subscribe: async function* () {
        let counter = 0
        while (true) {
          await sleep(1000)
          yield { numberIncremented: counter++ }
        }
      }
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()
const httpServer = createServer(app)

const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })

const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await server.start()
app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server))

const PORT = 4000
await new Promise((resolve) => { httpServer.listen(PORT, resolve) })

console.log(`🚀 Server ready at: http://localhost:${PORT}/graphql`)