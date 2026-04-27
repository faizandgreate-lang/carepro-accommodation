/** 
 * Care-Pro Workers Portal - Dynamic Data Edition
 */
const SPREADSHEET_ID = "17Dvof-oD43QJWl6wkE0jRzNX7cwarabNLAYZi-lKjYE";
const searchInput = document.getElementById('iqama-search');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');

let workerData = [];

function loadData() {
    return new Promise((resolve) => {
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:handleResponse`;
        const script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);

        window.handleResponse = (response) => {
            const rows = response.table.rows;
            const cols = response.table.cols;
            
            workerData = rows.map(row => {
                const item = {};
                row.c.forEach((cell, i) => {
                    const colName = cols[i].label || `col_${i}`;
                    item[colName] = cell ? cell.v : '';
                });
                return item;
            });
            
            document.body.removeChild(script);
            resolve(workerData);
        };
    });
}

let currentLang = 'en';

const setLanguage = (lang) => {
    currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update active button
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-ar').classList.toggle('active', lang === 'ar');

    // Translate elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = translations[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = translations[lang][key];
    });
};

const renderWorkerCard = (worker) => {
    let detailsHtml = '';
    
    Object.keys(worker).forEach(key => {
        const value = worker[key];
        if (value && String(value).trim() !== "" && String(value).trim() !== "null") {
            const isSalary = key.toLowerCase().includes('salary');
            
            // Try to translate the label if it matches our dictionary
            let label = key;
            const labelKey = key.toUpperCase().replace(/\s/g, '') + 'Label';
            // Simple mapping for common fields
            const commonFields = {
                'IQAMANO': 'iqamaLabel',
                'NAME': 'nameLabel',
                'NATIONALITY': 'nationalityLabel',
                'IQAMAPROFESHION': 'professionLabel',
                'SALARY': 'salaryLabel',
                'DOB': 'dobLabel',
                'DOJ': 'dojLabel',
                'CONTACTNO': 'contactLabel'
            };
            const mappedKey = commonFields[key.toUpperCase().replace(/\s/g, '')];
            if (mappedKey) {
                label = translations[currentLang][mappedKey];
            }

            detailsHtml += `
                <div class="info-group">
                    <label>${label}</label>
                    <p class="${isSalary ? 'salary-highlight' : ''}">${value}</p>
                </div>
            `;
        }
    });

    resultsContainer.innerHTML = `
        <div class="worker-card">
            ${detailsHtml}
            <button class="gen-cv-btn" onclick="openCVModal()">
                <i class="fas fa-file-alt"></i> Generate Professional CV
            </button>
        </div>
    `;
    
    // Store current worker globally for CV logic
    window.currentWorkerData = worker;
    
    resultsContainer.classList.remove('hidden');
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
};

const handleSearch = async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    searchBtn.innerText = "Searching...";
    searchBtn.disabled = true;

    try {
        const workers = await loadData();
        
        const worker = workers.find(w => {
            // Find Iqama Number in any column that sounds like "IQAMA"
            const iqamaKey = Object.keys(w).find(k => k.toLowerCase().includes('iqama'));
            if (!iqamaKey) return false;
            
            const iqamaValue = String(w[iqamaKey] || '').replace(/\s/g, '');
            return iqamaValue === query.replace(/\s/g, '');
        });

        if (worker) {
            renderWorkerCard(worker);
        } else {
            alert("Worker not found. Please check the Iqama number.");
            resultsContainer.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Connection Error. Check your internet or sheet permissions.");
    } finally {
        searchBtn.innerText = "Search";
        searchBtn.disabled = false;
    }
};

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
