const API_URL = 'https://sut-park-backend.onrender.com/public/news'; 
const BACKEND_URL = 'https://sut-park-backend.onrender.com';

const newsListContainer = document.getElementById('project-list'); 
const statusMessage = document.getElementById('status-message');
const searchInput = document.getElementById('search-input'); 
const searchButton = document.getElementById('search-toggle'); 
const searchWrapper = document.getElementById('search-wrapper'); 

const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');

const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("img01");
const captionText = document.getElementById("caption");
const closeModal = document.querySelector(".close");

const langTH = document.getElementById('langTH');
const langEN = document.getElementById('langEN');

let allNews = []; 
let currentGalleryImages = []; 

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const mainLogo = document.getElementById('mainLogo');
    const scrollDistance = 50; 

    if (!mainLogo) return;
    if (window.scrollY > scrollDistance) {
        header.classList.add('sticky'); 
        mainLogo.src = '../logo/Logo2.png';
    } else {
        header.classList.remove('sticky'); 
        mainLogo.src = '../logo/logo.png';
    }
});

function formatThaiDate(dateString) {
    if (!dateString || dateString.startsWith('0000')) return 'ไม่ระบุวันที่';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'ไม่ระบุวันที่';
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return 'ไม่ระบุวันที่'; }
}

function getImgUrl(path) {
    const FALLBACK_URL = 'https://placehold.co/400x200?text=SUT+News+No+Image';
    if (!path) return FALLBACK_URL;
    if (path.indexOf('http') === 0) return path;
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanPath}`;
}

function prepareGalleryImages(item) {
    let images = [];
    if (item.imageUrl) images.push({ url: getImgUrl(item.imageUrl), alt: item.title || 'Main Photo' });
    if (images.length === 1) {
        for (let i = 1; i <= 3; i++) {
            images.push({ url: `https://placehold.co/600x400?text=News+Gallery+Mock+${i}`, alt: `Mock ${i}` });
        }
    }
    return images;
}

function createGalleryHTML(images) {
    if (images.length === 0) return `<div class="image-placeholder">No Image</div>`;
    const mainImg = images[0];
    const thumbnailHTML = images.slice(1, 4).map((img, idx) => `
        <img src="${img.url}" alt="${img.alt}" class="thumbnail-image" data-global-index="${idx + 1}">
    `).join('');

    return `
        <div id="main-gallery-container" class="main-gallery-container">
            <div id="main-image-wrapper" class="main-image-wrapper" onclick="openModal(0)">
                <img id="main-image-detail" src="${mainImg.url}" class="main-gallery-image">
                <div class="zoom-overlay"><div class="zoom-icon">+</div></div>
            </div>
            <div id="thumbnail-grid" class="thumbnail-grid">${thumbnailHTML}</div>
        </div>
    `;
}

function createNewsCard(item, currentLang = 'th') {
    const card = document.createElement('div');
    card.className = 'service-card';
    const title = item.title || 'ไม่มีหัวข้อข่าว';
    const displayDate = formatThaiDate(item.createdAt);
    const readMoreText = currentLang === 'en' ? 'READ MORE →' : 'อ่านเพิ่มเติม →';

    card.innerHTML = `
        <img src="${getImgUrl(item.imageUrl)}" onerror="this.src='https://placehold.co/350x350?text=Image+Error'" alt="${title}">
        <div class="service-card-content">
            <div class="date-snippet">🗓️ ${displayDate}</div>
            <h3 class="title-snippet">${title}</h3>
            <a href="#" class="read-more" onclick="showDetail('${item._id}'); return false;">${readMoreText}</a> 
        </div>
    `;
    card.addEventListener('click', () => showDetail(item._id));
    return card;
}

function renderNews(items, searchTerm = '') {
    if (!newsListContainer) return;
    newsListContainer.innerHTML = ''; 
    const currentLang = document.documentElement.lang || 'th';
    
    let filteredItems = items;
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase().trim();
        filteredItems = items.filter(i => 
            (i.title || '').toLowerCase().includes(lowerSearch) || 
            (i.content || '').toLowerCase().includes(lowerSearch)
        );
    }

    if (filteredItems.length === 0) {
        statusMessage.style.display = 'block';
        statusMessage.innerText = searchTerm ? 'ไม่พบข่าวที่ค้นหา' : 'ยังไม่มีข่าวสาร';
        return;
    }

    statusMessage.style.display = 'none';
    filteredItems.forEach(item => {
        newsListContainer.appendChild(createNewsCard(item, currentLang));
    });
}

async function fetchAndRenderNews(searchTerm = '') {
    if (!newsListContainer) return;
    showListView();

    statusMessage.style.display = 'none';
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

    try {
        const response = await fetch(API_URL);
        const newsList = await response.json();
        allNews = newsList.filter(item => (item.category || '').trim() !== 'ประกาศคำสั่ง');
        
        renderNews(allNews, searchTerm);
    } catch (error) {
        newsListContainer.innerHTML = ''; 
        statusMessage.style.display = 'block';
        statusMessage.innerText = `❌ เกิดข้อผิดพลาด: ${error.message}`;
    }
}

window.showDetail = function(newsId) {
    const item = allNews.find(p => p._id === newsId);
    if (!item) return;

    listView.style.display = 'none';
    detailView.style.display = 'block';
    currentGalleryImages = prepareGalleryImages(item);

    detailView.innerHTML = `
        <div class="detail-container">
            <button class="back-button" onclick="showListView()">← กลับสู่รายการ</button>
            <h1 class="detail-title">${item.title}</h1>
            <div class="detail-content-wrapper">
                <div class="detail-text-col">
                    <div class="detail-info">
                        <div class="info-group"><strong>หมวดหมู่:</strong> ${item.category || 'ข่าวทั่วไป'}</div>
                        <div class="info-group"><strong>วันที่:</strong> ${formatThaiDate(item.createdAt)}</div>
                    </div>
                    <h2>รายละเอียดข่าวสาร</h2>
                    <p class="detail-content-text1">${item.content || ''}</p>
                </div>
                <div class="detail-gallery-col">${createGalleryHTML(currentGalleryImages)}</div>
            </div>
        </div>
    `;
    setupGalleryEventListeners();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.showListView = function() {
    listView.style.display = 'block';
    detailView.style.display = 'none';
}

window.openModal = function(index) {
    if (!currentGalleryImages[index]) return;
    modal.style.display = "block";
    modalImg.src = currentGalleryImages[index].url;
    captionText.innerHTML = currentGalleryImages[index].alt || '';
}

function setupGalleryEventListeners() {
    document.querySelectorAll('.thumbnail-image').forEach(thumb => {
        thumb.onclick = () => openModal(parseInt(thumb.dataset.globalIndex));
    });
}

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-th]').forEach(el => {
        el.innerText = el.getAttribute(`data-${lang}`);
    });
    renderNews(allNews, searchInput.value);
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

function handleSearchAction() {
    if (!searchWrapper || !searchInput) return;
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

searchButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSearchAction();
});

searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchAndRenderNews(searchInput.value);
});

document.addEventListener('click', (e) => {
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        if (searchInput.value.trim() === "") searchWrapper.classList.remove('active');
    }
});

if (closeModal) closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    switchLanguage('th');
    fetchAndRenderNews();
});