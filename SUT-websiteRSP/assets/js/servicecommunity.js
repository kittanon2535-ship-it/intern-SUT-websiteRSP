const API_URL = 'https://sut-park-backend.onrender.com/public/services';
const BACKEND_URL = 'https://sut-park-backend.onrender.com';
const projectListContainer = document.getElementById('project-list');
const statusMessage = document.getElementById('status-message');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchWrapper = document.getElementById('search-wrapper');
const searchToggle = document.getElementById('search-toggle');
const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("img01");
const captionText = document.getElementById("caption");
const closeModal = document.getElementsByClassName("close")[0];
const langTH = document.getElementById('langTH');
const langEN = document.getElementById('langEN');

let allProjects = []; 
let currentGalleryImages = []; 

/**
 * @param {string} dateString -
 * @returns {string | null} 
 */
function formatThaiDate(dateString) {
    if (!dateString || dateString === '0000-00-00T00:00:00.000Z' || dateString === '0000-00-00') return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return null;
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return null;
    }
}

/**
 * @param {string} path 
 * @returns {string} 
 */
function getImgUrl(path) {
    const FALLBACK_URL = 'https://placehold.co/400x200?text=RSP+No+Image';

    if (!path) return FALLBACK_URL;
    if (path.indexOf('http') === 0) return path;

    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanPath}`;
}

function prepareGalleryImages(item) {
    let images = [];
    const mainImagePath = item.imagePath || item.imageUrl;

    if (mainImagePath) {
        images.push({ url: getImgUrl(mainImagePath), alt: item.title || 'Main Photo', isMain: true });
    }
    if (item.galleryImages && Array.isArray(item.galleryImages)) {
        item.galleryImages.forEach(path => {
            const imgUrl = getImgUrl(path);
            if (!images.some(img => img.url === imgUrl)) {
                images.push({ url: imgUrl, alt: item.title || 'Gallery Photo' });
            }
        });
    }

    if (images.length === 0) {
        images.push({ url: getImgUrl(null), alt: 'No Image Available', isMain: true });
        for (let i = 1; i <= 3; i++) {
            images.push({ url: `https://placehold.co/600x400?text=Gallery+Mock+${i}`, alt: `Mock Gallery ${i}` });
        }
    } else if (images.length < 4) {
        const needed = 4 - images.length;
        for (let i = 1; i <= needed; i++) {
            images.push({ url: `https://placehold.co/600x400?text=Gallery+Mock+${images.length + i}`, alt: `Mock Gallery ${images.length + i}` });
        }
    }
    
    return images;
}

function createGalleryHTML(images) {
    if (images.length === 0) {
        return `<div class="image-placeholder">RSP No Image</div>`;
    }

    const mainImg = images[0];
    const thumbnailData = images.slice(1, 7); 
    const thumbnailHTML = thumbnailData.map((imgData, index) => {
        const globalIndex = index + 1; 
        return `
            <img 
                src="${imgData.url}" 
                alt="${imgData.alt}" 
                class="thumbnail-image" 
                data-global-index="${globalIndex}" 
                onerror="this.src='https://placehold.co/150x150?text=Image+Error'">
        `;
    }).join('');
    return `
        <div id="main-gallery-container" class="main-gallery-container">
            <div id="main-image-wrapper" class="main-image-wrapper" data-global-index="0">
                <img 
                    id="main-image-detail" 
                    src="${mainImg.url}" 
                    alt="${mainImg.alt}" 
                    class="main-gallery-image"
                    onerror="this.src='https://placehold.co/600x400?text=Image+Error'">
                <div class="zoom-overlay">
                    <div class="zoom-icon">+</div>
                </div>
            </div>

            <div id="thumbnail-grid" class="thumbnail-grid">
                ${thumbnailHTML}
            </div>
        </div>
    `;
}

function switchLanguage(lang) {
    document.querySelectorAll('[data-th]').forEach(el => {
        const translation = el.getAttribute(`data-${lang}`);
        if(translation) {
            el.textContent = translation;
        }
    });
    const titleEl = document.querySelector('title');
    if (titleEl) {
        document.title = titleEl.getAttribute(`data-${lang}`);
    }
    
    document.documentElement.lang = lang;
    langTH?.classList.toggle('active', lang === 'th');
    langEN?.classList.toggle('active', lang === 'en');
    
    renderProjects(allProjects, searchInput?.value || '');
}

