import { tokenRowSlice, getFileInput } from './helpFunctions.js';

/**
 * Evaluates a numeric expression
 * @param {Object} input - The input tokens
 * @returns {number|boolean} - The evaluated result or false if not a valid numeric expression
 */
function evalNum(input) {
    let out = "";
    
    for (const c in input) {
        const value = input[c].value;
        const key = input[c].type;
        
        if (key === "NUM") {
            out += String(value);
        } else if (key === "OPERATOR") {
            if (value === "PLUS") {
                out += "+";
            } else if (value === "MINUS") {
                out += "-";
            } else if (value === "MULTIPLIKATION") {
                out += "*";
            } else if (value === "SLASH") {
                out += "/";
            } else if (value === "LEFTPARENTHESIS") {
                out += "(";
            } else if (value === "RIGHTPARENTHESIS") {
                out += ")";
            }
        } else {
            return false;
        }
    }
    
    try {
        return eval(out);
    } catch (e) {
        console.error("Error evaluating expression:", out);
        return false;
    }
}

/**
 * Checks if a character is a number
 * @param {string|number} char - The character to check
 * @returns {boolean} - True if the character is a number
 */
function isNumber(char) {
    return /^\d+$/.test(String(char));
}

/**
 * Prints a value to the console (will be adapted for browser)
 * @param {*} value - The value to print
 */
function basicPrint(value) {
    // In browser context, this would append to a DOM element
    if (typeof self !== 'undefined' && self.basicOutput) {
        self.basicOutput.append(`${value}\n`);
    }
}

/**
 * Gets input from the user (will be adapted for browser)
 * @param {string} text - The prompt text
 * @returns {string} - The user input
 */
function basicInput(text) {
    // In browser context, this would use a prompt or custom input mechanism
    if (typeof window !== 'undefined') {
        return prompt(text);
    }
    return ""; // Default for non-browser environments
}

/**
 * Gets the key of a value in a dictionary
 * @param {Object} data - The dictionary
 * @param {*} val - The value to find
 * @param {string} index - The index to check
 * @returns {number|null} - The key or null if not found
 */
function getKeyOf(data, val, index = "value") {
    let i = 0;
    const keys = Object.keys(data);
    
    while (i < keys.length) {
        if (data[keys[i]][index] === val) {
            return i;
        }
        i++;
    }
    
    return null;
}

/**
 * Evaluates a string expression
 * @param {Object} input - The input tokens
 * @returns {string} - The evaluated string
 */
function evalString(input) {
    let out = "";
    const keys = Object.keys(input);
    
    let i = 0;
    while (i < keys.length) {
        const token = input[keys[i]];
        
        if (i % 2 === 0) { // if first item
            if (token.type === "STR") {
                out += String(token.value);
            } else if (token.type === "NUM") {
                out += String(token.value);
            } else {
                return "Error evalStr input :: " + JSON.stringify(input);
            }
        } else if (token.value !== "PLUS" && token.value !== "MINUS") {
            return "Error evalStr input :: " + JSON.stringify(input);
        }
        
        i++;
    }
    
    return out;
}

/**
 * Class for managing BASIC functions
 */
class FunctionSet {
    /**
     * Constructor for FunctionSet
     * @param {string} threadName - The name of the thread
     * @param {string} mode - The mode (dev or pro)
     */
    constructor(threadName, mode) {
        this.name = threadName;
        this.varList = [];
        this.arrayList = [];
        this.oldIndexes = [];
        this.forLoop = [];
        this.namespace = "";
        this.mode = mode;
        this.maxLoopCount = 100_000;
    }

    /**
     * Gets the name of the function set
     * @returns {string} - The name
     */
    getName() {
        return this.name;
    }

    /**
     * Implements the PRINT command
     * @param {Object} tokens - The tokens to print
     */
    PRINT(tokens) {
        const output = this.advancedEval(tokens);
        basicPrint(output);
    }

    /**
     * Implements the LET command
     * @param {Object} name - The variable name
     * @param {Object} value - The value to assign
     */
    LET(name, value) {
        this.createNewVar(name.value, this.advancedEval(value));
    }

