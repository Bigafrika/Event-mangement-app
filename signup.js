// Form validation schema
const signupSchema = {
  username: {
    minLength: 3,
    errorMessage: 'Username must be at least 3 characters'
  },
  password: {
    minLength: 6,
    errorMessage: 'Password must be at least 6 characters'
  }
};

// DOM elements
const signupForm = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const toast = document.getElementById('toast');

// Form validation
function validateForm() {
  let isValid = true;
  
  // Validate username
  if (usernameInput.value.length < signupSchema.username.minLength) {
    usernameError.textContent = signupSchema.username.errorMessage;
    isValid = false;
  } else {
    usernameError.textContent = '';
  }
  
  // Validate password
  if (passwordInput.value.length < signupSchema.password.minLength) {
    passwordError.textContent = signupSchema.password.errorMessage;
    isValid = false;
  } else {
    passwordError.textContent = '';
  }
  
  // Validate password match
  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordError.textContent = "Passwords don't match";
    isValid = false;
  } else {
    confirmPasswordError.textContent = '';
  }
  
  return isValid;
}

// Show toast notification
function showToast(title, description, type = 'success') {
  toast.innerHTML = `
    <div>
      <p class="toast-title">${title}</p>
      <p class="toast-description">${description}</p>
    </div>
  `;
  toast.className = `toast show toast-${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Store user data in localStorage (for demo purposes)
function storeUserData(username, password) {
  const userData = {
    username: username,
    password: password,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('tempUserData', JSON.stringify(userData));
}

// Mock signup function
async function mockSignup(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username && password) {
        // Store the user data before resolving
        storeUserData(username, password);
        resolve();
      } else {
        reject(new Error('Signup failed. Please try again.'));
      }
    }, 1500);
  });
}

// Form submission
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Show loading state
  submitBtn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.textContent = 'Signing up...';
  
  try {
    await mockSignup(usernameInput.value, passwordInput.value);
    showToast('Sign Up Successful', 'Redirecting to login page...', 'success');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      // Pass the username as a URL parameter for auto-fill
      window.location.href = `login.html?username=${encodeURIComponent(usernameInput.value)}`;
    }, 2000);
    
  } catch (error) {
    showToast('Sign Up Failed', error.message, 'destructive');
  } finally {
    // Reset loading state
    submitBtn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = 'Sign Up';
  }
});

// Input validation on blur
usernameInput.addEventListener('blur', validateForm);
passwordInput.addEventListener('blur', validateForm);
confirmPasswordInput.addEventListener('blur', validateForm);

// Real-time password match validation
confirmPasswordInput.addEventListener('input', () => {
  if (passwordInput.value && confirmPasswordInput.value) {
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordError.textContent = "Passwords don't match";
    } else {
      confirmPasswordError.textContent = '';
    }
  }
});