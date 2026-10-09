const authScreen = document.getElementById('authScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const formEyebrow = document.getElementById('formEyebrow');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
let toastTimer;
let activityPage = 0;
let notificationIndex = 2;
let currentEmail = '';
let loggedExpenses = [];
const dashboardNotifications = [
  'Unable to load dashboard data. Please check your connection and try again.',
  'Welcome! Start by logging your first expense or income.',
  'You have pending roommate bills to settle.'
];

const activityPages = [
  [
    ['⌂', 'Home supplies', 'Today, 10:42 AM', '-₱42.50', 'coral'],
    ['↗', 'Monthly salary', 'Yesterday, 9:00 AM', '+₱2,700.00', 'mint income'],
    ['✦', 'Morning coffee', 'Yesterday, 8:15 AM', '-₱5.20', 'yellow']
  ],
  [
    ['▣', 'Internet bill', 'Oct 06, 2:30 PM', '-₱65.00', 'coral'],
    ['↗', 'Freelance payment', 'Oct 05, 11:20 AM', '+₱450.00', 'mint income'],
    ['●', 'Grocery run', 'Oct 04, 5:45 PM', '-₱84.20', 'yellow']
  ]
];

const defaultAccounts = { 'johndoe@email.com': '12345678' };
const demoEmail = 'johndoe@email.com';
const getAccounts = () => ({ ...defaultAccounts, ...JSON.parse(localStorage.getItem('pocketMoneyAccounts') || '{}') });
const moneyFormat = (amount) => `₱${amount.toFixed(2)}`;
const isDemoUser = () => currentEmail === demoEmail;
const getExpenseKey = () => `pocketMoneyExpenses:${currentEmail}`;
const getLoggedExpenses = () => JSON.parse(localStorage.getItem(getExpenseKey()) || '[]');
const getTagValues = (form) => ['bills', 'food', 'transportation', 'entertainment', 'school', 'emergency'].map((name) => Number(form.elements[name].value));
const getTotalExpense = (values) => values.reduce((total, value) => total + value, 0);
const showToast = (message) => {
  toastMessage.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
};
const setMode = (mode) => {
  const signup = mode === 'signup';
  loginForm.classList.toggle('hidden', signup);
  signupForm.classList.toggle('hidden', !signup);
  formEyebrow.textContent = signup ? 'START FRESH' : 'WELCOME BACK';
  formTitle.innerHTML = signup ? 'Make money<br><em>feel simpler.</em>' : 'Your money,<br><em>in focus.</em>';
  formSubtitle.textContent = signup ? 'Create your free account in a few seconds.' : 'Sign in to pick up where you left off.';
};
const showDashboard = (email) => {
  currentEmail = email;
  loggedExpenses = getLoggedExpenses();
  const name = email.split('@')[0].split(/[._-]/)[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById('userName').textContent = displayName;
  document.getElementById('userAvatar').textContent = email.slice(0, 2).toUpperCase();
  authScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  activityPage = 0;
  renderActivityPage();
  updateExpenseSummary();
  notificationIndex = 2;
  showToast('You have pending roommate bills to settle.');
};

const renderActivityPage = () => {
  const activityList = document.getElementById('activityList');
  const customActivity = loggedExpenses.flatMap((expense) => Object.entries(expense.tags).filter(([, amount]) => amount > 0).map(([tag, amount]) => ['+', tag.charAt(0).toUpperCase() + tag.slice(1), `${expense.period} log`, `-${moneyFormat(amount)}`, 'coral']));
  const activities = [...customActivity, ...(isDemoUser() ? activityPages.flat() : [])];
  const pageCount = Math.max(1, Math.ceil(activities.length / 3));
  activityPage = Math.min(activityPage, pageCount - 1);
  activityList.innerHTML = activities.slice(activityPage * 3, activityPage * 3 + 3).map(([icon, title, date, amount, style]) => `<div class="activity-row"><span class="activity-icon ${style.split(' ')[0]}">${icon}</span><div><strong>${title}</strong><small>${date}</small></div><b class="${style.includes('income') ? 'income' : ''}">${amount}</b></div>`).join('');
  document.getElementById('previousPage').disabled = activityPage === 0;
  document.getElementById('nextPage').disabled = activityPage === pageCount - 1;
  document.getElementById('pageIndicator').textContent = `Page ${activityPage + 1} of ${pageCount}`;
};

const updateExpenseSummary = () => {
  const total = loggedExpenses.reduce((sum, expense) => sum + expense.total, 0);
  const demoValues = isDemoUser();
  document.getElementById('totalExpenses').textContent = moneyFormat((demoValues ? 1234.56 : 0) + total);
  document.getElementById('totalIncome').textContent = moneyFormat(demoValues ? 3715.36 : 0);
  document.getElementById('remainingAllowance').textContent = moneyFormat(demoValues ? 2480.80 : 0);
  document.getElementById('pendingBills').textContent = moneyFormat(demoValues ? 120 : 0);
};

const expenseModal = document.getElementById('expenseModal');
const expenseForm = document.getElementById('expenseForm');
const expenseTotal = document.getElementById('expenseTotal');
const updateExpenseTotal = () => {
  expenseTotal.textContent = moneyFormat(getTotalExpense(getTagValues(expenseForm)));
};
const closeExpenseModal = () => {
  expenseModal.classList.add('hidden');
  expenseForm.reset();
  updateExpenseTotal();
};

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value;
  if (!email || !password) return showToast('Email and password are required.');
  if (!getAccounts()[email] || getAccounts()[email] !== password) return showToast('Invalid email or password.');
  showDashboard(email);
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = signupForm.email.value.trim().toLowerCase();
  const password = signupForm.password.value;
  const confirmPassword = signupForm.confirmPassword.value;
  if (!email || !password || !confirmPassword) return showToast('Email and password are required.');
  if (!signupForm.email.validity.valid) return showToast('Please enter a valid email.');
  if (password !== confirmPassword) return showToast('Passwords do not match.');
  if (password.length < 8) return showToast('Password must be at least 8 characters.');
  const accounts = getAccounts();
  accounts[email] = password;
  localStorage.setItem('pocketMoneyAccounts', JSON.stringify(accounts));
  if (email !== demoEmail) localStorage.setItem(`pocketMoneyExpenses:${email}`, '[]');
  signupForm.reset();
  setMode('login');
  showToast('Account created. You can now log in.');
});

