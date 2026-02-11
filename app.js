// ✅ তোমার নতুন ব্যাকএন্ড লিংক (আপডেট করা হয়েছে)
const API_URL = "https://script.google.com/macros/s/AKfycbzuk0GTOs_PdQCoBIbm2IyQjGN4nKXdKHsHYpILbtPasp9fCPXPXGiXrypjREeF6Al_yg/exec";

// ১. অ্যাপ লোড হলে চেক করবে কেউ লগিন আছে কি না
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(user) {
        showApp(user);
    }
};

// ২. লগিন ফাংশন
function handleLogin() {
    const phone = document.getElementById("phone").value;
    const pass = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    const msg = document.getElementById("login-msg");

    if(!phone || !pass) { 
        msg.innerText = "Phone & Password required!"; 
        return; 
    }

    btn.innerText = "Checking...";
    msg.innerText = "";

    // API কল করা হচ্ছে (GET Request)
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
        console.error(err);
        msg.innerText = "Connection Error! Check Console.";
        btn.innerText = "Login";
    });
}

// ৩. অ্যাপ দেখানো এবং মেনু সাজানো (রোল অনুযায়ী)
function showApp(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-container").style.display = "flex";
    document.getElementById("welcome-msg").innerText = `Welcome, ${user.name}`;
    document.getElementById("user-role-display").innerText = `Role: ${user.role}`;

    renderMenu(user.access);
    loadDashboard(user.role);
}

// ৪. ডাইনামিক মেনু তৈরি (কে কী দেখবে)
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
    // নির্দিষ্ট রোল অনুযায়ী মেনু
    else {
        if(permissions.includes('crm')) menu.innerHTML += `<li onclick="showSection('crm')"><i class="fas fa-users"></i> CRM</li>`;
        if(permissions.includes('hr')) menu.innerHTML += `<li onclick="showSection('hr')"><i class="fas fa-user-tie"></i> HRM</li>`;
        if(permissions.includes('accounts')) menu.innerHTML += `<li onclick="showSection('accounts')"><i class="fas fa-calculator"></i> Accounts</li>`;
        if(permissions.includes('logistic')) menu.innerHTML += `<li onclick="showSection('logistic')"><i class="fas fa-truck"></i> Logistics</li>`;
        if(permissions.includes('admin_assets')) menu.innerHTML += `<li onclick="showSection('admin_assets')"><i class="fas fa-laptop"></i> Admin Assets</li>`;
        if(permissions.includes('cr')) menu.innerHTML += `<li onclick="showSection('cr')"><i class="fas fa-headset"></i> CR Ticket</li>`;
    }
}

// ৫. পেজ পরিবর্তন করা
function showSection(id) {
    document.querySelectorAll('.section').forEach(d => d.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // মেনু হাইলাইট
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// ৬. ড্যাশবোর্ড ডাটা আনা (GET Request)
function loadDashboard(role) {
    fetch(`${API_URL}?action=getStats&role=${role}`)
    .then(res => res.json())
    .then(data => {
        if(data.status === "success") {
            const s = data.stats;
            document.getElementById("stats-cards").innerHTML = `
                <div class="card" style="background: linear-gradient(45deg, #6a11cb, #2575fc);"><h3>Total Leads</h3><h1>${s.leads}</h1></div>
                <div class="card" style="background: linear-gradient(45deg, #11998e, #38ef7d);"><h3>Total Staff</h3><h1>${s.staff}</h1></div>
                <div class="card" style="background: linear-gradient(45deg, #ff9966, #ff5e62);"><h3>Sales</h3><h1>${s.sales}</h1></div>
            `;
        }
    });
}

// ৭. ডাটা সেভ করার ফাংশন (Universal Save Function - POST Request)
function saveData(type) {
    const user = JSON.parse(localStorage.getItem("divineUser"));
    if(!user) return alert("Please Login First!");

    let payload = {};
    const btn = event.target; // যে বাটনে ক্লিক করেছে
    const originalText = btn.innerText;
    
    // বাটন লোডিং দেখাবে
    btn.innerText = "Saving...";
    btn.disabled = true;

    // A. Accounts Data Ready করা
    if(type === 'accounts') {
        const amount = document.getElementById("acc_amount").value;
        if(!amount) { alert("Amount required!"); btn.innerText = originalText; btn.disabled = false; return; }

        payload = {
            action: "add_account",
            type: document.getElementById("acc_type").value,
            cat: document.getElementById("acc_cat").value,
            amount: amount,
            desc: document.getElementById("acc_desc").value,
            user: user.name
        };
    }
    // B. CR Data Ready করা
    else if(type === 'cr') {
        const phone = document.getElementById("cr_phone").value;
        if(!phone) { alert("Client Phone required!"); btn.innerText = originalText; btn.disabled = false; return; }

        payload = {
            action: "add_ticket",
            client: document.getElementById("cr_client").value,
            phone: phone,
            issue: document.getElementById("cr_issue").value,
            user: user.name
        };
    }
    // C. HR Data Ready করা
    else if(type === 'hr') {
        const name = document.getElementById("hr_name").value;
        if(!name) { alert("Name required!"); btn.innerText = originalText; btn.disabled = false; return; }

        payload = {
            action: "add_employee",
            name: name,
            phone: document.getElementById("hr_phone").value,
            role: document.getElementById("hr_role").value,
            user: user.name
        };
    }

    // ব্যাকএন্ডে ডাটা পাঠানো (POST Request)
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message); // কনফার্মেশন মেসেজ
        btn.innerText = originalText;
        btn.disabled = false;
        
        // সফল হলে পেজ রিফ্রেশ করে নতুন ডাটা দেখানো যেতে পারে (Optional)
        // location.reload(); 
    })
    .catch(err => {
        alert("Error saving data! Check internet.");
        console.error(err);
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// ৮. লগআউট
function logout() {
    localStorage.removeItem("divineUser");
    location.reload();
}