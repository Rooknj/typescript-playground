/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import rimraf from "rimraf";
// import { execSync } from "child_process";

const remove = (fileOrDirectory: string): void => {
  rimraf(
    fileOrDirectory,
    (error: Error): void => {
      if (error) {
        console.log(`Error removing ${fileOrDirectory} ❌: `, error);
      } else {
        console.log(`Successfully removed ${fileOrDirectory} ✅`);
      }
    }
  );
};

// Remove dist folder
remove("dist");

// Remove build folder
remove("build");

// Remove coverage folder
remove("coverage");

// Remove database
// remove("data/*.sqlite");

// Bring down docker containers
// console.log("Bringing docker containers down");
// execSync("docker-compose down");
