const BASE_URL = "https://script.google.com/macros/s/AKfycbyq5pTjmygVlQHRb5GnBN-AosSJEPnkr0vfaTdLP-Q6MI5dZ74MFQg9NfUt5jSsJMSy/exec";

/* ================= LOGIN ================= */

function login(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"login",
      email:document.getElementById("email").value,
      password:document.getElementById("password").value
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.status){
      sessionStorage.setItem("user",JSON.stringify(data.user));
      window.location.href="dashboard.html";
    }else{
      document.getElementById("loginError").innerText="Invalid Login";
    }
  });
}

/* ================= AUTH CHECK ================= */

if(window.location.pathname.includes("dashboard.html")){
  const user = JSON.parse(sessionStorage.getItem("user"));
  if(!user){
    window.location.href="index.html";
  }else{
    loadDashboard();
    loadProjectsDropdown();
    loadLeadSources();
  }
}

/* ================= NAVIGATION ================= */

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function logout(){
  sessionStorage.clear();
  window.location.href="index.html";
}

/* ================= DASHBOARD ================= */

function loadDashboard(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"dashboard"})
  })
  .then(res=>res.json())
  .then(d=>{
    document.getElementById("summaryCards").innerHTML=`
      <div class="card">Leads: ${d.total_leads}</div>
      <div class="card">Bookings: ${d.total_bookings}</div>
      <div class="card">Installments: ${d.total_installments}</div>
    `;
  });
}

/* ================= LEADS ================= */

function createLead(){
  const user = JSON.parse(sessionStorage.getItem("user"));

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"createLead",
      client_name:client_name.value,
      phone:phone.value,
      project:project.value,
      lead_source_name:lead_source.value,
      lead_source_code:lead_source.value,
      assign_type:assign_type.value,
      assigned_team:team.value,
      created_by:user.full_name
    })
  }).then(()=>alert("Lead Created"));
}

function loadProjectsDropdown(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getProjects"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html="";
    data.forEach(p=>{
      html+=`<option>${p.project_name}</option>`;
    });
    project.innerHTML=html;
  });
}

function loadLeadSources(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getLeadSources"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html="";
    data.forEach(s=>{
      html+=`<option value="${s.source_code}">${s.source_name}</option>`;
    });
    lead_source.innerHTML=html;
  });
}