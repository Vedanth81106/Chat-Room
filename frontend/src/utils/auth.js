export const TOKEN_KEY = "token";

/**
 * Retrieves the JWT token from LocalStorage and cleans up extra quotes.
 * @returns {string|null} The clean token or null if not found.
 */

export function getToken(){
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? raw.replace(/^"|"$/g, '') : null;
}

/**
 * Saves the authentication data to LocalStorage.
 * @param {string} token - The JWT token.
 */

export function saveAuth(token){
    if(token){
        localStorage.setItem(TOKEN_KEY, token);
    }
}

export function clearAuth(token){
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Checks if the user is currently authenticated.
 * @returns {boolean}
 */
export function isAuthenticated() {
    const token = getToken();
    return !!token; // Returns true if token exists, false otherwise
}