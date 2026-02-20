const BASE_URL = "https://script.google.com/macros/s/AKfycbywODb0uELb87HgxDf9-zTOwIh_rtB_drcUe3Yrt39lB9Nsd6MzhVZcgWxw5hxbN7zl/exec";

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

  const target = document.getElementById(section);
  if(target){
    target.classList.remove("hidden");
  }

  /* -------- AUTO LOAD SYSTEM -------- */

  if(section === "dashboard"){
    loadDashboard();
  }

  if(section === "requisitions"){
    loadRequisitions();
  }

  if(section === "projects"){
    loadProjects?.();
  }

  if(section === "lead_list"){
    loadLeads?.();
  }

  if(section === "commission_report"){
    loadCommission();
  }
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

/* ================= CREATE PROJECT ================= */

function createProject(){

  const name = document.getElementById("project_name")?.value.trim();
  const location = document.getElementById("project_location")?.value.trim();
  const budget = document.getElementById("project_budget")?.value.trim();

  if(!name){
    alert("Project name required");
    return;
  }

  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({
      action:"createProject",
      project_name:name,
      location:location,
      budget:budget
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.status){
      alert("Project Created Successfully");
      loadDashboard();
      loadDropdowns();
      document.getElementById("project_name").value="";
      document.getElementById("project_location").value="";
      document.getElementById("project_budget").value="";
    }else{
      alert(data.message);
    }
  })
  .catch(err=>{
    console.error(err);
    alert("Project creation failed");
  });
}

/* ================= CREATE LEAD ================= */

function createLead(){

  const client_name = document.getElementById("client_name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const project = document.getElementById("project")?.value;
  const lead_source = document.getElementById("lead_source")?.value;
  const assign_type = document.getElementById("assign_type")?.value;
  const team = document.getElementById("team")?.value;

  if(!client_name){
    alert("Client name required");
    return;
  }

  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({
      action:"createLead",
      client_name:client_name,
      phone:phone,
      project:project,
      lead_source:lead_source,
      assign_type:assign_type,
      team:team
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.status){
      alert("Lead Created Successfully");
      loadDashboard();
      document.getElementById("client_name").value="";
      document.getElementById("phone").value="";
    }else{
      alert(data.message);
    }
  })
  .catch(err=>{
    console.error(err);
    alert("Lead creation failed");
  });
}

/* ================= CREATE REQUISITION ================= */

function createRequisition(){

  const type = document.getElementById("req_type").value;
  const amount = document.getElementById("req_amount").value;
  const note = document.getElementById("req_note").value;

  if(!amount){
    alert("Amount required");
    return;
  }

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"createRequisition",
      type:type,
      amount:amount,
      note:note,
      user:user.name
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.status){
      alert("Requisition Submitted");
      document.getElementById("req_amount").value="";
      document.getElementById("req_note").value="";
    }else{
      alert(data.message);
    }
  });
}

function approveReq(id){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"approveRequisition",
      id:id
    })
  }).then(()=>alert("Approved"));
}

function rejectReq(id){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"rejectRequisition",
      id:id
    })
  }).then(()=>alert("Rejected"));
}

/* ================= REQUISITION LIST + APPROVAL UI ================= */

function loadRequisitions(){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getRequisitions"})
  })
  .then(res=>res.json())
  .then(data=>{

    let html = `
      <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Level</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
    `;

    data.forEach(r=>{

      let actionButtons = "";

      if(r.status === "Pending"){

        if(r.level === "TL" && user.role === "Team Leader"){
          actionButtons = approvalButtons(r.id);
        }

        if(r.level === "Admin" && user.department === "Admin & HR Logistic"){
          actionButtons = approvalButtons(r.id);
        }

        if(r.level === "CEO" && user.role === "Chief System Architect"){
          actionButtons = approvalButtons(r.id);
        }
      }

      html += `
        <tr>
          <td>${r.type}</td>
          <td>${r.amount}</td>
          <td>${r.status}</td>
          <td>${r.level}</td>
          <td>${actionButtons}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";

    document.getElementById("requisitionList").innerHTML = html;

  });
}

function approvalButtons(id){
  return `
    <button onclick="approveReq('${id}')" style="background:#28a745;margin-right:5px;">Approve</button>
    <button onclick="rejectReq('${id}')" style="background:#dc3545;">Reject</button>
  `;
}

function approveReq(id){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"approveRequisition",
      id:id
    })
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadRequisitions();
  });
}

function rejectReq(id){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"rejectRequisition",
      id:id
    })
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadRequisitions();
  });
}