if (langTH && langEN) {
    langTH.addEventListener('click', () => switchLanguage('th'));
    langEN.addEventListener('click', () => switchLanguage('en'));
}

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
        mainLogo.src = '../logo/Logo.png';
    }
});

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    const projectId = item._id; 
    const imagePath = item.imagePath || item.imageUrl;
    const imageUrl = getImgUrl(imagePath); 

    let displayDateString = 'ไม่ระบุวันที่';
    const startDate = formatThaiDate(item.startDate);
    const endDate = formatThaiDate(item.endDate);
    const deadline = formatThaiDate(item.deadline);

    if (startDate && endDate && startDate !== endDate) {
        displayDateString = `${startDate} - ${endDate}`;
    } else if (startDate) {
        displayDateString = startDate;
    } else if (deadline) {
        displayDateString = deadline;
    }
        
    const title = item.title || 'ไม่มีชื่อโครงการ';
    const titleSnippet = `${item.category || ''} ${title}`; 
    const currentLang = document.documentElement.lang || 'th';
    const readMoreText = currentLang === 'en' ? 'READ MORE →' : 'อ่านเพิ่มเติม →';

    let fundingBadgeHTML = '';
    const fundingAmount = item.fundingAmount || 0;
    if (fundingAmount > 0) {
        const formattedFunding = fundingAmount.toLocaleString();
        fundingBadgeHTML = `<div class="funding-badge">💰 ${formattedFunding} บาท</div>`;
    } else if (item.category === 'กิจกรรม' || item.category === 'บริการ' || item.category === 'โครงการ') {
        fundingBadgeHTML = `<div class="funding-badge">💰 0 บาท</div>`;
    }

    card.innerHTML = `
        <img src="${imageUrl}" onerror="this.src='https://placehold.co/350x350?text=Image+Error'" alt="${title}">
        <div class="service-card-content">
            <div class="date-snippet">${displayDateString}</div>
            <p class="title-snippet">${titleSnippet}</p>
            ${fundingBadgeHTML} <a href="#" class="read-more" data-id="${projectId}">${readMoreText}</a> 
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        e.preventDefault(); 
        showDetail(projectId);
    });

    return card;
}

function createDetailView(item) {
    if (!item || !detailView) {
        detailView.innerHTML = '<p class="status error">ไม่พบข้อมูลโครงการนี้</p>';
        return;
    }

    currentGalleryImages = prepareGalleryImages(item);
    const galleryHTML = createGalleryHTML(currentGalleryImages);

    const startDate = formatThaiDate(item.startDate);
    const endDate = formatThaiDate(item.endDate);
    const deadlineDate = formatThaiDate(item.deadline);
    
    let dateDisplayLabel = 'วันสิ้นสุดรับสมัคร:';
    let dateDisplayValue = deadlineDate || 'ไม่ระบุ';

    if (startDate && endDate) {
        dateDisplayLabel = 'วัน/ช่วงเวลา:';
        dateDisplayValue = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    } else if (startDate) {
        dateDisplayLabel = 'วันเริ่มต้น:';
        dateDisplayValue = startDate;
    }

    const fundingText = item.rewardAmount && item.rewardAmount > 0 ? 
        `${item.rewardAmount.toLocaleString()} บาท` : 
        `ไม่ระบุ`;
        
    const audiences = item.targetGroup || item.targetAudience || [];

    const targetAudienceText = audiences.length > 0 ? 
        (Array.isArray(audiences) ? audiences.join(', ') : audiences) : 
        `ทุกประเภท`;

    detailView.innerHTML = `
        <div class="detail-container">
            <button class="back-button" onclick="showListView()">← กลับสู่รายการ</button>
            <h1 class="detail-title">${item.title || 'รายละเอียดโครงการ'}</h1>
            
            <div class="detail-content-wrapper">
                
                <div class="detail-text-col">
                    <div class="detail-info">
                        
                        <div class="info-group">
                            <div class="detail-label">ประเภทบริการ:</div>
                            <div class="detail-content-text">${item.category || '-'}</div>
                        </div>

                        <div class="info-group">
                            <div class="detail-label">${dateDisplayLabel}</div>
                            <div class="detail-content-text">${dateDisplayValue}</div>
                        </div>

                        <div class="info-group">
                            <div class="detail-label">การสนับสนุนสูงสุด:</div>
                            <div class="detail-content-text">${fundingText}</div>
                        </div>

                        <div class="info-group">
                            <div class="detail-label">กลุ่มเป้าหมาย:</div>
                            <div class="detail-content-text">${targetAudienceText}</div>
                        </div>
                    </div>
                
                    <h2>รายละเอียดโครงการ</h2>
                    <p class="detail-content-text1">${item.description || 'ไม่มีคำอธิบายโดยละเอียดสำหรับโครงการนี้'}</p>
                </div>
                
                <div class="detail-gallery-col">
                    ${galleryHTML}
                </div>
            </div>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setupGalleryEventListeners();
}

