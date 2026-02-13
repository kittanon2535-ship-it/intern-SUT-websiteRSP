// --- Configuration & Elements ---
const API_URL = 'https://sut-park-backend.onrender.com/public/news'; 
const BACKEND_URL = 'https://sut-park-backend.onrender.com';
const SCROLL_THRESHOLD = 50; 
const LOGO_NORMAL = '../logo/logo.png';
const LOGO_STICKY = '../logo/Logo2.png';

const newsListContainer = document.getElementById('project-list'); 
const statusMessage = document.getElementById('status-message');
const searchInput = document.getElementById('search-input'); 
const searchWrapper = document.getElementById('search-wrapper');
const searchToggle = document.querySelector('.search-icon-btn'); 

const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');

const langTH = document.getElementById('langTH');
const langEN = document.getElementById('langEN');

let allNews = []; 

// --- 1. ฟังก์ชันจัดการ Header (ที่แยกออกมา) ---

/**
 * จัดการการเปลี่ยนสี Header และสลับโลโก้เมื่อ Scroll
 */
function handleHeaderScroll() {
    const header = document.querySelector('header');
    const mainLogo = document.getElementById('mainLogo');

    if (!header || !mainLogo) return;

    const isSticky = window.scrollY > SCROLL_THRESHOLD;

    // เปลี่ยนสีพื้นหลัง (ผ่าน class sticky ใน CSS)
    if (isSticky) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }

    // สลับรูปโลโก้
    const targetLogo = isSticky ? LOGO_STICKY : LOGO_NORMAL;
    if (mainLogo.getAttribute('src') !== targetLogo) {
        mainLogo.src = targetLogo;
    }
}

// --- 2. ฟังก์ชันจัดการข้อมูลและแสดงผล (News Logic) ---

function formatThaiDate(dateString) {
    if (!dateString || dateString.startsWith('0000')) return 'ไม่ระบุวันที่';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'ไม่ระบุวันที่';
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return 'ไม่ระบุวันที่'; }
}

function getFileUrl(path) {
    if (!path) return null;
    if (path.indexOf('http') === 0) return path; 
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanPath}`;
}

function renderSkeletons() {
    if (!newsListContainer) return;
    newsListContainer.innerHTML = `
        <div class="service-card skeleton-active">
            <div class="skeleton-image-box"></div>
            <div class="service-card-content">
                <div class="skeleton-bar date-bar"></div>
                <div class="skeleton-bar title-bar"></div>
                <div class="skeleton-bar title-bar short"></div>
                <div class="skeleton-btn-pill"></div>
            </div>
        </div>
    `.repeat(4);
}

function createNewsCard(item, currentLang = 'th') {
    const card = document.createElement('div');
    card.className = 'service-card'; 
    const title = item.title || 'ไม่มีหัวข้อเอกสาร';
    const displayDate = formatThaiDate(item.createdAt);
    const readMoreText = currentLang === 'en' ? 'Details' : 'ดูรายละเอียด';
    const pdfIcon = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';

    card.innerHTML = `
        <div class="file-icon-wrapper">
            <img src="${pdfIcon}" alt="PDF">
        </div>
        <div class="service-card-content">
            <div class="text-group">
                <h3 class="title-snippet">${title}</h3>
                <div class="date-snippet">🗓️ ${displayDate}</div>
            </div>
            <div class="read-more">${readMoreText}</div>
        </div>
    `;
    card.addEventListener('click', () => showDetail(item._id));
    return card;
}

function createNewsDetailView(item) {
    if (!item || !detailView) return;
    const fileUrl = getFileUrl(item.imageUrl); 
    const title = item.title || 'รายละเอียดเอกสาร';
    const content = (item.content || 'ไม่มีรายละเอียดเนื้อหา').replace(/\n/g, '<br>');
    const displayDate = formatThaiDate(item.createdAt);

    detailView.innerHTML = `
        <div class="detail-container">
            <button class="back-button" onclick="showListView()">← กลับสู่รายการ</button>
            <div class="detail-content-wrapper">
                <div class="detail-text-col">
                    <h1>${title}</h1>
                    <div class="detail-info">
                        <div class="info-group">
                            <span class="detail-label">หมวดหมู่</span>
                            <span class="detail-content-text">${item.category || 'ประกาศ/คำสั่ง'}</span>
                        </div>
                        <div class="info-group">
                            <span class="detail-label">วันที่เผยแพร่</span>
                            <span class="detail-content-text">${displayDate}</span>
                        </div>
                    </div>
                    <div class="text-description-area">
                        <h2>รายละเอียด</h2>
                        <p class="detail-content-text1">${content}</p>
                    </div>
                    <div style="margin-top: 50px;">
                        <a href="${fileUrl}" target="_blank" download class="download-button">⬇️ ดาวน์โหลดไฟล์ต้นฉบับ (PDF)</a>
                    </div>
                </div>
                <div class="detail-gallery-col">
                    <div class="document-preview-card">
                        <div class="preview-header">DOCUMENT PREVIEW</div>
                        <div class="pdf-viewer-wrapper">
                            <iframe src="https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchAndRenderNews(searchTerm = '') {
    if (!newsListContainer) return;
    showListView();
    renderSkeletons();
    statusMessage.style.display = 'none';

    try {
        const response = await fetch(API_URL);
        const newsList = await response.json();
        
        allNews = newsList.filter(item => 
            (item.category || '').trim() === 'ประกาศคำสั่ง'
        );

        renderNewsList(allNews, searchTerm);
    } catch (error) {
        newsListContainer.innerHTML = '';
        statusMessage.style.display = 'block';
        statusMessage.innerText = `❌ Error: ${error.message}`;
        statusMessage.className = 'status error';
    }
}

