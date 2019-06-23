/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import parseArgs from "minimist";
import spawn from "cross-spawn";
// @ts-ignore
import { name, version } from "../package.json";

const IMAGE_NAME = `rooknj/${name}`;

const getDockerImage = (tag: string): string => {
  let dockerTag = tag;
  if (process.env.TRAVIS) {
    console.log("In CI");
    const tagName = process.env.TRAVIS_TAG;
    if (tagName) {
      dockerTag = version;
    } else {
      const branchName = process.env.TRAVIS_BRANCH;
      if (branchName === "master") {
        dockerTag = "master";
      } else {
        dockerTag = "test";
      }
    }
  }
  return `${IMAGE_NAME}:${dockerTag}`;
};

const buildDockerImage = async (tag: string): Promise<void> => {
  const image = getDockerImage(tag);
  console.log("Building", image);
  const child = spawn("docker", ["build", "-t", image, "."], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env,
  });

  // If docker build fails, then exit with an error code
  child.on(
    "exit",
    (code: number): void => {
      if (code !== 0) process.exit(code);
    }
  );
};

const publishDockerImage = async (tag: string): Promise<void> => {
  const image = getDockerImage(tag);
  console.log("Publishing", image);
  const child = spawn("docker", ["push", image], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env,
  });

  // If docker push fails, then exit with an error code
  child.on(
    "exit",
    (code: number): void => {
      if (code !== 0) process.exit(code);
    }
  );
};

// Process all command line arguments
const processArgs = async (argv: string[]): Promise<void> => {
  const args = parseArgs(argv.slice(2));
  // a tag is required if not in CI
  if (!args.t && !process.env.TRAVIS) {
    console.log("Not in CI and no tag was given. Aborting");
    process.exit(1);
  }

  if (args._.find((arg: string): boolean => arg === "build")) {
    buildDockerImage(args.t);
  } else if (args._.find((arg: string): boolean => arg === "publish")) {
    publishDockerImage(args.t);
  } else {
    console.log("No valid options supplied. Aborting");
    process.exit(1);
  }
};

processArgs(process.argv);