document.getElementById('showSignup').addEventListener('click', () => setMode('signup'));
document.getElementById('showLogin').addEventListener('click', () => setMode('login'));
document.getElementById('quickExpense').addEventListener('click', () => {
  expenseModal.classList.remove('hidden');
  document.getElementById('totalMoney').focus();
});
document.getElementById('closeExpense').addEventListener('click', closeExpenseModal);
document.getElementById('cancelExpense').addEventListener('click', closeExpenseModal);
expenseForm.addEventListener('input', updateExpenseTotal);
expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const money = Number(expenseForm.elements.money.value);
  const values = getTagValues(expenseForm);
  const total = getTotalExpense(values);
  if (money < 0) return showToast('Expense amount cannot be negative.');
  if (values.some((value) => value < 0)) return showToast('Tag values cannot be negative.');
  if (!Number.isFinite(money) || money === 0) return showToast('Total money is required.');
  if (total > money) return showToast('Warning: You have exceeded your daily limit!');
  const names = ['bills', 'food', 'transportation', 'entertainment', 'school', 'emergency'];
  const tags = Object.fromEntries(names.map((name, index) => [name, values[index]]));
  loggedExpenses.unshift({ period: expenseForm.elements.period.value, money, total, tags });
  localStorage.setItem(getExpenseKey(), JSON.stringify(loggedExpenses));
  activityPage = 0;
  renderActivityPage();
  updateExpenseSummary();
  closeExpenseModal();
  showToast('Expense logged successfully.');
});
document.getElementById('quickIncome').addEventListener('click', () => showToast('Income tracker screen is ready.'));
document.getElementById('viewReports').addEventListener('click', () => showToast('Reports are being prepared for this cycle.'));
document.getElementById('notificationButton').addEventListener('click', () => {
  notificationIndex = (notificationIndex + 1) % dashboardNotifications.length;
  showToast(dashboardNotifications[notificationIndex]);
});
document.getElementById('previousPage').addEventListener('click', () => { if (activityPage > 0) { activityPage -= 1; renderActivityPage(); } });
document.getElementById('nextPage').addEventListener('click', () => { if (!document.getElementById('nextPage').disabled) { activityPage += 1; renderActivityPage(); } });
document.getElementById('logoutButton').addEventListener('click', () => {
  dashboardScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  loginForm.reset();
  setMode('login');
});
document.querySelectorAll('.password-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const field = document.getElementById(button.dataset.target);
    const isPassword = field.type === 'password';
    field.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
    button.setAttribute('aria-label', `${isPassword ? 'Hide' : 'Show'} password`);
  });
});
