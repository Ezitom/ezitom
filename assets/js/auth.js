/**
 * auth.js
 * Client-side authentication logic for EziTom Portfolio.
 */

const AUTH_KEY = 'ezitom_admin_auth';
const SESSION_KEY = 'ezitom_session';

// Only this email is authorized to access the admin dashboard
const ADMIN_EMAIL = 'oniebenezer1@gmail.com';

const AuthManager = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return false;
        
        try {
            const data = JSON.parse(session);
            // Check if session is expired (e.g., 24 hours)
            const now = Date.now();
            if (now > data.expiry) {
                this.logout();
                return false;
            }
            // Only the authorized admin email can access the dashboard
            if (data.email.toLowerCase() !== ADMIN_EMAIL) {
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Signup a new admin (Gmail only)
     */
    signup(email, password) {
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return { success: false, message: 'Only Gmail addresses are allowed.' };
        }

        const auth = {
            email: email.toLowerCase(),
            password: password // In a real app, this would be hashed. For this static demo, we store it plainly.
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
        return { success: true, message: 'Account created successfully!' };
    },

    /**
     * Login the admin
     */
    login(email, password, rememberMe = false) {
        const stored = localStorage.getItem(AUTH_KEY);
        if (!stored) {
            return { success: false, message: 'No account found. Please sign up.' };
        }

        const auth = JSON.parse(stored);
        if (auth.email === email.toLowerCase() && auth.password === password) {
            const expiry = rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email.toLowerCase(), expiry }));

            // Only the authorized admin email gets dashboard access
            if (email.toLowerCase() === ADMIN_EMAIL) {
                return { success: true, isAdmin: true };
            } else {
                // Accept the login silently but flag as non-admin
                return { success: true, isAdmin: false };
            }
        }

        return { success: false, message: 'Invalid email or password.' };
    },

    /**
     * Reset password
     */
    resetPassword(email, newPassword) {
        const stored = localStorage.getItem(AUTH_KEY);
        if (!stored) return { success: false, message: 'User not found.' };

        const auth = JSON.parse(stored);
        if (auth.email === email.toLowerCase()) {
            auth.password = newPassword;
            localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
            return { success: true, message: 'Password updated successfully!' };
        }

        return { success: false, message: 'Email does not match our records.' };
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    }
};

window.AuthManager = AuthManager;
