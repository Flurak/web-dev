//----------------------------------------------
//                  Constants
//----------------------------------------------

const storageKey = "savedAccount";
const serverUrl = "http://localhost:5000/api";

const routes = {
  "/login": { templateId: "login" },
  "/dashboard": { templateId: "dashboard", init: refresh },
  "/credits": { templateId: "credits" },
  "/transaction": { templateId: "transaction" },
};

//----------------------------------------------
//                  Routing
//----------------------------------------------

function navigate(path) {
  window.history.pushState({}, path, path);
  updateRoute();
}

function updateRoute() {
  const path = window.location.pathname;
  const route = routes[path];

  if (!route) {
    return navigate("/dashboard");
  }

  const template = document.getElementById(route.templateId);
  const view = template.content.cloneNode(true);
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(view);

  if (typeof route.init === "function") {
    route.init();
  }
}
//----------------------------------------------
//                  Global State
//----------------------------------------------

let state = Object.freeze({
  account: null,
});

function updateState(property, newData) {
  state = Object.freeze({
    ...state,
    [property]: newData,
  });
}

//----------------------------------------------
//                  Login / Register
//----------------------------------------------

async function login() {
  const loginForm = document.getElementById("loginForm");
  const user = loginForm.user.value;
  const data = await getAccount(user);

  if (data.error) {
    return updateElement("loginError", data.error);
  }

  updateState("account", data);
  navigate("/dashboard");
}

async function register() {
  const registerForm = document.getElementById("registerForm");
  const formData = new FormData(registerForm);
  const jsonData = JSON.stringify(Object.fromEntries(formData));
  const result = await createAccount(jsonData);

  if (result.error) {
    return console.log("An error occurred:", result.error);
  }

  console.log("Account created!", result);

  updateState("account", result);
  navigate("/dashboard");
}
//----------------------------------------------
//                  Dashboard
//----------------------------------------------

async function updateAccountData() {
  const account = state.account;
  if (!account) {
    return logout();
  }

  const data = await getAccount(account.user);
  if (data.error) {
    return logout();
  }

  updateState("account", data);
}

async function refresh() {
  await updateAccountData();
  updateDashboard();
}

function updateDashboard() {
  const account = state.account;
  if (!account) {
    return logout();
  }

  updateElement("description", account.description);
  updateElement("balance", account.balance.toFixed(2));
  updateElement("currency", account.currency);
  const transactionsRows = document.createDocumentFragment();
  for (const transaction of account.transactions) {
    const transactionRow = createTransactionRow(transaction);
    transactionsRows.appendChild(transactionRow);
  }
  updateElement("transactions", transactionsRows);
}

function createTransactionRow(transaction) {
  const template = document.getElementById("transaction");
  const transactionRow = template.content.cloneNode(true);
  const tr = transactionRow.querySelector("tr");
  tr.children[0].textContent = transaction.date;
  tr.children[1].textContent = transaction.object;
  tr.children[2].textContent = transaction.amount.toFixed(2);
  return transactionRow;
}

function logout() {
  updateState("account", null);
  navigate("/login");

  localStorage.setItem(storageKey, JSON.stringify(state.account));
}
//----------------------------------------------
//                  Utilities
//----------------------------------------------

function updateElement(id, textOrNode) {
  const element = document.getElementById(id);
  element.textContent = ""; // Removes all children
  element.append(textOrNode);
}

function onLinkClick(event) {
  event.preventDefault();
  navigate(event.target.href);
}

//----------------------------------------------
//                  Api Interactions
//----------------------------------------------

async function sendRequest(api, method, body) {
  try {
    const response = await fetch(serverUrl + api, {
      method: method || "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    });
    return await response.json();
  } catch (error) {
    return { error: error.message || "Unknown error" };
  }
}

async function getAccount(user) {
  return sendRequest("/accounts/" + encodeURIComponent(user));
}

async function createAccount(account) {
  return sendRequest("/accounts", "POST", account);
}

async function createTransaction(user, transaction) {
  return sendRequest(
    "/accounts/" + user + "/transactions",
    "POST",
    transaction
  );
}

//-----------------------------
//        transaction dialog
//-----------------------------
function addTransaction() {
  const dialog = document.getElementById("transactionDialog");
  dialog.classList.add("show");

  // Reset form
  const transactionForm = document.getElementById("transactionForm");
  transactionForm.reset();

  // Set date to today
  transactionForm.date.valueAsDate = new Date();
}

async function confirmTransaction() {
  const dialog = document.getElementById("transactionDialog");
  dialog.classList.remove("show");

  const transactionForm = document.getElementById("transactionForm");

  const formData = new FormData(transactionForm);
  const jsonData = JSON.stringify(Object.fromEntries(formData));
  const data = await createTransaction(state.account.user, jsonData);

  if (data.error) {
    return updateElement("transactionError", data.error);
  }

  // Update local state with new transaction
  const newAccount = {
    ...state.account,
    balance: state.account.balance + data.amount,
    transactions: [...state.account.transactions, data],
  };
  updateState("account", newAccount);

  // Update display
  updateDashboard();
}

async function cancelTransaction() {
  const dialog = document.getElementById("transactionDialog");
  dialog.classList.remove("show");
}

//----------------------------------------------
//                  Initialize
//----------------------------------------------

function init() {
  const savedAccount = localStorage.getItem(storageKey);
  if (savedAccount) {
    updateState("account", JSON.parse(savedAccount));
  }

  window.onpopstate = () => updateRoute();
  updateRoute();
}

init();
