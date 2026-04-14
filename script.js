/* ============================================================
   365ORTHODOXY - MAIN SCRIPT
   Functions: Header Date, Optional Translations, Lightbox
   ============================================================ */

async function fetchTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error('File not found.');
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
        dateEl.innerHTML = `<b>${formattedDate}</b>`;
    }
}

function applyTranslations(translations) {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && translations[key]) el.innerHTML = translations[key];
    });
}

async function setLanguage(lang) {
    const translations = await fetchTranslations(lang);
    applyTranslations(translations);

    document.getElementById('btn-el')?.classList.toggle('active', lang === 'el');
    document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');

    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    updateHeaderDate(lang);
}

function openLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.querySelector('.close-lightbox')?.focus();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    document.getElementById('openLightbox')?.focus();
}

function initLanguageAndDate() {
    const hasI18nNodes = document.querySelector('[data-i18n]');
    const htmlLang = document.documentElement.lang === 'en' ? 'en' : 'el';

    if (hasI18nNodes) {
        const raw = localStorage.getItem('preferredLang');
        const savedLang = ['el', 'en'].includes(raw) ? raw : htmlLang;
        setLanguage(savedLang);
        return;
    }

    updateHeaderDate(htmlLang);
}

function initDynamicCopyrightYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.copyright-year').forEach((node) => {
        node.textContent = String(year);
    });
}

function initObfuscatedEmails() {
    document.querySelectorAll('.obfuscated-email').forEach((emailLink) => {
        const user = emailLink.getAttribute('data-user');
        const domain = emailLink.getAttribute('data-domain');
        if (!user || !domain) return;

        const email = `${user}@${domain}`;
        emailLink.setAttribute('href', `mailto:${email}`);
        emailLink.textContent = email;
    });
}

function initCookieConsent() {
    const consentKey = 'cookieConsent';
    if (localStorage.getItem(consentKey)) return;

    const isEnglish = document.documentElement.lang === 'en';
    const message = isEnglish
        ? 'This site uses essential cookies/local storage for language preferences and basic functionality.'
        : 'Ο ιστότοπος χρησιμοποιεί απαραίτητα cookies/local storage για προτιμήσεις γλώσσας και βασική λειτουργία.';
    const acceptLabel = isEnglish ? 'Accept' : 'Αποδοχή';
    const rejectLabel = isEnglish ? 'Reject' : 'Απόρριψη';
    const policyLabel = isEnglish ? 'Privacy Policy' : 'Πολιτική Απορρήτου';
    const policyPath = isEnglish ? 'privacy-en.html' : 'privacy.html';

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
        <p>${message} <a href="${policyPath}">${policyLabel}</a></p>
        <div class="cookie-actions">
            <button type="button" class="cookie-btn cookie-btn-muted" data-consent="rejected">${rejectLabel}</button>
            <button type="button" class="cookie-btn" data-consent="accepted">${acceptLabel}</button>
        </div>
    `;

    document.body.appendChild(banner);

    banner.querySelectorAll('button[data-consent]').forEach((button) => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-consent') || 'accepted';
            localStorage.setItem(consentKey, value);
            banner.remove();
        });
    });
}

function initLightbox() {
    const openBtn = document.getElementById('openLightbox');
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    const scrollContainer = document.querySelector('.lightbox-scroll-container');

    if (openBtn && lightbox) {
        openBtn.addEventListener('click', (event) => {
            event.preventDefault();
            openLightbox();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox || event.target === scrollContainer) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initLanguageAndDate();
    initLightbox();
    initObfuscatedEmails();
    initDynamicCopyrightYear();
    initCookieConsent();
});
