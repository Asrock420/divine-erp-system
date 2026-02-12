// ✅ তোমার দেওয়া লেটেস্ট Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbxtuMzn6aAWrk1pfQF5iryh1JjUm4CLRq82JNTD3qm1Kp06V6vu6lr-hX8DzrOcisKFuQ/exec";

window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) {
        showApp(user);
        startNotificationService(user.name);
    } else {
        document.getElementById("login-screen").style.display = "flex";
    }
};

// 1. মেনু রেন্ডার (Department Wise)
function renderMenu(user) {
    const menu = document.getElementById("sidebar-menu");
    let html = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // CR Department
    if(user.role === 'CR') {
        html += `<li onclick="showSection('cr-panel'); loadCRData();"><i class="fas fa-hand-holding-usd"></i> Collection & Due</li>`;
    }
    // CEO
    else if(user.role === 'CEO') {
        document.getElementById("ceo-visuals").style.display = 'block';
        document.getElementById("add-lead-btn-wrapper").style.display = 'none'; 
        html += `<li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-file-signature"></i> Final Approvals</li>`;
    }
    // Admin (Modified Dashboard)
    else if(user.role === 'Admin') {
         html += `
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-check-double"></i> Approvals & Bills</li>
        `;
    }
    // Team Leader
    else if(user.role === 'Team Leader') {
        html += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> Team Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-tasks"></i> Requests (Team/My)</li>
        `;
    }
    // Accounts
    else if(user.role === 'Accounts') {
        html += `
            <li onclick="showModal('expense-modal')"><i class="fas fa-minus-circle" style="color:red"></i> Add Expense</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-money-bill-wave"></i> Disbursement</li>
        `;
    }
    // Sales / Martech
    else {
        html += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-paper-plane"></i> Requisitions</li>
        `;
    }
    menu.innerHTML = html;
}

// 2. CR Data Loader & Search Function
function loadCRData() {
    fetchCRData(); // Default load
}

function searchCR() {
    const query = document.getElementById("cr-search-box").value;
    fetchCRData(query); // Search query pathiye load koro
}

function fetchCRData(query = "") {
    const tbody = document.getElementById("cr-table-body");
    tbody.innerHTML = "<tr><td colspan='4'>Searching...</td></tr>";

    let url = `${API_URL}?action=get_cr_data`;
    if(query) url += `&query=${query}`;

    fetch(url)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success" && data.data.length > 0) {
            tbody.innerHTML = "";
            data.data.forEach(row => {
                // [Date, Client, Project, Amount, Type, User]
                tbody.innerHTML += `
                    <tr>
                        <td><b>${row[1]}</b><br><small>${row[2]}</small></td>
                        <td>৳${row[3]} <span class="badge">${row[4]}</span></td>
                        <td><small>${new Date(row[0]).toLocaleDateString()}</small></td>
                        <td><button class="btn-print"><i class="fas fa-receipt"></i></button></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='4'>No Data Found</td></tr>";
        }
    });
}

// 3. Stats & CEO Visuals
function loadStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    const ceoDiv = document.getElementById("project-cards");

    if(['CEO', 'Accounts', 'Admin', 'CR'].includes(user.role)) {
        cardsDiv.innerHTML = "Loading...";
        fetch(`${API_URL}?action=getStats&role=${user.role}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                if(user.role === 'CR') document.getElementById("cr-total-today").innerText = `৳${data.stats.realized}`;

                if(user.role === 'Admin') {
                     cardsDiv.innerHTML = `
                        <div class="card" style="border-top:4px solid purple"><h1>My Bills</h1><p>Check Status</p></div>
                     `;
                } else {
                     cardsDiv.innerHTML = `
                        <div class="card" style="border-top:4px solid green"><h1>৳${data.stats.realized || 0}</h1><p>Total Realized</p></div>
                        <div class="card" style="border-top:4px solid red"><h1>৳${data.stats.expense || 0}</h1><p>Total Expense</p></div>
                        <div class="card" style="border-top:4px solid blue"><h1>৳${data.stats.cashHand || 0}</h1><p>Cash in Hand</p></div>
                    `;
                }
                
                // CEO Visuals: Lead Counts
                if(user.role === 'CEO' && data.stats.leadVisuals) {
                    let pData = data.stats.leadVisuals;
                    ceoDiv.innerHTML = "";
                    for (let [key, val] of Object.entries(pData)) {
                        ceoDiv.innerHTML += `
                            <div class="card" style="min-width:140px; margin-bottom:10px;">
                                <h5 style="margin:5px 0">${key}</h5>
                                <h2 style="color:#2c3e50; margin:5px 0;">${val}</h2>
                                <small style="color:blue">Interested Leads</small>
                            </div>
                        `;
                    }
                }
            }
        });
    }
}

