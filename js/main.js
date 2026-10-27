/**
 * Blogify - main.js
 * Common shared utility functions, data initialization, navigation, and notification helpers.
 * Fully integrated with backend REST API and authentication session management.
 */

// Key constants for LocalStorage
const STORAGE_KEYS = {
  USERS: 'blogify_users',
  CURRENT_USER: 'blogify_current_user',
  JWT_TOKEN: 'blogify_jwt_token',
  POSTS: 'blogify_posts',
  INITIALIZED: 'blogify_initialized_v1'
};

// Default Sample Posts for immediate rich presentation and fallback preview
const DEFAULT_POSTS = [
  {
    id: 'post_101',
    title: 'Mastering Modern Frontend Architecture in 2026',
    slug: 'mastering-modern-frontend-architecture',
    category: 'Engineering',
    excerpt: 'Explore the modern landscape of component architectures, state management patterns, and performant web APIs that every frontend engineer must know.',
    content: 'Frontend engineering has evolved significantly. From modular vanilla design systems to high-performance micro-frontends, building maintainable and lightning-fast user interfaces requires a solid grasp of browser internals, asynchronous rendering, and clean separation of concerns. In this post, we break down foundational patterns and practical tips to level up your UI code.',
    author: 'Alex Johnson',
    authorEmail: 'alex@example.com',
    date: 'Oct 24, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    status: 'published'
  },
  {
    id: 'post_102',
    title: 'Designing Accessible User Interfaces: A Practical Guide',
    slug: 'designing-accessible-user-interfaces',
    category: 'Design',
    excerpt: 'Accessibility is not an afterthought. Learn practical methods to implement semantic HTML, contrast ratios, and keyboard navigation seamlessly.',
    content: 'Building inclusive digital experiences is essential. Every user deserves equal access to information and interactivity. This guide covers WCAG 2.2 standards, how to test with screen readers, managing focus states properly, and styling accessible custom form components without sacrificing beauty.',
    author: 'Sarah Chen',
    authorEmail: 'sarah@example.com',
    date: 'Oct 22, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    status: 'published'
  },
  {
    id: 'post_103',
    title: '10 Vanilla JavaScript Tips Every Developer Needs',
    slug: 'vanilla-javascript-tips-tricks',
    category: 'JavaScript',
    excerpt: 'Boost your daily productivity with powerful modern JavaScript techniques: destructuring, optional chaining, DOM manipulation, and LocalStorage tricks.',
    content: 'Before jumping into heavy frameworks, deeply understanding core JavaScript is the superpower of exceptional web developers. Discover how to leverage event delegation, clean array transformations, async/await with resilient error handling, and robust browser storage patterns.',
    author: 'Alex Johnson',
    authorEmail: 'alex@example.com',
    date: 'Oct 19, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1579468118864-ddb62140e417?auto=format&fit=crop&w=800&q=80',
    status: 'published'
  },
  {
    id: 'post_104',
    title: 'The Future of AI-Powered Developer Tools',
    slug: 'future-of-ai-powered-developer-tools',
    category: 'Technology',
    excerpt: 'An in-depth perspective on how generative AI models and intelligent agents are fundamentally reshaping the day-to-day workflow of software engineers.',
    content: 'Developer tooling is undergoing a once-in-a-generation shift. From intelligent code completion to automated end-to-end testing agents, the collaboration between human engineering intuition and AI speed is unlocking unprecedented creative output.',
    author: 'Elena Gomez',
    authorEmail: 'elena@example.com',
    date: 'Oct 15, 2026',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    status: 'published'
  },
  {
    id: 'post_105',
    title: 'Building Resilient CSS Layouts with Flexbox & Grid',
    slug: 'building-resilient-css-layouts',
    category: 'Design',
    excerpt: 'Stop wrestling with broken wrappers. Understand the true synergy between CSS Grid and Flexbox for responsive, device-agnostic screen layouts.',
    content: 'CSS Grid and Flexbox are not competitors; they are complementary superpowers. Grid governs page-level two-dimensional layouts, while Flexbox shines for one-dimensional inline components and micro-alignments. Here is a definitive playbook.',
    author: 'Sarah Chen',
    authorEmail: 'sarah@example.com',
    date: 'Oct 12, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    status: 'published'
  },
  {
    id: 'post_106',
    title: 'Upcoming Trends in Web Performance Optimization (Draft)',
    slug: 'upcoming-trends-in-web-performance',
    category: 'Engineering',
    excerpt: 'Notes and benchmarks exploring Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and responsive asset delivery strategies.',
    content: 'Core Web Vitals continue to dictate ranking and user retention. Exploring image compression formats like AVIF, resource hints, and minimal script bundles.',
    author: 'Alex Johnson',
    authorEmail: 'alex@example.com',
    date: 'Oct 26, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    status: 'draft'
  }
];

