const adminTrigger = document.getElementById('admin-trigger');
const adminPanel = document.getElementById('admin-panel');
const closeAdmin = document.getElementById('close-admin');
const addWorkerBtn = document.getElementById('add-worker-btn');
const adminWorkerList = document.getElementById('admin-worker-list');

// Toggle Admin Panel with Password
adminTrigger.addEventListener('click', () => {
    const password = prompt("Enter Admin Password:");
    if (password === "vddf2jjwm3x7p27frhrt8bvht") {
        adminPanel.classList.remove('hidden');
        loadAdminWorkerList();
    } else {
        alert("Access Denied!");
    }
});

closeAdmin.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
});

const loadAdminWorkerList = async () => {
    adminWorkerList.innerHTML = '<p>Loading...</p>';
    if (typeof db !== 'undefined') {
        try {
            const snapshot = await db.collection('workers').get();
            adminWorkerList.innerHTML = '';
            snapshot.forEach(doc => {
                const worker = doc.data();
                const item = document.createElement('div');
                item.className = 'admin-worker-item';
                item.innerHTML = `
                    <span>${worker.name} (${worker.iqama})</span>
                    <button class="delete-btn" onclick="deleteWorker('${doc.id}')">Delete</button>
                `;
                adminWorkerList.appendChild(item);
            });
        } catch (error) {
            adminWorkerList.innerHTML = '<p>Firebase Error.</p>';
        }
    } else {
        adminWorkerList.innerHTML = '<p>Mock mode active.</p>';
    }
};

addWorkerBtn.addEventListener('click', async () => {
    const newWorker = {
        iqama: document.getElementById('new-iqama').value,
        name: document.getElementById('new-name').value,
        dob: document.getElementById('new-dob').value,
        contact: document.getElementById('new-contact').value,
        nationality: document.getElementById('new-nationality').value,
        doj: document.getElementById('new-doj').value,
        profession: document.getElementById('new-profession').value,
        salary: document.getElementById('new-salary').value
    };

    if (typeof db !== 'undefined') {
        await db.collection('workers').add(newWorker);
        alert("Added!");
        loadAdminWorkerList();
        document.querySelectorAll('.admin-form input').forEach(i => i.value = '');
    } else {
        alert("Mock mode: Data not saved.");
    }
});

window.deleteWorker = async (id) => {
    if (confirm("Delete?")) {
        await db.collection('workers').doc(id).delete();
        loadAdminWorkerList();
    }
};
