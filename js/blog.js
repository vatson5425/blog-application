/**
 * Blogify - blog.js
 * Handles Homepage listing, Search filtering, Category filtering, and Create/Edit Blog forms.
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

  function renderCards() {
    const allPosts = getStoredPosts();
    // Only show published blogs on the public homepage
    const publishedPosts = allPosts.filter(p => p.status === 'published');

    const filtered = publishedPosts.filter(post => {
      const matchesCategory = activeCategory === 'all' || 
        post.category.toLowerCase() === activeCategory.toLowerCase();

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'}`;
    }

    if (filtered.length === 0) {
      blogGrid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    blogGrid.innerHTML = filtered.map(post => {
      const safeImg = post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
      const initial = post.author ? post.author.charAt(0).toUpperCase() : 'B';

      return `
        <article class="blog-card" id="card-${post.id}">
          <div class="card-img-wrap">
            <img src="${safeImg}" alt="${escapeHtml(post.title)}" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'">
            <span class="card-badge">${escapeHtml(post.category)}</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span>${escapeHtml(post.date || 'Recent')}</span>
              <span class="meta-dot"></span>
              <span>${escapeHtml(post.readTime || '4 min read')}</span>
            </div>
            <h3 class="card-title">${escapeHtml(post.title)}</h3>
            <p class="card-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="card-footer">
              <div class="author-info">
                <div class="author-avatar">${initial}</div>
                <span class="author-name">${escapeHtml(post.author || 'Anonymous')}</span>
              </div>
              <button class="btn btn-secondary btn-sm read-article-btn" data-id="${post.id}">
                Read Post &rarr;
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listener for modal reader
    attachCardModalListeners(filtered);
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderCards();
    });
  }

  // Filter category buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderCards();
    });
  });

  // Initial render
  renderCards();
}

/**
 * Handle Article Quick Reader Modal on Home Page
 */
function attachCardModalListeners(posts) {
  const modal = document.getElementById('blogViewModal');
  if (!modal) return;

  const modalTitle = document.getElementById('modalBlogTitle');
  const modalMeta = document.getElementById('modalBlogMeta');
  const modalImg = document.getElementById('modalBlogImg');
  const modalContent = document.getElementById('modalBlogContent');
  const closeModalBtn = document.getElementById('modalCloseBtn');

  document.querySelectorAll('.read-article-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-id');
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (modalTitle) modalTitle.textContent = post.title;
      if (modalMeta) {
        modalMeta.textContent = `By ${post.author} • ${post.category} • ${post.date}`;
      }
      if (modalImg) {
        modalImg.src = post.imageUrl || '';
        modalImg.alt = post.title;
      }
      if (modalContent) {
        modalContent.textContent = post.content || post.excerpt;
      }

      modal.classList.add('active');
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

/**
 * --------------------------------------------------------------------------
 * Create & Edit Blog Page Handler (create-blog.html)
 * --------------------------------------------------------------------------
 */
function setupBlogEditor() {
  const editorForm = document.getElementById('blogEditorForm');
  if (!editorForm) return; // Not on create-blog.html

  // Auth Guard: User must be signed in to access Create / Edit Blog
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to create or edit blogs', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
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

  // Check URL params for edit mode: ?id=post_101
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get('id');
  const allPosts = getStoredPosts();
  let currentEditingPost = null;

  if (editPostId) {
    currentEditingPost = allPosts.find(p => p.id === editPostId);
    if (currentEditingPost) {
      if (pageHeading) pageHeading.textContent = 'Edit Blog Post';
      titleInput.value = currentEditingPost.title || '';
      categorySelect.value = currentEditingPost.category || 'Technology';
      excerptInput.value = currentEditingPost.excerpt || '';
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

  // Handler to persist blog post
  function savePost(forcedStatus = null) {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const excerpt = excerptInput.value.trim();
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

    if (!excerpt) {
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

    const posts = getStoredPosts();
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (currentEditingPost) {
      // Update existing post
      const index = posts.findIndex(p => p.id === currentEditingPost.id);
      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          title,
          category,
          excerpt,
          content,
          imageUrl,
          status,
          date: currentDate
        };
      }
      saveStoredPosts(posts);
      showToast('Blog post updated successfully!', 'success');
    } else {
      // Create brand new post
      const newPost = {
        id: 'post_' + Date.now(),
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category,
        excerpt,
        content,
        author: currentUser.name,
        authorEmail: currentUser.email,
        date: currentDate,
        readTime: `${Math.max(1, Math.round(content.split(/\s+/).length / 180))} min read`,
        imageUrl,
        status
      };
      posts.unshift(newPost);
      saveStoredPosts(posts);
      showToast('Blog post saved successfully!', 'success');
    }

    showAlert(alertBanner, `Post saved as "${status}". Redirecting to dashboard...`, 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  }

  // Buttons triggers
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
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
