const BASE_URL="https://script.google.com/macros/s/AKfycbzL8GoZ3pySX9XPHIOVaFw4xm_wdlTlV2ngFEpPN7-qvugGsopJBOyS1Pzr_j3-ZnDt/exec";

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

if(window.location.pathname.includes("dashboard")){
const user=JSON.parse(sessionStorage.getItem("user"));
if(!user){
window.location.href="index.html";
}else{
loadSummary();
}
}

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
}

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