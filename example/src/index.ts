/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { Container } from "typedi";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { PubSub } from "graphql-subscriptions";
import MQTT from "async-mqtt";
import { LightResolver } from "./Lights/light-resolver";
import { Light, LightState } from "./Lights/light-type";
import { name, version } from "../package.json";

console.log(`💡  Initializing ${name} v${version} 💡`);

// Unhandled error logging
process.on("uncaughtException", (error): void => {
  console.error("Unhandled Exception", error);
  process.exit(1);
});
process.on("unhandledRejection", (error): void => {
  console.error("Unhandled Rejection", error);
  process.exit(1);
});

// listen for the signal interruption (ctrl-c)
// Close all connected clients
process.on(
  "SIGINT",
  async (): Promise<void> => {
    console.log("SIGINT signal received, shutting down gracefully...");
    // TODO: Close connected clients
    console.log("Successfully shut down. Goodbye");
    process.exit(0);
  }
);

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  // Set up a pub sub system for Graphql Subscriptions
  const pubSub = new PubSub();
  Container.set(PubSub, pubSub); // Set up Dependency Injection

  // Connect to outside dependencies
  const DB_NAME = "test.sqlite";
  const DB_OPTIONS: ConnectionOptions = {
    type: "sqlite",
    // Create the SQLite database in the executable's directory if running from a pkg executable
    database: process.env.NODE_ENV
      ? path.join(__dirname, "..", "data", DB_NAME)
      : path.join("data", DB_NAME),
    entities: [Light, LightState],
    synchronize: true,
    logging: false,
  };
  const MQTT_HOST = `tcp://${process.env.MQTT_HOST || "localhost"}:1883`;
  const MQTT_OPTIONS: MQTT.IClientOptions = {
    reconnectPeriod: 5000, // Amount of time between reconnection attempts
    username: "pi",
    password: "MQTTIsBetterThanUDP",
  };
  const [connection, mqttClient] = await Promise.all([
    createConnection(DB_OPTIONS),
    MQTT.connect(MQTT_HOST, MQTT_OPTIONS),
  ]);
  Container.set(Connection, connection); // Set up Dependency Injection
  Container.set("MQTT_CLIENT", mqttClient); // Set up Dependency Injection (AsyncMqttClient type causes an error here)

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
