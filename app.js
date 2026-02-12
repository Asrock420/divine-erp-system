// ✅ তোমার দেওয়া লেটেস্ট ব্যাকএন্ড লিংক
const API_URL = "https://script.google.com/macros/s/AKfycbxVi7QepVy-va6AV2kXSNhVH1elrS8Z_TUgdpd8gSAnBmgSApWhpn0eClfkeZBJyRn5CA/exec";

// অ্যাপ স্টার্ট হলে লগিন চেক
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) {
        showApp(user);
    } else {
        // ইউজার না থাকলে লগিন স্ক্রিন দেখাবে
        document.getElementById("login-screen").style.display = "flex";
        document.getElementById("app-container").style.display = "none";
    }
};

// ১. মেনু রেন্ডার
function renderMenu(user) {
    const menu = document.getElementById("sidebar-menu");
    let html = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // Admin, Martech, CEO
    if(user.role === 'Martech' || user.role === 'CEO' || user.role === 'Admin') {
        html += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> All Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-check-double"></i> Approvals</li>
        `;
        if(user.role === 'Martech') document.getElementById("martech-search").style.display = 'block';
        if(user.role === 'CEO') document.getElementById("ceo-reports").style.display = 'block';
    }
    
    // 🔥 Accounts স্পেশাল মেনু
    else if(user.role === 'Accounts') {
        html += `
            <li onclick="showModal('income-modal')"><i class="fas fa-plus-circle" style="color:green;"></i> Add Income</li>
            <li onclick="showModal('expense-modal')"><i class="fas fa-minus-circle" style="color:red;"></i> Add Expense</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-money-check-alt"></i> Disbursement</li>
        `;
    }
    
    // Sales
    else if(user.role === 'Sales') {
        html += `<li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>`;
    }

    menu.innerHTML = html;
}

// ২. ড্যাশবোর্ড স্ট্যাটস
function loadStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    
    // Accounts, Admin, CEO রা রিয়েল হিসাব দেখবে
    if(['Accounts', 'Admin', 'CEO'].includes(user.role)) {
        cardsDiv.innerHTML = `<div class="card"><h3>Loading...</h3></div>`;
        
        fetch(`${API_URL}?action=getStats&role=${user.role}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                cardsDiv.innerHTML = `
                    <div class="card" style="border-top: 4px solid green;">
                        <h1 style="color:green;">৳${data.stats.income || 0}</h1><p>Total Income</p>
                    </div>
                    <div class="card" style="border-top: 4px solid red;">
                        <h1 style="color:red;">৳${data.stats.expense || 0}</h1><p>Total Expense</p>
                    </div>
                    <div class="card" style="border-top: 4px solid blue;">
                        <h1 style="color:blue;">৳${data.stats.balance || 0}</h1><p>Cash Hand</p>
                    </div>
                `;
            }
        });
    } else {
        cardsDiv.innerHTML = `
            <div class="card"><h1>0</h1><p>Today's Call</p></div>
            <div class="card"><h1>0</h1><p>Pending Leads</p></div>
        `;
    }
}

// ৩. ইনকাম/এক্সপেন্স সেভ
function saveAccountEntry(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    let amount, category, desc;

    if(type === 'Income') {
        amount = document.getElementById("inc_amount").value;
        category = document.getElementById("inc_category").value;
        desc = document.getElementById("inc_desc").value;
    } else {
        amount = document.getElementById("exp_amount").value;
        category = document.getElementById("exp_category").value;
        desc = document.getElementById("exp_desc").value;
    }

    if(!amount) return alert("Please enter amount!");

    const btn = event.target;
    btn.innerText = "Saving...";
    btn.disabled = true;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "add_transaction",
            type: type,
            amount: amount,
            category: category,
            desc: desc,
            user: user.name
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        btn.innerText = `Save ${type}`;
        btn.disabled = false;
        if(data.status === "success") {
            closeModal(`${type.toLowerCase()}-modal`);
            // ফিল্ড ক্লিয়ার
            if(type==='Income') document.getElementById("inc_amount").value = "";
            if(type==='Expense') document.getElementById("exp_amount").value = "";
            loadStats(user);
        }
    });
}

