const API_URL = "https://script.google.com/macros/s/AKfycbxVi7QepVy-va6AV2kXSNhVH1elrS8Z_TUgdpd8gSAnBmgSApWhpn0eClfkeZBJyRn5CA/exec";

window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) showApp(user);
};

// লগিন ফাংশন (Same as before)
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    document.getElementById("loginBtn").innerText = "Checking...";
    
    fetch(`${API_URL}?action=login&phone=${phone}&pass=${pass}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            localStorage.setItem("divineUser", JSON.stringify(data.user));
            showApp(data.user);
        } else {
            alert(data.message);
            document.getElementById("loginBtn").innerText = "Login";
        }
    });
}

// 🔥 মেইন লজিক: রোল অনুযায়ী থিম এবং ফিচার সেট করা
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("user-role-display").innerText = user.name;

    // ১. থিম সেট করা (Theme Engine)
    document.body.className = ""; // Reset
    if (user.role === 'CEO') {
        document.body.classList.add('theme-ceo'); // Ultra Modern
    } else if (user.role === 'Martech') {
        document.body.classList.add('theme-martech'); // Hacker Mode
    } else if (user.role === 'Accounts' || user.role === 'CR') {
        document.body.classList.add('theme-elegant'); // Soft/Feminine
    } else {
        document.body.classList.add('theme-sales'); // Default Sales
    }

    // ২. মেনু জেনারেশন (Menu Generator)
    const menu = document.getElementById("sidebar-menu");
    menu.innerHTML = `<li onclick="showSection('dashboard')">📊 Dashboard</li>`;

    // CEO স্পেশাল মেনু
    if(user.role === 'CEO') {
        // CEO-র কোনো ডাটা এন্ট্রি মেনু নেই, শুধু রিপোর্ট
        document.getElementById("ceo-reports").style.display = "block"; // CEO Report Section Show
        document.getElementById("martech-search").style.display = "none"; // CEO doesn't need search bar immediately
    }
    
    // Martech মেনু
    else if(user.role === 'Martech') {
        document.getElementById("martech-search").style.display = "block"; // Spy Search Active
        menu.innerHTML += `<li onclick="showSection('leads-panel'); loadLeads();">🕵️‍♂️ All Leads (Spy)</li>`;
        menu.innerHTML += `<li onclick="showSection('bill-panel');">⚙️ System Control</li>`;
    }

    // Accounts/CR মেনু
    else if(user.role === 'Accounts' || user.role === 'CR') {
        menu.innerHTML += `<li onclick="showSection('bill-panel');">💰 Collections & Bills</li>`;
        // CR Ticket system link here
    }

    // Sales মেনু
    else {
        menu.innerHTML += `<li onclick="showSection('leads-panel'); loadLeads();">📞 My Leads</li>`;
    }

    // ৩. ড্যাশবোর্ড ডাটা লোড
    loadDashboardStats(user);
}

// ড্যাশবোর্ডে স্ট্যাটস দেখানো (CEO vs Others)
function loadDashboardStats(user) {
    const cardsDiv = document.getElementById("stats-cards");
    
    if(user.role === 'CEO') {
        // CEO View: Big Numbers only
        cardsDiv.innerHTML = `
            <div class="card"><h1>৳ 50.5 Cr</h1><p>Total Revenue</p></div>
            <div class="card"><h1>1,250</h1><p>Total Leads</p></div>
            <div class="card"><h1>120</h1><p>Active Staff</p></div>
            <div class="card"><h1>98%</h1><p>Efficiency</p></div>
        `;
    } else {
        // Staff View
        cardsDiv.innerHTML = `
            <div class="card"><h3>My Targets</h3><h1>Pending</h1></div>
            <div class="card"><h3>Today's Call</h3><h1>0</h1></div>
        `;
    }
}

// PDF ডাউনলোড ফাংশন (CEO-র জন্য)
function downloadReport(dept) {
    alert(`Downloading ${dept} Report as PDF... (System generating file)`);
    // ভবিষ্যতে এখানে jsPDF লাইব্রেরি দিয়ে রিয়েল পিডিএফ জেনারেট করা হবে
}

// অন্য ফাংশনগুলো (showSection, logout) আগের মতোই থাকবে...
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}
function logout() { localStorage.removeItem("divineUser"); location.reload(); }