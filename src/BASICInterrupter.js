import FunctionSet from './functionSet.js';
import { tokenRowSlice } from './helpFunctions.js';

/**
 * Gets the index of a value in a dictionary
 * @param {Object} data - The dictionary
 * @param {*} val - The value to find
 * @param {string} index - The index to check
 * @returns {number|null} - The index or null if not found
 */
function getIndexOf(data, val, index = "value") {
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
 * Finds a row index by key
 * @param {Object} tokens - The tokens
 * @param {string|number} key - The key to find
 * @returns {number|null} - The index or null if not found
 */
function findRowIndexByKey(tokens, key) {
    const tokenKeys = Object.keys(tokens);
    let i = 0;
    
    while (i < tokenKeys.length) {
        if (tokenKeys[i] === String(key)) {
            return i;
        }
        i++;
    }
    
    return null;
}

/**
 * Class for interpreting BASIC code
 */
class Interrupter {
    // Static constants
    static STATIC = "STATIC";
    static VAR_ARRAY = "VAR_ARRAY";
    static VAR = "VAR";

    /**
     * Constructor for Interrupter
     * @param {Object} setManager - The set manager
     * @param {string} functionSetName - The function set name
     * @param {string} mode - The mode (dev or pro)
     * @param {boolean} isNew - Whether this is a new interrupter
     */
    constructor(setManager, functionSetName, mode, isNew = true) {
        this.rowIndex = 0;
        this.isNew = isNew;
        this.mode = mode;
        
        if (isNew) {
            this.functions = new FunctionSet(functionSetName, mode);
            this.manager = setManager;
            this.manager.addSet(this.functions);
        } else {
            this.manager = setManager;
            this.functions = this.manager.getByName(functionSetName);
        }
    }

    /**
     * Moves the code index
     * @param {Object} tokens - The tokens
     * @param {number} index - The index to move to
     * @returns {string} - The key at the new index
     */
    moveCodeIndex(tokens, index = 0) {
        const temp = Object.keys(tokens)[index];
        this.rowIndex = index + 1;
        return temp;
    }

    /**
     * Creates a new interrupter and interrupts a row
     * @param {Object} tokens - The tokens
     * @param {Object} code - The code to interrupt
     * @returns {string|null} - The new row number or null
     */
    newInterrupter(tokens, code) {
        const row = {};
        const rowKey = Object.keys(tokens)[this.rowIndex - 1];
        row[rowKey] = code;
        
        // create a new interceptor with the same functionsSet
        const number = new Interrupter(this.manager, this.functions.getName(), this.mode, false).interrupt(row);
        
        if (number) {
            return this.moveCodeIndex(tokens, findRowIndexByKey(tokens, number));
        }
        
        return null;
    }

    /**
     * Interrupts (executes) the BASIC code
     * @param {Object} tokens - The tokens to interrupt
     * @returns {string|null} - The row number or null
     */
    interrupt(tokens) {
        let codeIndex = this.moveCodeIndex(tokens, this.rowIndex);
        
        while (true) {
            // code index is the row number
            // c is the index of the specific token in the row
            if (Object.keys(tokens[codeIndex]).length <= 0) {
                console.error("Syntax error row: " + codeIndex);
                throw new Error("Syntax error");
            }
            
            const c = Object.keys(tokens[codeIndex])[0];
            const checking = tokens[codeIndex][c];
            
            try {
                if (checking.type === Interrupter.STATIC) {
                    // check if the command starts with a static key name
                    if (checking.value === "REM") {
                        if (this.rowIndex < Object.keys(tokens).length) {
                            codeIndex = this.moveCodeIndex(tokens, this.rowIndex);
                        } else {
                            break;
                        }
                        continue;
                    }
                    
                    if (checking.value === "PRINT") {
                        this.functions.PRINT(tokenRowSlice(tokens[codeIndex], 1));
                    } else if (checking.value === "LET") {
                        const varName = tokens[codeIndex][parseInt(c) + 1];
                        
                        if (tokens[codeIndex][parseInt(c) + 2].value === "EQ") {
                            this.functions.LET(varName, tokenRowSlice(tokens[codeIndex], 3));
                        } else {
                            console.error("Let error: " + JSON.stringify(checking) + " row(" + codeIndex + ")");
                            throw new Error("Let error");
                        }
                    } else if (checking.value === "ARRAY") {
                        const arrayName = tokens[codeIndex][parseInt(c) + 1];
                        let arrayDimension = 1;
                        
                        if (parseInt(c) + 2 < Object.keys(tokens[codeIndex]).length && 
                            tokens[codeIndex][parseInt(c) + 2].value === "COMMA") {
                            arrayDimension = tokens[codeIndex][parseInt(c) + 3].value;
                        }
                        
                        this.functions.ARRAY_CREATE(arrayName, arrayDimension);
                    } else if (checking.value === "INPUT") {
                        const data = tokenRowSlice(tokens[codeIndex], 1);
                        const index = getIndexOf(data, "APPOSTROF");
                        const text = tokenRowSlice(data, 0, index);
                        const varName = data[Object.keys(tokenRowSlice(data, index + 1))[0]];
                        
                        this.functions.INPUT(varName, text);
                    } else if (checking.value === "END") {
                        console.log("The Script Was Terminated(row: " + codeIndex + ")");
                        return null;
                    } else if (checking.value === "GOTO") {
                        const number = this.functions.GOTO(tokenRowSlice(tokens[codeIndex], 1));
                        
                        if (!this.isNew) {
                            return number;
                        }
                        
                        codeIndex = this.moveCodeIndex(tokens, findRowIndexByKey(tokens, number));
                        continue;
                    } else if (checking.value === "GOSUB") {
                        const number = this.functions.GOSUB(tokenRowSlice(tokens[codeIndex], 1), codeIndex);
                        
                        if (!this.isNew) {
                            return number;
                        }
                        
                        codeIndex = this.moveCodeIndex(tokens, findRowIndexByKey(tokens, number));
                        continue;
                    } else if (checking.value === "NAMESPACE") {
                        this.functions.NAMESPACE(tokenRowSlice(tokens[codeIndex], 1));
                    } else if (checking.value === "LOAD") {
                        this.functions.LOAD(tokenRowSlice(tokens[codeIndex], 1));
                    } else if (checking.value === "IMPORT") {
                        const path = tokenRowSlice(tokens[codeIndex], 1, getIndexOf(tokens[codeIndex], "AS"));
                        const importVar = tokenRowSlice(tokens[codeIndex], getIndexOf(tokens[codeIndex], "AS") + 1);
                        
                        this.functions.IMPORT(path, importVar);
                        continue;
                    } else if (checking.value === "RETURN") {
                        const number = this.functions.RETURN();
                        
                        if (number !== null) {
                            codeIndex = this.moveCodeIndex(tokens, findRowIndexByKey(tokens, number));
                            codeIndex = this.moveCodeIndex(tokens, this.rowIndex);
                            continue;
                        }
                    } else if (checking.value === "PAUSE") {
                        this.functions.PAUSE(tokenRowSlice(tokens[codeIndex], 1));
                    } else if (checking.value === "IF") {
                        const statement = tokenRowSlice(
                            tokens[codeIndex], 
                            1, 
                            getIndexOf(tokens[codeIndex], "THEN")
                        );
                        
                        const code = tokenRowSlice(
                            tokens[codeIndex], 
                            getIndexOf(tokens[codeIndex], "THEN") + 1,
                            getIndexOf(tokens[codeIndex], "ELSE")
                        );
                        
                        if (this.functions.IF(statement)) {
                            const newCodeIndex = this.newInterrupter(tokens, code);
                            
                            if (newCodeIndex !== null) {
                                codeIndex = newCodeIndex;
                                continue;
                            }
                        } else if (getIndexOf(tokens[codeIndex], "ELSE") !== null) {
                            const alternativeCode = tokenRowSlice(
                                tokens[codeIndex],
                                getIndexOf(tokens[codeIndex], "ELSE") + 1
                            );
                            
                            const newCodeIndex = this.newInterrupter(tokens, alternativeCode);
                            
                            if (newCodeIndex !== null) {
                                codeIndex = newCodeIndex;
                                continue;
                            }
                        }
                    } else if (checking.value === "EXPORT") {
                        this.functions.EXPORT(tokenRowSlice(tokens[codeIndex], 1));
                    } else if (checking.value === "FOR") {
                        this.functions.FOR(tokenRowSlice(tokens[codeIndex], 1), codeIndex);
                    } else if (checking.value === "NEXT") {
                        const number = this.functions.NEXT(tokenRowSlice(tokens[codeIndex], 1));
                        
                        if (number !== null) {
                            codeIndex = this.moveCodeIndex(tokens, findRowIndexByKey(tokens, number));
                            codeIndex = this.moveCodeIndex(tokens, this.rowIndex);
                            continue;
                        }
                    } else {
                        console.error("Undefined token: " + JSON.stringify(checking) + " row(" + codeIndex + ")");
                        throw new Error("Undefined token");
                    }
                } else if (checking.type === Interrupter.VAR_ARRAY) {
                    const arrayName = checking.value;
                    const keys = tokenRowSlice(tokens[codeIndex], 1);
                    
                    this.functions.ARRAY_UPPDATE(arrayName, keys);
                } else if (checking.type === Interrupter.VAR) {
                    if (tokens[codeIndex][parseInt(c) + 1].value === "EQ") {
                        this.functions.LET(checking, tokenRowSlice(tokens[codeIndex], 2));
                    } else {
                        console.error("Error type: " + JSON.stringify(checking) + " row(" + codeIndex + ")");
                        throw new Error("Error type");
                    }
                }
                
                // move tokens list forward
                if (this.rowIndex < Object.keys(tokens).length) {
                    codeIndex = this.moveCodeIndex(tokens, this.rowIndex);
                } else {
                    break;
                }
            } catch (e) {
                if (this.mode === 'dev') {
                    console.error("An exception occurred: ", e);
                    console.error(e.stack);
                } else {
                    console.error(`Error: ${JSON.stringify(checking)} row(${codeIndex})`);
                }
                break;
            }
        }
        
        return null;
    }
}

export default Interrupter;
export { getIndexOf, findRowIndexByKey };