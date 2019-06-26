/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { ApolloServer } from "apollo-server";
import { Container } from "typedi";
import { buildSchema } from "type-graphql";
import { createConnection, Connection } from "typeorm";
import { PubSub } from "graphql-subscriptions";
import { LightResolver } from "./Lights/light-resolver";
import { Light, LightState } from "./Lights/light-type";

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  const connection = await createConnection({
    type: "sqlite",
    database: path.join(__dirname, "..", "data", "test.sqlite"),
    entities: [Light, LightState],
    synchronize: true,
    logging: false,
  });

  // Set the connection in the container so it can be injected into services
  Container.set(Connection, connection);

  // Set up a pub sub system for Graphql Subscriptions
  const pubSub = new PubSub();
  Container.set(PubSub, pubSub);

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [LightResolver],
    // Automatically create `schema.gql` file with schema definition in current folder if not running from a pkg executable
    // Don't create the schema file if running from a pkg executable
    emitSchemaFile: process.env.NODE_ENV ? path.resolve(__dirname, "schema.gql") : false,
    // register 3rd party IOC container
    container: Container,
    // Use our custom PubSub system
    pubSub,
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
