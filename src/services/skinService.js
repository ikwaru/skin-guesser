/**
 * Service for fetching and managing League of Legends skin data
 */

const DDRAGON_VERSION = '15.18.1';
const BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US`;

class SkinService {
    constructor() {
        this.allSkins = [];
        this.isLoaded = false;
    }

    /**
     * Fetch all skins from all champions
     * @returns {Promise<Array>} Array of skin objects with name, championName, and fullName
     */
    async fetchAllSkins() {
        if (this.isLoaded) {
            return this.allSkins;
        }

        try {
            const champResponse = await fetch(`${BASE_URL}/champion.json`);
            const champData = await champResponse.json();
            const allChampions = Object.values(champData.data);
            
            const skinPromises = allChampions.map(async (champion) => {
                try {
                    const response = await fetch(`${BASE_URL}/champion/${champion.id}.json`);
                    const data = await response.json();
                    const championData = Object.values(data.data)[0];
                    
                    return championData.skins
                        .filter(skin => skin.num !== 0) // Exclude base skins
                        .map(skin => ({
                            name: skin.name,
                            championName: championData.name,
                            championId: championData.id,
                            skinNum: skin.num,
                            fullName: `${skin.name} ${championData.name}`.trim(),
                            splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_${skin.num}.jpg`
                        }));
                } catch (error) {
                    console.error(`Error fetching ${champion.id}:`, error);
                    return [];
                }
            });
            
            const allSkinsArrays = await Promise.all(skinPromises);
            this.allSkins = allSkinsArrays.flat();
            this.isLoaded = true;
            
            return this.allSkins;
            
        } catch (error) {
            console.error('Error fetching all skins:', error);
            return [];
        }
    }

    /**
     * Filter skins based on search input
     * @param {string} input - The search input
     * @param {number} limit - Maximum number of suggestions to return
     * @returns {Array} Filtered array of skin suggestions
     */
    filterSuggestions(input, limit = 10) {
        if (!input.trim()) {
            return [];
        }

        const searchTerm = input.toLowerCase();
        return this.allSkins.filter(skin => 
            skin.name.toLowerCase().includes(searchTerm) ||
            skin.fullName.toLowerCase().includes(searchTerm)
        ).slice(0, limit);
    }

    /**
     * Get a random skin from all available skins
     * @returns {Object|null} Random skin object or null if no skins loaded
     */
    getRandomSkin() {
        if (this.allSkins.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * this.allSkins.length);
        return this.allSkins[randomIndex];
    }

    /**
     * Get all skins for a specific champion
     * @param {string} championName - The champion name
     * @returns {Array} Array of skins for the specified champion
     */
    getSkinsByChampion(championName) {
        return this.allSkins.filter(skin => 
            skin.championName.toLowerCase() === championName.toLowerCase()
        );
    }

    /**
     * Check if skins are loaded
     * @returns {boolean} True if skins are loaded
     */
    isSkinsLoaded() {
        return this.isLoaded;
    }

    /**
     * Get total number of skins
     * @returns {number} Total number of skins
     */
    getTotalSkinsCount() {
        return this.allSkins.length;
    }
}

const skinService = new SkinService();
export default skinService;
