/**
 * data-manager.js
 * Centralized data management for EziTom Portfolio.
 * Handles localStorage persistence and provides default hardcoded data.
 */

const DEFAULT_PORTFOLIO_DATA = {
    projects: [
        {
            id: 1,
            title: 'See Mary See Beauty Salon',
            description: 'A brand dedicated to helping individuals express their identity through their hair. With over 10 years of industry experience, the brand emphasises attention to detail and a deep understanding of personal style. The website reflects this expertise while providing a modern, user-friendly experience.',
            tech_stack: ["WordPress", "WooCommerce", "Custom CSS"],
            image_url: 'images/projects/Business website.png',
            live_url: 'https://pcc.plz.mybluehost.me/website_f48cd1cd/',
            category: 'Business'
        },
        {
            id: 2,
            title: 'Tolu & Dami: Our Story',
            description: 'A couple in Abuja wanted a personal site to share their story, countdown to the big day, and collect RSVPs. Built a warm, elegant single-page site with a live countdown timer, photo gallery, and a working RSVP form that emails the couple on every submission.',
            tech_stack: ["HTML", "CSS", "Vanilla JS", "EmailJS"],
            image_url: 'images/projects/tolu-dami-wedding.svg',
            live_url: '#',
            category: 'Events & Wedding'
        },
        {
            id: 3,
            title: 'GreenRoots Organic Store',
            description: 'An organic food brand scaling from farmers markets to online sales. Built a full e-commerce storefront integrated with the Shopify Storefront API, custom cart UI, and a mobile-first checkout flow. First-week sales exceeded the client monthly in-store average.',
            tech_stack: ["Next.js", "Shopify API", "Stripe", "Tailwind CSS"],
            image_url: 'images/projects/greenroots-store.svg',
            live_url: '#',
            category: 'Business'
        },
        {
            id: 4,
            title: 'DevNotes - Personal Blog',
            description: 'A personal space on the web to write about real discoveries — not tutorials, just notes. Built with Next.js App Router and MDX so code, diagrams, and thoughts live in the same post. Fully statically generated, loads in under 1 second.',
            tech_stack: ["Next.js", "MDX", "Vercel", "TypeScript"],
            image_url: 'images/projects/devnotes-blog.svg',
            live_url: '#',
            category: 'Business'
        },
        {
            id: 5,
            title: 'Harbour Events Co.',
            description: 'A high-end event planning company in Lagos needed a site that felt as premium as their service. Built a visually rich site with animated section transitions, a portfolio gallery, and an enquiry form that sends structured briefing emails directly to their inbox.',
            tech_stack: ["React", "Framer Motion", "Nodemailer", "Tailwind CSS"],
            image_url: 'images/projects/harbour-events.svg',
            live_url: '#',
            category: 'Events & Wedding'
        },
        {
            id: 6,
            title: 'OpenTrack CLI',
            description: 'A command-line tool built out of frustration — it pulls open GitHub issues across all repos into one prioritised list in the terminal. 200+ GitHub stars, adopted by multiple teams who reported significant time savings.',
            tech_stack: ["Node.js", "GitHub API", "npm", "Commander.js"],
            image_url: 'images/projects/opentrack-cli.svg',
            live_url: '#',
            category: 'Business'
        }
    ],
    skills: {
        "Frontend": [
            { id: 101, skill_name: 'HTML', proficiency: 95 },
            { id: 102, skill_name: 'CSS', proficiency: 95 },
            { id: 103, skill_name: 'JavaScript', proficiency: 90 },
            { id: 104, skill_name: 'WordPress', proficiency: 85 }
        ],
        "Backend": [
            { id: 201, skill_name: 'Node.js/Express', proficiency: 85 },
            { id: 202, skill_name: 'Native PHP', proficiency: 80 },
            { id: 203, skill_name: 'MySQL', proficiency: 85 },
            { id: 204, skill_name: 'Python/Django', proficiency: 78 },
            { id: 205, skill_name: 'REST & GraphQL APIs', proficiency: 90 },
            { id: 206, skill_name: 'PostgreSQL', proficiency: 82 }
        ],
        "DevOps & Tooling": [
            { id: 301, skill_name: 'Git', proficiency: 90 },
            { id: 302, skill_name: 'GitHub Actions', proficiency: 80 },
            { id: 303, skill_name: 'Vercel', proficiency: 85 },
            { id: 304, skill_name: 'Netlify', proficiency: 82 }
        ]
    }
};

