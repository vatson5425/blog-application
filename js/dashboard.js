/**
 * Blogify - dashboard.js
 * User authentication protection, statistics calculation, dynamic table rendering,
 * and post deletion with confirmation modal.
 * Fully integrated with Backend REST APIs (GET /api/blogs/my, DELETE /api/blogs/:id, GET /api/auth/me).
 */

document.addEventListener('DOMContentLoaded', () => {
  setupDashboard();
});

async function setupDashboard() {
  const dashboardContainer = document.getElementById('dashboardView');
  if (!dashboardContainer) return; // Not on dashboard.html

  // 1. Auth Guard: Ensure token exists
  const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  let currentUser = getCurrentUser();

  if (!token) {
    showToast('Please login to access the creator dashboard', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
    return;
  }

  // 2. Fetch fresh user profile from backend (GET /api/auth/me)
  try {
    const profileRes = await AuthAPI.getMe();
    if (profileRes && profileRes.user) {
      currentUser = profileRes.user;
      setAuthSession(token, currentUser);
    }
  } catch (authError) {
    console.error('Failed to authenticate session:', authError);
    if (authError.status === 401) {
      if (typeof clearAuthSession === 'function') clearAuthSession();
      showToast('Session expired or invalid. Please log in again.', 'danger');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
      return;
    }
    // Network or other error - notify user
    const notice = document.getElementById('profileErrorNotice');
    if (notice) {
      notice.style.display = 'block';
      notice.textContent = `Unable to verify session with backend: ${authError.message}`;
    }
  }

  // 3. Render Profile Card & Header
  renderProfileSection(currentUser);

  // 4. Bind Hero Logout Button
  const heroLogoutBtn = document.getElementById('dashboardHeroLogoutBtn');
  if (heroLogoutBtn) {
    heroLogoutBtn.addEventListener('click', () => {
      performLogout();
    });
  }

  // 5. Render Stats & Post List
  await renderDashboardContent(currentUser);

  // 6. Setup Delete Confirmation Modal
  setupDeleteModal();
}

/**
 * Render user profile card in dashboard
 */
function renderProfileSection(user) {
  if (!user) return;
  const userNameElem = document.getElementById('dashUserName');
  const userGreetingElem = document.getElementById('dashGreetingName');
  const profileNameElem = document.getElementById('profileName');
  const profileEmailElem = document.getElementById('profileEmail');
  const profileAvatarElem = document.getElementById('profileAvatar');
  const profileMemberSince = document.getElementById('profileMemberSince');

  const displayName = user.name || 'Author';
  const displayEmail = user.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  if (userNameElem) userNameElem.textContent = displayName;
  if (userGreetingElem) userGreetingElem.textContent = displayName.split(' ')[0];
  if (profileNameElem) profileNameElem.textContent = displayName;
  if (profileEmailElem) profileEmailElem.textContent = displayEmail;
  if (profileAvatarElem) profileAvatarElem.textContent = initial;
  if (profileMemberSince && user.createdAt) {
    profileMemberSince.textContent = new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  }
}

/**
 * Centralized Logout Handler
 */
function performLogout() {
  if (typeof clearAuthSession === 'function') {
    clearAuthSession();
  } else {
    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 600);
}

/**
 * Render blog statistics and user-specific posts table
 */
async function renderDashboardContent(user) {
  const tableBody = document.getElementById('dashboardPostsTableBody');
  const emptyState = document.getElementById('dashboardEmptyState');

  if (!tableBody) return;

  // Loading state
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
        Loading your articles from server...
      </td>
    </tr>
  `;

  let userPosts = [];

  try {
    // 1. Fetch user articles from Backend REST API (GET /api/blogs/my)
    const res = await BlogAPI.getMyBlogs();
    userPosts = res.blogs || [];
  } catch (error) {
    console.error('Failed to retrieve user blogs:', error);
    if (error.status === 401) {
      if (typeof clearAuthSession === 'function') clearAuthSession();
      showToast('Session expired. Please log in again.', 'danger');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
      return;
    }
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--danger);">
          Failed to load your articles from server: ${escapeHtml(error.message)}
        </td>
      </tr>
    `;
    return;
  }

  // Statistics calculation
  const totalPosts = userPosts.length;
  const publishedPosts = userPosts.filter(p => p.status === 'published').length;
  const draftPosts = userPosts.filter(p => p.status === 'draft').length;

  const totalElem = document.getElementById('statTotalPosts');
  const pubElem = document.getElementById('statPublishedPosts');
  const draftElem = document.getElementById('statDraftPosts');

  if (totalElem) totalElem.textContent = totalPosts;
  if (pubElem) pubElem.textContent = publishedPosts;
  if (draftElem) draftElem.textContent = draftPosts;

  const filterCountAll = document.getElementById('dashFilterCountAll');
  const filterCountPub = document.getElementById('dashFilterCountPub');
  const filterCountDraft = document.getElementById('dashFilterCountDraft');
  if (filterCountAll) filterCountAll.textContent = totalPosts;
  if (filterCountPub) filterCountPub.textContent = publishedPosts;
  if (filterCountDraft) filterCountDraft.textContent = draftPosts;

  // Render Table based on active status filter
  let currentStatusFilter = 'all';

  function renderTableRows() {
    const filtered = userPosts.filter(p => {
      if (currentStatusFilter === 'all') return true;
      return p.status === currentStatusFilter;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        const emptyTitle = emptyState.querySelector('.empty-state-title');
        const emptyDesc = emptyState.querySelector('.empty-state-desc');
        if (currentStatusFilter === 'draft') {
          if (emptyTitle) emptyTitle.textContent = 'No draft articles';
          if (emptyDesc) emptyDesc.textContent = 'You have no saved drafts. Click "Write a Post" and choose "Save as Draft" to keep drafts privately.';
        } else if (currentStatusFilter === 'published') {
          if (emptyTitle) emptyTitle.textContent = 'No published articles';
          if (emptyDesc) emptyDesc.textContent = 'You have not published any articles yet.';
        } else {
          if (emptyTitle) emptyTitle.textContent = 'No articles yet';
          if (emptyDesc) emptyDesc.textContent = "You haven't created any articles under this account yet. Click below to compose your first post!";
        }
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    tableBody.innerHTML = '';

    filtered.forEach((post, index) => {
      const postId = post._id || post.id;
      const isPublished = post.status === 'published';
      const statusClass = isPublished ? 'published' : 'draft';
      const statusLabel = isPublished ? 'Published' : 'Draft';
      const rawDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (post.date || 'Recent');

      const tr = document.createElement('tr');
      tr.id = `row-${postId}`;

      // Index column
      const tdIndex = document.createElement('td');
      const strongIndex = document.createElement('strong');
      strongIndex.textContent = `#${index + 1}`;
      tdIndex.appendChild(strongIndex);

      // Title column
      const tdTitle = document.createElement('td');
      const spanTitle = document.createElement('span');
      spanTitle.className = 'table-post-title';
      spanTitle.title = post.title || 'Untitled';
      spanTitle.textContent = post.title || 'Untitled';
      tdTitle.appendChild(spanTitle);

    // Category column
    const tdCategory = document.createElement('td');
    const badgeCategory = document.createElement('span');
    badgeCategory.className = 'card-badge';
    badgeCategory.style.position = 'static';
    badgeCategory.textContent = post.category || 'General';
    tdCategory.appendChild(badgeCategory);

    // Status column
    const tdStatus = document.createElement('td');
    const badgeStatus = document.createElement('span');
    badgeStatus.className = `status-badge ${statusClass}`;
    badgeStatus.textContent = statusLabel;
    tdStatus.appendChild(badgeStatus);

    // Date column
    const tdDate = document.createElement('td');
    tdDate.textContent = rawDate;

    // Actions column
    const tdActions = document.createElement('td');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'table-actions';

    const viewLink = document.createElement('a');
    viewLink.href = `blog-details.html?id=${postId}`;
    viewLink.className = 'btn btn-outline btn-sm';
    viewLink.title = 'View Post';
    viewLink.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      View
    `;

    const editLink = document.createElement('a');
    editLink.href = `create-blog.html?id=${postId}`;
    editLink.className = 'btn btn-secondary btn-sm';
    editLink.title = 'Edit Post';
    editLink.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Edit
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger btn-sm delete-post-btn';
    deleteBtn.setAttribute('data-id', postId);
    deleteBtn.setAttribute('data-title', post.title || 'Untitled');
    deleteBtn.title = 'Delete Post';
    deleteBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      Delete
    `;

    actionsDiv.appendChild(editLink);
    actionsDiv.appendChild(deleteBtn);
    tdActions.appendChild(actionsDiv);

    tr.appendChild(tdIndex);
    tr.appendChild(tdTitle);
    tr.appendChild(tdCategory);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDate);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
    });
  }

  // Hook up status filter tab clicks
  const statusFilterBtns = document.querySelectorAll('#dashboardStatusFilters .filter-btn');
  statusFilterBtns.forEach(btn => {
    btn.onclick = () => {
      statusFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatusFilter = btn.getAttribute('data-status');
      renderTableRows();
    };
  });

  // Initial table render
  renderTableRows();
}

/**
 * Handle confirmation modal before post deletion
 */
let targetDeleteId = null;

function setupDeleteModal() {
  const modal = document.getElementById('deleteConfirmModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const targetTitleElem = document.getElementById('deletePostTargetTitle');

  if (!modal || !confirmBtn) return;

  // Open modal via delegation
  document.body.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-post-btn');
    if (deleteBtn) {
      targetDeleteId = deleteBtn.getAttribute('data-id');
      const postTitle = deleteBtn.getAttribute('data-title');
      if (targetTitleElem) targetTitleElem.textContent = `"${postTitle}"`;
      modal.classList.add('active');
    }
  });

  // Cancel deletion
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      targetDeleteId = null;
    });
  }

  // Close modal when clicking outside box
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      targetDeleteId = null;
    }
  });

  // Confirm and execute deletion
  confirmBtn.addEventListener('click', async () => {
    if (!targetDeleteId) return;

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';

    try {
      // 1. Send DELETE request to Backend REST API (DELETE /api/blogs/:id)
      await BlogAPI.deleteBlog(targetDeleteId);
      showToast('Article deleted from server successfully', 'danger');
    } catch (error) {
      if (error.isNetworkError) {
        // Fallback delete locally
        let posts = getStoredPosts();
        posts = posts.filter(p => p.id !== targetDeleteId && p._id !== targetDeleteId);
        saveStoredPosts(posts);
        showToast('Article deleted locally (Server offline)', 'warning');
      } else {
        showToast(error.message || 'Failed to delete blog post', 'danger');
      }
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Yes, Delete Post';
      modal.classList.remove('active');

      const currentUser = getCurrentUser();
      renderDashboardContent(currentUser);
      targetDeleteId = null;
    }
  });
}