window.showListView = function() {
    if (listView && detailView) {
        listView.style.display = 'block';
        detailView.style.display = 'none';
        
        const currentLang = document.documentElement.lang || 'th';
        const titleEl = document.querySelector('title');
        if (titleEl) {
            document.title = titleEl.getAttribute(`data-${currentLang}`);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.showDetail = function(projectId) {
    const project = allProjects.find(p => p._id === projectId);
    
    if (listView && detailView) {
        listView.style.display = 'none';
        detailView.style.display = 'block';
        createDetailView(project);
        document.title = `${project?.title || 'รายละเอียดโครงการ'} | RSP`;
    }
}

function renderProjects(items, searchTerm = '') {
    if (!projectListContainer || !statusMessage) return;

    projectListContainer.innerHTML = '';
    statusMessage.style.display = 'none';

    let filteredItems = items;
    if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        filteredItems = items.filter(item => {
            const title = item.title || '';
            const description = item.description || '';
            const category = item.category || '';
            
            const dateString = [
                formatThaiDate(item.startDate) || '', 
                formatThaiDate(item.endDate) || '', 
                formatThaiDate(item.deadline) || ''
            ].join(' ').toLowerCase(); 
            
            return (
                title.toLowerCase().includes(lowerCaseSearch) ||
                description.toLowerCase().includes(lowerCaseSearch) ||
                category.toLowerCase().includes(lowerCaseSearch) ||
                dateString.includes(lowerCaseSearch)
            );
        });
    }
    
    const currentLang = document.documentElement.lang || 'th';
    const noProjectsText = currentLang === 'en' ? 'No projects found.' : (searchTerm ? 'ไม่พบโครงการที่ค้นหา' : 'ยังไม่มีข้อมูลบริการในขณะนี้');

    if (filteredItems.length === 0) {
        statusMessage.innerText = noProjectsText;
        statusMessage.style.display = 'block';
        statusMessage.className = 'status';
        return;
    }

    filteredItems.forEach(item => {
        projectListContainer.appendChild(createCard(item));
    });
}

async function fetchAndRenderProjects(searchTerm = '') {
    if (!projectListContainer || !statusMessage) return;

    if (typeof showListView === "function") showListView(); 
    const skeletonHTML = `
        <div class="service-card skeleton-active">
            <div class="skeleton-image-box"></div>
            <div class="service-card-content">
                <div class="skeleton-bar date"></div>
                <div class="skeleton-bar title"></div>
                <div class="skeleton-bar title short"></div>
                <div class="skeleton-btn-pill"></div>
            </div>
        </div>
    `;

    projectListContainer.innerHTML = Array(4).fill(skeletonHTML).join('');
    
    statusMessage.style.display = 'block';
    statusMessage.innerText = 'กำลังโหลดข้อมูล...';
    statusMessage.className = 'status loading';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const items = await response.json();
        const targetCategory = 'วิสาหกิจ';
        allProjects = items.filter(item => item.category === targetCategory); 
        
        requestAnimationFrame(() => {
            projectListContainer.innerHTML = ''; 
            renderProjects(allProjects, searchTerm);
        });
        
    } catch (error) {
        console.error('Error:', error);
        projectListContainer.innerHTML = ''; 
        statusMessage.innerText = `❌ เกิดข้อผิดพลาด: ${error.message}`;
        statusMessage.className = 'status error';
    }
}

/**
 * @param {number} index 
 */
function openModal(index) {
    if (currentGalleryImages.length === 0 || !modal || !modalImg) return;
    
    const imgData = currentGalleryImages[index];
    if (imgData) {
        modal.style.display = "block";
        modalImg.src = imgData.url; 
        captionText.innerHTML = imgData.alt || ''; 
    }
}

function closeModalHandler() {
    if (modal) {
        modal.style.display = "none";
    }
}

function setupGalleryEventListeners() {
    const mainImageWrapper = document.querySelector('#main-gallery-container .main-image-wrapper');
    if (mainImageWrapper) {
        mainImageWrapper.addEventListener('click', (e) => {
            openModal(0);
        });
    }

    const thumbnails = document.querySelectorAll("#thumbnail-grid .thumbnail-image");
    thumbnails.forEach(function(thumb) {
        const newThumb = thumb.cloneNode(true);
        thumb.parentNode.replaceChild(newThumb, thumb);

        newThumb.addEventListener('click', (e) => {
            const index = parseInt(newThumb.getAttribute('data-global-index'));
            if (!isNaN(index)) {
                openModal(index);
            }
        });
    });
}

if (closeModal) {
    closeModal.onclick = closeModalHandler;
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModalHandler();
    }
    if (!event.target.matches('.dropdown a') && !event.target.closest('.dropdown')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function handleSearchAction() {
    const isSearchActive = searchWrapper.classList.contains('active');
    const hasValue = searchInput.value.trim() !== "";

    if (!isSearchActive) {
        searchWrapper.classList.add('active');
        searchInput.focus(); 
    } else {
        if (hasValue) {
            fetchAndRenderProjects(searchInput.value);
        } else {บ
            searchWrapper.classList.remove('active');
        }
    }
}

searchToggle?.addEventListener('click', (e) => {
    e.stopPropagation(); 
    handleSearchAction();
});

searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchAndRenderProjects(searchInput.value);
    }
});

document.addEventListener('click', (e) => {
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        if (searchInput.value.trim() === "") {
            searchWrapper.classList.remove('active');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        navigation.querySelectorAll('a').forEach(link => {
             if (!link.closest('.dropdown')) { 
                 link.addEventListener('click', () => {
                     setTimeout(() => {
                         navigation.classList.remove('active');
                         menuToggle.classList.remove('active');
                     }, 100);
                 });
             }
        });
    }
    
    switchLanguage('th'); 
    fetchAndRenderProjects(); 
});