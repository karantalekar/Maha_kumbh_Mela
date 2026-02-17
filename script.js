// Registration
function registerUser(e) {
  e.preventDefault();
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role").value
  };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registered Successfully");
  window.location.href = "index.html";
}

// Login
function loginUser(e) {
  e.preventDefault();
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const uname = document.getElementById("loginUsername").value;
  const pass = document.getElementById("loginPassword").value;
  const user = users.find(u => u.username === uname && u.password === pass);
  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = user.role === "admin" ? "admin_panel.html" : "user_panel.html";
  } else {
    alert("Invalid credentials");
  }
}

// Aadhaar Save
function saveAadhaar(e) {
  e.preventDefault();
  const aadhaar = document.getElementById("aadhaar").value;
  const address = document.getElementById("address").value;
  let user = JSON.parse(localStorage.getItem("loggedInUser"));
  user.aadhaar = aadhaar;
  user.address = address;

  let users = JSON.parse(localStorage.getItem("users")).map(u =>
    u.username === user.username ? user : u
  );

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loggedInUser", JSON.stringify(user));
  alert("Aadhaar details saved");
}

// Admin Panel – View Users
// function showAllUsers() {
//   const users = JSON.parse(localStorage.getItem("users")) || [];
//   const list = document.getElementById("userList");
//   list.innerHTML = "";
//   users.forEach(user => {
//     const li = document.createElement("li");
//     li.textContent = `${user.name} (${user.role}) – Aadhaar: ${user.aadhaar || 'N/A'}`;
//     list.appendChild(li);
//   });
// }


let allUsers = [];

function showAllUsers() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  allUsers = JSON.parse(localStorage.getItem("users")) || [];

  if (allUsers.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users found.";
    userList.appendChild(li);
    return;
  }

  displayUsers(allUsers);
}

function displayUsers(users) {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  users.forEach((user, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>Username:</strong> ${user.username || "N/A"}<br>
      <strong>Aadhaar:</strong> ${user.aadhaar || "Not Provided"}<br>
      <strong>DOB:</strong> ${user.dob || "Not Provided"}<br>
      <strong>Mobile:</strong> ${user.mobile || "Not Provided"}<br>
      <strong>Address:</strong> ${user.address || "Not Provided"}<br>
      <button onclick="removeUser('${user.username}')" style="margin-top: 8px; background: crimson;">Remove</button>
    `;
    userList.appendChild(li);
  });
}

function removeUser(username) {
  if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(user => user.username !== username);
  localStorage.setItem("users", JSON.stringify(users));

  // If the deleted user is logged in, log them out
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedIn && loggedIn.username === username) {
    localStorage.removeItem("loggedInUser");
  }

  showAllUsers();
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// function searchUsers() {
//   const query = document.getElementById("searchInput").value.toLowerCase();
//   const filtered = allUsers.filter(user =>
//     user.username && user.username.toLowerCase().includes(query)
//   );
//   displayUsers(filtered);
// }

function searchUsers() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allUsers.filter(user =>
    user.username && user.username.toLowerCase().includes(query)
  );
  displayUsers(filtered);
}