const STORAGE_KEY = 'ezitom_portfolio_data';

const DataManager = {
    /**
     * Get the current portfolio data from localStorage or fallback to defaults.
     */
    getPortfolioData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing stored portfolio data:', e);
            }
        }
        // If nothing stored or error, save and return defaults
        this.savePortfolioData(DEFAULT_PORTFOLIO_DATA);
        return DEFAULT_PORTFOLIO_DATA;
    },

    /**
     * Save the entire data object to localStorage.
     */
    savePortfolioData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Dispatch a custom event so other parts of the app can react if needed
        window.dispatchEvent(new CustomEvent('portfolioDataUpdated', { detail: data }));
    },

    // ── PROJECT CRUD ──────────────────────────────────────────

    addProject(project) {
        const data = this.getPortfolioData();
        project.id = Date.now(); // Simple ID generation
        data.projects.unshift(project); // Add to beginning
        this.savePortfolioData(data);
        return project;
    },

    updateProject(updatedProject) {
        const data = this.getPortfolioData();
        const index = data.projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
            data.projects[index] = updatedProject;
            this.savePortfolioData(data);
            return true;
        }
        return false;
    },

    deleteProject(id) {
        const data = this.getPortfolioData();
        data.projects = data.projects.filter(p => p.id !== id);
        this.savePortfolioData(data);
        return true;
    },

    // ── SKILLS CRUD ───────────────────────────────────────────

    addSkill(category, skill) {
        const data = this.getPortfolioData();
        if (!data.skills[category]) {
            data.skills[category] = [];
        }
        skill.id = Date.now();
        data.skills[category].push(skill);
        this.savePortfolioData(data);
        return skill;
    },

    updateSkill(category, updatedSkill) {
        const data = this.getPortfolioData();
        if (data.skills[category]) {
            const index = data.skills[category].findIndex(s => s.id === updatedSkill.id);
            if (index !== -1) {
                data.skills[category][index] = updatedSkill;
                this.savePortfolioData(data);
                return true;
            }
        }
        return false;
    },

    deleteSkill(category, id) {
        const data = this.getPortfolioData();
        if (data.skills[category]) {
            data.skills[category] = data.skills[category].filter(s => s.id !== id);
            // Clean up empty categories
            if (data.skills[category].length === 0) {
                delete data.skills[category];
            }
            this.savePortfolioData(data);
            return true;
        }
        return false;
    },

    // ── MESSAGES MANAGEMENT ─────────────────────────────────────
    
    MESSAGES_KEY: 'ezitom_messages',

    getMessages() {
        const stored = localStorage.getItem(this.MESSAGES_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    saveMessage(messageData) {
        const messages = this.getMessages();
        const newMessage = {
            id: Date.now(),
            name: messageData.name,
            email: messageData.email,
            subject: messageData.subject || 'No Subject',
            message: messageData.message,
            timestamp: new Date().toISOString(),
            read: false,
            emailStatus: messageData.emailStatus || 'pending' // 'sent', 'failed', or 'pending'
        };
        messages.unshift(newMessage); // Newest first
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
        // Dispatch event so dashboard can update badge
        window.dispatchEvent(new CustomEvent('messagesUpdated'));
        return newMessage;
    },

    deleteMessage(id) {
        const messages = this.getMessages();
        const filtered = messages.filter(m => m.id !== id);
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('messagesUpdated'));
        return true;
    },

    markMessageAsRead(id) {
        const messages = this.getMessages();
        const index = messages.findIndex(m => m.id === id);
        if (index !== -1) {
            messages[index].read = true;
            localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
            window.dispatchEvent(new CustomEvent('messagesUpdated'));
            return true;
        }
        return false;
    },

    getUnreadCount() {
        const messages = this.getMessages();
        return messages.filter(m => !m.read).length;
    }
};

// Export to window for global access
window.DataManager = DataManager;
