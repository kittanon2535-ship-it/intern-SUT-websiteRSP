let personnelData = null; 
let isDataLoaded = false; 

const headers = [
    "ลำดับ", 
    "ชื่อ สกุล", 
    "ตำแหน่ง", 
    "รหัสพนักงาน", 
    "วันเดือนปีเกิด", 
    "เลขที่บัตรปชช.", 
    "อีเมล์ SUT", 
    "เบอร์โต๊ะ", 
    "Name", 
    "Surename",
    "รหัสพนักงาน_ซ้ำ"
];

async function loadData() {
    if (isDataLoaded) return; 

    try {
        const response = await fetch('../data/RSPDATA22.csv'); 
        if (!response.ok) {
             return null; 
        }
        
        const csvText = await response.text(); 
        personnelData = parseCSV(csvText); 
        isDataLoaded = true;
        console.log("โหลดและประมวลผลข้อมูลบุคลากรสำเร็จ:", personnelData.length, "รายการ");
        
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล (Background):", error);
        return null;
    }
}

function parseCSV(csv) {
    const lines = csv.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        let values = lines[i].split(','); 
        if (values.length < headers.length) {
            if (values[0].trim().length > 0 && values.length <= 2) {
                continue;
            }
        }
        
        if (values[0].trim().length === 0 || values[1].trim().length === 0) {
            continue;
        }

        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = (values[j] || '').trim(); 
        }
        data.push(obj);
    }
    return data;
}

async function searchPersonnel() {
    const container = document.getElementById('resultsContainer');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim(); 
    if (searchTerm.length === 0) {
        displayResults(null, false, false); 
        return;
    }
    container.innerHTML = '<p>กำลังประมวลผล...</p>';

    if (!isDataLoaded) {    
        await loadData();
    }

    if (personnelData === null || !isDataLoaded) {
        container.innerHTML = '<p style="color: red;">ไม่สามารถโหลดข้อมูลบุคลากรได้ กรุณาตรวจสอบว่ามีไฟล์ <b style="font-weight: bold;">RSPDATA2.csv</b> อยู่ในโฟลเดอร์เดียวกันหรือไม่ หรือมีปัญหาในการอ่านไฟล์</p>';
        return;
    }

    const results = personnelData.filter(person => {
        const searchableText = `${person['ชื่อ สกุล']} ${person['ตำแหน่ง']} ${person['อีเมล์ SUT']} ${person['เบอร์โต๊ะ']} ${person['Name']} ${person['Surename']} ${person['รหัสพนักงาน']}`.toLowerCase();
        return searchableText.includes(searchTerm);
    });

    displayResults(results, true); 
}

function displayResults(results, isSearch = false, isInitial = false) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; 

    const searchTerm = document.getElementById('searchInput').value;

    if (!isSearch) {
        container.innerHTML = `<p>กรุณากรอกคำค้นในช่องด้านบน (ชื่อ-สกุล, ตำแหน่ง, อีเมล, โทรศัพท์ หรือรหัสพนักงาน) เพื่อเริ่มต้นค้นหาข้อมูลบุคลากร</p>`;
        return;
    }

    if (results.length === 0) {
        container.innerHTML = `<p>ไม่พบข้อมูลบุคลากรที่ตรงกับคำค้น <b style="color: #6fbef7;">"${searchTerm}"</b></p>`;
        return;
    }
    
    const resultHeader = document.createElement('p');
    resultHeader.style.marginBottom = '15px';
    resultHeader.innerHTML = `พบข้อมูลบุคลากร <b style="font-weight: bold;">${results.length}</b> รายการ`;
    container.appendChild(resultHeader);

    results.forEach(person => {
        const card = document.createElement('div');
        card.className = 'person-card';
        
        const phone = person['เบอร์โต๊ะ'] || ' - ';
        const email = person['อีเมล์ SUT'] || ' - ';
        const employeeId = person['รหัสพนักงาน'] || ' - ';

        card.innerHTML = `
            <div class="card-info">
                <strong>${person['ชื่อ สกุล']}</strong> 
                <span>ตำแหน่ง: ${person['ตำแหน่ง']}</span>
                <span>รหัสพนักงาน: ${employeeId}</span>
            </div>
            <div class="card-contact">
                <span class="contact-phone"><i class="fas fa-phone-alt"></i> ${phone}</span>
                <span class="contact-email"><i class="fas fa-envelope"></i> ${email}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadData(); 
    displayResults(null, false, true); 
    
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    if (searchButton) {
        searchButton.addEventListener('click', searchPersonnel);
    }
    
    if (searchInput) {
        // 1. ตรวจจับการกด Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPersonnel();
            }
        });
        searchInput.addEventListener('input', () => {
            searchPersonnel(); 
        });
    }
});

const langTH = document.getElementById('langTH');
const langEN = document.getElementById('langEN');

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

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
});