    /**
     * Implements the ARRAY_CREATE command
     * @param {Object} name - The array name
     * @param {number} dim - The array dimension
     */
    ARRAY_CREATE(name, dim) {
        this.createNewArray(name.value, dim);
    }

    /**
     * Implements the ARRAY_UPDATE command
     * @param {string} name - The array name
     * @param {Object} data - The array data
     */
    ARRAY_UPPDATE(name, data) {
        const array = this.getArrayByName(name);
        const key = this.generateArrayKeys(data);
        
        // test if the right amount of array keys
        if (key.keysFound > parseInt(array.dimension)) {
            console.error("Too many keys", key, "array:", array);
            throw new Error("Too many keys");
        } else if (key.keysFound < parseInt(array.dimension)) {
            console.error("Too few keys:", key, "array:", array);
            throw new Error("Too few keys");
        }
        
        if (data[Object.keys(data)[key.endOfKeys]].value === "EQ") {
            data = tokenRowSlice(data, key.endOfKeys + 1);
            const value = this.advancedEval(data);
            this.updateArray(name, key.keys, value);
        }
    }

    /**
     * Implements the INPUT command
     * @param {Object} varName - The variable name
     * @param {Object} text - The prompt text
     */
    INPUT(varName, text) {
        text = this.advancedEval(text);
        const value = basicInput(text);
        this.createNewVar(varName.value, value);
    }

    /**
     * Implements the GOTO command
     * @param {Object} data - The line number
     * @returns {number} - The line number
     */
    GOTO(data) {
        return this.advancedEval(data);
    }

    /**
     * Implements the GOSUB command
     * @param {Object} data - The line number
     * @param {number} oldIndex - The current line index
     * @returns {number} - The line number
     */
    GOSUB(data, oldIndex) {
        const number = this.advancedEval(data);
        this.oldIndexes.push(oldIndex);
        return number;
    }

    /**
     * Implements the RETURN command
     * @returns {number|null} - The line number or null
     */
    RETURN() {
        try {
            return this.oldIndexes.pop();
        } catch (e) {
            return null;
        }
    }

    /**
     * Implements the PAUSE command
     * @param {Object} data - The pause duration
     */
    PAUSE(data) {
        const t = this.advancedEval(data);
        // In browser context, this would use setTimeout
        if (typeof window !== 'undefined') {
            setTimeout(() => {}, t * 1000);
        }
    }

    /**
     * Implements the IF command
     * @param {Object} caseData - The condition
     * @returns {boolean} - The result of the condition
     */
    IF(caseData) {
        const keys = Object.keys(caseData);
        const operationIndex = keys[getKeyOf(caseData, "BOOLEANSKOP", "type")];
        const operator = caseData[operationIndex].value;
        
        const value1 = this.advancedEval(tokenRowSlice(caseData, 0, parseInt(operationIndex) - 1));
        const value2 = this.advancedEval(tokenRowSlice(caseData, parseInt(operationIndex)));
        
        let jsOperator;
        if (operator === "EQEQ") {
            jsOperator = "==";
        } else if (operator === "LT") {
            jsOperator = "<";
        } else if (operator === "LTEQ") {
            jsOperator = "<=";
        } else if (operator === "MT") {
            jsOperator = ">";
        } else if (operator === "MTEQ") {
            jsOperator = ">=";
        } else if (operator === "NEQ") {
            jsOperator = "!=";
        }
        
        let val1 = value1;
        let val2 = value2;
        
        if (!isNumber(value1)) {
            val1 = `"${String(value1)}"`;
        }
        
        if (!isNumber(value2)) {
            val2 = `"${String(value2)}"`;
        }
        
        try {
            return eval(`${val1} ${jsOperator} ${val2}`);
        } catch (e) {
            console.error("Error evaluating condition,", "Value1:", val1, "Operation", jsOperator, "Value2:", val2);
            return false;
        }
    }