// Default Demo User
const DEFAULT_USERS = [
  {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'Password123'
  }
];

/**
 * Initialize default LocalStorage state if not already populated
 */
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

/**
 * Retrieve current logged-in user or null
 */
function getCurrentUser() {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Retrieve all blog posts from LocalStorage (Fallback / Offline support)
 */
function getStoredPosts() {
  const postsJson = localStorage.getItem(STORAGE_KEYS.POSTS);
  try {
    return postsJson ? JSON.parse(postsJson) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save array of blog posts to LocalStorage
 */
function saveStoredPosts(posts) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

/**
 * Global Toast Notification
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Update Header Navigation based on authentication state
 */
async function setupGlobalNav() {
  let user = getCurrentUser();
  const navActionsContainer = document.getElementById('navAuthActions');
  const navMobileToggle = document.getElementById('navToggleBtn');
  const navMenu = document.getElementById('navLinksMenu');

  // Mobile drawer toggle
  if (navMobileToggle && navMenu) {
    navMobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // Proactively verify token with backend /api/auth/me to keep user profile fresh
  const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  if (token) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        user = data.user;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else if (res.status === 401) {
        // Token expired or invalid on server - clear stale token
        console.warn('Authentication token expired or invalid.');
        if (typeof clearAuthSession === 'function') {
          clearAuthSession();
        } else {
          localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
        user = null;
      }
    } catch (err) {
      // Backend offline: keep existing cached user session
    }
  }

  // Update Auth buttons or user menu pill
  if (navActionsContainer) {
    if (user) {
      navActionsContainer.innerHTML = '';
      
      const userPill = document.createElement('a');
      userPill.href = 'dashboard.html';
      userPill.className = 'user-menu-pill';
      userPill.title = 'Go to Dashboard';
      
      const avatar = document.createElement('span');
      avatar.className = 'user-avatar-sm';
      avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = user.name ? user.name.split(' ')[0] : 'User';
      
      userPill.appendChild(avatar);
      userPill.appendChild(nameSpan);

      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'navLogoutBtn';
      logoutBtn.className = 'btn btn-outline btn-sm';
      logoutBtn.type = 'button';
      logoutBtn.textContent = 'Logout';

      logoutBtn.addEventListener('click', () => {
        if (typeof clearAuthSession === 'function') {
          clearAuthSession();
        } else {
          localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 600);
      });

      navActionsContainer.appendChild(userPill);
      navActionsContainer.appendChild(logoutBtn);
    } else {
      navActionsContainer.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
      `;
    }
  }
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  setupGlobalNav();
});

/**
 * --------------------------------------------------------------------------
 * Global Shared Form Validation & Alert Banner Helpers
 * Available across all pages (auth, blog editor, dashboard)
 * --------------------------------------------------------------------------
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(inputElement, message) {
  if (!inputElement) return;
  inputElement.classList.add('input-error');
  inputElement.classList.remove('input-success');
  const parent = inputElement.parentElement;
  if (parent) {
    const errorElem = parent.querySelector('.form-error-msg');
    if (errorElem) {
      errorElem.textContent = message;
      errorElem.classList.add('visible');
    }
  }
}

function clearFieldError(inputElement) {
  if (!inputElement) return;
  inputElement.classList.remove('input-error');
  inputElement.classList.add('input-success');
  const parent = inputElement.parentElement;
  if (parent) {
    const errorElem = parent.querySelector('.form-error-msg');
    if (errorElem) {
      errorElem.textContent = '';
      errorElem.classList.remove('visible');
    }
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

