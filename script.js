/* ============================================================
   365ORTHODOXY - MAIN SCRIPT
   Functions: Language Sync, Header Date, Premium Lightbox
   ============================================================ */

// 1. ΣΥΝΑΡΤΗΣΕΙΣ ΜΕΤΑΦΡΑΣΗΣ & ΓΛΩΣΣΑΣ
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
    
    // Ενημέρωση UI στοιχείων
    document.getElementById('btn-el')?.classList.toggle('active', lang === 'el');
    document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');
    
    // Αποθήκευση επιλογής
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    
    // Ενημέρωση ημερομηνίας
    updateHeaderDate(lang);
}

// --- ΔΙΟΡΘΩΜΕΝΟ LIGHTBOX ΓΙΑ IOS (iPhone/iPad) ---
const mockupImages = ["assets/mockups/m1.webp", "assets/mockups/m2.webp", "assets/mockups/m3.webp"];
let currentMockupIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openLightbox');
    const lb = document.getElementById('lightbox');
    
    if (openBtn && lb) {
        openBtn.onclick = function(e) {
            e.preventDefault();
            lb.style.display = 'flex';
        };
    }
});

// Συνάρτηση για αλλαγή εικόνας με προστασία για iOS
function changeImage(event, n) {
    // ΕΜΠΟΔΙΖΕΙ ΤΟ ΚΛΕΙΣΙΜΟ ΤΟΥ LIGHTBOX
    if (event) {
        event.stopPropagation(); 
    }
    
    currentMockupIndex += n;
    if (currentMockupIndex >= mockupImages.length) currentMockupIndex = 0;
    if (currentMockupIndex < 0) currentMockupIndex = mockupImages.length - 1;
    
    const imgElement = document.getElementById('lightbox-img');
    if (imgElement) {
        imgElement.src = mockupImages[currentMockupIndex];
    }
}

// Κλείσιμο μόνο αν πατηθεί το background
const lbContainer = document.getElementById('lightbox');
if (lbContainer) {
    lbContainer.onclick = function(event) {
        // Κλείνει ΜΟΝΟ αν πατήσεις το μαύρο/glass φόντο, όχι την εικόνα ή τα βέλη
        if (event.target === lbContainer) {
            lbContainer.style.display = "none";
        }
    };
}

// 3. INITIALIZATION (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openLightbox');
    const lb = document.getElementById('lightbox');
    
    if (openBtn && lb) {
        openBtn.onclick = function(e) {
            e.preventDefault();
            lb.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Κλειδώνει το πίσω scroll
        };
    }
});

// Κλείσιμο Lightbox
function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.style.display = 'none';
        document.body.style.overflow = 'auto'; // Επαναφέρει το πίσω scroll
    }
}

// Κλείσιμο με κλικ στο background ή το X
window.onclick = function(event) {
    const lb = document.getElementById('lightbox');
    const scrollContainer = document.querySelector('.lightbox-scroll-container');
    // Αν πατήσεις στο container (κενό ανάμεσα στις φωτό) κλείνει
    if (event.target === lb || event.target === scrollContainer) {
        closeLightbox();
    }
}

// Σύνδεση του X με τη συνάρτηση κλεισίματος
document.querySelector('.close-lightbox').onclick = closeLightbox;