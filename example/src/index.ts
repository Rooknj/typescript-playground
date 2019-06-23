/* eslint no-console:0 */
import { ApolloServer, gql } from "apollo-server";

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  console.log("Hello World");

  // The GraphQL schema
  const typeDefs = gql`
    type Query {
      "A simple type for getting started!"
      hello: String
    }
  `;

  // A map of functions which return data for the schema.
  const resolvers = {
    Query: {
      hello: (): string => "world",
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await server.listen();
  console.log(`🚀 Server ready at ${url}`);
})();
