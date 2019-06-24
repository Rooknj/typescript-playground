/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { LightResolver } from "./Lights/light-resolver";

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [LightResolver],
    // Automatically create `schema.gql` file with schema definition in current folder if not running from a pkg executable
    // Don't create the schema file if running from a pkg executable
    emitSchemaFile: process.env.NODE_ENV ? path.resolve(__dirname, "schema.gql") : false,
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    // enable GraphQL Playground
    playground: true,
  });

  const { url } = await server.listen(4000);
  console.log(`🚀 Server ready at ${url}`);
})();
