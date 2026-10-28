/**
 * Blogify - blog.js
 * Handles Homepage listing, Search filtering, Category filtering, and Create/Edit Blog forms.
 * Integrated with Backend REST APIs (GET /api/blogs, POST /api/blogs, PUT /api/blogs/:id, GET /api/blogs/:id).
 */

document.addEventListener('DOMContentLoaded', () => {
  setupBlogCatalog();
  setupBlogEditor();
});

/**
 * --------------------------------------------------------------------------
 * Home Page Blog Catalog (Search, Filter, Render)
 * --------------------------------------------------------------------------
 */
function setupBlogCatalog() {
  const blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return; // Not on the home page

  const searchInput = document.getElementById('blogSearchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const emptyState = document.getElementById('emptyBlogState');
  const resultsCount = document.getElementById('resultsCount');

  let activeCategory = 'all';
  let searchTerm = '';
  let debounceTimer = null;

  async function fetchAndRenderBlogs() {
    // Show loading state
    blogGrid.innerHTML = `
      <div id="blogLoadingSpinner" style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
        <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid var(--border-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 1rem; font-weight: 500; font-size: 0.95rem;">Loading articles from MongoDB Atlas...</p>
      </div>
    `;
    if (emptyState) emptyState.style.display = 'none';

    try {
      // Fetch from MongoDB Atlas Backend REST API (GET /api/blogs?search=...&category=...)
      const res = await BlogAPI.getPublishedBlogs(searchTerm, activeCategory);
      // Resilient response structure handling: supports res.blogs, res.data, res.posts, or raw array
      let posts = [];
      if (Array.isArray(res)) {
        posts = res;
      } else if (res && Array.isArray(res.blogs)) {
        posts = res.blogs;
      } else if (res && Array.isArray(res.data)) {
        posts = res.data;
      } else if (res && Array.isArray(res.posts)) {
        posts = res.posts;
      }
      renderCards(posts);
    } catch (error) {
      console.error('Failed to load published blogs from database:', error);
      blogGrid.innerHTML = `
        <div id="blogFetchError" style="grid-column: 1/-1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 580px; margin: 0 auto;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: var(--danger-bg); color: var(--danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Failed to Load Articles</h3>
          <p style="color: var(--text-secondary); font-size: 0.925rem; margin-bottom: 1.5rem; line-height: 1.6;">${escapeHtml(error.message || 'Unable to connect to the database. Please verify backend server and MongoDB status.')}</p>
          <button type="button" class="btn btn-primary btn-sm" id="retryFetchBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.35rem;">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Retry Connection
          </button>
        </div>
      `;
      const retryBtn = document.getElementById('retryFetchBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => fetchAndRenderBlogs());
      }
      if (resultsCount) resultsCount.textContent = 'Showing 0 articles';
    }
  }

  function renderCards(posts) {
    if (resultsCount) {
      resultsCount.textContent = `Showing ${posts.length} ${posts.length === 1 ? 'article' : 'articles'}`;
    }

    if (posts.length === 0) {
      blogGrid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    blogGrid.innerHTML = '';

    posts.forEach(post => {
      const postId = post._id || post.id;
      const title = post.title || 'Untitled';
      const category = post.category || 'General';
      const excerpt = post.description || post.excerpt || '';
      const authorName = post.author && typeof post.author === 'object' ? post.author.name : (post.author || 'Anonymous');
      const authorInitial = authorName.charAt(0).toUpperCase();
      const rawDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (post.date || 'Recent');
      const imageUrl = post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
      const readTime = post.readTime || `${Math.max(1, Math.round((post.content || '').split(/\s+/).length / 180))} min read`;

      const card = document.createElement('article');
      card.className = 'blog-card';
      card.id = `card-${postId}`;

      // 1. Image cover
      const imgWrap = document.createElement('div');
      imgWrap.className = 'card-img-wrap';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = title;
      img.className = 'card-img';
      img.loading = 'lazy';
      img.onerror = () => {
        img.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
      };

      const badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = category;

      imgWrap.appendChild(img);
      imgWrap.appendChild(badge);

      // 2. Body
      const body = document.createElement('div');
      body.className = 'card-body';

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML = `<span>${escapeHtml(rawDate)}</span><span class="meta-dot"></span><span>${escapeHtml(readTime)}</span>`;

      const titleEl = document.createElement('h3');
      titleEl.className = 'card-title';
      titleEl.textContent = title;

      const excerptEl = document.createElement('p');
      excerptEl.className = 'card-excerpt';
      excerptEl.textContent = excerpt;

      // 3. Footer
      const footer = document.createElement('div');
      footer.className = 'card-footer';

      const authorInfo = document.createElement('div');
      authorInfo.className = 'author-info';

      const avatar = document.createElement('div');
      avatar.className = 'author-avatar';
      avatar.textContent = authorInitial;

      const authorSpan = document.createElement('span');
      authorSpan.className = 'author-name';
      authorSpan.textContent = authorName;

      authorInfo.appendChild(avatar);
      authorInfo.appendChild(authorSpan);

      const readBtn = document.createElement('a');
      readBtn.className = 'btn btn-secondary btn-sm read-article-btn';
      readBtn.textContent = 'Read Post →';
      readBtn.href = `blog-details.html?id=${encodeURIComponent(postId)}`;
      readBtn.setAttribute('data-id', postId);

      footer.appendChild(authorInfo);
      footer.appendChild(readBtn);

      body.appendChild(meta);
      body.appendChild(titleEl);
      body.appendChild(excerptEl);
      body.appendChild(footer);

      card.appendChild(imgWrap);
      card.appendChild(body);

      // Make card clickable
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Prevent double trigger if clicking on an interactive link/button inside
        if (e.target.closest('a') || e.target.closest('button')) {
          return;
        }
        window.location.href = `blog-details.html?id=${encodeURIComponent(postId)}`;
      });

      blogGrid.appendChild(card);
    });
  }

  // Live search with debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      searchTerm = e.target.value.trim();
      debounceTimer = setTimeout(() => {
        fetchAndRenderBlogs();
      }, 300);
    });
  }

  // Category filter tabs
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      fetchAndRenderBlogs();
    });
  });

  // Initial load
  fetchAndRenderBlogs();
}

