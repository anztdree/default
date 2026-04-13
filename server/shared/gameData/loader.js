/**
 * Game Data Loader
 * 
 * 100% derived from client code analysis.
 * 
 * Client loads JSON configs from resource/json/ directory (402+ files).
 * These configs define game rules: heroes, items, stages, skills, etc.
 * 
 * Client uses ReadJsonSingleton to load configs:
 *   ReadJsonSingleton.getInstance().heroDefine
 *   ReadJsonSingleton.getInstance().errorDefine
 *   ReadJsonSingleton.getInstance().itemDefine
 *   etc.
 * 
 * This loader reads the same JSON files so the server can use them.
 */

const fs = require('fs');
const path = require('path');

class GameDataLoader {
    constructor() {
        this.data = {};
        this.loaded = false;
    }

    /**
     * Load all JSON config files from a directory
     * @param {string} jsonDir - Path to resource/json/ directory
     */
    loadFromDirectory(jsonDir) {
        if (!fs.existsSync(jsonDir)) {
            console.warn(`[GameDataLoader] Directory not found: ${jsonDir}`);
            console.warn('[GameDataLoader] Config files not loaded. Server will use defaults.');
            return;
        }

        const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

        console.log(`[GameDataLoader] Loading ${files.length} config files from ${jsonDir}...`);

        for (const file of files) {
            try {
                const filePath = path.join(jsonDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const jsonData = JSON.parse(content);
                // Key name = filename without .json extension
                const key = file.replace('.json', '');
                this.data[key] = jsonData;
            } catch (err) {
                console.error(`[GameDataLoader] Failed to load ${file}: ${err.message}`);
            }
        }

        this.loaded = true;
        console.log(`[GameDataLoader] Loaded ${Object.keys(this.data).length} config entries`);
    }

    /**
     * Get a config by name
     * @param {string} name - Config name (e.g., 'errorDefine', 'heroDefine')
     * @returns {object|null}
     */
    get(name) {
        return this.data[name] || null;
    }

    /**
     * Check if configs are loaded
     */
    isLoaded() {
        return this.loaded;
    }
}

// Singleton
const loader = new GameDataLoader();
module.exports = loader;
