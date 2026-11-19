// Request logger lines would drown the test output; errors are kept visible.
console.info = (): void => undefined;
