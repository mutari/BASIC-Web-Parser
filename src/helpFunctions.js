/**
 * Helper functions for the BASIC compiler
 */

/**
 * Gets input from a file (in browser context, this would be from a text area or file input)
 * @param {string} content - The content of the file
 * @returns {Array} - Array of lines from the file
 */
function getFileInput(content) {
    const commandList = [];
    const lines = content.split('\n');
    
    for (let line of lines) {
        commandList.push(line + ' ');
    }
    
    return commandList;
}

/**
 * Creates a hash map from a command list
 * @param {Array} cmList - List of commands
 * @returns {Object} - Hash map of commands
 */
function createHashMap(cmList) {
    const cmMap = {};
    
    for (let x of cmList) {
        const split = x.split(' ');
        const number = split[0];
        split.shift();
        
        if (!/^\d+$/.test(number)) {
            continue;
        }
        
        cmMap[number] = split.join(' ');
    }
    
    return cmMap;
}

/**
 * Slices a dictionary of tokens
 * @param {Object} dic - Dictionary to slice
 * @param {number} start - Start index
 * @param {number} end - End index (optional)
 * @returns {Object} - Sliced dictionary
 */
function tokenRowSlice(dic, start, end = undefined) {
    const entries = Object.entries(dic);
    const sliced = entries.slice(start, end);
    return Object.fromEntries(sliced);
}

export { getFileInput, createHashMap, tokenRowSlice };