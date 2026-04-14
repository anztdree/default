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

    /**
     * Load all game data JSON files from the default resource/json directory.
     * Called by main-server/index.js on startup: GameData.load()
     *
     * The default path is relative to the project root (server/../resource/json).
     * This matches the client's ReadJsonSingleton which reads from resource/json/.
     *
     * @returns {Promise<void>}
     */
    async load() {
        // Default path: project_root/resource/json
        // server/shared/gameData/loader.js → ../../resource/json
        var defaultDir = path.resolve(__dirname, '..', '..', '..', 'resource', 'json');
        this.loadFromDirectory(defaultDir);
    }

    /**
     * Get statistics about loaded game data.
     * Called by main-server/index.js: GameData.getStats()
     *
     * @returns {{ fileCount: number, loadTimeMs: number }} Stats object
     */
    getStats() {
        return {
            fileCount: Object.keys(this.data).length,
            loadTimeMs: 0, // Not tracked at this level; loaders handle timing
        };
    }
}

// Singleton
const loader = new GameDataLoader();
module.exports = loader;