// ৪. বিল লোড ও অ্যাপ্রুভাল
function loadBills() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const div = document.getElementById("bill-list");
    div.innerHTML = "<p>Checking for pending bills...</p>";

    fetch(`${API_URL}?action=get_bills&role=${user.role}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success" && data.data.length > 0) {
            let html = `<table style="width:100%"><tr><th>Details</th><th>Amount</th><th>Status</th><th>Action</th></tr>`;
            data.data.forEach(b => {
                let btnText = "Approve";
                let btnColor = "green";
                
                if(user.role === 'Accounts') {
                    btnText = "Disburse"; // একাউন্টস টাকা দেবে
                    btnColor = "#2980b9";
                }

                html += `
                    <tr>
                        <td><b>${b.purpose}</b><br><small>By: ${b.name}</small></td>
                        <td>৳${b.amount}</td>
                        <td><small>Adm:${b.adminSt}<br>CEO:${b.ceoSt}</small></td>
                        <td>
                            <button onclick="approveBill('${b.id}', 'Approved')" style="background:${btnColor}; color:white; border:none; padding:6px 10px; border-radius:4px;">${btnText}</button>
                        </td>
                    </tr>`;
            });
            html += `</table>`;
            div.innerHTML = html;
        } else {
            div.innerHTML = "<p style='text-align:center; padding:20px; color:#7f8c8d;'>✅ No Pending Approvals!</p>";
        }
    });
}

// ৫. বিল অ্যাকশন
function approveBill(billId, status) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(!confirm(`Confirm ${status}?`)) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "approve_bill", billId: billId, role: user.role, status: status })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadBills();
    });
}

// ৬. লিড লোড
function loadLeads() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const tbody = document.querySelector("#leads-table tbody");
    if(!tbody) return;
    tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    fetch(`${API_URL}?action=get_my_leads&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        tbody.innerHTML = "";
        if(data.status === "success" && data.data.length > 0) {
            data.data.forEach(lead => {
                let actionBtn = lead.isBlocked 
                    ? `<span style="color:red">Locked 🔒</span>` 
                    : `<a href="tel:${lead.phone}" class="btn-call">📞 Call</a>`;

                tbody.innerHTML += `<tr>
                    <td><b>${lead.name}</b><br><small>${lead.source}</small></td>
                    <td>${lead.phone}</td>
                    <td>${lead.status}</td>
                    <td>${actionBtn}</td>
                </tr>`;
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='4'>No leads found.</td></tr>";
        }
    });
}

// ৭. মারটেক সার্চ
function searchLead() {
    const query = document.getElementById("search-query").value;
    const resDiv = document.getElementById("search-results");
    if(!query) return;
    resDiv.innerHTML = "Searching...";

    fetch(`${API_URL}?action=search_lead&query=${query}`)
    .then(res => res.json())
    .then(data => {
        if(data.results && data.results.length > 0) {
            let html = `<ul style="list-style:none; padding:0; margin-top:10px;">`;
            data.results.forEach(r => {
                html += `<li style="background:#f9f9f9; padding:8px; border-bottom:1px solid #ddd;">
                    <strong>${r.name}</strong> (${r.phone}) <br> Agent: <b style="color:blue">${r.agent}</b> | Status: ${r.status}
                </li>`;
            });
            html += `</ul>`;
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = "<p style='color:red'>Not Found</p>";
        }
    });
}

// ৮. লগিন ফাংশন
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    
    if(!phone || !pass) return alert("Enter info");
    btn.innerText = "Checking...";
    
    fetch(`${API_URL}?action=login&phone=${phone}&pass=${pass}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            localStorage.setItem("divineUser", JSON.stringify(data.user));
            showApp(data.user);
        } else {
            alert(data.message);
            btn.innerText = "Login";
        }
    })
    .catch(e => { alert("Connection Error"); btn.innerText = "Login"; });
}

// অ্যাপ দেখানো
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("user-role-display").innerText = `${user.name} (${user.role})`;
    renderMenu(user);
    loadStats(user);
    showSection('dashboard');
}

// সেকশন পরিবর্তন
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    if(window.innerWidth < 768) document.getElementById("sidebar").classList.remove("active");
}

// ডাটা সেভ (Lead/Bill)
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target;
    
    let payload = { user: user.name };
    if(type === 'lead') {
        payload.action = "add_lead";
        payload.name = document.getElementById("lead_name").value;
        payload.phone = document.getElementById("lead_phone").value;
        payload.source = document.getElementById("lead_source").value;
        payload.assignTo = user.name;
    } else if(type === 'bill') {
        payload.action = "submit_bill";
        payload.dept = user.role;
        payload.purpose = document.getElementById("bill_purpose").value;
        payload.amount = document.getElementById("bill_amount").value;
        payload.desc = document.getElementById("bill_desc").value;
        payload.phone = user.phone;
    }

    btn.innerText = "Saving...";
    fetch(API_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        btn.innerText = "Save";
        if(data.status==="success") {
            closeModal(`${type}-modal`);
            if(type==='lead') loadLeads();
        }
    });
}

function logout() { localStorage.removeItem("divineUser"); location.reload(); }