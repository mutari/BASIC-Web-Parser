/**
 * Class for managing function sets
 */
class SetManager {
    /**
     * Constructor for SetManager
     */
    constructor() {
        this.sets = [];
    }

    /**
     * Add a function set to the manager
     * @param {Object} functionSet - The function set to add
     */
    addSet(functionSet) {
        this.sets.push(functionSet);
    }

    /**
     * Get a function set by name
     * @param {string} name - The name of the function set to get
     * @returns {Object|null} - The function set or null if not found
     */
    getByName(name) {
        for (const functionSet of this.sets) {
            if (functionSet.getName() === name) {
                return functionSet;
            }
        }
        return null;
    }
}

export default SetManager;