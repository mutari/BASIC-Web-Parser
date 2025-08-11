# BASIC Compiler Documentation

## Overview

This is a JavaScript implementation of a BASIC language compiler. BASIC (Beginner's All-purpose Symbolic Instruction Code) is a family of high-level programming languages designed to be easy to learn and use. This compiler allows you to write BASIC code and execute it in a JavaScript environment.

## Features

- **BASIC Language Support**: Implements core BASIC language features including variables, arrays, loops, conditionals, and subroutines.
- **JavaScript Integration**: Runs in browser environments, allowing integration with web applications.
- **Customizable Output**: Redirect output to custom functions for integration with UI elements.

## Core Components

The compiler consists of several key components:

1. **BASICCompiler**: The main class that coordinates parsing and execution of BASIC code.
2. **BASICParser**: Converts BASIC code into tokens that can be processed by the interpreter.
3. **BASICInterrupter**: Executes the parsed tokens, handling program flow and operations.
4. **FunctionSet**: Manages variables, arrays, and functions available to the BASIC program.

## Supported BASIC Commands

The compiler supports the following BASIC commands:

- **PRINT**: Outputs text or variable values
- **LET**: Assigns values to variables
- **GOTO**: Jumps to a specific line number
- **ARRAY**: Declares arrays
- **INPUT**: Accepts user input
- **IF/THEN/ELSE**: Conditional execution
- **FOR/TO/NEXT**: Loop constructs
- **GOSUB/RETURN**: Subroutine calls
- **REM**: Comments
- **NAMESPACE**: Defines a namespace for the program
- **LOAD**: Loads system variables or functions
- **IMPORT/AS**: Imports external code
- **PLOT/DISPLAY/DRAW/TEXT**: Graphics commands
- **PAUSE**: Pauses execution
- **EXPORT**: Exports data
- **CLS/CLT/CLC**: Clear screen/text/canvas commands

## Getting Started

To use the BASIC compiler in your project, see the [Usage Guide](usage.md) for detailed instructions and the [Examples](example) directory for sample BASIC programs.

## License

This project is available for use under the terms specified in the project repository.