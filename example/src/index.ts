/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { LightResolver } from "./light-resolver";

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  console.log("Hello World");

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [LightResolver],
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
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
