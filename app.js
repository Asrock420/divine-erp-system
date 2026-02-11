// ✅ তোমার ব্যাকএন্ড লিংক
const API_URL = "https://script.google.com/macros/s/AKfycbxVi7QepVy-va6AV2kXSNhVH1elrS8Z_TUgdpd8gSAnBmgSApWhpn0eClfkeZBJyRn5CA/exec";

// অ্যাপ স্টার্ট
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) showApp(user);
};

// ১. লগিন
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");

    if(!phone || !pass) return alert("Please enter Phone & Password");
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
    .catch(err => {
        console.error(err);
        alert("Server Error! Check Internet.");
        btn.innerText = "Login";
    });
}

// ২. মেইন অ্যাপ শো
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("user-role-display").innerText = `${user.name} (${user.role})`;

    renderMenu(user);
    loadStats(user);
}

// ৩. মেনু সাজানো (রোল অনুযায়ী)
function renderMenu(user) {
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // Martech & CEO
    if(user.role === 'Martech' || user.role === 'CEO') {
        if(user.role === 'Martech') document.getElementById("martech-search").style.display = "block";
        if(user.role === 'CEO') document.getElementById("ceo-reports").style.display = "block";
        
        menu.innerHTML += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> All Leads</li>
            <li onclick="showSection('bill-panel');"><i class="fas fa-file-invoice"></i> Bills</li>
        `;
    }
    // Sales
    else if(user.role === 'Sales') {
        menu.innerHTML += `<li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>`;
    }
    // Accounts
    else if(user.role === 'Accounts' || user.role === 'CR') {
        menu.innerHTML += `<li onclick="showSection('bill-panel');"><i class="fas fa-calculator"></i> Bills</li>`;
    }
}

// ৪. পেজ বদলানো
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // মোবাইলে সাইডবার বন্ধ করা
    if(window.innerWidth < 768) {
        document.getElementById("sidebar").classList.remove("active");
    }
}

// ৫. লিড লোড করা
function loadLeads() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const tbody = document.querySelector("#leads-table tbody");
    tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    fetch(`${API_URL}?action=get_my_leads&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        tbody.innerHTML = "";
        if(data.status === "success" && data.data.length > 0) {
            data.data.forEach(lead => {
                let statusColor = lead.status === 'New' ? 'blue' : 'black';
                let actionBtn = lead.isBlocked 
                    ? `<span style="color:red">Locked</span>` 
                    : `<a href="tel:${lead.phone}" class="btn-call">Call</a>`;

                tbody.innerHTML += `
                    <tr>
                        <td>${lead.name}<br><small>${lead.source}</small></td>
                        <td>${lead.phone}</td>
                        <td style="color:${statusColor}">${lead.status}</td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='4'>No leads found.</td></tr>";
        }
    });
}

// ৬. সার্চ (Martech)
function searchLead() {
    const query = document.getElementById("search-query").value;
    const resDiv = document.getElementById("search-results");
    resDiv.innerHTML = "Searching...";
    
    fetch(`${API_URL}?action=search_lead&query=${query}`)
    .then(res => res.json())
    .then(data => {
        if(data.results.length > 0) {
            let html = `<ul style="list-style:none; padding:0; margin-top:10px;">`;
            data.results.forEach(r => {
                html += `<li style="background:#f9f9f9; padding:10px; margin-bottom:5px; border:1px solid #ddd;">
                    <strong>${r.name}</strong> (${r.phone}) <br> Agent: <b>${r.agent}</b> | Status: ${r.status}
                </li>`;
            });
            html += `</ul>`;
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = "<p style='color:red'>Not Found</p>";
        }
    });
}

// ৭. ডাটা সেভ
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target;
    const originalText = btn.innerText;
    
    let payload = { user: user.name };

    if(type === 'lead') {
        payload.action = "add_lead";
        payload.name = document.getElementById("lead_name").value;
        payload.phone = document.getElementById("lead_phone").value;
        payload.source = document.getElementById("lead_source").value;
        payload.assignTo = user.name;
    } 
    else if(type === 'bill') {
        payload.action = "submit_bill";
        payload.dept = user.role;
        payload.purpose = document.getElementById("bill_purpose").value;
        payload.amount = document.getElementById("bill_amount").value;
        payload.desc = document.getElementById("bill_desc").value;
        payload.phone = user.phone;
    }

    btn.innerText = "Saving...";
    btn.disabled = true;

    fetch(API_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        btn.innerText = originalText;
        btn.disabled = false;
        if(data.status === "success") {
            document.getElementById(`${type}-modal`).style.display = "none";
            if(type === 'lead') loadLeads();
        }
    });
}

// ৮. লগআউট
function logout() { localStorage.removeItem("divineUser"); location.reload(); }

// ৯. স্ট্যাটস (সিম্পল)
function loadStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    if(user.role === 'CEO') {
        cardsDiv.innerHTML = `
            <div class="card"><h1>50.5 Cr</h1><p>Revenue</p></div>
            <div class="card"><h1>1,250</h1><p>Total Leads</p></div>
            <div class="card"><h1>120</h1><p>Staff</p></div>
        `;
    } else {
        cardsDiv.innerHTML = `
            <div class="card"><h1>0</h1><p>Today's Call</p></div>
            <div class="card"><h1>0</h1><p>Pending Leads</p></div>
        `;
    }
}