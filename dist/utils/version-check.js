/**
 * Version checker - checks for updates in the background
 *
 * Fetches latest version from GitHub and notifies user if update available.
 * Caches check results to avoid spamming (checks once per day).
 */
import https from 'https';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import pc from 'picocolors';
import { orange } from '../cli/colors.js';
// Current version from package.json
const CURRENT_VERSION = '1.4.1';
// GitHub raw URL for package.json
const VERSION_URL = 'https://raw.githubusercontent.com/Play-New/superagents/main/package.json';
// Cache settings
const CACHE_FILE = path.join(os.homedir(), '.superagents', 'version-check.json');
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
/**
 * Compare semver versions
 * Returns true if latest > current
 */
function isNewerVersion(current, latest) {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const c = currentParts[i] || 0;
        const l = latestParts[i] || 0;
        if (l > c)
            return true;
        if (l < c)
            return false;
    }
    return false;
}
/**
 * Fetch latest version from GitHub (with timeout)
 */
async function fetchLatestVersion() {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve(null);
        }, 5000); // 5 second timeout
        const req = https.get(VERSION_URL, (res) => {
            if (res.statusCode !== 200) {
                clearTimeout(timeout);
                resolve(null);
                return;
            }
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                clearTimeout(timeout);
                try {
                    const pkg = JSON.parse(data);
                    resolve(pkg.version || null);
                }
                catch {
                    resolve(null);
                }
            });
        });
        req.on('error', () => {
            clearTimeout(timeout);
            resolve(null);
        });
        req.end();
    });
}
/**
 * Read cached version check
 */
async function readCache() {
    try {
        if (await fs.pathExists(CACHE_FILE)) {
            return await fs.readJson(CACHE_FILE);
        }
    }
    catch {
        // Ignore cache errors
    }
    return null;
}
/**
 * Write version check to cache
 */
async function writeCache(latestVersion) {
    try {
        await fs.ensureDir(path.dirname(CACHE_FILE));
        await fs.writeJson(CACHE_FILE, {
            lastCheck: Date.now(),
            latestVersion
        });
    }
    catch {
        // Ignore cache errors
    }
}
/**
 * Check for updates (non-blocking)
 * Returns update info if available, null otherwise
 */
export async function checkForUpdates() {
    try {
        // Check cache first
        const cache = await readCache();
        const now = Date.now();
        if (cache && (now - cache.lastCheck) < CHECK_INTERVAL_MS) {
            // Use cached result
            if (isNewerVersion(CURRENT_VERSION, cache.latestVersion)) {
                return { current: CURRENT_VERSION, latest: cache.latestVersion };
            }
            return null;
        }
        // Fetch fresh version
        const latestVersion = await fetchLatestVersion();
        if (latestVersion) {
            await writeCache(latestVersion);
            if (isNewerVersion(CURRENT_VERSION, latestVersion)) {
                return { current: CURRENT_VERSION, latest: latestVersion };
            }
        }
        return null;
    }
    catch {
        // Never fail the main flow due to version check
        return null;
    }
}
/**
 * Display update notification
 */
export function displayUpdateNotification(update) {
    console.log('');
    console.log(pc.bgYellow(pc.black(' UPDATE AVAILABLE ')));
    console.log(`  ${pc.dim(`v${update.current}`)} → ${orange(`v${update.latest}`)}`);
    console.log(`  Run: ${pc.bold('superagents update')}`);
    console.log('');
}
/**
 * Get current version
 */
export function getCurrentVersion() {
    return CURRENT_VERSION;
}
//# sourceMappingURL=version-check.js.map