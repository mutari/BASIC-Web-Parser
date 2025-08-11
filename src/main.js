import Parser from './BASICParser.js';
import Interrupter from './BASICInterrupter.js';
import SetManager from './setManager.js';
import { getFileInput, createHashMap } from './helpFunctions.js';

/**
 * Main class for the BASIC compiler
 */
class BASICCompiler {
    /**
     * Constructor for BASICCompiler
     */
    constructor() {
        this.commandList = [];
        this.commandMap = {};
        this.tokens = null;
        this.functionManager = null;
        this.interrupter = null;
        this.parser = null;
        this.output = "";
    }

    /**
     * Sets the output function
     * @param {Function} outputFunction - The function to call for output
     */
    setOutputFunction(outputFunction) {
        // This will be used to redirect output to the UI
        self.basicOutput = {
            textContent: "",
            append: function(text) {
                this.textContent += text;
                if (outputFunction) {
                    outputFunction(text);
                }
            }
        };
    }

    /**
     * Compiles and runs BASIC code
     * @param {string} code - The BASIC code to compile and run
     * @param {string} managerName - The name of the function set manager
     * @param {string} mode - The mode (dev or pro)
     * @param {boolean} debug - Whether to enable debug output
     * @param {Object} initialVars - Initial variables to set
     * @returns {string} - The output of the program
     */
    run(code, managerName = "main", mode = "pro", debug = false, initialVars = {}) {
        // Reset output
        if (self.basicOutput) {
            self.basicOutput.textContent = "";
        }
        
        // Get command list from code
        this.commandList = getFileInput(code);
        
        // Create command map
        this.commandMap = createHashMap(this.commandList);
        
        if (debug) {
            console.log("Command Map:", this.commandMap);
        }
        
        // Parse the code
        this.parser = new Parser(managerName);
        this.tokens = this.parser.parseMap(this.commandMap);
        
        if (debug) {
            console.log("(Parser) Tokens:", JSON.stringify(this.tokens, null, 2));
            console.log("(Parser) Command Map:", this.parser.getCommandMap());
        }
        
        // Create function manager
        this.functionManager = new SetManager();
        
        // Create interrupter
        this.interrupter = new Interrupter(this.functionManager, managerName, mode);
        
        // Get function set
        const functionSet = this.functionManager.getByName(managerName);
        if (debug) {
            console.log("(SetManager) functionSet:", functionSet);
        }
        
        // Set initial variables
        for (const varName in initialVars) {
            functionSet.createNewVar(varName, initialVars[varName]);
        }
        
        // Run the code
        this.interrupter.interrupt(this.tokens);
        
        if (debug) {
            console.log("Variables:", JSON.stringify(functionSet.varList, null, 2));
            console.log("Arrays:", JSON.stringify(functionSet.arrayList, null, 2));
        }
        
        // Return the output
        return self.basicOutput ? self.basicOutput.textContent : "";
    }
}

// Create a global instance if in browser
if (typeof window !== 'undefined') {
    self.BASICCompiler = new BASICCompiler();
}

export default BASICCompiler;