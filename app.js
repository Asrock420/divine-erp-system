/* ============================================================
   DIVINE ERP – ENTERPRISE STRUCTURED BUILD (14 SECTIONS)
============================================================ */

const BASE_URL = "https://script.google.com/macros/s/AKfycbxoCg0STC-Hl00HReRfEiA7F8BGHcNAHKQZBvWtZ5L5ixt0DZsKYE_gIxq-daJIfOfU/exec";

/* ================= 1️⃣ GLOBAL ================= */

let user = null;
let PERMISSIONS = {};

/* ================= 2️⃣ AUTH ================= */

if (window.location.pathname.includes("dashboard.html")) {

  user = JSON.parse(sessionStorage.getItem("user"));

  if (!user) {
    window.location.href = "index.html";
  } else {
    initDashboardFlow();
  }
}

/* ================= LOGIN FUNCTION ================= */

function login(){

  const loader = document.getElementById("loginLoader");
  const errorBox = document.getElementById("loginError");

  if(loader) loader.classList.remove("hidden");
  if(errorBox) errorBox.innerText = "";

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

    if(loader) loader.classList.add("hidden");

    if(data.status){
      sessionStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    }else{
      if(errorBox) errorBox.innerText = data.message || "Invalid Credentials";
    }

  })
  .catch(err=>{
    if(loader) loader.classList.add("hidden");
    if(errorBox) errorBox.innerText = "Server connection failed";
    console.error(err);
  });
}

/* ================= 3️⃣ INIT FLOW ================= */

function initDashboardFlow(){
  loadPermissions().then(()=>{
    loadDashboard();
    loadDropdowns();
  });
}

/* ================= 4️⃣ PERMISSION ENGINE ================= */

async function loadPermissions(){

  const res = await fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"getPermissions",
      role:user.role
    })
  });

  const data = await res.json();

  if(data.status){
    PERMISSIONS = data.permissions;
    applyPermissionEngine();
  }
}

function applyPermissionEngine(){

  // Hide all controlled items first
  document.querySelectorAll("[data-module],[data-menu],[data-permission]")
  .forEach(el=> el.style.display = "none");

  // Show allowed
  document.querySelectorAll("[data-module]").forEach(el=>{
    const key = el.getAttribute("data-module");
    if(PERMISSIONS[key]) el.style.display = "block";
  });

  document.querySelectorAll("[data-menu]").forEach(el=>{
    const key = el.getAttribute("data-menu");
    if(PERMISSIONS[key]){
      el.style.display = "block";
      const parent = el.closest(".has-sub");
      if(parent) parent.style.display = "block";
    }
  });

  document.querySelectorAll("[data-permission]").forEach(el=>{
    const key = el.getAttribute("data-permission");
    if(PERMISSIONS[key]) el.style.display = "inline-block";
  });
}

/* ================= 5️⃣ NAVIGATION ================= */

function showSection(section){

  document.querySelectorAll(".section")
  .forEach(el=> el.classList.add("hidden"));

  const target = document.getElementById(section);
  if(target) target.classList.remove("hidden");

  autoLoadSection(section);
}

function toggleSub(el){
  const submenu = el.nextElementSibling;
  submenu.style.display =
    submenu.style.display === "block" ? "none" : "block";
}

function logout(){
  sessionStorage.clear();
  window.location.href = "index.html";
}

/* ================= 6️⃣ AUTO LOAD SYSTEM ================= */

function autoLoadSection(section){

  if(section === "dashboard") loadDashboard();
  if(section === "requisitions") loadRequisitions();
  if(section === "projects") loadProjects?.();
  if(section === "lead_list") loadLeads?.();
  if(section === "commission_report") loadCommission();
}

/* ================= 7️⃣ DASHBOARD KPI ANIMATION ================= */

function animateCounter(id,start,end,duration){

  end = Number(end);
  if(isNaN(end)||end<0) end=0;

  let range=end-start;
  let current=start;

  if(range===0){
    document.getElementById(id).innerText=end;
    return;
  }

  let increment=end>start?1:-1;
  let stepTime=Math.abs(Math.floor(duration/Math.abs(range)));
  let obj=document.getElementById(id);

  let timer=setInterval(function(){
    current+=increment;
    obj.innerText=current;
    if(current==end) clearInterval(timer);
  },stepTime);
}

