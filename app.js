// ✅ তোমার দেওয়া নতুন লিংক (Updated)
const API_URL = "https://script.google.com/macros/s/AKfycbxtuMzn6aAWrk1pfQF5iryh1JjUm4CLRq82JNTD3qm1Kp06V6vu6lr-hX8DzrOcisKFuQ/exec";

// অ্যাপ স্টার্ট
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) {
        showApp(user);
        startNotificationService(user.name); // নোটিফিকেশন সার্ভিস চালু
    } else {
        document.getElementById("login-screen").style.display = "flex";
    }
};

// ১. মেনু রেন্ডার (রোল অনুযায়ী)
function renderMenu(user) {
    const menu = document.getElementById("sidebar-menu");
    let html = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // CR Department
    if(user.role === 'CR') {
        html += `<li onclick="showSection('cr-panel'); loadStats(user);"><i class="fas fa-hand-holding-usd"></i> Collection & Due</li>`;
    }
    // CEO (ভিজুয়াল রিপোর্ট দেখবে)
    else if(user.role === 'CEO') {
        document.getElementById("ceo-visuals").style.display = 'block';
        document.getElementById("add-lead-btn-wrapper").style.display = 'none'; // CEO লিড অ্যাড করবে না
        html += `<li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-file-signature"></i> Final Approvals</li>`;
    }
    // Team Leader (টিম রিকোয়েস্ট দেখবে)
    else if(user.role === 'Team Leader') {
        html += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> Team Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-tasks"></i> Team Requests</li>
        `;
    }
    // Accounts (টাকা দিবে ও প্রিন্ট করবে)
    else if(user.role === 'Accounts') {
        html += `
            <li onclick="showModal('expense-modal')"><i class="fas fa-minus-circle" style="color:red"></i> Add Expense</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-money-bill-wave"></i> Disbursement</li>
        `;
    }
    // Admin / Martech
    else if(user.role === 'Admin' || user.role === 'Martech') {
        html += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> All Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-check-double"></i> Approvals</li>
        `;
    }
    // Sales Staff
    else {
        html += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-paper-plane"></i> Requisitions</li>
        `;
    }

    menu.innerHTML = html;
}

// ২. ড্যাশবোর্ড স্ট্যাটস (CR & CEO Visuals)
function loadStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    const ceoDiv = document.getElementById("project-cards");

    // শুধু যারা হিসাব দেখবে
    if(['CEO', 'Accounts', 'Admin', 'CR'].includes(user.role)) {
        cardsDiv.innerHTML = "Loading Data...";
        
        fetch(`${API_URL}?action=getStats&role=${user.role}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                // CR Panel Update
                if(user.role === 'CR') {
                     document.getElementById("cr-total-today").innerText = `৳${data.stats.realized}`;
                     // Due calculation logic can be added later
                }

                // Main Cards (CEO/Admin/Accounts)
                cardsDiv.innerHTML = `
                    <div class="card" style="border-top:4px solid green"><h1>৳${data.stats.realized || 0}</h1><p>Total Realized (CR)</p></div>
                    <div class="card" style="border-top:4px solid red"><h1>৳${data.stats.expense || 0}</h1><p>Total Expense</p></div>
                    <div class="card" style="border-top:4px solid blue"><h1>৳${data.stats.cashHand || 0}</h1><p>Cash in Hand</p></div>
                `;
                
                // CEO Project Visuals
                if(user.role === 'CEO' && data.stats.projectData) {
                    let pData = data.stats.projectData;
                    ceoDiv.innerHTML = "";
                    for (let [key, val] of Object.entries(pData)) {
                        ceoDiv.innerHTML += `
                            <div class="card" style="min-width:140px; margin-bottom:10px;">
                                <h5 style="margin:5px 0">${key}</h5>
                                <h2 style="color:#2c3e50; margin:5px 0;">৳${val}</h2>
                                <small style="color:green">Collected</small>
                            </div>
                        `;
                    }
                }
            }
        });
    }
}

