declare module "pkg" {
  export const exec: (args: string[]) => Promise<void>;
}
