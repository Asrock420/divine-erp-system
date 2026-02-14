const BASE_URL = "https://script.google.com/macros/s/AKfycbzvPMZKRx9kqG92dZ1XnfnaH6u2qEiiJInMq-OUB-0KMEyXllHkYh-XkjJYOypmbrn2/exec";

function addLead(){

  const user = JSON.parse(sessionStorage.getItem("user"));

  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addLead",
      client_name: document.getElementById("client_name").value,
      phone: document.getElementById("phone").value,
      project: document.getElementById("project").value,
      unit_type: document.getElementById("unit_type").value,
      budget: document.getElementById("budget").value,
      source: document.getElementById("source").value,
      follow_up_date: document.getElementById("follow_up_date").value,
      remarks: document.getElementById("remarks").value,
      created_by: user.name
    })
  })
  .then(res => res.json())
  .then(data => {
    alert("Lead Saved");
    loadLeads();
  });
}

function loadLeads(){

  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getLeads"
    })
  })
  .then(res => res.json())
  .then(data => {

    const table = document.getElementById("leadTable");
    table.innerHTML = "";

    data.forEach(lead => {
      table.innerHTML += `
        <tr>
          <td>${lead.client_name}</td>
          <td>${lead.phone}</td>
          <td>${lead.project}</td>
          <td>${lead.status}</td>
          <td>${lead.assigned_to}</td>
        </tr>
      `;
    });

  });
}