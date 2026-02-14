const BASE_URL = "https://script.google.com/macros/s/AKfycbxEfD4Ig1ft56_neMJZOqps7sRjx3EX5XJuHsR5l3EYepikdCIq8NyE2fW1X4h67aFE/exec";

/* ================= LOGIN ================= */

function login(){
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      email: email,
      password: password
    })
  })
  .then(res => res.json())
  .then(data => {
    if(data.status){
      sessionStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("loginError").innerText = "Login failed. Check credentials";
    }
  });
}

/* ================= AUTH CHECK ================= */

if(window.location.pathname.includes("dashboard.html")){
  const user = JSON.parse(sessionStorage.getItem("user"));
  if(!user){
    window.location.href = "index.html";
  } else {
    loadDashboard();
  }
}

/* ================= NAVIGATION ================= */

function logout(){
  sessionStorage.clear();
  window.location.href = "index.html";
}

function showSection(section){
  document.querySelectorAll(".section").forEach(el => {
    el.classList.add("hidden");
  });
  document.getElementById(section).classList.remove("hidden");

  if(section === "dashboard") loadDashboard();
  if(section === "installments") loadInstallments();
  if(section === "projects") loadProjects();
  if(section === "payroll") loadPayroll();
  if(section === "collections") loadCollections();
  if(section === "expenses") loadExpenses();
  if(section === "requisitions") loadRequisitions();
}

/* ================= DASHBOARD ================= */

function loadDashboard(){
  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({action: "dashboard"})
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("summaryCards").innerHTML = `
      <div class="kpi green">
        <h3>Total Leads</h3>
        <p>${data.total_leads}</p>
      </div>
      <div class="kpi orange">
        <h3>Total Bookings</h3>
        <p>${data.total_bookings}</p>
      </div>
      <div class="kpi red">
        <h3>Total Installments</h3>
        <p>${data.total_installments}</p>
      </div>
    `;
  });
}

/* ================= INSTALLMENTS ================= */

function loadInstallments(){
  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({action: "getInstallments"})
  })
  .then(res => res.json())
  .then(data => {
    const tbl = document.getElementById("installmentTable");
    tbl.innerHTML = "";
    data.forEach(i=>{
      tbl.innerHTML+=`
        <tr>
          <td>${i.client}</td>
          <td>${i.total}</td>
          <td>${i.paid}</td>
          <td>${i.due}</td>
          <td>${i.status}</td>
          <td><button onclick="payInstallment('${i.id}')">Pay</button></td>
        </tr>
      `;
    });
  });
}

function payInstallment(id){
  let amt = prompt("Enter amount:");
  if(!amt) return;
  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({
      action:"addPayment",
      installment_id:id,
      amount:amt,
      method:"Online",
      reference:"N/A",
      received_by:JSON.parse(sessionStorage.getItem("user")).name,
      note:""
    })
  }).then(()=>loadInstallments());
}

/* ================= PROJECTS ================= */

function loadProjects(){
  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({action:"getProjectDashboard"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html = "";
    data.forEach(p=>{
      html += `<div class="card"><strong>${p.project}</strong><br> Count: ${p.count} <br> Revenue: ${p.revenue}</div>`;
    });
    document.getElementById("projectList").innerHTML = html;
  });
}

/* ================= PAYROLL ================= */

function loadPayroll(){
  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({action:"getPayroll"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html = "";
    data.forEach(p=>{
      html += `<div class="card">${p.name} - ${p.salary} + ${p.commission} = ${p.total}</div>`;
    });
    document.getElementById("payrollList").innerHTML = html;
  });
}

/* ================= COLLECTIONS ================= */

function loadCollections(){
  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({action:"getCollections"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html = "";
    data.forEach(c=>{
      html += `<div class="card">${c.client_name} - ${c.amount_collected}</div>`;
    });
    document.getElementById("collectionList").innerHTML = html;
  });
}

/* ================= EXPENSES ================= */

function loadExpenses(){
  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({action:"getExpenses"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html = "";
    data.forEach(e=>{
      html += `<div class="card">${e.expense_category} - ${e.amount}</div>`;
    });
    document.getElementById("expenseList").innerHTML = html;
  });
}

/* ================= REQUISITIONS ================= */

function loadRequisitions(){
  fetch(BASE_URL,{
    method:"POST",
    body: JSON.stringify({action:"getRequisitions"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html="";
    data.forEach(r=>{
      html += `<div class="card">${r.request_type} - ${r.amount}</div>`;
    });
    document.getElementById("requisitionList").innerHTML = html;
  });
}