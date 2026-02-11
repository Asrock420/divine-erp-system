// ✅ তোমার ব্যাকএন্ড লিংক (Super Backend v4)
const API_URL = "https://script.google.com/macros/s/AKfycbxVi7QepVy-va6AV2kXSNhVH1elrS8Z_TUgdpd8gSAnBmgSApWhpn0eClfkeZBJyRn5CA/exec";

// অ্যাপ লোড
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) showApp(user);
};

// ১. লগিন সিস্টেম
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");

    if(!phone || !pass) return alert("Please enter Phone & Password");
    
    btn.innerText = "Verifying...";
    
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
        alert("Server Error! Check internet connection.");
        btn.innerText = "Login";
    });
}

// ২. মেইন অ্যাপ ডিসপ্লে
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("user-role-display").innerText = `${user.name} (${user.role})`;

    renderMenu(user);
    loadStats(user);
}

// ৩. ডাইনামিক মেনু (রোল অনুযায়ী)
function renderMenu(user) {
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // A. মারটেক / সিইও
    if(user.role === 'Martech' || user.role === 'CEO') {
        if(user.role === 'Martech') {
            document.getElementById("martech-search").style.display = "flex"; // সার্চ বার অন
        }
        if(user.role === 'CEO') {
            document.getElementById("ceo-reports").style.display = "block"; // রিপোর্ট বাটন অন
        }
        menu.innerHTML += `
            <li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-users"></i> All Leads</li>
            <li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-file-invoice-dollar"></i> Bills & Approval</li>
        `;
    }
    // B. সেলস
    else if(user.role === 'Sales') {
        menu.innerHTML += `<li onclick="showSection('leads-panel'); loadLeads();"><i class="fas fa-phone"></i> My Leads</li>`;
    }
    // C. অ্যাকাউন্টস / CR
    else if(user.role === 'Accounts' || user.role === 'CR') {
        menu.innerHTML += `<li onclick="showSection('bill-panel'); loadBills();"><i class="fas fa-calculator"></i> Pending Bills</li>`;
    }
}

// ৪. পেজ নেভিগেশন (বাটন ফিক্স)
function showSection(id) {
    // সব সেকশন লুকাও
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    // শুধু নির্দিষ্ট সেকশন দেখাও
    const activeSection = document.getElementById(id);
    if(activeSection) {
        activeSection.style.display = 'block';
    } else {
        console.error("Section not found:", id);
    }

    // মোবাইলে মেনু বন্ধ করা
    if(window.innerWidth < 768) {
        document.getElementById("sidebar").classList.remove("active");
    }
}

// ৫. লিড লোড করা (পানিশমেন্ট সহ)
function loadLeads() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const tbody = document.querySelector("#leads-table tbody");
    if(!tbody) return;

    tbody.innerHTML = "<tr><td colspan='4'>Loading data...</td></tr>";

    fetch(`${API_URL}?action=get_my_leads&user=${user.name}`)
    .then(res => res.json())
    .then(data => {
        tbody.innerHTML = "";
        if(data.status === "success" && data.data.length > 0) {
            data.data.forEach(lead => {
                let actionBtn = lead.isBlocked 
                    ? `<span style="color:red; font-weight:bold;"><i class="fas fa-lock"></i> Locked</span>` 
                    : `<a href="tel:${lead.phone}" class="btn-call">📞 Call</a>`;

                tbody.innerHTML += `
                    <tr>
                        <td><b>${lead.name}</b><br><small style="color:#777">${lead.source}</small></td>
                        <td>${lead.phone}</td>
                        <td><span style="padding:4px 8px; background:#e1f5fe; color:#0288d1; border-radius:4px; font-size:12px;">${lead.status}</span></td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='4' style="text-align:center">No leads found.</td></tr>";
        }
    });
}

// ৬. মারটেক সার্চ
function searchLead() {
    const query = document.getElementById("search-query").value;
    const resDiv = document.getElementById("search-results");
    
    if(!query) return alert("Enter number or name!");
    resDiv.innerHTML = "Searching...";

    fetch(`${API_URL}?action=search_lead&query=${query}`)
    .then(res => res.json())
    .then(data => {
        if(data.results.length > 0) {
            let html = `<div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-top:10px;">`;
            data.results.forEach(r => {
                html += `<div style="border-bottom:1px solid #eee; padding:5px;">
                    <strong>${r.name}</strong> (${r.phone}) <br>
                    <span style="color:blue">Agent: ${r.agent}</span> | Status: ${r.status}
                </div>`;
            });
            html += `</div>`;
            resDiv.innerHTML = html;
        } else {
            resDiv.innerHTML = "<p style='color:red; margin-top:10px;'>❌ No Data Found</p>";
        }
    });
}

// ৭. ডাটা সেভ ফাংশন (লিড ও বিল)
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target; // যে বাটনে চাপ দেওয়া হয়েছে
    const originalText = btn.innerText;
    
    let payload = { user: user.name };

    if(type === 'lead') {
        payload.action = "add_lead";
        payload.name = document.getElementById("lead_name").value;
        payload.phone = document.getElementById("lead_phone").value;
        payload.source = document.getElementById("lead_source").value;
        payload.assignTo = user.name; 
        
        if(!payload.name || !payload.phone) return alert("Fill all fields!");
    } 
    else if(type === 'bill') {
        payload.action = "submit_bill";
        payload.dept = user.dept || user.role;
        payload.purpose = document.getElementById("bill_purpose").value;
        payload.amount = document.getElementById("bill_amount").value;
        payload.desc = document.getElementById("bill_desc").value;
        payload.phone = user.phone;
        
        if(!payload.amount) return alert("Amount required!");
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
            closeModal(`${type}-modal`);
            // ফিল্ড ক্লিয়ার
            if(type==='lead') { document.getElementById("lead_name").value = ""; document.getElementById("lead_phone").value = ""; }
            if(type==='bill') { document.getElementById("bill_amount").value = ""; }
            
            // লিস্ট রিফ্রেশ
            if(type === 'lead') loadLeads();
            // if(type === 'bill') loadBills();
        }
    })
    .catch(err => {
        alert("Error saving data!");
        console.error(err);
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// ৮. ড্যাশবোর্ড স্ট্যাটস
function loadStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    
    if(user.role === 'CEO') {
        cardsDiv.innerHTML = `
            <div class="card"><h1>৳ 50.5 Cr</h1><p>Revenue</p></div>
            <div class="card"><h1>1,250</h1><p>Leads</p></div>
            <div class="card"><h1>120</h1><p>Staff</p></div>
        `;
    } else {
        cardsDiv.innerHTML = `
            <div class="card"><h1>0</h1><p>Today's Call</p></div>
            <div class="card"><h1>0</h1><p>Pending Leads</p></div>
        `;
    }
}

// হেল্পার ফাংশন
function loadBills() { document.getElementById("bill-list").innerHTML = "<p>Loading bills...</p>"; /* লজিক পরে এড হবে */ }
function downloadReport(dept) { alert(`Generating ${dept} Report...`); }
function logout() { localStorage.removeItem("divineUser"); location.reload(); }