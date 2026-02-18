// Διορθωμένο Script για Burgundy Ημερομηνία και Bold
async function fetchTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error(`File not found.`);
        return await response.json();
    } catch (error) {
        console.error('Translations failed:', error);
        return null;
    }
}

function updateHeaderDate(lang) {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const locale = (lang === 'el') ? 'el-GR' : 'en-US';
    const dateEl = document.getElementById('header-date');
    if (dateEl) {
        const formattedDate = now.toLocaleDateString(locale, options).toLowerCase();
        // Επιστροφή ημερομηνίας με bold
        dateEl.innerHTML = `<b>${formattedDate}</b>`;
    }
}

function applyTranslations(translations) {
    if (!translations) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.innerHTML = translations[key];
    });
}

async function setLanguage(lang) {
    const translations = await fetchTranslations(lang);
    applyTranslations(translations);
    document.getElementById('btn-el')?.classList.toggle('active', lang === 'el');
    document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');
    updateHeaderDate(lang);
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'el';
    setLanguage(savedLang);
    document.getElementById('btn-el')?.addEventListener('click', () => setLanguage('el'));
    document.getElementById('btn-en')?.addEventListener('click', () => setLanguage('en'));
});