    /**
     * Implements the FOR command
     * @param {Object} data - The for loop data
     * @param {number} rowIndex - The current row index
     */
    FOR(data, rowIndex) {
        const keyTo = getKeyOf(data, "TO");
        const keyStep = getKeyOf(data, "STEP");
        
        // create a variable
        const varData = tokenRowSlice(data, 0, keyTo);
        const varName = varData[1];
        
        if (varData[2].value === "EQ") {
            this.LET(varName, tokenRowSlice(varData, 2));
        } else {
            console.error("Error interpreter: missing EQ when declaring var");
            throw new Error("Missing EQ in FOR loop");
        }
        
        let goal, step;
        if (keyStep) {
            goal = tokenRowSlice(data, keyTo + 1, keyStep);
            step = tokenRowSlice(data, keyStep + 1);
            step = this.advancedEval(step);
        } else {
            goal = tokenRowSlice(data, keyTo + 1);
            step = 1;
        }
        
        goal = this.advancedEval(goal);
        
        this.forLoop.push({
            var: varName,
            goal: goal,
            step: step,
            row: rowIndex,
            count: 0,
        });
    }
    
    /**
     * Implements the NEXT command
     * @param {Object} varName - The variable name
     * @returns {number|null} - The line number or null
     */
    NEXT(varName) {
        const loop = this.forLoop[this.forLoop.length - 1];
        if(loop.count++ > this.maxLoopCount) {
            throw Error("Loop out of loop");
        }
        
        if (loop.var.value !== varName[1].value) {
            console.error("For loops in wrong queue");
            throw new Error("For loops in wrong queue");
        }
        
        const value = this.getVarByName(loop.var.value);
        
        if (parseInt(value.value) + parseInt(loop.step) > parseInt(loop.goal)) {
            this.forLoop.pop();
            this.updateVar(loop.var.value, "None"); // should change to kill the variable
            return null;
        }
        
        this.updateVar(loop.var.value, parseInt(value.value) + parseInt(loop.step));
        return loop.row;
    }

    /**
     * Implements the LOAD command
     * @param {Object} data - The data to load
     */
    LOAD(data) {
        const name = Object.values(data)[0].value;
        
        if (name === "NOW" || name === "MS") {
            this.createNewVar(name, Date.now());
        } else if (name === "SEC") {
            this.createNewVar(name, Math.floor(Date.now() / 1000));
        }
    }

    /**
     * Implements the NAMESPACE command
     * @param {Object} tokens - The namespace tokens
     */
    NAMESPACE(tokens) {
        const namespace = this.advancedEval(tokens);
        this.namespace = namespace;
    }

    /**
     * Implements the IMPORT command
     * @param {Object} path - The path to import
     * @param {Object} importVar - The import variable
     */
    IMPORT(path, importVar) {
        // In browser context, this would use fetch or another mechanism
        console.log("IMPORT not fully implemented in JS version");
        console.log(path, importVar);
    }

    /**
     * Implements the EXPORT command
     * @param {Object} data - The data to export
     */
    EXPORT(data) {
        const varData = this.getVarByName(data[1].value);
        console.log(`exp:${varData.name}:${varData.value}`);
    }

    /**
     * Gets a variable by name
     * @param {string} name - The variable name
     * @returns {Object} - The variable
     */
    getVarByName(name) {
        name = this.getNamespace(name);
        
        for (const varData of this.varList) {
            if (varData.name === name) {
                return varData;
            }
        }
        
        console.error(`Error: variable with name: ${name} is not declared`);
        throw new Error(`Variable ${name} not declared`);
    }

    /**
     * Creates a new variable
     * @param {string} name - The variable name
     * @param {*} value - The variable value
     */
    createNewVar(name, value) {
        name = this.getNamespace(name);
        
        for (const varData of this.varList) {
            if (varData.name === name) {
                varData.value = value; // if var exists override it
                return;
            }
        }
        
        this.varList.push({ name: name, value: value });
    }

    /**
     * Updates a variable
     * @param {string} name - The variable name
     * @param {*} value - The new value
     */
    updateVar(name, value) {
        name = this.getNamespace(name);
        const varData = this.getVarByName(name);
        varData.value = value;
    }

