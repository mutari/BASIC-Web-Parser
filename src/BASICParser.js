/**
 * Functions and classes for parsing BASIC code
 */

/**
 * Creates a token object
 * @param {string} t - The token type
 * @param {*} v - The token value
 * @returns {Object} - The token object
 */
function getTokenObject(t, v) {
    return { type: t, value: v };
}

/**
 * Splits a string into an array of characters
 * @param {string} word - The string to split
 * @returns {Array} - Array of characters
 */
function split(word) {
    return word.split('');
}

/**
 * Gets the next character in an array
 * @param {Array} chars - The array of characters
 * @param {number} index - The current index
 * @returns {string|number} - The next character or -1 if out of bounds
 */
function getNext(chars, index) {
    if (chars.length > index) {
        return chars[index];
    }
    return -1;
}

/**
 * Class for parsing BASIC code
 */
class Parser {
    /**
     * Constructor for Parser
     * @param {string} mode - The mode (dev or pro)
     */
    constructor(mode) {
        this.commandMap = {};
        
        // Define constants
        this.INVISIBLE_CHAR_LIST = [" ", "\t", "\n"];
        
        this.KEYWORDS_LIST = [
            "PRINT", "LET", "GOTO", "ARRAY", "INPUT", "END", "IF", "THEN", "ELSE", "FOR", "TO",
            "STEP", "NEXT", "GOSUB", "NAMESPACE", "LOAD", "IMPORT", "AS", "RETURN", "PLOT",
            "DISPLAY", "DRAW", "TEXT", "PAUSE", "EXPORT", "CLS", "CLT", "CLC", "REM", "FALSE", "TRUE"
        ];
        
        this.OPERATORS_DICT = {
            '=': "NEQ", '+': "PLUS", '-': "MINUS", '*': "MULTIPLIKATION",
            '/': "SLASH", ',': "COMMA", ';': "APPOSTROF",
            '(': "LEFTPARENTHESIS", ')': "RIGHTPARENTHESIS", '[': "LEFTBLOCK", ']': "RIGHTBLOCK"
        };
    }

    /**
     * Parses a command map into tokens
     * @param {Object} cm - The command map
     * @returns {Object} - The parsed tokens
     */
    parseMap(cm) {
        this.commandMap = cm;
        
        const tokens = {};
        
        for (const key in this.commandMap) {
            const rowTokens = {};
            
            const chars = split(this.commandMap[key]);
            let cmd = "";
            let index = 0;
            
            let string = "";
            let isString = false;
            
            let number = "";
            let isNumber = false;
            
            for (let c = 0; c < chars.length; c++) {
                cmd += chars[c];
                
                // if the parser have found a string
                if (isString) {
                    if (cmd !== "\"") {
                        string += cmd;
                        cmd = "";
                    } else { // end of string
                        rowTokens[index] = getTokenObject("STR", string);
                        string = "";
                        cmd = "";
                        isString = false;
                        index++;
                    }
                }
                
                // if the parser have found a number
                else if (isNumber) {
                    if (/^\d+$/.test(cmd)) {
                        number += cmd;
                        cmd = "";
                        if (c + 1 >= chars.length || !/^\d+$/.test(chars[c + 1])) {
                            rowTokens[index] = getTokenObject("NUM", number);
                            number = "";
                            isNumber = false;
                            index++;
                        }
                    } else {
                        return { error: `could not work out a number row: ${key}` };
                    }
                }
                
                else if (this.INVISIBLE_CHAR_LIST.includes(cmd)) { // make the candy go away
                    cmd = "";
                } else if (cmd === "\"") { // start of string 
                    isString = true;
                    cmd = "";
                }
                
                // start of a number
                else if (/^\d+$/.test(cmd)) {
                    number += cmd;
                    isNumber = true;
                    cmd = "";
                    if (c + 1 >= chars.length || !/^\d+$/.test(chars[c + 1])) {
                        rowTokens[index] = getTokenObject("NUM", number);
                        number = "";
                        isNumber = false;
                        index++;
                    }
                }
                
                // test of operations
                else if (cmd === "=") {
                    if (c + 1 >= chars.length || chars[c + 1] !== "=") {
                        rowTokens[index] = getTokenObject("OPERATOR", "EQ");
                    } else {
                        rowTokens[index] = getTokenObject("BOOLEANSKOP", "EQEQ");
                        c++; // Skip next character
                    }
                    index++;
                    cmd = "";
                } else if (cmd === "<") {
                    if (c + 1 >= chars.length || chars[c + 1] !== "=") {
                        rowTokens[index] = getTokenObject("BOOLEANSKOP", "LT");
                    } else {
                        rowTokens[index] = getTokenObject("BOOLEANSKOP", "LTEQ");
                        c++; // Skip next character
                    }
                    index++;
                    cmd = "";
                } else if (cmd === ">") {
                    if (c + 1 >= chars.length || chars[c + 1] !== "=") {
                        rowTokens[index] = getTokenObject("BOOLEANSKOP", "MT");
                    } else {
                        rowTokens[index] = getTokenObject("BOOLEANSKOP", "MTEQ");
                        c++; // Skip next character
                    }
                    index++;
                    cmd = "";
                }
                
                // Check simple operators
                else if (cmd in this.OPERATORS_DICT) {
                    rowTokens[index] = getTokenObject("OPERATOR", this.OPERATORS_DICT[cmd]);
                    index++;
                    cmd = "";
                }
                
                // Check for comments
                else if (cmd === "REM" && (c + 1 >= chars.length || this.INVISIBLE_CHAR_LIST.includes(getNext(chars, c + 1)))) {
                    // if it's a comment then it just skips it
                    rowTokens[index] = getTokenObject("STATIC", "REM");
                    break;
                }
                
                // Boolean values
                else if (cmd === "FALSE" && (c + 1 >= chars.length || this.INVISIBLE_CHAR_LIST.includes(getNext(chars, c + 1)))) {
                    rowTokens[index] = getTokenObject("BOOLEAN", "FALSE");
                    index++;
                    cmd = "";
                } else if (cmd === "TRUE" && (c + 1 >= chars.length || this.INVISIBLE_CHAR_LIST.includes(getNext(chars, c + 1)))) {
                    rowTokens[index] = getTokenObject("BOOLEAN", "TRUE");
                    index++;
                    cmd = "";
                }
                
                // Check for common keywords
                else if (/^[a-zA-Z]+$/.test(cmd) && this.KEYWORDS_LIST.includes(cmd) && 
                        (c + 1 >= chars.length || this.INVISIBLE_CHAR_LIST.includes(getNext(chars, c + 1)))) {
                    rowTokens[index] = getTokenObject("STATIC", cmd);
                    index++;
                    cmd = "";
                }
                
                // Check for var
                else if (cmd.length > 0 && (c + 1 >= chars.length || [" ", "\n", ",", "]"].includes(getNext(chars, c + 1)))) {
                    rowTokens[index] = getTokenObject("VAR", cmd);
                    index++;
                    cmd = "";
                }
                
                // check for variables - a variable name can only be one char long
                // needs a lot of work
                else if (cmd.length > 0 && (c + 1 < chars.length && getNext(chars, c + 1) === "[")) {
                    rowTokens[index] = getTokenObject("VAR_ARRAY", cmd);
                    index++;
                    cmd = "";
                }
            }
            
            tokens[key] = rowTokens;
        }
        
        return tokens;
    }

    /**
     * Gets the command map
     * @returns {Object} - The command map
     */
    getCommandMap() {
        return this.commandMap;
    }
}

export default Parser;
export { getTokenObject, split, getNext };