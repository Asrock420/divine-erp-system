const BASE_URL="https://script.google.com/macros/s/AKfycbwf9Ku2ywk51UwQGfAhdczZ9LxsDiiIGbgQ6a4JXNSs6HJ_2Bkq0jMp3oJvSBjgeBZJ/exec";

/* ================= LOGIN ================= */

function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"login",
      email:email,
      password:password
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.success){
      sessionStorage.setItem("user",JSON.stringify(data.user));
      window.location.href="dashboard.html";
    }else{
      alert("Login Failed");
    }
  });
}

/* ================= AUTH CHECK ================= */

if(window.location.pathname.includes("dashboard")){
  const user=JSON.parse(sessionStorage.getItem("user"));
  if(!user){
    window.location.href="index.html";
  }else{
    loadSummary();
  }
}

/* ================= NAVIGATION ================= */

function logout(){
  sessionStorage.clear();
  window.location.href="index.html";
}

function showSection(id){
  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");

  if(id==="dashboard") loadSummary();
  if(id==="installments") loadInstallments();
  if(id==="projects") loadProjects();
  if(id==="payroll") loadPayroll();
}

/* ================= DASHBOARD ================= */

function loadSummary(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getFinancialSummary"})
  })
  .then(res=>res.json())
  .then(d=>{
    document.getElementById("revenue").innerText=d.revenue || 0;
    document.getElementById("outstanding").innerText=d.outstanding || 0;
    document.getElementById("overdue").innerText=d.overdue || 0;
  });
}

/* ================= INSTALLMENTS ================= */

function loadInstallments(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getInstallments"})
  })
  .then(res=>res.json())
  .then(data=>{
    const table=document.getElementById("installmentTable");
    table.innerHTML="";
    data.forEach(i=>{
      table.innerHTML+=`
      <tr>
        <td>${i.client}</td>
        <td>${i.total}</td>
        <td>${i.paid}</td>
        <td>${i.due}</td>
        <td>${i.status}</td>
        <td><button onclick="payInstallment('${i.id}')">Pay</button></td>
      </tr>`;
    });
  });
}

function payInstallment(id){
  let amount=prompt("Enter Payment Amount:");
  if(!amount) return;

  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"addPayment",
      id:id,
      amount:amount
    })
  }).then(()=>loadInstallments());
}

/* ================= PROJECT DASHBOARD ================= */

function loadProjects(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getProjectDashboard"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html="";
    data.forEach(p=>{
      html+=`<div>${p.project} - ${p.count} Sales - Revenue: ${p.revenue}</div><br>`;
    });
    document.getElementById("projectList").innerHTML=html;
  });
}

/* ================= PAYROLL ================= */

function loadPayroll(){
  fetch(BASE_URL,{
    method:"POST",
    body:JSON.stringify({action:"getPayroll"})
  })
  .then(res=>res.json())
  .then(data=>{
    let html="";
    data.forEach(p=>{
      html+=`<div>${p.name} - Salary: ${p.salary} - Commission: ${p.commission} - Total: ${p.total}</div><br>`;
    });
    document.getElementById("payrollList").innerHTML=html;
  });
}