/**
 * Handle Article Quick Reader Modal on Home Page
 */
function openArticleModal(post) {
  const modal = document.getElementById('blogViewModal');
  if (!modal) return;

  const modalTitle = document.getElementById('modalBlogTitle');
  const modalMeta = document.getElementById('modalBlogMeta');
  const modalImg = document.getElementById('modalBlogImg');
  const modalContent = document.getElementById('modalBlogContent');
  const closeModalBtn = document.getElementById('modalCloseBtn');

  const authorName = post.author && typeof post.author === 'object' ? post.author.name : (post.author || 'Anonymous');
  const rawDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (post.date || 'Recent');

  if (modalTitle) modalTitle.textContent = post.title || 'Untitled';
  if (modalMeta) {
    modalMeta.textContent = `By ${authorName} • ${post.category || 'General'} • ${rawDate}`;
  }
  if (modalImg) {
    modalImg.src = post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    modalImg.alt = post.title || 'Article cover';
  }
  if (modalContent) {
    modalContent.textContent = post.content || post.description || post.excerpt || '';
  }

  modal.classList.add('active');

  if (closeModalBtn) {
    closeModalBtn.onclick = () => modal.classList.remove('active');
  }

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

/**
 * --------------------------------------------------------------------------
 * Create & Edit Blog Page Handler (create-blog.html)
 * --------------------------------------------------------------------------
 */
async function setupBlogEditor() {
  const editorForm = document.getElementById('blogEditorForm');
  if (!editorForm) return; // Not on create-blog.html

  // Auth Guard: User must be signed in to access Create / Edit Blog
  const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  let currentUser = getCurrentUser();

  if (!token && !currentUser) {
    showToast('Please login to create or edit blogs', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
    return;
  }

  // If token is present, ensure user profile is verified
  if (token && typeof AuthAPI !== 'undefined') {
    try {
      const meRes = await AuthAPI.getMe();
      if (meRes && meRes.user) {
        currentUser = meRes.user;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    } catch (authErr) {
      if (authErr.status === 401) {
        if (typeof clearAuthSession === 'function') clearAuthSession();
        showToast('Your session has expired. Please log in again.', 'danger');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
        return;
      }
    }
  }

  const titleInput = document.getElementById('postTitle');
  const categorySelect = document.getElementById('postCategory');
  const excerptInput = document.getElementById('postExcerpt');
  const contentInput = document.getElementById('postContent');
  const imgUrlInput = document.getElementById('postImageUrl');
  const statusSelect = document.getElementById('postStatus');
  const imgPreview = document.getElementById('imagePreview');
  const pageHeading = document.getElementById('editorPageHeading');
  const alertBanner = document.getElementById('editorAlertBanner');
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  const publishBtn = document.getElementById('publishBtn');

  // Check URL params for edit mode: ?id=xxx
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get('id');
  let currentEditingPost = null;

  if (editPostId) {
    try {
      // 1. Try fetching from Backend REST API (GET /api/blogs/:id)
      const res = await BlogAPI.getBlogById(editPostId);
      currentEditingPost = res.blog;
    } catch (e) {
      // 2. Fallback to LocalStorage
      const localPosts = getStoredPosts();
      currentEditingPost = localPosts.find(p => (p._id === editPostId || p.id === editPostId));
    }

    if (currentEditingPost) {
      if (pageHeading) pageHeading.textContent = 'Edit Blog Post';
      titleInput.value = currentEditingPost.title || '';
      categorySelect.value = currentEditingPost.category || 'Technology';
      excerptInput.value = currentEditingPost.description || currentEditingPost.excerpt || '';
      contentInput.value = currentEditingPost.content || '';
      imgUrlInput.value = currentEditingPost.imageUrl || '';
      statusSelect.value = currentEditingPost.status || 'published';

      if (currentEditingPost.imageUrl && imgPreview) {
        imgPreview.src = currentEditingPost.imageUrl;
        imgPreview.style.display = 'block';
        const placeholder = document.getElementById('imgPlaceholderText');
        if (placeholder) placeholder.style.display = 'none';
      }
    }
  }

  // Live image preview listener
  if (imgUrlInput && imgPreview) {
    imgUrlInput.addEventListener('input', () => {
      const url = imgUrlInput.value.trim();
      const placeholder = document.getElementById('imgPlaceholderText');
      if (url) {
        imgPreview.src = url;
        imgPreview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      } else {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
      }
    });
  }

  // Handler to persist blog post (Create or Update)
  async function savePost(forcedStatus = null) {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const description = excerptInput.value.trim();
    const content = contentInput.value.trim();
    const imageUrl = imgUrlInput.value.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    const status = forcedStatus || statusSelect.value;

    let hasErrors = false;

    if (!title) {
      showFieldError(titleInput, 'Blog title is required.');
      hasErrors = true;
    } else {
      clearFieldError(titleInput);
    }

    if (!description) {
      showFieldError(excerptInput, 'Please provide a short summary or excerpt.');
      hasErrors = true;
    } else {
      clearFieldError(excerptInput);
    }

    if (!content) {
      showFieldError(contentInput, 'Full blog content cannot be empty.');
      hasErrors = true;
    } else {
      clearFieldError(contentInput);
    }

    if (hasErrors) return;

    const blogPayload = {
      title,
      category,
      description,
      content,
      imageUrl,
      status
    };

    // Disable action buttons during submission
    if (publishBtn) publishBtn.disabled = true;
    if (saveDraftBtn) saveDraftBtn.disabled = true;

    try {
      if (editPostId) {
        // PUT /api/blogs/:id
        await BlogAPI.updateBlog(editPostId, blogPayload);
        showToast('Blog post updated successfully on server!', 'success');
      } else {
        // POST /api/blogs
        await BlogAPI.createBlog(blogPayload);
        showToast(`Blog post successfully ${status === 'draft' ? 'saved as draft' : 'published'}!`, 'success');
      }

      showAlert(alertBanner, `Post saved as "${status}". Redirecting to dashboard...`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      // Fallback: Save to LocalStorage if server offline
      if (error.isNetworkError) {
        console.warn('Backend server offline. Persisting post to local storage fallback...');
        const posts = getStoredPosts();
        const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (editPostId) {
          const index = posts.findIndex(p => p.id === editPostId || p._id === editPostId);
          if (index !== -1) {
            posts[index] = { ...posts[index], ...blogPayload, excerpt: description, date: currentDate };
          }
        } else {
          const author = getCurrentUser() || { name: 'Author', email: 'demo@example.com' };
          posts.unshift({
            id: 'post_' + Date.now(),
            ...blogPayload,
            excerpt: description,
            author: author.name,
            authorEmail: author.email,
            date: currentDate
          });
        }

        saveStoredPosts(posts);
        showToast(`Post saved to local storage (Server offline)`, 'warning');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
        return;
      }

      let displayMessage = error.message || 'Failed to save blog post.';
      if (error.status === 401) {
        displayMessage = 'Session expired or not authenticated. Please log in again.';
        if (typeof clearAuthSession === 'function') clearAuthSession();
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      }
      showAlert(alertBanner, displayMessage, 'danger');
      if (alertBanner) alertBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      if (publishBtn) publishBtn.disabled = false;
      if (saveDraftBtn) saveDraftBtn.disabled = false;
    }
  }

  // Button triggers
  if (publishBtn) {
    publishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      savePost('published');
    });
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      savePost('draft');
    });
  }

  editorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePost();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
