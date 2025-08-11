# JavaScript BASIC Compiler

A JavaScript implementation of a BASIC language compiler, rewritten from a Python version to run in web browsers.

## Overview

This project is a JavaScript rewrite of a Python BASIC compiler. It allows you to write, run, and debug BASIC programs directly in your web browser. The compiler supports many BASIC language features including variables, arrays, loops, conditionals, and more.

## Features

- **In-browser Execution**: Run BASIC code directly in your web browser without any server-side processing.
- **Interactive UI**: User-friendly interface with code editor and output display.
- **Example Programs**: Pre-built example programs to help you get started.
- **Core BASIC Features**:
  - Variables and arrays
  - Arithmetic operations
  - Conditional statements (IF-THEN-ELSE)
  - Loops (FOR-NEXT)
  - GOTO and GOSUB statements
  - Input and output (PRINT, INPUT)
  - Comments (REM)

## Getting Started

### Running the Compiler

1. Open `index.html` in a web browser.
2. Enter your BASIC code in the editor or select an example from the dropdown.
3. Click the "Run" button to execute the code.
4. View the output in the output panel.

### Example BASIC Programs

#### Hello World
```basic
10 REM Hello World Program
20 PRINT "Hello, World!"
30 END
```

#### For Loop
```basic
10 REM For Loop Example
20 FOR I = 1 TO 5
30 PRINT "Count: "; I
40 NEXT I
50 END
```

#### Conditional Statement
```basic
10 REM Conditional Example
20 INPUT "Enter a number: "; X
30 IF X > 10 THEN PRINT "Number is greater than 10" ELSE PRINT "Number is less than or equal to 10"
40 END
```

## BASIC Language Reference

### Line Numbers
All BASIC statements must begin with a line number. Line numbers determine the order of execution.

### Variables
Variables can be created and assigned values using the LET statement:
```basic
10 LET X = 42
```

### Arrays
Arrays can be created and accessed:
```basic
10 ARRAY A
20 A[1] = 42
30 PRINT A[1]
```

### Arithmetic Operations
The compiler supports basic arithmetic operations:
```basic
10 PRINT 2 + 3 * 4  REM Outputs 14
```

### Control Flow

#### IF-THEN-ELSE
```basic
10 IF X > 10 THEN PRINT "Greater than 10" ELSE PRINT "Less than or equal to 10"
```

#### FOR-NEXT Loops
```basic
10 FOR I = 1 TO 5
20 PRINT I
30 NEXT I
```

#### GOTO
```basic
10 PRINT "Before GOTO"
20 GOTO 40
30 PRINT "This will be skipped"
40 PRINT "After GOTO"
```

#### GOSUB and RETURN
```basic
10 GOSUB 100
20 PRINT "Back from subroutine"
30 END
100 PRINT "In subroutine"
110 RETURN
```

### Input/Output

#### PRINT
```basic
10 PRINT "Hello, World!"
20 PRINT X
30 PRINT "Value: "; X
```

#### INPUT
```basic
10 INPUT "Enter your name: "; NAME
20 PRINT "Hello, "; NAME
```

### Comments
```basic
10 REM This is a comment
```

## Project Structure

- `index.html` - Main HTML interface for the compiler
- `test.html` - Test page with various BASIC code examples
- `src/` - JavaScript source files
  - `main.js` - Main compiler class and entry point
  - `BASICParser.js` - Parser for BASIC code
  - `BASICInterrupter.js` - Interpreter for executing BASIC code
  - `functionSet.js` - Implementation of BASIC functions
  - `setManager.js` - Manager for function sets
  - `helpFunctions.js` - Helper functions used by the compiler

## Technical Details

### Architecture

The compiler follows a traditional compilation pipeline:

1. **Lexical Analysis & Parsing**: The `BASICParser` class tokenizes the BASIC code and creates a structured representation.
2. **Interpretation**: The `BASICInterrupter` class executes the tokenized code.
3. **Function Execution**: The `FunctionSet` class implements the actual BASIC commands.

### Integration

To integrate the BASIC compiler into your own projects:

```javascript
import BASICCompiler from './src/main.js';

// Create compiler instance
const compiler = new BASICCompiler();

// Set output function
compiler.setOutputFunction(text => {
    console.log(text); // Or append to a DOM element
});

// Run BASIC code
const code = '10 PRINT "Hello, World!"';
compiler.run(code);
```

## Testing

The project includes a test page (`test.html`) with various BASIC code examples to verify the compiler's functionality. Open this file in a web browser to run the tests.

## Limitations

- The compiler does not support all features of standard BASIC.
- Error handling is basic and may not provide detailed error messages.
- Performance may be limited for very large or complex BASIC programs.

## Future Improvements

- Add support for more BASIC language features
- Improve error handling and reporting
- Enhance the UI with syntax highlighting and auto-completion
- Add ability to save and load BASIC programs
- Implement a debugger with step-by-step execution

## License

This project is open source and available under the MIT License.

## Acknowledgements

This project is a JavaScript rewrite of a Python BASIC compiler. The original Python implementation provided the foundation for this JavaScript version.