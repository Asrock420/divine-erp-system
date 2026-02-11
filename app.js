// ✅ তোমার দেওয়া লিংক (Backend v3)
const API_URL = "https://script.google.com/macros/s/AKfycbzuk0GTOs_PdQCoBIbm2IyQjGN4nKXdKHsHYpILbtPasp9fCPXPXGiXrypjREeF6Al_yg/exec";

window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) showApp(user);
};

// 1. লগিন
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    const msg = document.getElementById("login-msg");

    if(!phone || !pass) { msg.innerText = "সব তথ্য দিন"; return; }
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
    .catch(err => { msg.innerText = "ইন্টারনেট কানেকশন চেক করুন"; btn.innerText = "Login"; });
}

// 2. অ্যাপ দেখানো
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("welcome-msg").innerText = `Hello, ${user.name}`;
    document.getElementById("user-role-display").innerText = user.role;
    
    renderMenu(user.access);
    loadDashboard(user.role);
}

// 3. মেনু তৈরি
function renderMenu(permissions) {
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    if(permissions.includes('all')) {
        menu.innerHTML += `
            <li onclick="showSection('crm')"><i class="fas fa-users"></i> CRM (Sales)</li>
            <li onclick="showSection('hr')"><i class="fas fa-user-tie"></i> HRM</li>
            <li onclick="showSection('accounts')"><i class="fas fa-calculator"></i> Accounts</li>
            <li onclick="showSection('logistic')"><i class="fas fa-truck"></i> Logistics</li>
            <li onclick="showSection('cr')"><i class="fas fa-headset"></i> CR Ticket</li>
        `;
    } else {
        if(permissions.includes('accounts')) menu.innerHTML += `<li onclick="showSection('accounts')"><i class="fas fa-calculator"></i> Accounts</li>`;
        if(permissions.includes('cr')) menu.innerHTML += `<li onclick="showSection('cr')"><i class="fas fa-headset"></i> CR Ticket</li>`;
        if(permissions.includes('hr')) menu.innerHTML += `<li onclick="showSection('hr')"><i class="fas fa-user-tie"></i> HRM</li>`;
        // আরও রোল থাকলে এখানে যোগ হবে
    }
}

// 4. পেজ পরিবর্তন (মোবাইলে মেনু অটো বন্ধ হবে)
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // হাইলাইট
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // মোবাইলে মেনু ক্লিক করলে সাইডবার বন্ধ হয়ে যাবে
    const sidebar = document.getElementById("sidebar");
    if(window.innerWidth < 768) {
        sidebar.classList.remove("active");
    }
}

// 5. ড্যাশবোর্ড ডাটা
function loadDashboard(role) {
    fetch(`${API_URL}?action=getStats&role=${role}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            const s = data.stats;
            document.getElementById("stats-cards").innerHTML = `
                <div class="card" style="background:#6a11cb"><h3>Total Leads</h3><h1>${s.leads}</h1></div>
                <div class="card" style="background:#11998e"><h3>Total Staff</h3><h1>${s.staff}</h1></div>
                <div class="card" style="background:#ff5e62"><h3>My Sales</h3><h1>${s.sales}</h1></div>
            `;
        }
    });
}

// 6. ডাটা সেভ
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    let payload = { user: user.name };

    if(type === 'accounts') {
        payload.action = "add_account";
        payload.type = document.getElementById("acc_type").value;
        payload.cat = document.getElementById("acc_cat").value;
        payload.amount = document.getElementById("acc_amount").value;
        payload.desc = document.getElementById("acc_desc").value;
        if(!payload.amount) { alert("Amount missing!"); btn.disabled=false; btn.innerText=originalText; return; }
    }
    else if(type === 'cr') {
        payload.action = "add_ticket";
        payload.client = document.getElementById("cr_client").value;
        payload.phone = document.getElementById("cr_phone").value;
        payload.issue = document.getElementById("cr_issue").value;
    }
    // ... HR data logic here if needed

    fetch(API_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        btn.innerText = originalText;
        btn.disabled = false;
        if(type==='accounts') { document.getElementById("acc_amount").value = ""; } // ফিল্ড ক্লিয়ার
    });
}

function logout() { localStorage.removeItem("divineUser"); location.reload(); }