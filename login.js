const loginSchema = {
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
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const toast = document.getElementById('toast'); 

const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'; // Default placeholder

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const usernameFromSignup = urlParams.get('username');
  
  if (usernameFromSignup && usernameInput) {
    usernameInput.value = decodeURIComponent(usernameFromSignup);
    passwordInput?.focus(); 
  }
});

function validateForm() {
  let isValid = true;
  
  if (usernameInput.value.length < loginSchema.username.minLength) {
    usernameError.textContent = loginSchema.username.errorMessage;
    isValid = false;
  } else {
    usernameError.textContent = '';
  }
  
  if (passwordInput.value.length < loginSchema.password.minLength) {
    passwordError.textContent = loginSchema.password.errorMessage;
    isValid = false;
  } else {
    passwordError.textContent = '';
  }
  
  return isValid;
}

function showLoginToast(title, description, type = 'success') {
  
  if (toast) {
    toast.innerHTML = `
      <div>
        <p style="font-weight: bold; margin-bottom: 5px;">${title}</p>
        <p>${description}</p>
      </div>
    `;
   
    toast.className = `toast show toast-${type}`; 
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  } else {
    
    alert(`${title}: ${description}`);
  }
}


async function mockLogin(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let loggedInUser = null;

      
      if (username === 'demo' && password === 'password123') {
        loggedInUser = {
          username: 'demo',
          avatarUrl: DEFAULT_AVATAR_URL 
        };
      }
      
      // Check against stored user data from signup 
      if (!loggedInUser) {
        const storedUserDataString = localStorage.getItem('tempUserData');
        if (storedUserDataString) {
          try {
            const storedUserData = JSON.parse(storedUserDataString);
            if (storedUserData.username === username && storedUserData.password === password) {
              loggedInUser = {
                username: storedUserData.username,
               
                avatarUrl: storedUserData.avatarUrl || DEFAULT_AVATAR_URL 
              };
            }
          } catch (e) {
            console.error("Error parsing tempUserData from localStorage", e);
          }
        }
      }
      
      if (loggedInUser) {
        resolve(loggedInUser); // Resolve with user details
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 1000);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    submitBtn.disabled = true;
    if(spinner) spinner.style.display = 'inline-block';
    if(btnText) btnText.textContent = 'Logging in...';
    
    try {
      const userDetails = await mockLogin(usernameInput.value, passwordInput.value);
      
      // Store user session for dashboard.js to pick up
      localStorage.setItem('eventlog_session', JSON.stringify({ user: userDetails }));
      
      showLoginToast('Login Successful', 'Redirecting to dashboard...', 'success');
      
      localStorage.removeItem('tempUserData'); // Clear temp data
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
      
    } catch (error) {
      showLoginToast('Login Failed', error.message, 'destructive');
    } finally {
      submitBtn.disabled = false;
      if(spinner) spinner.style.display = 'none';
      if(btnText) btnText.textContent = 'Login';
    }
  });
}

// Add blur listeners if inputs exist
usernameInput?.addEventListener('blur', validateForm);
passwordInput?.addEventListener('blur', validateForm);
