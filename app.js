// ✅ তোমার দেওয়া ব্যাকএন্ড লিংক
const API_URL = "https://script.google.com/macros/s/AKfycbxRSO20IvcjIPdPBs-B9cwqS6gnZp65ahpiwzjmmItGqEg4JIUyzBZf8dlbGVZMg-pDUQ/exec";

// অ্যাপ লোড হলে চেক করবে কেউ লগিন আছে কি না
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) {
        showApp(user);
    }
};

// ১. লগিন ফাংশন
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    const msg = document.getElementById("login-msg");

    if(!phone || !pass) { msg.innerText = "Phone & Password required!"; return; }

    btn.innerText = "Checking...";
    msg.innerText = "";

    // API কল করা হচ্ছে
    fetch(`${API_URL}?action=login&phone=${phone}&pass=${pass}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            // ব্রাউজারে ডাটা সেভ রাখা
            localStorage.setItem("divineUser", JSON.stringify(data.user));
            showApp(data.user);
        } else {
            msg.innerText = data.message;
            btn.innerText = "Login";
        }
    })
    .catch(err => {
        msg.innerText = "Connection Error!";
        btn.innerText = "Login";
    });
}

// ২. অ্যাপ দেখানো এবং মেনু সাজানো (রোল অনুযায়ী)
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("welcome-msg").innerText = `Welcome, ${user.name}`;
    document.getElementById("user-role-display").innerText = `Role: ${user.role}`;

    renderMenu(user.access);
    loadDashboard(user.role);
}

// ৩. ডাইনামিক মেনু তৈরি (কে কী দেখবে)
function renderMenu(permissions) {
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = `<li onclick="showSection('dashboard')" class="active"><i class="fas fa-home"></i> Dashboard</li>`;

    // Martech / CEO সব দেখবে
    if(permissions.includes('all')) {
        menu.innerHTML += `
            <li onclick="showSection('crm')"><i class="fas fa-users"></i> CRM (Sales)</li>
            <li onclick="showSection('hr')"><i class="fas fa-user-tie"></i> HRM (Staff)</li>
            <li onclick="showSection('accounts')"><i class="fas fa-calculator"></i> Accounts</li>
            <li onclick="showSection('admin_assets')"><i class="fas fa-laptop"></i> Admin Assets</li>
            <li onclick="showSection('logistic')"><i class="fas fa-truck"></i> Logistics</li>
            <li onclick="showSection('cr')"><i class="fas fa-headset"></i> CR Ticket</li>
        `;
    } 
    // নির্দিষ্ট রোল
    else {
        if(permissions.includes('crm')) menu.innerHTML += `<li onclick="showSection('crm')"><i class="fas fa-users"></i> CRM</li>`;
        if(permissions.includes('hr')) menu.innerHTML += `<li onclick="showSection('hr')"><i class="fas fa-user-tie"></i> HRM</li>`;
        if(permissions.includes('accounts')) menu.innerHTML += `<li onclick="showSection('accounts')"><i class="fas fa-calculator"></i> Accounts</li>`;
        if(permissions.includes('logistic')) menu.innerHTML += `<li onclick="showSection('logistic')"><i class="fas fa-truck"></i> Logistics</li>`;
    }
}

// ৪. পেজ পরিবর্তন করা
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    // মেনু হাইলাইট লজিক পরে এড করা হবে
}

// ৫. ড্যাশবোর্ড ডাটা আনা
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

// ৬. লগআউট
function logout() {
    localStorage.removeItem("divineUser");
    location.reload();
}