// ✅ তোমার ব্যাকএন্ড লিংক
const API_URL = "https://script.google.com/macros/s/AKfycbxVi7QepVy-va6AV2kXSNhVH1elrS8Z_TUgdpd8gSAnBmgSApWhpn0eClfkeZBJyRn5CA/exec";

// অ্যাপ লোড হলে চেক করবে
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) showApp(user);
};

// ১. লগিন ফাংশন (এখন কাজ করবে)
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    const msg = document.getElementById("login-msg");

    if(!phone || !pass) {
        alert("Please enter Phone & Password");
        return;
    }

    btn.innerText = "Checking...";
    btn.disabled = true;
    
    fetch(`${API_URL}?action=login&phone=${phone}&pass=${pass}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            localStorage.setItem("divineUser", JSON.stringify(data.user));
            showApp(data.user);
        } else {
            msg.innerText = "❌ " + data.message;
            msg.style.color = "red";
            btn.innerText = "Login";
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error(err);
        msg.innerText = "⚠️ Server Connection Error!";
        btn.innerText = "Login";
        btn.disabled = false;
    });
}

// ২. অ্যাপ ইন্টারফেস দেখানো
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("user-role-display").innerText = `${user.name} (${user.role})`;

    renderMenu(user);
    loadStats(user);
}

// ৩. মেনু তৈরি করা
function renderMenu(user) {
    const menu = document.getElementById("sidebar-menu");
    // ডিফল্ট ড্যাশবোর্ড মেনু
    let menuHTML = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // রোল অনুযায়ী মেনু আইটেম যোগ
    if(user.role === 'Martech' || user.role === 'CEO') {
        menuHTML += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> All Leads</li>
            <li onclick="showSection('bill-panel');"><i class="fas fa-file-invoice"></i> Bills</li>
        `;
        // সার্চ বার এবং রিপোর্ট বাটন অন করা
        if(user.role === 'Martech') {
            const searchBox = document.getElementById("martech-search");
            if(searchBox) searchBox.style.display = "block";
        }
        if(user.role === 'CEO') {
            const reportBox = document.getElementById("ceo-reports");
            if(reportBox) reportBox.style.display = "block";
        }
    }
    else if(user.role === 'Sales') {
        menuHTML += `<li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>`;
    }
    else if(user.role === 'Accounts' || user.role === 'CR') {
        menuHTML += `<li onclick="showSection('bill-panel');"><i class="fas fa-calculator"></i> Bills</li>`;
    }

    menu.innerHTML = menuHTML;
}

// ৪. পেজ বা সেকশন পরিবর্তন
function showSection(id) {
    // সব সেকশন বন্ধ
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    
    // নির্দিষ্ট সেকশন চালু
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';

    // মেনু হাইলাইট আপডেট
    /* (Optional styling update logic here) */

    // মোবাইলে মেনু বন্ধ করা
    if(window.innerWidth < 768) {
        document.getElementById("sidebar").classList.remove("active");
    }
}

// ৫. লিড লোড করা
function loadLeads() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const tbody = document.querySelector("#leads-table tbody");
    if(!tbody) return;

    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center'>Loading data...</td></tr>";

    fetch(`${API_URL}?action=get_my_leads&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        tbody.innerHTML = "";
        if(data.status === "success" && data.data.length > 0) {
            data.data.forEach(lead => {
                let statusColor = lead.status === 'New' ? 'blue' : 'black';
                let actionBtn = lead.isBlocked 
                    ? `<span style="color:red; font-weight:bold;">Locked 🔒</span>` 
                    : `<a href="tel:${lead.phone}" class="btn-call">📞 Call</a>`;

                tbody.innerHTML += `
                    <tr>
                        <td><b>${lead.name}</b><br><small>${lead.source}</small></td>
                        <td>${lead.phone}</td>
                        <td style="color:${statusColor}">${lead.status}</td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            });
        } else {
            // ভুলটা এখানেই ছিল, এখন ফিক্সড
            tbody.innerHTML = "<tr><td colspan='4' style='text-align:center'>No leads found.</td></tr>";
        }
    })
    .catch(e => {
        console.error(e);
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:red;'>Error loading data</td></tr>";
    });
}

// ৬. সার্চ ফাংশন (Martech)
function searchLead() {
    const query = document.getElementById("search-query").value;
    const resDiv = document.getElementById("search-results");
    
    if(!query) return alert("Enter name or phone");
    resDiv.innerHTML = "Searching...";

    fetch(`${API_URL}?action=search_lead&query=${query}`)
    .then(res => res.json())
    .then(data => {
        if(data.results && data.results.length > 0) {
            let html = `<ul style="list-style:none; padding:0; margin-top:10px;">`;
            data.results.forEach(r => {
                html += `<li style="background:#f9f9f9; padding:10px; margin-bottom:5px; border:1px solid #ddd;">
                    <strong>${r.name}</strong> (${r.phone}) <br> 
                    Agent: <b style="color:blue">${r.agent}</b> | Status: ${r.status}
                </li>`;
            });
            html += `</ul>`;
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = "<p style='color:red; margin-top:10px;'>No data found</p>";
        }
    });
}

// ৭. ডাটা সেভ (Lead / Bill)
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target;
    const originalText = btn.innerText;
    
    let payload = { user: user.name };

    // A. Lead Data
    if(type === 'lead') {
        payload.action = "add_lead";
        payload.name = document.getElementById("lead_name").value;
        payload.phone = document.getElementById("lead_phone").value;
        payload.source = document.getElementById("lead_source").value;
        payload.assignTo = user.name;
        
        if(!payload.name || !payload.phone) return alert("Fill all fields");
    } 
    // B. Bill Data
    else if(type === 'bill') {
        payload.action = "submit_bill";
        payload.dept = user.role;
        payload.purpose = document.getElementById("bill_purpose").value;
        payload.amount = document.getElementById("bill_amount").value;
        payload.desc = document.getElementById("bill_desc").value;
        payload.phone = user.phone; // user object must have phone
        
        if(!payload.amount) return alert("Enter amount");
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
            // Clear inputs
            if(type === 'lead') { document.getElementById("lead_name").value=""; document.getElementById("lead_phone").value=""; }
        }
    })
    .catch(err => {
        alert("Failed to save. Check connection.");
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// ৮. লগআউট
function logout() {
    localStorage.removeItem("divineUser");
    location.reload();
}

// ৯. স্ট্যাটস লোড
function loadStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    if(!cardsDiv) return;

    if(user.role === 'CEO') {
        cardsDiv.innerHTML = `
            <div class="card"><h1>50.5 Cr</h1><p>Revenue</p></div>
            <div class="card"><h1>1,250</h1><p>Leads</p></div>
            <div class="card"><h1>120</h1><p>Staff</p></div>
        `;
    } else {
        cardsDiv.innerHTML = `
            <div class="card"><h1>0</h1><p>Today's Call</p></div>
            <div class="card"><h1>0</h1><p>Pending</p></div>
        `;
    }
}