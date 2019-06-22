/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import * as spawn from "cross-spawn";
import * as path from "path";
import { exec } from "pkg";
import { name, version } from "../package.json";

const EXECUTABLE_NAME = name;
const BUILD_FOLDER = "build";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on(
  "unhandledRejection",
  (err): never => {
    throw err;
  }
);

// BUILD: Build an executable with pkg
let target: string;
if (process.env.PKG_TARGET) {
  // Run pkg with this target
  target = process.env.PKG_TARGET;
} else {
  switch (process.platform) {
    case "darwin": // mac
      target = "node10-macos-x64";
      break;
    case "win32": // windows
      target = "node10-win-x64";
      break;
    case "linux": // linux
      target = "node10-linux-x64";
      break;
    default:
      throw new Error("No target specified");
  }
}

console.log(`🛠  Building ${name} v${version} 🛠`);

console.log("Compiling Typescript...");
const { status } = spawn.sync("tsc", {
  stdio: ["inherit", "inherit", "inherit"],
});
// If the typescript compilation failed, return with an error exit code
if (status !== 0) {
  console.log("Error Compiling Typescript ❌");
  process.exit(status);
} else {
  console.log("Compilation Successful ✅");
}

console.log("Building Executable...");
const outputFile = `./${BUILD_FOLDER}/${EXECUTABLE_NAME}`;
exec([".", "--target", target, "--output", outputFile]);
console.log("Build Success ✅");
console.log(`Executable located at ${path.join(BUILD_FOLDER, EXECUTABLE_NAME)}`);
