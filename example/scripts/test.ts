/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import * as spawn from "cross-spawn";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on(
  "unhandledRejection",
  (err): never => {
    throw err;
  }
);

const argv = process.argv.slice(2);

if (argv.indexOf("--no-watch") >= 0) {
  process.env.CI = "true";
  argv.splice(argv.indexOf("--no-watch"), 1); // Remove no-watch option from argv so jest doesn't screw up
}

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf("--coverage") < 0) {
  argv.push("--watch");
}

const { status } = spawn.sync("jest", argv, {
  stdio: ["inherit", "inherit", "inherit"],
});

// If any tests failed, return with an error exit code
if (status !== 0) process.exit(status);