function loadDashboard(){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"dashboard"})
  })
  .then(res=>res.json())
  .then(data=>{

    document.getElementById("summaryCards").innerHTML=`
      <div class="kpi green"><div id="kpi_leads">0</div><small>Total Leads</small></div>
      <div class="kpi orange"><div id="kpi_bookings">0</div><small>Total Bookings</small></div>
      <div class="kpi blue"><div id="kpi_installments">0</div><small>Total Installments</small></div>
      <div class="kpi purple"><div id="kpi_revenue">0</div><small>Total Revenue</small></div>
    `;

    animateCounter("kpi_leads",0,data.total_leads,800);
    animateCounter("kpi_bookings",0,data.total_bookings,800);
    animateCounter("kpi_installments",0,data.total_installments,800);
    animateCounter("kpi_revenue",0,data.total_revenue,1000);
  });
}

/* ================= 8️⃣ DYNAMIC DROPDOWN ENGINE ================= */

function loadDropdowns(){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getDropdownData"})
  })
  .then(res=>res.json())
  .then(data=>{
    fillSelect("project",data.projects);
    fillSelect("lead_source",data.lead_sources);
    fillSelect("team",data.teams);
  });
}

function fillSelect(id,list){
  const select=document.getElementById(id);
  if(!select) return;
  select.innerHTML="";
  list.forEach(item=>{
    select.innerHTML+=`<option value="${item}">${item}</option>`;
  });
}

/* ================= 9️⃣ COMMISSION DASHBOARD ================= */

function loadCommission(){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getCommissionReport"})
  })
  .then(res=>res.json())
  .then(data=>{

    let html="";
    data.forEach(c=>{
      html+=`
        <div class="card">
          <strong>${c.sales_name}</strong><br>
          Project: ${c.project}<br>
          Amount: ${c.amount}<br>
          Status: ${c.status}
        </div>
      `;
    });

    document.getElementById("commissionList").innerHTML=html;
  });
}

/* ================= 🔟 CREATE PROJECT ================= */

function createProject(){

  const name=document.getElementById("project_name")?.value.trim();
  const location=document.getElementById("project_location")?.value.trim();
  const budget=document.getElementById("project_budget")?.value.trim();

  if(!name){ alert("Project name required"); return; }

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"createProject",
      project_name:name,
      location, budget
    })
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadDashboard();
    loadDropdowns();
  });
}

/* ================= 1️⃣1️⃣ CREATE LEAD ================= */

function createLead(){

  const client_name=document.getElementById("client_name")?.value.trim();
  const phone=document.getElementById("phone")?.value.trim();
  const project=document.getElementById("project")?.value;
  const lead_source=document.getElementById("lead_source")?.value;
  const assign_type=document.getElementById("assign_type")?.value;
  const team=document.getElementById("team")?.value;

  if(!client_name){ alert("Client name required"); return; }

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"createLead",
      client_name, phone, project, lead_source, assign_type, team
    })
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadDashboard();
  });
}

/* ================= 1️⃣2️⃣ CREATE REQUISITION ================= */

function createRequisition(){

  const type=document.getElementById("req_type").value;
  const amount=document.getElementById("req_amount").value;
  const note=document.getElementById("req_note").value;

  if(!amount){ alert("Amount required"); return; }

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"createRequisition",
      type, amount, note,
      user:user.name
    })
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadRequisitions();
  });
}

/* ================= 1️⃣3️⃣ REQUISITION LIST + APPROVAL UI ================= */

function loadRequisitions(){

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getRequisitions"})
  })
  .then(res=>res.json())
  .then(data=>{

    let html=`<table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Level</th>
          <th>Action</th>
        </tr>
      </thead><tbody>`;

    data.forEach(r=>{

      let actionButtons="";

      if(r.status==="Pending" && PERMISSIONS.requisition_approve_btn){
        actionButtons=approvalButtons(r.id);
      }

      html+=`
        <tr>
          <td>${r.type}</td>
          <td>${r.amount}</td>
          <td>${r.status}</td>
          <td>${r.level}</td>
          <td>${actionButtons}</td>
        </tr>
      `;
    });

    html+="</tbody></table>";

    document.getElementById("requisitionList").innerHTML=html;
  });
}

function approvalButtons(id){
  return `
    <button onclick="approveReq('${id}')" data-permission="requisition_approve_btn">Approve</button>
    <button onclick="rejectReq('${id}')" data-permission="requisition_reject_btn">Reject</button>
  `;
}

/* ================= 1️⃣4️⃣ APPROVAL ACTIONS ================= */

function approveReq(id){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"approveRequisition",id})
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
    body:JSON.stringify({action:"rejectRequisition",id})
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
    loadRequisitions();
  });
}