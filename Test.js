import BASICCompiler from './src/main.js';

const compiler = new BASICCompiler();

// Set output function
compiler.setOutputFunction(console.log);

const code = `
10 REM This is a test
20 PRINT "Hello World!"
`;

try {
    // Run the code
    compiler.run(code, 'main', 'pro', false);
} catch (error) {
    output.textContent += `\nError: ${error.message}`;
    console.error(error);
}