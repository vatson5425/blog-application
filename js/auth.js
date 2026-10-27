/**
 * Blogify - auth.js
 * Handles Login and Registration forms, validations, show/hide password, and LocalStorage state.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupRegisterForm();
  setupPasswordToggles();
});

/**
 * Handle Login Form Logic
 */
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('rememberMe');
  const alertBanner = document.getElementById('loginAlertBanner');

  // Check if credentials remembered
  const rememberedEmail = localStorage.getItem('blogify_remembered_email');
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBanner);

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Email validation
    if (!email) {
      showFieldError(emailInput, 'Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    // Password validation
    if (!password) {
      showFieldError(passwordInput, 'Password is required.');
      isValid = false;
    } else {
      clearFieldError(passwordInput);
    }

    if (!isValid) return;

    // Check credentials against registered users in LocalStorage
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersJson ? JSON.parse(usersJson) : [];

    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser || foundUser.password !== password) {
      showAlert(alertBanner, 'Invalid email or password. Please try again.', 'danger');
      return;
    }

    // Remember Me logic
    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem('blogify_remembered_email', email);
    } else {
      localStorage.removeItem('blogify_remembered_email');
    }

    // Save current session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
      name: foundUser.name,
      email: foundUser.email
    }));

    showAlert(alertBanner, 'Login successful! Redirecting to dashboard...', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
}

/**
 * Handle Register Form Logic
 */
function setupRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const passwordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');
  const alertBanner = document.getElementById('registerAlertBanner');

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(alertBanner);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    // Name check
    if (!name) {
      showFieldError(nameInput, 'Full name is required.');
      isValid = false;
    } else if (name.length < 2) {
      showFieldError(nameInput, 'Name must be at least 2 characters.');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    // Email check
    if (!email) {
      showFieldError(emailInput, 'Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email format.');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    // Password check
    if (!password) {
      showFieldError(passwordInput, 'Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      showFieldError(passwordInput, 'Password must be at least 6 characters long.');
      isValid = false;
    } else {
      clearFieldError(passwordInput);
    }

    // Confirm password check
    if (!confirmPassword) {
      showFieldError(confirmPasswordInput, 'Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      showFieldError(confirmPasswordInput, 'Passwords do not match.');
      isValid = false;
    } else {
      clearFieldError(confirmPasswordInput);
    }

    if (!isValid) return;

    // Check if user already exists
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersJson ? JSON.parse(usersJson) : [];

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      showAlert(alertBanner, 'An account with this email already exists. Please log in.', 'danger');
      return;
    }

    // Save new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Also sign them in immediately
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
      name: newUser.name,
      email: newUser.email
    }));

    showAlert(alertBanner, 'Account created successfully! Preparing your dashboard...', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  });
}

/**
 * Show / Hide password toggles
 */
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.setAttribute('aria-label', 'Hide password');
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>`;
      } else {
        input.type = 'password';
        btn.setAttribute('aria-label', 'Show password');
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>`;
      }
    });
  });
}

// Field validation helper methods
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(inputElement, message) {
  inputElement.classList.add('input-error');
  inputElement.classList.remove('input-success');
  const errorElem = inputElement.parentElement.querySelector('.form-error-msg');
  if (errorElem) {
    errorElem.textContent = message;
    errorElem.classList.add('visible');
  }
}

function clearFieldError(inputElement) {
  inputElement.classList.remove('input-error');
  inputElement.classList.add('input-success');
  const errorElem = inputElement.parentElement.querySelector('.form-error-msg');
  if (errorElem) {
    errorElem.textContent = '';
    errorElem.classList.remove('visible');
  }
}

function showAlert(bannerElement, message, type = 'danger') {
  if (!bannerElement) return;
  bannerElement.textContent = message;
  bannerElement.className = `alert-banner visible alert-${type}`;
}

function hideAlert(bannerElement) {
  if (!bannerElement) return;
  bannerElement.className = 'alert-banner';
  bannerElement.textContent = '';
}