    /**
     * Gets an array by name
     * @param {string} name - The array name
     * @returns {Object} - The array
     */
    getArrayByName(name) {
        name = this.getNamespace(name);
        
        for (const array of this.arrayList) {
            if (array.name === name) {
                return array;
            }
        }
        
        console.error(`Error: array with name: ${name} is not declared`);
        throw new Error(`Array ${name} not declared`);
    }

    /**
     * Creates a new array
     * @param {string} name - The array name
     * @param {number} dim - The array dimension
     */
    createNewArray(name, dim) {
        name = this.getNamespace(name);
        this.arrayList.push({
            name: name,
            dimension: dim,
            value_list: {}
        });
    }

    /**
     * Updates an array
     * @param {string} name - The array name
     * @param {string} keys - The array keys
     * @param {*} value - The new value
     */
    updateArray(name, keys, value) {
        const array = this.getArrayByName(name);
        array.value_list[keys] = value;
    }

    /**
     * Gets the namespace for a name
     * @param {string} name - The name
     * @returns {string} - The namespaced name
     */
    getNamespace(name) {
        if (name.split('@').length > 1) {
            return name;
        }
        
        if (this.namespace !== "") {
            name = this.namespace + "@" + name;
        }
        
        return name;
    }

    /**
     * Generates array keys
     * @param {Object} data - The data
     * @returns {Object} - The keys
     */
    generateArrayKeys(data) {
        let keys = "";
        // get the array keys
        let endOfKeys = -1;
        let keysFound = 0;
        let exp = false;
        let expObj = {};
        
        const dataKeys = Object.keys(data);
        let i = 0;
        
        while (i < dataKeys.length) {
            const c = dataKeys[i];
            
            if (data[c].value === "LEFTBLOCK") {
                exp = true;
            } else if (data[c].value === "RIGHTBLOCK") {
                keysFound++;
                
                if (keys !== "") {
                    keys += ',' + this.advancedEval(expObj);
                } else {
                    keys += this.advancedEval(expObj);
                }
                
                expObj = {};
                exp = false;
                
                if (i + 1 >= dataKeys.length) {
                    endOfKeys = parseInt(c);
                    break;
                } else if (data[dataKeys[i + 1]].value !== "LEFTBLOCK") {
                    endOfKeys = parseInt(c);
                    break;
                }
            } else if (exp) {
                expObj[c] = data[c];
            } else {
                console.error("Array syntax error data ::", data);
                throw new Error("Array syntax error");
            }
            
            i++;
        }
        
        return { endOfKeys: endOfKeys, keysFound: keysFound, keys: keys };
    }

    /**
     * Translates variables to their values
     * @param {Object} input - The input tokens
     * @returns {Object} - The translated tokens
     */
    translate(input) {
        const out = {};
        const keys = Object.keys(input);
        
        for (let i = 0; i < keys.length; i++) {
            const c = parseInt(keys[i]);
            const token = input[c];
            
            if (token.type === "VAR") {
                const value = this.getVarByName(token.value).value;
                
                if (isNumber(value)) {
                    out[c] = { type: "NUM", value: value };
                } else {
                    out[c] = { type: "STR", value: value };
                }
            } else if (token.type === "VAR_ARRAY") {
                const key = this.generateArrayKeys(tokenRowSlice(input, c));
                
                // Skip the array index tokens
                i += key.endOfKeys;
                
                const value = this.getArrayByName(token.value).value_list[key.keys];
                
                if (isNumber(value)) {
                    out[c] = { type: "NUM", value: value };
                } else {
                    out[c] = { type: "STR", value: value };
                }
            } else {
                out[c] = token;
            }
        }
        
        return out;
    }

    /**
     * Advanced evaluation of expressions
     * @param {Object} value - The value to evaluate
     * @returns {*} - The evaluated result
     */
    advancedEval(value) {
        // translates all the variables to their value
        const trans = this.translate(value);
        
        // returns false if the value has a char that is not a number
        let res = evalNum(trans);
        
        if (res === false) {
            // if value is not a number, try as string
            res = evalString(trans);
        }
        
        return res;
    }
}

export default FunctionSet;
export { evalNum, isNumber, basicPrint, basicInput, getKeyOf, evalString };