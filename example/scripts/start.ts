/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import * as spawn from "cross-spawn";
// import * as spawnArgs from "spawn-args";
import { delimiter, resolve as pathResolve } from "path";
// import { execSync } from "child_process";

process.env.NODE_ENV = "development";

// Crash on unhandled rejections
process.on(
  "unhandledRejection",
  (err): never => {
    throw err;
  }
);

// Get start arguments
// const argv = process.argv.slice(2);

// Handle mock server
// if (argv.indexOf("--mock") >= 0) {
//   console.log("Starting Prysma using mock services");
//   process.env.MOCK = "true";
// } else if (argv.indexOf("--remote") >= 0) {
//   console.log("Starting Prysma using remote services");
//   process.env.MQTT_HOST = "prysma.local";
//   process.env.REDIS_HOST = "prysma.local";
// } else {
//   console.log("Starting Prysma using local services");
//   // Start docker containers
//   console.log("Spinning up Local MQTT broker");
//   process.env.MQTT_HOST = "localhost";
//   // console.log("Spinning up Local Redis Server");
//   // process.env.REDIS_HOST = "localhost";
//   execSync("docker-compose up -d mqtt", {
//     stdio: [process.stdin, process.stdout], // Ignore stderr so nothing prints to the console if this fails.
//   });
// }

// Start Nodemon with cross-spawn
spawn.sync("nodemon", ["-e", "ts", "-w", "./src", "-x", "ts-node", "src/index.ts"], {
  stdio: ["inherit", "inherit", "inherit"],
  cwd: process.cwd(),
  env: Object.assign({}, process.env, {
    PATH: process.env.PATH + delimiter + pathResolve(process.cwd(), "node_modules", ".bin"),
  }),
});
