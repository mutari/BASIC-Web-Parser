import BASICCompiler from './src/main.js'; // adjust path if needed
console.log('Worker is running');

const compiler = new BASICCompiler();

compiler.setOutputFunction(postMessage);

onmessage = (e) => {
    try {
        compiler.run(e.data, 'main', 'pro', false);
    } catch (error) {
        postMessage(`\nError: ${error.message}`);
    }
};