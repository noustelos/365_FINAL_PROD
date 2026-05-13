/* ============================================================
   365ORTHODOXY - MAIN SCRIPT
   Functions: Header Date, Optional Translations, Lightbox
   ============================================================ */

const TRANSLATION_FETCH_TIMEOUT_MS = 6000;
const translationCache = new Map();

function safeStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn('Storage read failed:', error);
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn('Storage write failed:', error);
        return false;
    }
}

async function fetchTranslations(lang) {
    if (translationCache.has(lang)) {
        return translationCache.get(lang);
    }

    let timeoutId = null;
    const hasAbortController = typeof AbortController !== 'undefined';
    const controller = hasAbortController ? new AbortController() : null;

    try {
        if (controller) {
            timeoutId = window.setTimeout(() => controller.abort(), TRANSLATION_FETCH_TIMEOUT_MS);
        }

        const response = await fetch(`translations/${lang}.json`, controller ? { signal: controller.signal } : undefined);
        if (!response.ok) throw new Error('File not found.');

        const parsed = await response.json();
        translationCache.set(lang, parsed);
        return parsed;
    } catch (error) {
        if (error && error.name === 'AbortError') {
            console.error('Translations failed: request timed out.');
            return null;
        }

        console.error('Translations failed:', error);
        return null;
    } finally {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
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

    const greekBtn = document.getElementById('btn-el') || document.querySelector('.lang-switcher a[href="index.html"]');
    const englishBtn = document.getElementById('btn-en') || document.querySelector('.lang-switcher a[href="en.html"]');

    if (greekBtn) greekBtn.classList.toggle('active', lang === 'el');
    if (englishBtn) englishBtn.classList.toggle('active', lang === 'en');

    safeStorageSet('preferredLang', lang);
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
    const hasDedicatedLanguagePages = Boolean(
        document.querySelector('.lang-switcher a[href="index.html"]')
        && document.querySelector('.lang-switcher a[href="en.html"]')
    );

    if (hasI18nNodes) {
        const raw = safeStorageGet('preferredLang');
        const savedLang = hasDedicatedLanguagePages
            ? htmlLang
            : (['el', 'en'].includes(raw) ? raw : htmlLang);

        setLanguage(savedLang).catch((error) => {
            console.error('Language initialization failed:', error);
            updateHeaderDate(htmlLang);
        });
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
    if (safeStorageGet(consentKey)) return;

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
            safeStorageSet(consentKey, value);
            banner.remove();
        });
    });
}

function initSubscribeFormGuard() {
    const isEnglish = document.documentElement.lang === 'en';
    const loadingLabel = isEnglish ? 'Sending...' : 'Αποστολή...';

    document.querySelectorAll('form.subscribe-form').forEach((form) => {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        form.addEventListener('submit', () => {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.textContent = loadingLabel;
        }, { once: true });
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

function initScrollReveal() {
    const widgets = document.querySelectorAll('main .glass-widget');
    if (widgets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        widgets.forEach((el) => {
            el.classList.add('is-visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

    widgets.forEach(el => {
        el.classList.add('reveal-widget');
        observer.observe(el);
    });

    window.addEventListener('pagehide', () => {
        observer.disconnect();
    }, { once: true });
}

function initGlowParallax() {
    const glow1 = document.querySelector('.glow-1');
    const glow2 = document.querySelector('.glow-2');
    if (!glow1 || !glow2) return;

    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    let frameId = null;
    let nextX = 0;
    let nextY = 0;

    const render = () => {
        const x = (nextX / window.innerWidth - 0.5) * 28;
        const y = (nextY / window.innerHeight - 0.5) * 20;
        glow1.style.transform = `translate(${x}px, ${y}px)`;
        glow2.style.transform = `translate(${-x}px, ${-y}px)`;
        frameId = null;
    };

    const onMouseMove = (event) => {
        nextX = event.clientX;
        nextY = event.clientY;

        if (frameId !== null) return;
        frameId = window.requestAnimationFrame(render);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    window.addEventListener('pagehide', () => {
        document.removeEventListener('mousemove', onMouseMove);
        if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
        }
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    initLanguageAndDate();
    initSubscribeFormGuard();
    initLightbox();
    initObfuscatedEmails();
    initDynamicCopyrightYear();
    initCookieConsent();
    initScrollReveal();
    initGlowParallax();
});