// ৩. বিল লোড (Hierarchy & Print)
function loadBills() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const div = document.getElementById("bill-list");
    div.innerHTML = "<p>Checking records...</p>";

    // টাইটেল আপডেট
    if(user.role === 'Team Leader') document.getElementById("bill-title").innerText = "Team Requisitions";
    if(user.role === 'Accounts') document.getElementById("bill-title").innerText = "Ready for Disbursement";

    fetch(`${API_URL}?action=get_bills&role=${user.role}&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success" && data.data.length > 0) {
            let html = `<table style="width:100%"><tr><th>Requisition Info</th><th>Amount</th><th>Status</th><th>Action</th></tr>`;
            
            data.data.forEach(b => {
                let actionBtn = "";
                
                // Accounts: Disburse & Print
                if(user.role === 'Accounts') {
                    actionBtn = `
                        <button onclick="approveBill('${b.id}', 'Paid')" class="btn-approve">Disburse</button>
                        <button onclick="printBill('${b.id}', '${b.name}', '${b.amount}')" class="btn-print"><i class="fas fa-print"></i></button>
                    `;
                } 
                // Sales: শুধু স্ট্যাটাস দেখবে
                else if(user.role === 'Sales') {
                    actionBtn = `<span class="badge">${b.tlStatus !== 'N/A' ? b.tlStatus : b.adminSt}</span>`;
                }
                // TL & Admin & CEO: Approve Button
                else {
                    actionBtn = `<button onclick="approveBill('${b.id}', 'Approved')" class="btn-approve">Approve</button>`;
                }

                html += `<tr>
                    <td onclick="alert('Details: ${b.purpose}')" style="cursor:pointer">
                        <b>${b.purpose}</b><br><small>By: ${b.name}</small>
                    </td>
                    <td>৳${b.amount}</td>
                    <td><small>TL: ${b.tlStatus}<br>Adm: ${b.adminSt}<br>CEO: ${b.ceoSt}</small></td>
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

// ৪. ডাটা সেভ (CR, Bill, Expense)
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target;
    let payload = { user: user.name, role: user.role, phone: user.phone }; // Phone added

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
            if(type==='cr') loadStats(user); // CR আপডেট
            if(type==='bill') loadBills();   // বিল আপডেট
        }
    });
}

// প্রিন্ট ফাংশন (ভাউচার)
function printBill(id, name, amount) {
    const win = window.open('', '', 'width=600,height=500');
    win.document.write(`
        <div style="text-align:center; font-family:sans-serif; border:3px solid #333; padding:40px; margin:20px;">
            <h2>👑 Divine Group of Companies</h2>
            <p><strong>PAYMENT VOUCHER</strong></p>
            <hr>
            <div style="text-align:left; margin-top:30px;">
                <p><strong>Voucher ID:</strong> ${id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Paid To:</strong> ${name}</p>
                <p><strong>Amount:</strong> <span style="font-size:24px; font-weight:bold;">৳${amount}</span></p>
                <p><strong>Method:</strong> Cash Disbursement</p>
            </div>
            <br><br><br><br>
            <div style="display:flex; justify-content:space-between;">
                <p>___________________<br>Receiver Signature</p>
                <p>___________________<br>Accounts Signature</p>
            </div>
        </div>
        <script>window.print();</script>
    `);
}

// নোটিফিকেশন পোলিং
function startNotificationService(name) {
    setInterval(() => {
        fetch(`${API_URL}?action=check_notifications&user=${name}`)
        .then(r=>r.json())
        .then(d=>{ if(d.msgs) d.msgs.forEach(m=>showToast(m)) })
    }, 10000);
}
function showToast(msg) {
    const t=document.createElement("div"); 
    t.className="toast-msg"; 
    t.innerHTML=`<i class="fas fa-bell"></i> ${msg}`; 
    document.body.appendChild(t); 
    setTimeout(()=>t.remove(), 6000);
}

// হেল্পার ফাংশন
function handleLogin() {
    const p=document.getElementById("phone").value; 
    const pw=document.getElementById("password").value;
    const btn=document.getElementById("loginBtn");
    
    btn.innerText = "Checking...";
    fetch(`${API_URL}?action=login&phone=${p}&pass=${pw}`)
    .then(r=>r.json())
    .then(d=>{
        if(d.status==="success") { 
            localStorage.setItem("divineUser", JSON.stringify(d.user)); 
            showApp(d.user); 
            startNotificationService(d.user.name); 
        } else { 
            alert(d.message); 
            btn.innerText = "Login"; 
        }
    });
}
function showApp(u) { document.getElementById("login-screen").style.display="none"; document.getElementById("app-container").style.display="flex"; renderMenu(u); loadStats(u); showSection('dashboard'); }
function showSection(id) { document.querySelectorAll('.section').forEach(d=>d.style.display='none'); document.getElementById(id).style.display='block'; if(window.innerWidth<768) document.getElementById("sidebar").classList.remove("active"); }
function approveBill(id, st) { fetch(API_URL, {method:"POST", body:JSON.stringify({action:"approve_bill", billId:id, role:JSON.parse(localStorage.getItem("divineUser")).role, status:st})}).then(r=>r.json()).then(d=>{alert(d.message); loadBills();}); }
function logout() { localStorage.removeItem("divineUser"); location.reload(); }
function loadLeads() {} // Placeholder