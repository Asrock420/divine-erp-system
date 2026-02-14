const BASE_URL = "https://script.google.com/macros/s/AKfycbzvPMZKRx9kqG92dZ1XnfnaH6u2qEiiJInMq-OUB-0KMEyXllHkYh-XkjJYOypmbrn2/exec";

function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    document.getElementById("error").innerText = "Email & Password required";
    return;
  }

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

    if(data.status === "success") {

      sessionStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";

    } else {
      document.getElementById("error").innerText = "Invalid Credentials";
    }

  })
  .catch(() => {
    document.getElementById("error").innerText = "Server Error";
  });
}


function createTestUser() {

  fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "createUser",
      user_id: "U100",
      full_name: "Admin User",
      email: "admin@test.com",
      password: "1234",
      role: "Admin",
      department: "Management",
      phone: "01700000000",
      basic_salary: 50000
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Test User Created.\nLogin with:\nEmail: admin@test.com\nPassword: 1234");
  })
  .catch(() => {
    alert("User Creation Failed");
  });
}