/**
 * Blogify - dashboard.js
 * User authentication protection, statistics calculation, dynamic table rendering,
 * and post deletion with confirmation modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupDashboard();
});

function setupDashboard() {
  const dashboardContainer = document.getElementById('dashboardView');
  if (!dashboardContainer) return; // Not on dashboard.html

  // 1. Auth Guard: Ensure user is logged in
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to access the creator dashboard', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
    return;
  }

  // 2. Personalize Header
  const userNameElem = document.getElementById('dashUserName');
  const userGreetingElem = document.getElementById('dashGreetingName');
  if (userNameElem) userNameElem.textContent = currentUser.name;
  if (userGreetingElem) userGreetingElem.textContent = currentUser.name;

  // 3. Render Stats & Post List
  renderDashboardContent(currentUser);

  // 4. Setup Delete Confirmation Modal
  setupDeleteModal();
}

/**
 * Render blog statistics and user-specific posts table
 */
function renderDashboardContent(user) {
  const posts = getStoredPosts();
  
  // Filter posts belonging to the logged-in user (or show all if admin/demo, but filter by email)
  const userPosts = posts.filter(p => !p.authorEmail || p.authorEmail.toLowerCase() === user.email.toLowerCase());

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

  // Table Body & Empty state
  const tableBody = document.getElementById('dashboardPostsTableBody');
  const emptyState = document.getElementById('dashboardEmptyState');

  if (!tableBody) return;

  if (userPosts.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = userPosts.map((post, index) => {
    const isPublished = post.status === 'published';
    const statusClass = isPublished ? 'published' : 'draft';
    const statusLabel = isPublished ? 'Published' : 'Draft';

    return `
      <tr id="row-${post.id}">
        <td><strong>#${index + 1}</strong></td>
        <td>
          <span class="table-post-title" title="${escapeHtml(post.title)}">
            ${escapeHtml(post.title)}
          </span>
        </td>
        <td><span class="card-badge" style="position:static;">${escapeHtml(post.category)}</span></td>
        <td>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </td>
        <td>${escapeHtml(post.date || 'Recent')}</td>
        <td>
          <div class="table-actions">
            <a href="create-blog.html?id=${post.id}" class="btn btn-secondary btn-sm" title="Edit Post">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </a>
            <button type="button" class="btn btn-danger btn-sm delete-post-btn" data-id="${post.id}" data-title="${escapeHtml(post.title)}" title="Delete Post">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
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
  confirmBtn.addEventListener('click', () => {
    if (!targetDeleteId) return;

    let posts = getStoredPosts();
    posts = posts.filter(p => p.id !== targetDeleteId);
    saveStoredPosts(posts);

    modal.classList.remove('active');
    showToast('Post removed successfully', 'danger');

    const currentUser = getCurrentUser();
    renderDashboardContent(currentUser);
    targetDeleteId = null;
  });
}
