document.addEventListener("DOMContentLoaded", () => {
  const filterControls = document.getElementById("filter-controls");
  if (!filterControls) {
    return;
  }

  let allPosts = [];

  const filterState = {
    selectedTag: "all",
    selectedAuthor: "all",
    selectedCategory: "all",
    sortOrder: "desc",
    currentPage: 1,
    postsPerPage: 9
  };

  const blogListURL = filterControls.dataset.blogUrl || new URL("posts/", window.location.href).pathname;
  const paginationContainer = document.getElementById("pagination-container");
  const container = document.getElementById("posts-container");
  const tagDropdown = document.getElementById("tag-dropdown");
  const catDropdown = document.getElementById("cat-dropdown");
  const authorDropdown = document.getElementById("author-dropdown");
  const clearButton = document.getElementById("clear-filters-btn");
  const sortDropdown = document.getElementById("sort-dropdown");

  const indexLocation = filterControls.dataset.indexUrl || new URL("index.json", window.location.href).pathname;

  const slugify = (text) => text.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9\-]+/g, "").replace(/--+/g, "-");

  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlFilters = urlParams.has("category") || urlParams.has("tag");

  function scrollToFilterControls() {
    requestAnimationFrame(() => {
      filterControls.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }

  if (hasUrlFilters) {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    scrollToFilterControls();
  }

  function blogFilterUrl(type, name) {
    const param = type === "category" ? "category" : "tag";
    return `${blogListURL}?${param}=${encodeURIComponent(slugify(name))}`;
  }

  function initFiltersFromURL() {
    const category = urlParams.get("category");
    const tag = urlParams.get("tag");
    let appliedFromUrl = false;

    if (category && catDropdown.querySelector(`option[value="${CSS.escape(category)}"]`)) {
      filterState.selectedCategory = category;
      catDropdown.value = category;
      appliedFromUrl = true;
    }

    if (tag && tagDropdown.querySelector(`option[value="${CSS.escape(tag)}"]`)) {
      filterState.selectedTag = tag;
      tagDropdown.value = tag;
      appliedFromUrl = true;
    }

    return appliedFromUrl;
  }

  function syncUrlFromFilters() {
    const params = new URLSearchParams();
    if (filterState.selectedCategory !== "all") {
      params.set("category", filterState.selectedCategory);
    }
    if (filterState.selectedTag !== "all") {
      params.set("tag", filterState.selectedTag);
    }

    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }

  fetch(indexLocation)
    .then(response => response.json())
    .then(data => {
      allPosts = data.filter(post => !post.featured);
      const appliedFromUrl = initFiltersFromURL();
      applyFilters();
      if (appliedFromUrl) {
        scrollToFilterControls();
      }
    })
    .catch(err => console.error("Error fetching index:", err));

  tagDropdown.addEventListener("change", (e) => {
    filterState.selectedTag = e.target.value;
    filterState.currentPage = 1;
    applyFilters();
  });

  authorDropdown.addEventListener("change", (e) => {
    filterState.selectedAuthor = e.target.value;
    filterState.currentPage = 1;
    applyFilters();
  });

  catDropdown.addEventListener("change", (e) => {
    filterState.selectedCategory = e.target.value;
    filterState.currentPage = 1;
    applyFilters();
  });

  sortDropdown.addEventListener("change", (e) => {
    filterState.sortOrder = e.target.value;
    filterState.currentPage = 1;
    applyFilters();
  });

  clearButton.addEventListener("click", () => {
    filterState.selectedTag = "all";
    filterState.selectedCategory = "all";
    filterState.selectedAuthor = "all";
    filterState.sortOrder = "desc";
    filterState.currentPage = 1;

    tagDropdown.value = "all";
    catDropdown.value = "all";
    authorDropdown.value = "all";
    sortDropdown.value = "desc";

    applyFilters();
  });

  function applyFilters() {
    let filteredResults = allPosts;

    if (filterState.selectedTag !== "all") {
      filteredResults = filteredResults.filter(post => {
        if (!post.tags) return false;
        return post.tags.some(tag => slugify(tag) === filterState.selectedTag);
      });
    }

    if (filterState.selectedCategory !== "all") {
      filteredResults = filteredResults.filter(post => {
        if (!post.categories) return false;
        return post.categories.some(category => slugify(category) === filterState.selectedCategory);
      });
    }

    if (filterState.selectedAuthor !== "all") {
      filteredResults = filteredResults.filter(post => {
        if (!post.authors) return false;
        return post.authors.some(author => slugify(author) === filterState.selectedAuthor);
      });
    }

    filteredResults.sort((a, b) => {
      if (filterState.sortOrder === "asc") {
        return a.dateSort - b.dateSort;
      }
      return b.dateSort - a.dateSort;
    });

    const totalItems = filteredResults.length;
    const totalPages = Math.ceil(totalItems / filterState.postsPerPage);
    const startIndex = (filterState.currentPage - 1) * filterState.postsPerPage;
    const endIndex = startIndex + filterState.postsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    renderPosts(paginatedResults);
    renderPagination(totalPages);
    syncUrlFromFilters();
  }

  function renderPosts(posts) {
    if (posts.length === 0) {
      container.innerHTML = "<p class='no-results'>No matching posts found.</p>";
      return;
    }

    container.innerHTML = posts.map(post => `
      <article class="media-card">
        <a class="media-card-image editorial no-underline" href="${post.permalink}">
          ${post.media ? `<img src="${post.media}" alt="${post.title}" loading="lazy">` : ""}
        </a>
        <div class="media-card-body">
          ${post.categories || post.tags ? `
          <div class="post-taxonomy">
            ${post.categories ? post.categories.map(c => `<a href="${blogFilterUrl("category", c)}" class="cat-badge no-underline">${c}</a>`).join("") : ""}
            ${post.tags ? post.tags.map(t => `<a href="${blogFilterUrl("tag", t)}" class="tag-badge no-underline">${t}</a>`).join("") : ""}
          </div>` : ""}
          <div class="post-meta-row">
            ${post.authors ? `<span>${post.authors.join(", ")}</span>` : ""}
            <span>${post.dateLong || post.date}</span>
          </div>
          <h3><a class="post-title-link no-underline" href="${post.permalink}">${post.title}</a></h3>
          <p>${post.summary || ""}</p>
        </div>
      </article>
    `).join("");
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let buttonsHtml = "";
    buttonsHtml += `<button class="page-btn" data-page="${filterState.currentPage - 1}" ${filterState.currentPage === 1 ? "disabled" : ""}>&laquo; Prev</button>`;

    for (let i = 1; i <= totalPages; i++) {
      buttonsHtml += `<button class="page-btn ${filterState.currentPage === i ? "active-page" : ""}" data-page="${i}">${i}</button>`;
    }

    buttonsHtml += `<button class="page-btn" data-page="${filterState.currentPage + 1}" ${filterState.currentPage === totalPages ? "disabled" : ""}>Next &raquo;</button>`;

    paginationContainer.innerHTML = buttonsHtml;

    paginationContainer.querySelectorAll(".page-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const targetPage = parseInt(e.target.getAttribute("data-page"), 10);
        filterState.currentPage = targetPage;
        applyFilters();
        container.scrollIntoView({ behavior: "smooth" });
      });
    });
  }
});
