const BASE_URL = "https://script.google.com/macros/s/AKfycbxab3ikmdCC2YnWUSx6etOR2dttbFwsObZyHPxd7Q7_qhwgIAiEsjhoOoKzU4ZbADWR/exec";

/* ================= AUTH ================= */

let user = null;

if (window.location.pathname.includes("dashboard.html")) {
  user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    window.location.href = "index.html";
  } else {
    applyRoleVisibility();
    loadDashboard();
  }
}

/* ================= NAVIGATION ================= */

function showSection(section) {
  document.querySelectorAll(".section").forEach(el => {
    el.classList.add("hidden");
  });
  document.getElementById(section).classList.remove("hidden");
}

function toggleSub(el) {
  const submenu = el.nextElementSibling;
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

/* ================= ROLE BASED MENU VISIBILITY ================= */

function applyRoleVisibility() {

  const role = user.role;
  const department = user.department;

  // Hide everything first
  document.querySelectorAll(".menu li").forEach(li => {
    li.style.display = "none";
  });

  // Dashboard visible to all
  document.querySelector(".menu li:first-child").style.display = "block";

  // Sales
  if (role === "Sales Executive" || role === "Team Leader") {
    showMenu("Leads");
    showMenu("Installments");
  }

  // CR + Account
  if (department === "CR+Account") {
    showMenu("Installments");
    showMenu("Collections");
  }

  // Admin & HR
  if (department === "Admin & HR Logistic") {
    showMenu("Payroll");
    showMenu("Expenses");
    showMenu("Requisitions");
  }

  // Chief Architect full access
  if (role === "Chief System Architect") {
    document.querySelectorAll(".menu li").forEach(li => {
      li.style.display = "block";
    });
  }
}

function showMenu(text) {
  document.querySelectorAll(".menu li").forEach(li => {
    if (li.innerText.includes(text)) {
      li.style.display = "block";
    }
  });
}

applyRoleVisibility();

/* ================= DASHBOARD KPI ANIMATION ================= */

function animateCounter(id, start, end, duration){

  end = Number(end);
  if(isNaN(end) || end < 0) end = 0;

  let range = end - start;
  let current = start;

  if(range === 0){
    document.getElementById(id).innerText = end;
    return;
  }

  let increment = end > start ? 1 : -1;
  let stepTime = Math.abs(Math.floor(duration / Math.abs(range)));

  let obj = document.getElementById(id);

  let timer = setInterval(function () {
    current += increment;
    obj.innerText = current;
    if (current == end) {
      clearInterval(timer);
    }
  }, stepTime);
}

function loadDashboard() {
  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({ action: "dashboard" })
  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("summaryCards").innerHTML = `
      <div class="kpi green"><div id="kpi_leads">0</div><small>Total Leads</small></div>
      <div class="kpi orange"><div id="kpi_bookings">0</div><small>Total Bookings</small></div>
      <div class="kpi blue"><div id="kpi_installments">0</div><small>Total Installments</small></div>
      <div class="kpi purple"><div id="kpi_revenue">0</div><small>Total Revenue</small></div>
    `;

    animateCounter("kpi_leads", 0, data.total_leads, 800);
    animateCounter("kpi_bookings", 0, data.total_bookings, 800);
    animateCounter("kpi_installments", 0, data.total_installments, 800);
    animateCounter("kpi_revenue", 0, data.total_revenue, 1000);

  });
}

loadDashboard();

/* ================= DYNAMIC DROPDOWN ENGINE ================= */

function loadDropdowns() {

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getDropdownData"})
  })
  .then(res=>res.json())
  .then(data=>{

    fillSelect("project", data.projects);
    fillSelect("lead_source", data.lead_sources);
    fillSelect("team", data.teams);

  });

}

function fillSelect(id, list){
  const select = document.getElementById(id);
  if(!select) return;
  select.innerHTML="";
  list.forEach(item=>{
    select.innerHTML += `<option value="${item}">${item}</option>`;
  });
}

loadDropdowns();

/* ================= COMMISSION DASHBOARD ================= */

function loadCommission() {
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getCommissionReport"})
  })
  .then(res=>res.json())
  .then(data=>{

    let html = "";
    data.forEach(c=>{
      html += `
        <div class="card">
          <strong>${c.sales_name}</strong><br>
          Project: ${c.project}<br>
          Amount: ${c.amount}<br>
          Status: ${c.status}
        </div>
      `;
    });

    document.getElementById("commissionList").innerHTML = html;
  });
}
function login(){

  const loader = document.getElementById("loginLoader");
  const errorBox = document.getElementById("loginError");

  loader.classList.remove("hidden");
  errorBox.innerText = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({
      action:"login",
      email:email,
      password:password
    })
  })
  .then(res => res.json())
  .then(data => {

    loader.classList.add("hidden");

    if(data.status){
      sessionStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    }else{
      errorBox.innerText = data.message || "Invalid Credentials";
    }

  })
  .catch(err=>{
    loader.classList.add("hidden");
    errorBox.innerText = "Server connection failed";
    console.error(err);
  });

}