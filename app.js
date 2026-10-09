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
const dashboardNotifications = [
  'Unable to load dashboard data. Please check your connection and try again.',
  'Welcome! Start by logging your first expense or income.',
  'You have pending roommate bills to settle.'
];

const activityPages = [
  [
    ['⌂', 'Home supplies', 'Today, 10:42 AM', '-$42.50', 'coral'],
    ['↗', 'Monthly salary', 'Yesterday, 9:00 AM', '+$2,700.00', 'mint income'],
    ['✦', 'Morning coffee', 'Yesterday, 8:15 AM', '-$5.20', 'yellow']
  ],
  [
    ['▣', 'Internet bill', 'Oct 06, 2:30 PM', '-$65.00', 'coral'],
    ['↗', 'Freelance payment', 'Oct 05, 11:20 AM', '+$450.00', 'mint income'],
    ['●', 'Grocery run', 'Oct 04, 5:45 PM', '-$84.20', 'yellow']
  ]
];

const defaultAccounts = { 'johndoe@email.com': '12345678' };
const getAccounts = () => ({ ...defaultAccounts, ...JSON.parse(localStorage.getItem('pocketMoneyAccounts') || '{}') });
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
  const name = email.split('@')[0].split(/[._-]/)[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById('userName').textContent = displayName;
  document.getElementById('userAvatar').textContent = email.slice(0, 2).toUpperCase();
  authScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  activityPage = 0;
  renderActivityPage();
  notificationIndex = 2;
  showToast('You have pending roommate bills to settle.');
};

const renderActivityPage = () => {
  const activityList = document.getElementById('activityList');
  activityList.innerHTML = activityPages[activityPage].map(([icon, title, date, amount, style]) => `<div class="activity-row"><span class="activity-icon ${style.split(' ')[0]}">${icon}</span><div><strong>${title}</strong><small>${date}</small></div><b class="${style.includes('income') ? 'income' : ''}">${amount}</b></div>`).join('');
  document.getElementById('previousPage').disabled = activityPage === 0;
  document.getElementById('nextPage').disabled = activityPage === activityPages.length - 1;
  document.getElementById('pageIndicator').textContent = `Page ${activityPage + 1} of ${activityPages.length}`;
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
  signupForm.reset();
  setMode('login');
  showToast('Account created. You can now log in.');
});

document.getElementById('showSignup').addEventListener('click', () => setMode('signup'));
document.getElementById('showLogin').addEventListener('click', () => setMode('login'));
document.getElementById('quickExpense').addEventListener('click', () => showToast('Expense logging screen is ready.'));
document.getElementById('quickIncome').addEventListener('click', () => showToast('Income tracker screen is ready.'));
document.getElementById('viewReports').addEventListener('click', () => showToast('Reports are being prepared for this cycle.'));
document.getElementById('notificationButton').addEventListener('click', () => {
  notificationIndex = (notificationIndex + 1) % dashboardNotifications.length;
  showToast(dashboardNotifications[notificationIndex]);
});
document.getElementById('previousPage').addEventListener('click', () => { if (activityPage > 0) { activityPage -= 1; renderActivityPage(); } });
document.getElementById('nextPage').addEventListener('click', () => { if (activityPage < activityPages.length - 1) { activityPage += 1; renderActivityPage(); } });
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
