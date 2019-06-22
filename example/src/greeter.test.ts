import Greeter from "./greeter";

test("basic", (): void => {
  const greeter = new Greeter("World");
  expect(greeter.greet()).toBe("Hello, World");
});