// 4. বিল লোড (Admin Self Bill + Rejection Logic)
function loadBills() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const div = document.getElementById("bill-list");
    div.innerHTML = "<p>Checking records...</p>";

    if(user.role === 'Admin') document.getElementById("bill-title").innerText = "Approvals & My Bills";
    if(user.role === 'CEO') document.getElementById("create-bill-btn").style.display = 'none';

    fetch(`${API_URL}?action=get_bills&role=${user.role}&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success" && data.data.length > 0) {
            let html = `<table style="width:100%"><tr><th>Requisition</th><th>Amount</th><th>Status</th><th>Action</th></tr>`;
            
            data.data.forEach(b => {
                let actionBtn = "";
                let isMyBill = (b.name === user.name);

                if(user.role === 'Accounts') {
                    actionBtn = `
                        <button onclick="approveBill('${b.id}', 'Paid')" class="btn-approve">Disburse</button>
                        <button onclick="printBill('${b.id}', '${b.name}', '${b.amount}')" class="btn-print"><i class="fas fa-print"></i></button>
                    `;
                } 
                else if(user.role === 'Team Leader') {
                    if(isMyBill) actionBtn = `<span class="badge" style="background:#95a5a6">My Request</span>`;
                    else {
                        actionBtn = `
                        <button onclick="approveBill('${b.id}', 'Approved')" class="btn-approve">Approve</button>
                        <button onclick="approveBill('${b.id}', 'Rejected')" class="btn-approve" style="background:red;margin-left:5px;">Reject</button>`;
                    }
                }
                else if(user.role === 'Admin') {
                    // Admin: অন্যের বিল Approve করবে, নিজের বিলের স্ট্যাটাস দেখবে
                    if(isMyBill) actionBtn = `<span class="badge" style="background:#9b59b6">My Request</span> <br> <small>CEO: ${b.ceoSt}</small>`;
                    else {
                        actionBtn = `
                        <button onclick="approveBill('${b.id}', 'Approved')" class="btn-approve">Approve</button>
                        <button onclick="approveBill('${b.id}', 'Rejected')" class="btn-approve" style="background:red;margin-left:5px;">Reject</button>`;
                    }
                }
                else if(user.role === 'CEO') {
                    actionBtn = `
                    <button onclick="approveBill('${b.id}', 'Approved')" class="btn-approve">Approve</button>
                    <button onclick="approveBill('${b.id}', 'Rejected')" class="btn-approve" style="background:red;margin-left:5px;">Reject</button>`;
                }
                else {
                    actionBtn = `<span class="badge">${b.tlStatus !== 'N/A' ? b.tlStatus : b.adminSt}</span>`;
                }

                html += `<tr>
                    <td onclick="alert('Details: ${b.purpose}')" style="cursor:pointer">
                        <b>${b.purpose}</b><br><small>${b.name} | ${b.date}</small>
                    </td>
                    <td>৳${b.amount}</td>
                    <td><small>Adm:${b.adminSt}<br>CEO:${b.ceoSt}</small></td>
                    <td>${actionBtn}</td>
                </tr>`;
            });
            html += `</table>`;
            div.innerHTML = html;
        } else {
            div.innerHTML = "<p style='text-align:center; padding:20px; color:#7f8c8d;'>✅ No Pending Tasks</p>";
        }
    });
}

// 5. সেভ ডাটা
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target;
    let payload = { user: user.name, role: user.role, phone: user.phone };

    if(type === 'cr') {
        payload.action = "add_collection";
        payload.client = document.getElementById("cr_client").value;
        payload.project = document.getElementById("cr_project").value;
        payload.amount = document.getElementById("cr_amount").value;
        payload.payType = document.getElementById("cr_type").value;
    } 
    else if(type === 'bill') {
        payload.action = "submit_bill";
        payload.dept = user.role;
        payload.purpose = document.getElementById("bill_purpose").value;
        payload.amount = document.getElementById("bill_amount").value;
        payload.desc = document.getElementById("bill_desc").value;
    }
    else if(type === 'lead') {
        payload.action = "add_lead";
        payload.name = document.getElementById("lead_name").value;
        payload.phone = document.getElementById("lead_phone").value;
        payload.project = document.getElementById("lead_project").value; 
        payload.assignTo = user.name;
    }
    else if(type === 'expense') {
        payload.action = "add_transaction";
        payload.type = "Expense";
        payload.category = "General";
        payload.amount = document.getElementById("exp_amount").value;
        payload.desc = document.getElementById("exp_desc").value;
    }

    btn.innerText = "Saving...";
    btn.disabled = true;

    fetch(API_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        btn.innerText = "Save";
        btn.disabled = false;
        if(data.status==="success") {
            closeModal(`${type}-modal`);
            if(type==='cr') loadCRData();
            if(type==='bill') loadBills();
        }
    });
}

function printBill(id, name, amount) {
    const win = window.open('', '', 'width=600,height=500');
    win.document.write(`<div style="text-align:center; border:3px solid #333; padding:40px;"><h2>👑 Divine Group</h2><p>PAYMENT VOUCHER</p><hr><p>ID: ${id}</p><p>Paid To: ${name}</p><h1>৳${amount}</h1><p>Status: PAID</p></div><script>window.print();</script>`);
}

function startNotificationService(name) { setInterval(() => { fetch(`${API_URL}?action=check_notifications&user=${name}`).then(r=>r.json()).then(d=>{ if(d.msgs) d.msgs.forEach(m=>showToast(m)) }) }, 10000); }
function showToast(msg) { const t=document.createElement("div"); t.className="toast-msg"; t.innerHTML=`<i class="fas fa-bell"></i> ${msg}`; document.body.appendChild(t); setTimeout(()=>t.remove(), 6000); }
function handleLogin() { const p=document.getElementById("phone").value; const pw=document.getElementById("password").value; const btn=document.getElementById("loginBtn"); btn.innerText="Checking..."; fetch(`${API_URL}?action=login&phone=${p}&pass=${pw}`).then(r=>r.json()).then(d=>{ if(d.status==="success") { localStorage.setItem("divineUser", JSON.stringify(d.user)); showApp(d.user); startNotificationService(d.user.name); } else { alert(d.message); btn.innerText="Login"; } }); }
function showApp(u) { document.getElementById("login-screen").style.display="none"; document.getElementById("app-container").style.display="flex"; renderMenu(u); loadStats(u); showSection('dashboard'); }
function showSection(id) { document.querySelectorAll('.section').forEach(d=>d.style.display='none'); document.getElementById(id).style.display='block'; if(window.innerWidth<768) document.getElementById("sidebar").classList.remove("active"); }
function approveBill(id, st) { fetch(API_URL, {method:"POST", body:JSON.stringify({action:"approve_bill", billId:id, role:JSON.parse(localStorage.getItem("divineUser")).role, status:st})}).then(r=>r.json()).then(d=>{alert(d.message); loadBills();}); }
function logout() { localStorage.removeItem("divineUser"); location.reload(); }
function loadLeads() {} function closeModal(id) { document.getElementById(id).style.display="none"; } function showModal(id) { document.getElementById(id).style.display="block"; }