function renderNewsList(items, searchTerm = '') {
    newsListContainer.innerHTML = '';
    const currentLang = document.documentElement.lang || 'th';
    
    let filtered = items;
    if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        filtered = items.filter(i => 
            (i.title || '').toLowerCase().includes(query) || 
            (i.content || '').toLowerCase().includes(query)
        );
    }

    if (filtered.length === 0) {
        statusMessage.style.display = 'block';
        statusMessage.innerText = searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีรายการประกาศ';
        return;
    }

    filtered.forEach(item => newsListContainer.appendChild(createNewsCard(item, currentLang)));
}

// --- 3. Event Listeners & Lifecycle ---

function handleSearchAction() {
    const isSearchActive = searchWrapper.classList.contains('active');
    if (!isSearchActive) {
        searchWrapper.classList.add('active');
        searchInput.focus();
    } else {
        if (searchInput.value.trim() !== "") {
            fetchAndRenderNews(searchInput.value);
        } else {
            searchWrapper.classList.remove('active');
        }
    }
}

window.showDetail = function(id) {
    const item = allNews.find(n => n._id === id);
    if (item) {
        listView.style.display = 'none';
        detailView.style.display = 'block';
        createNewsDetailView(item);
        document.title = `${item.title} | RSP`;
    }
};

window.showListView = function() {
    listView.style.display = 'block';
    detailView.style.display = 'none';
};

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    renderNewsList(allNews, searchInput.value);
}

if(langTH && langEN) {
    langTH.addEventListener('click', () => switchLanguage('th'));
    langEN.addEventListener('click', () => switchLanguage('en'));
}

function switchLanguage(lang) {
    document.querySelectorAll('[data-th]').forEach(el => {
        const translation = el.getAttribute(`data-${lang}`);
        if (translation) {
             el.textContent = translation;
        }
    });

    document.documentElement.lang = lang;
    if(langTH) langTH.classList.toggle('active', lang === 'th');
    if(langEN) langEN.classList.toggle('active', lang === 'en');
}
// Scroll Event
window.addEventListener('scroll', handleHeaderScroll);

// Search Events
searchToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSearchAction();
});

searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchAndRenderNews(searchInput.value);
});

document.addEventListener('click', (e) => {
    if (searchWrapper && !searchWrapper.contains(e.target) && searchInput.value.trim() === "") {
        searchWrapper.classList.remove('active');
    }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    handleHeaderScroll(); // รันครั้งแรกเผื่อหน้าจอโหลดมาแล้วไม่ได้อยู่บนสุด
    switchLanguage('th');
    fetchAndRenderNews();
});