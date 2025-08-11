# BASIC Compiler Usage Guide

This guide explains how to use the BASIC compiler in your projects.

## Installation

The BASIC compiler is designed to be used in a web browser environment. To include it in your project:

1. Copy the BASIC compiler files to your project directory
2. Include the main script in your HTML file:

```html
<script type="module">
  import BASICCompiler from './src/main.js';
  // Your code here
</script>
```

## Basic Usage

### Running BASIC Code

To run BASIC code, create an instance of the `BASICCompiler` class and call the `run` method:

```javascript
// Create a new compiler instance
const compiler = new BASICCompiler();

// Set up output function (optional)
compiler.setOutputFunction((text) => {
  console.log(text); // Or append to a DOM element
});

// BASIC code to run
const basicCode = `
10 PRINT "Hello, World!"
20 LET X = 5
30 PRINT "X = " + X
40 END
`;

// Run the code
const output = compiler.run(basicCode);
```

### Run Method Parameters

The `run` method accepts the following parameters:

```javascript
compiler.run(code, managerName, mode, debug, initialVars);
```

- `code` (string, required): The BASIC code to compile and run
- `managerName` (string, optional): The name of the function set manager (default: "main")
- `mode` (string, optional): The mode - "dev" or "pro" (default: "pro")
- `debug` (boolean, optional): Whether to enable debug output (default: false)
- `initialVars` (object, optional): Initial variables to set (default: {})

## BASIC Syntax

### Line Numbers

Each line of BASIC code must start with a line number. Line numbers determine the order of execution and are used as targets for GOTO and GOSUB statements.

```basic
10 PRINT "First line"
20 PRINT "Second line"
```

### Variables

Variables are created using the LET statement:

```basic
10 LET X = 5
20 LET NAME = "John"
```

### Arrays

Arrays are declared using the ARRAY statement:

```basic
10 ARRAY NUMBERS[10]
20 LET NUMBERS[0] = 42
```

### Control Flow

#### Conditional Statements

```basic
10 LET X = 5
20 IF X > 3 THEN GOTO 40
30 PRINT "X is less than or equal to 3"
40 PRINT "X is greater than 3"
```

#### Loops

```basic
10 FOR I = 1 TO 5
20 PRINT I
30 NEXT I
```

With step value:

```basic
10 FOR I = 0 TO 10 STEP 2
20 PRINT I
30 NEXT I
```

#### Subroutines

```basic
10 GOSUB 100
20 PRINT "Back from subroutine"
30 END
100 PRINT "In subroutine"
110 RETURN
```

### Input/Output

#### Printing

```basic
10 PRINT "Hello, World!"
20 LET X = 5
30 PRINT "X = " + X
```

#### User Input

```basic
10 INPUT "Enter your name: ", NAME
20 PRINT "Hello, " + NAME
```

### Comments

Use REM to add comments to your code:

```basic
10 REM This is a comment
20 PRINT "Hello" REM This is also a comment
```

## Advanced Features

### Namespaces

Define a namespace for your program:

```basic
10 NAMESPACE "MYPROGRAM"
```

### Loading System Variables

Load system variables:

```basic
10 LOAD SEC
20 PRINT "Current seconds: " + SEC
```

### Graphics Commands

Basic graphics commands:

```basic
10 CLS
20 PLOT 10, 10
30 DRAW 50, 50
40 TEXT "Hello", 100, 100
```

## Debugging

To enable debug output, set the debug parameter to true:

```javascript
const output = compiler.run(basicCode, "main", "pro", true);
```

This will log parsing and execution information to the console.

## Using the Compiler in a Web Worker

For better performance and to prevent the UI from freezing during execution of complex BASIC programs, you can run the compiler in a Web Worker:

### 1. Create a Worker File

Create a file named `Worker.js` with the following content:

```javascript
import BASICCompiler from './src/main.js';

const compiler = new BASICCompiler();

// Set output function to send messages back to the main thread
compiler.setOutputFunction(postMessage);

// Handle messages from the main thread
onmessage = (e) => {
    try {
        compiler.run(e.data, 'main', 'pro', false);
    } catch (error) {
        postMessage(`\nError: ${error.message}`);
    }
};
```

### 2. Use the Worker in Your HTML/JavaScript

In your main JavaScript code:

```javascript
// Create a new worker
const worker = new Worker('./Worker.js', { type: 'module' });

// Handle messages from the worker
worker.onmessage = (e) => {
    // e.data contains the output from the BASIC program
    console.log(e.data); // Or append to a DOM element
};

// Send BASIC code to the worker
const basicCode = `
10 PRINT "Hello from Web Worker!"
20 END
`;
worker.postMessage(basicCode);
```

This approach offers several advantages:
- The BASIC program runs in a separate thread, preventing UI freezes
- Long-running programs won't block your main application
- Better isolation between the compiler and your application code

## Examples

See the [Examples](example) directory for sample BASIC programs that demonstrate various features of the compiler.