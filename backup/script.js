
// Fetches the translation file for the given language
async function fetchTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Translation file for '${lang}' not found.`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load translations:', error);
        return null;
    }
}

// Updates the displayed date in the header based on the selected language
function updateHeaderDate(lang) {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const locale = (lang === 'el') ? 'el-GR' : 'en-US';
    const dateEl = document.getElementById('header-date');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(locale, options).toUpperCase();
    }
}

// Applies the translations to the page content and placeholders
function applyTranslations(translations) {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });
}

// Main function to set the language of the page
async function setLanguage(lang) {
    // Fetch and apply translations
    const translations = await fetchTranslations(lang);
    applyTranslations(translations);

    // Update UI state (active button)
    document.getElementById('btn-el')?.classList.toggle('active', lang === 'el');
    document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');

    // Update the date display
    updateHeaderDate(lang);

    // Persist the selected language
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
}

// Sets up the initial state and event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language from storage or default to Greek
    const savedLang = localStorage.getItem('preferredLang') || 'el';
    setLanguage(savedLang);

    // Add click event listeners to language switcher buttons
    document.getElementById('btn-el')?.addEventListener('click', () => setLanguage('el'));
    document.getElementById('btn-en')?.addEventListener('click', () => setLanguage('en'));
});
