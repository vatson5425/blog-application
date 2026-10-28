/**
 * Blogify - blog-details.js
 * Handles individual blog details page rendering:
 * - Reads blog ID from query parameters (?id=xxx)
 * - Retrieves selected blog from backend GET /api/blogs/:id
 * - Populates title, full content, author, category, publication date, and cover image safely
 * - Protects against XSS injection with safe text assignment
 * - Handles missing ID, invalid format, 404 deleted/non-existent blogs, and 403 private drafts
 * - Shows loading, empty, and error feedback states
 */

document.addEventListener('DOMContentLoaded', () => {
  loadBlogDetails();
});

async function loadBlogDetails() {
  const loadingView = document.getElementById('detailsLoadingView');
  const errorView = document.getElementById('detailsErrorView');
  const contentView = document.getElementById('detailsContentView');

  const errorTitle = document.getElementById('detailsErrorTitle');
  const errorDesc = document.getElementById('detailsErrorDesc');
  const errorIcon = document.getElementById('detailsErrorIcon');

  function showError(title, message, isWarning = false) {
    if (loadingView) loadingView.style.display = 'none';
    if (contentView) contentView.style.display = 'none';
    if (errorView) {
      errorView.style.display = 'block';
      if (errorTitle) errorTitle.textContent = title;
      if (errorDesc) errorDesc.textContent = message;
      if (errorIcon) {
        errorIcon.className = `details-state-icon ${isWarning ? 'warning' : 'error'}`;
      }
    }
  }

  // 1. Parse 'id' parameter from current URL
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');

  if (!blogId || !blogId.trim()) {
    showError(
      'Missing Article ID',
      'No article ID was specified in the link. Please return to the homepage to select an article to read.',
      true
    );
    return;
  }

  // 2. Fetch blog from backend API (GET /api/blogs/:id)
  try {
    const res = await BlogAPI.getBlogById(blogId.trim());

    if (!res || !res.blog) {
      showError(
        'Article Not Found',
        'The article you are looking for does not exist or may have been deleted.'
      );
      return;
    }

    renderBlogArticle(res.blog);
  } catch (err) {
    console.error('Error fetching blog details:', err);

    if (err.status === 403) {
      showError(
        'Private Draft Access Restricted',
        err.message || 'This article is a private draft. Only the author can view it while signed in.',
        true
      );
    } else if (err.status === 404) {
      showError(
        'Article Not Found',
        err.message || 'The requested article could not be found. It may have been removed or the ID is invalid.'
      );
    } else if (err.isNetworkError) {
      showError(
        'Backend Server Offline',
        'Could not connect to the backend server. Please verify the Express server is running on port 5000 and connected to MongoDB Atlas.'
      );
    } else {
      showError(
        'Unable to Load Article',
        err.message || 'An unexpected error occurred while fetching the article from the database.'
      );
    }
  }
}

/**
 * Safely render the retrieved blog post to the DOM
 */
