// ✅ তোমার নতুন ব্যাকএন্ড লিংক (Updated)
const API_URL = "https://script.google.com/macros/s/AKfycbxVi7QepVy-va6AV2kXSNhVH1elrS8Z_TUgdpd8gSAnBmgSApWhpn0eClfkeZBJyRn5CA/exec";

// অ্যাপ লোড
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) showApp(user);
};

// ১. লগিন
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    const msg = document.getElementById("login-msg");

    if(!phone || !pass) return alert("তথ্য দিন!");
    btn.innerText = "Checking...";
    
    fetch(`${API_URL}?action=login&phone=${phone}&pass=${pass}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            localStorage.setItem("divineUser", JSON.stringify(data.user));
            showApp(data.user);
        } else {
            msg.innerText = data.message;
            btn.innerText = "Login";
        }
    })
    .catch(err => { console.error(err); btn.innerText = "Login"; alert("Connection Error"); });
}

// ২. অ্যাপ ইন্টারফেস
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("user-role-display").innerText = `${user.name} (${user.role})`;

    // মেনু রেন্ডার
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;
    
    // মারটেক স্পেশাল মেনু
    if(user.role === 'Martech' || user.role === 'CEO') {
        document.getElementById("martech-search").style.display = "block"; // সার্চ বার অন
        menu.innerHTML += `<li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> All Leads</li>`;
        menu.innerHTML += `<li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-file-invoice-dollar"></i> Bills</li>`;
    } 
    // সেলসম্যান মেনু
    else if(user.role === 'Sales') {
        menu.innerHTML += `<li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>`;
    }
    // অ্যাকাউন্টস মেনু
    else if(user.role === 'Accounts') {
        menu.innerHTML += `<li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-calculator"></i> Pending Bills</li>`;
    }

    loadStats(user);
}

// ৩. সেকশন পরিবর্তন
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(window.innerWidth < 768) document.getElementById("sidebar").classList.remove("active");
}

// ৪. লিড লোড করা (পানিশমেন্ট লজিক সহ)
function loadLeads() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const tbody = document.querySelector("#leads-table tbody");
    tbody.innerHTML = "<tr><td colspan='4'>Loading Leads...</td></tr>";

    fetch(`${API_URL}?action=get_my_leads&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        tbody.innerHTML = "";
        if(data.status === "success") {
            data.data.forEach(lead => {
                // পানিশমেন্ট চেক: যদি ব্লকড হয়
                let rowClass = lead.isBlocked ? "status-blocked" : "";
                let actionBtn = lead.isBlocked 
                    ? `<i class="fas fa-lock"></i> Locked`
                    : `<a href="tel:${lead.phone}" class="btn-call">📞 Call</a>`;

                tbody.innerHTML += `
                    <tr class="${rowClass}">
                        <td>${lead.name}<br><small>${lead.source}</small></td>
                        <td>${lead.phone}</td>
                        <td>${lead.status}</td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            });
        }
    });
}

// ৫. মারটেক সার্চ (Spy Search)
function searchLead() {
    const query = document.getElementById("search-query").value;
    const resDiv = document.getElementById("search-results");
    resDiv.innerHTML = "Searching...";
    
    fetch(`${API_URL}?action=search_lead&query=${query}`)
    .then(res => res.json())
    .then(data => {
        if(data.results.length > 0) {
            let html = `<ul style="list-style:none; padding:0;">`;
            data.results.forEach(r => {
                html += `<li style="background:white; padding:10px; border-bottom:1px solid #ddd;">
                    <strong>${r.name}</strong> (${r.phone}) <br>
                    Agent: <b style="color:blue">${r.agent}</b> | Status: ${r.status}
                </li>`;
            });
            html += `</ul>`;
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = "❌ No Data Found";
        }
    });
}

// ৬. ডাটা সেভ (লিড বা বিল)
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    let payload = { user: user.name };

    if(type === 'lead') {
        payload.action = "add_lead";
        payload.name = document.getElementById("lead_name").value;
        payload.phone = document.getElementById("lead_phone").value;
        payload.source = document.getElementById("lead_source").value;
        payload.assignTo = user.name; // নিজে অ্যাড করলে নিজের নামেই থাকবে
    } 
    else if(type === 'bill') {
        payload.action = "submit_bill";
        payload.dept = user.dept;
        payload.purpose = document.getElementById("bill_purpose").value;
        payload.amount = document.getElementById("bill_amount").value;
        payload.desc = document.getElementById("bill_desc").value;
        payload.phone = user.phone;
    }

    fetch(API_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.status === "success") {
            closeModal(`${type}-modal`);
            if(type === 'lead') loadLeads();
        }
    });
}

function logout() { localStorage.removeItem("divineUser"); location.reload(); }
function loadStats(user) { /* Stats logic later */ }