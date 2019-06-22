class Greeter {
  private greeting: string;

  public constructor(message: string) {
    this.greeting = message;
  }

  public greet(): string {
    return `Hello, ${this.greeting}`;
  }
}

const greeter = new Greeter("world");

console.log(greeter.greet());

export default Greeter;
