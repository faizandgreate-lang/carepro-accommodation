/** 
 * Care-Pro CV Generator - VERCEL BRIDGE EDITION
 */
const cvModal = document.getElementById('cv-modal');
const closeCvModalBtn = document.getElementById('close-cv-modal');
const finalizeCvBtn = document.getElementById('finalize-cv-btn');
const photoInput = document.getElementById('worker-photo');

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
    try {
        // Calling our secure Vercel Bridge
        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type: 'cv' })
        });
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "[SUMMARY]\nAI Bridge Connection failed. Please ensure the 'api' folder is uploaded.\n[ROLES]\n- Please retry.";
    }
};

finalizeCvBtn.addEventListener('click', async () => {
    const worker = window.currentWorkerData;
    if (!worker) return;

    finalizeCvBtn.innerText = "AI is Deep-Enhancing CV...";
    finalizeCvBtn.disabled = true;

    const prompt = `
        Executive CV Writer. 
        Create professional CV for: ${worker.NAME}
        Role: ${worker.EXPERIENCE || worker['IQAMA PROFESHION']}
        KSA Service: ${worker['YEARS EXPERINCE IN KSA']} Years
        Location: ${worker['EXPERIENCE PLACE']}
        
        Format:
        [SUMMARY]
        6 professional sentences.
        [ROLES]
        8 detailed bullet points.
    `;

    const aiContent = await askGeminiForCV(prompt);
    const summary = aiContent.split('[ROLES]')[0].replace('[SUMMARY]', '').trim();
    const roles = aiContent.split('[ROLES]')[1] || "AI roles generated.";

    const cvHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>CV - ${worker.NAME}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                :root { --primary: #0066cc; }
                body { margin: 0; background: #f1f5f9; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
                .cv-a4 { width: 210mm; min-height: 297mm; background: white; padding: 20mm; box-shadow: 0 0 30px rgba(0,0,0,0.1); color: #333; box-sizing: border-box; }
                .cv-header { display: flex; justify-content: space-between; border-bottom: 3px solid var(--primary); padding-bottom: 2rem; margin-bottom: 3rem; }
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
                <button onclick="downloadPDF()">Download PDF Document</button>
                <button onclick="window.print()" style="background:#64748b;">Print</button>
            </div>
            <div id="cv-content" class="cv-a4">
                <div class="cv-header">
                    <img src="assets/logo.png" style="height:80px;">
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
                        <div class="cv-section-title">Detailed Roles and Responsibilities</div>
                        <div class="cv-ai-content">${roles}</div>
                    </div>
                </div>
            </div>
            <script>
                function downloadPDF() {
                    html2pdf().set({ margin: 0, filename: 'CV.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 3 }, jsPDF: { format: 'a4' } }).from(document.getElementById('cv-content')).save();
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
