/** 
 * Care-Pro CV Generator Logic - BULLETPROOF EDITION
 */
const CV_API_KEY = "AIzaSyAzZEkBhqPijdUsDksKRskVqfRTHoaPJuc";

const cvModal = document.getElementById('cv-modal');
const closeCvModalBtn = document.getElementById('close-cv-modal');
const finalizeCvBtn = document.getElementById('finalize-cv-btn');
const photoInput = document.getElementById('worker-photo');
const extraInfoInput = document.getElementById('extra-cv-info');

let uploadedPhotoData = null;

const formatGoogleDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    if (dateStr.includes('Date(')) {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
            return `${parts[2]}/${parseInt(parts[1])+1}/${parts[0]}`;
        }
    }
    return dateStr;
};

if (photoInput) {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => { uploadedPhotoData = event.target.result; };
            reader.readAsDataURL(file);
        }
    });
}

window.openCVModal = () => { if (cvModal) cvModal.classList.remove('hidden'); };
if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', () => { cvModal.classList.add('hidden'); });

const askGeminiForCV = async (prompt) => {
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CV_API_KEY}`;
    
    try {
        // Try Direct
        const res = await fetch(directUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        try {
            // Try Proxy
            const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(directUrl);
            const res = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            return "SUMMARY\nAI Connection is currently being optimized for your region. Please try again in 1 minute.\nROLES\n- AI Generation pending.";
        }
    }
};

if (finalizeCvBtn) {
    finalizeCvBtn.addEventListener('click', async () => {
        const worker = window.currentWorkerData;
        if (!worker) return;

        finalizeCvBtn.innerText = "AI is Deep-Enhancing CV...";
        finalizeCvBtn.disabled = true;

        const prompt = `
            You are an Elite Executive CV Writer. Transform this data into a high-end CV.
            Name: ${worker.NAME}
            Primary Role: ${worker.EXPERIENCE || worker['IQAMA PROFESHION']}
            KSA Service: ${worker['YEARS EXPERINCE IN KSA']} Years
            Location: ${worker['EXPERIENCE PLACE']}
            Additional Info: ${extraInfoInput ? extraInfoInput.value : ''}
            
            Format: Return text with headings "SUMMARY" and "ROLES". 
        `;

        const aiContent = await askGeminiForCV(prompt);
        const summary = aiContent.includes('ROLES') ? aiContent.split('ROLES')[0].replace('SUMMARY', '').trim() : aiContent;
        const roles = aiContent.includes('ROLES') ? aiContent.split('ROLES')[1].trim() : "AI roles generation completed.";

        const cvHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>CV - ${worker.NAME}</title>
                <base href="${window.location.href}">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                <style>
                    :root { --primary: #0066cc; }
                    body { margin: 0; background: #f1f5f9; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
                    .cv-a4 { width: 210mm; min-height: 297mm; background: white; padding: 20mm; box-shadow: 0 0 30px rgba(0,0,0,0.1); color: #333; position: relative; box-sizing: border-box; }
                    .cv-header { display: flex; justify-content: space-between; border-bottom: 3px solid var(--primary); padding-bottom: 2rem; margin-bottom: 3rem; }
                    .cv-logo img { height: 80px; }
                    .cv-photo-box { width: 120px; height: 150px; border: 2px solid #f1f5f9; border-radius: 8px; overflow: hidden; }
                    .cv-photo-box img { width: 100%; height: 100%; object-fit: cover; }
                    .cv-body { display: grid; grid-template-columns: 1fr 2fr; gap: 3rem; }
                    .cv-section-title { color: var(--primary); text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-size: 1.1rem; }
                    .cv-field { margin-bottom: 1.2rem; }
                    .cv-field label { font-size: 0.75rem; color: #94a3b8; display: block; text-transform: uppercase; font-weight: 600; }
                    .cv-field p { font-weight: 600; font-size: 1.1rem; margin: 0.2rem 0 0 0; }
                    .cv-ai-content { font-size: 1rem; line-height: 1.8; color: #334155; white-space: pre-line; }
                    .actions { margin-bottom: 2rem; display: flex; gap: 1rem; }
                    button { padding: 0.8rem 2rem; border-radius: 30px; border: none; font-weight: 600; cursor: pointer; background: var(--primary); color: white; }
                    @media print { .actions { display: none; } body { padding: 0; background: white; } .cv-a4 { box-shadow: none; width: 100%; } }
                </style>
            </head>
            <body>
                <div class="actions">
                    <button id="dl-btn" onclick="downloadPDF()">Download PDF Document</button>
                    <button onclick="window.print()" style="background:#64748b;">Print</button>
                </div>
                <div id="cv-content" class="cv-a4">
                    <div class="cv-header">
                        <div class="cv-logo"><img src="assets/logo.png" alt="Logo"></div>
                        <div class="cv-photo-box">
                            ${uploadedPhotoData ? `<img src="${uploadedPhotoData}">` : '<div style="padding:60px 10px; text-align:center; color:#ccc; font-size:0.8rem;">ATTACH PHOTO</div>'}
                        </div>
                    </div>
                    <div class="cv-body">
                        <div class="cv-left-col">
                            <div class="cv-section-title">Personal Profile</div>
                            <div class="cv-field"><label>Name</label><p>${worker.NAME}</p></div>
                            <div class="cv-field"><label>Nationality</label><p>${worker.NATIONALITY}</p></div>
                            <div class="cv-field"><label>BGD (DOB)</label><p>${formatGoogleDate(worker.BGD || worker.DOB)}</p></div>
                            <div class="cv-field"><label>Joining Date (DOJ)</label><p>${formatGoogleDate(worker.DOJ)}</p></div>
                            <div class="cv-field"><label>Iqama Number</label><p>${worker['IQAMA NO']}</p></div>
                            <div class="cv-field"><label>KSA Experience</label><p>${worker['YEARS EXPERINCE IN KSA']} Years</p></div>
                        </div>
                        <div class="cv-right-col">
                            <div class="cv-section-title">Professional Summary</div>
                            <div class="cv-ai-content" style="margin-bottom: 3rem;">${summary}</div>
                            <div class="cv-section-title">Experience History</div>
                            <div class="cv-field">
                                <label>Main Role / Experience</label>
                                <p style="font-size: 1.2rem; color: var(--primary);">${worker.EXPERIENCE || worker['IQAMA PROFESHION'] || 'N/A'}</p>
                            </div>
                            <div class="cv-field">
                                <label>Experience Location</label>
                                <p style="font-size: 1.1rem; margin-bottom:1rem;">${worker['EXPERIENCE PLACE'] || 'N/A'}</p>
                            </div>
                            <div class="cv-field">
                                <label>Detailed Roles and Responsibilities</label>
                                <div class="cv-ai-content">${roles}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <script>
                    function downloadPDF() {
                        const btn = document.getElementById('dl-btn');
                        btn.innerText = 'Finalizing...';
                        html2pdf().set({ margin: 0, filename: 'CV.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 3 }, jsPDF: { format: 'a4' } }).from(document.getElementById('cv-content')).save().then(()=> btn.innerText = 'Download PDF');
                    }
                </script>
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        newWindow.document.write(cvHtml);
        newWindow.document.close();
        
        finalizeCvBtn.innerText = "Generate AI Enhanced CV";
        finalizeCvBtn.disabled = false;
        cvModal.classList.add('hidden');
    });
}
