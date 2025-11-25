const API = "http://localhost:5000/api/v1";
const alertPlaceholder = document.createElement("div");
alertPlaceholder.className = "alert-placeholder";
document.body.querySelector(".container").prepend(alertPlaceholder);

const result = document.getElementById("result");
const tasksList = document.getElementById("tasksList");
let currentUser = null;

axios.defaults.baseURL = API;
axios.defaults.withCredentials = true;

// show: display an object or string in the result panel
function show(o) {
  result.textContent = typeof o === "string" ? o : JSON.stringify(o, null, 2);
}

// showAlert: display a transient alert message
function showAlert(message, type = "info", timeout = 4000) {
  const el = document.createElement("div");
  el.className = `alert alert-${type} alert-dismissible`;
  el.role = "alert";
  el.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  alertPlaceholder.appendChild(el);
  if (timeout)
    setTimeout(() => {
      try {
        el.remove();
      } catch (e) {}
    }, timeout);
}

document.getElementById("btnHealth").addEventListener("click", async () => {
  try {
    const r = await axios.get("http://localhost:5000/");
    show(r.data);
    showAlert("Server reachable", "success");
  } catch (e) {
    show("Error: " + (e.response?.data?.error || e.message));
    showAlert("Health check failed", "danger");
  }
});

document.getElementById("btnRegister").addEventListener("click", async () => {
  const name = document.getElementById("r_name").value.trim();
  const email = document.getElementById("r_email").value.trim();
  const password = document.getElementById("r_password").value;
  if (!name || name.length < 2)
    return show("Name must be at least 2 characters");
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return show("Valid email required");
  if (!password || password.length < 8)
    return show("Password must be at least 8 characters");
  try {
    const res = await axios.post("/auth/register", { name, email, password });
    show({ status: res.status, body: res.data });
    currentUser = res.data.user;
    showAlert("Registered and logged in", "success");
    renderUserState();
  } catch (e) {
    show("Error: " + (e.response?.data || e.message));
  }
});

document.getElementById("btnLogin").addEventListener("click", async () => {
  const btn = document.getElementById("btnLogin");
  const prevHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...`;

  const email = document.getElementById("l_email").value.trim();
  const password = document.getElementById("l_password").value;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    btn.disabled = false;
    btn.innerHTML = prevHtml;
    return show("Valid email required");
  }
  if (!password || password.length < 8) {
    btn.disabled = false;
    btn.innerHTML = prevHtml;
    return show("Password must be at least 8 characters");
  }
  try {
    const res = await axios.post("/auth/login", { email, password });
    show({ status: res.status, body: res.data });
    currentUser = res.data.user;
    showAlert("Logged in", "success");
    renderUserState();
  } catch (e) {
    show("Error: " + (e.response?.data || e.message));
  } finally {
    btn.disabled = false;
    btn.innerHTML = prevHtml;
  }
});

document.getElementById("btnLogout").addEventListener("click", async () => {
  try {
    const res = await axios.post("/auth/logout");
    show(res.data);
  } catch (e) {
    show("Error: " + (e.response?.data || e.message));
  }
});

// fetchCurrentUser: detect existing session on load
async function fetchCurrentUser() {
  try {
    const res = await axios.get("/auth/me");
    currentUser = res.data.user;
    renderUserState();
  } catch (err) {
    currentUser = null;
    renderUserState();
  }
}

// renderUserState: show current user info in the header
function renderUserState() {
  let header = document.getElementById("userHeader");
  if (!header) {
    header = document.createElement("div");
    header.id = "userHeader";
    header.className = "mb-2";
    document.body.querySelector(".container").prepend(header);
  }
  if (currentUser)
    header.innerHTML = `Signed in as <span class="user-badge">${currentUser.name} (${currentUser.role})</span>`;
  else header.innerHTML = '<span class="text-muted">Not signed in</span>';
}

fetchCurrentUser();

// renderTasks: fetch and display tasks in the simple demo panel
async function renderTasks() {
  try {
    const res = await axios.get("/tasks");
    const tasks = res.data.tasks || [];
    tasksList.innerHTML = "";
    tasks.forEach((t) => {
      const el = document.createElement("div");
      el.className = "card mb-2 p-2";
      el.innerHTML = `<strong>${t.title}</strong> - ${
        t.description || ""
      } <br/>Completed: ${t.completed} <br/> <button data-id="${
        t._id || t.id
      }" class="btn btn-sm btn-danger btn-delete">Delete</button> <button data-id="${
        t._id || t.id
      }" class="btn btn-sm btn-secondary btn-edit">Edit</button>`;
      tasksList.appendChild(el);
    });
    document.querySelectorAll(".btn-delete").forEach((b) =>
      b.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        try {
          const r = await axios.delete("/tasks/" + id);
          show(r.data);
          renderTasks();
        } catch (err) {
          show("Error: " + (err.response?.data || err.message));
        }
      })
    );
    document.querySelectorAll(".btn-edit").forEach((b) =>
      b.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const title = prompt("New title");
        const description = prompt("New description");
        const completed = confirm("Mark as completed?");
        try {
          const r = await axios.put("/tasks/" + id, {
            title,
            description,
            completed,
          });
          show(r.data);
          renderTasks();
        } catch (err) {
          show("Error: " + (err.response?.data || err.message));
        }
      })
    );
  } catch (err) {
    show("Error: " + (err.response?.data?.error || err.message));
  }
}

document
  .getElementById("btnListTasks")
  .addEventListener("click", () => renderTasks());

document.getElementById("btnCreateTask").addEventListener("click", async () => {
  const title = document.getElementById("t_title").value.trim();
  const description = document.getElementById("t_description").value.trim();
  if (!title || title.length < 3)
    return show("Title must be at least 3 characters");
  try {
    const res = await axios.post("/tasks", { title, description });
    show(res.data);
    renderTasks();
  } catch (err) {
    show("Error: " + (err.response?.data || err.message));
  }
});