function renderBlogArticle(blog) {
  const loadingView = document.getElementById('detailsLoadingView');
  const errorView = document.getElementById('detailsErrorView');
  const contentView = document.getElementById('detailsContentView');

  // Update Page Title in browser tab
  const headTitle = document.getElementById('pageHeadTitle');
  if (headTitle && blog.title) {
    headTitle.textContent = `${blog.title} — Blogify`;
  }

  // Breadcrumb category
  const breadcrumbCategory = document.getElementById('breadcrumbCategory');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = blog.category || 'General';
  }

  // Category pill
  const categoryEl = document.getElementById('articleCategory');
  if (categoryEl) {
    categoryEl.textContent = blog.category || 'General';
  }

  // Status badge (draft vs published)
  const statusBadge = document.getElementById('articleStatusBadge');
  if (statusBadge) {
    const isDraft = blog.status === 'draft';
    statusBadge.textContent = isDraft ? 'Private Draft' : 'Published';
    statusBadge.className = `details-status-pill ${isDraft ? 'draft' : 'published'}`;
    statusBadge.style.display = 'inline-flex';
  }

  // Article Title
  const titleEl = document.getElementById('articleTitle');
  if (titleEl) {
    titleEl.textContent = blog.title || 'Untitled Article';
  }

  // Article Excerpt / Description
  const descEl = document.getElementById('articleDescription');
  if (descEl) {
    descEl.textContent = blog.description || '';
  }

  // Author details
  const author = blog.author;
  let authorName = 'Anonymous Contributor';
  let authorEmail = '';

  if (author && typeof author === 'object') {
    authorName = author.name || 'Anonymous';
    authorEmail = author.email || '';
  } else if (typeof author === 'string') {
    authorName = author;
  }

  const authorNameEl = document.getElementById('authorName');
  if (authorNameEl) authorNameEl.textContent = authorName;

  const authorEmailEl = document.getElementById('authorEmail');
  if (authorEmailEl) {
    authorEmailEl.textContent = authorEmail ? authorEmail : 'Verified Writer';
  }

  const authorAvatarEl = document.getElementById('authorAvatar');
  if (authorAvatarEl) {
    authorAvatarEl.textContent = authorName.charAt(0).toUpperCase();
  }

  // Date formatting
  const dateEl = document.getElementById('articleDate');
  if (dateEl) {
    if (blog.createdAt) {
      const dateObj = new Date(blog.createdAt);
      dateEl.textContent = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } else {
      dateEl.textContent = 'Recently Published';
    }
  }

  // Read time estimate
  const readTimeEl = document.getElementById('articleReadTime');
  if (readTimeEl) {
    const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 180));
    readTimeEl.textContent = `${minutes} min read`;
  }

  // Cover image
  const coverImg = document.getElementById('articleCoverImg');
  const coverWrapper = document.getElementById('coverWrapper');
  const imageUrl = blog.imageUrl && blog.imageUrl.trim()
    ? blog.imageUrl.trim()
    : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';

  if (coverImg) {
    coverImg.src = imageUrl;
    coverImg.alt = blog.title || 'Article cover';
    coverImg.onerror = () => {
      coverImg.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    };
  }

  // Full article body content (safe text rendering to prevent HTML injection)
  const contentEl = document.getElementById('articleContent');
  if (contentEl) {
    contentEl.innerHTML = '';
    const rawContent = blog.content || '';
    
    // Split by double newline or single newline to create structured paragraphs
    const paragraphs = rawContent.split(/\n\n+/);
    paragraphs.forEach(paraText => {
      const trimmed = paraText.trim();
      if (trimmed) {
        const p = document.createElement('p');
        p.textContent = trimmed;
        contentEl.appendChild(p);
      }
    });

    if (!paragraphs.length || !rawContent.trim()) {
      const emptyP = document.createElement('p');
      emptyP.style.fontStyle = 'italic';
      emptyP.style.color = 'var(--text-muted)';
      emptyP.textContent = 'No written content provided for this article.';
      contentEl.appendChild(emptyP);
    }
  }

  // Show author edit action button if current logged-in user is the author
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const authorActionButtons = document.getElementById('authorActionButtons');
  const editArticleBtn = document.getElementById('editArticleBtn');

  const authorId = (author && author._id) ? author._id.toString() : (author ? author.toString() : '');
  const currentUserId = currentUser ? (currentUser.id || currentUser._id) : null;

  if (currentUser && authorId && currentUserId && authorId === currentUserId.toString()) {
    if (authorActionButtons) authorActionButtons.style.display = 'flex';
    if (editArticleBtn) editArticleBtn.href = `create-blog.html?id=${encodeURIComponent(blog._id || blog.id)}`;
  }

  // Display content view, hide loading/error
  if (loadingView) loadingView.style.display = 'none';
  if (errorView) errorView.style.display = 'none';
  if (contentView) contentView.style.display = 'block';
}
