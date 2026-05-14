document.addEventListener("DOMContentLoaded", () => {
  let allPosts = [];
  
  // Track all active filters globally
  const filterState = {
    searchQuery: "",
    selectedTag: "all",
    selectedAuthor: "all",
    selectedCategory: "all",
    sortOrder: "desc" // Default sorting parameter
  };

  const container = document.getElementById("posts-container");
  const searchInput = document.getElementById("search-input");
  const tagDropdown = document.getElementById("tag-dropdown");
  const catDropdown = document.getElementById("cat-dropdown");
  const authorDropdown = document.getElementById("author-dropdown");
  const clearButton = document.getElementById("clear-filters-btn");
  const sortDropdown = document.getElementById("sort-dropdown");

  // 1. Fetch Hugo's pre-compiled JSON index
  fetch("/index.json")
    .then(response => response.json())
    .then(data => {
      allPosts = data;
      applyFilters(); // Initial render
    })
    .catch(err => console.error("Error fetching index:", err));

  // 2. Event Listeners for Filter Controls
  searchInput.addEventListener("input", (e) => {
    filterState.searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  tagDropdown.addEventListener("change", (e) => {
    filterState.selectedTag = e.target.value;
    applyFilters();
  });

  authorDropdown.addEventListener("change", (e) => {
    filterState.selectedAuthor = e.target.value;
    applyFilters();
  });

  catDropdown.addEventListener("change", (e) => {
    filterState.selectedCategory = e.target.value;
    applyFilters();
  });

  sortDropdown.addEventListener("change", (e) => {
    filterState.sortOrder = e.target.value;
    applyFilters();
  });

  // 3. Clear Filters Click Event Listener
  clearButton.addEventListener("click", () => {
    // Reset global logical state object
    filterState.searchQuery = "";
    filterState.selectedTag = "all";
    filterState.selectedCategory = "all";
    filterState.selectedAuthor = "all";
    filterState.sortOrder = "desc";

    // Reset visual UI element positions
    searchInput.value = "";
    tagDropdown.value = "all";
    catDropdown.value = "all";
    authorDropdown.value = "all";
    sortDropdown.value = "desc";

    // Run cascade filter engine to restore all items
    applyFilters();
  });

  // Helper function to format strings for comparison (slugify)
  const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

  // 3. Overlapping Filter Logic Engine
  function applyFilters() {
    let filteredResults = allPosts;

    // Filter Step A: Text Search
    if (filterState.searchQuery !== "") {
      filteredResults = filteredResults.filter(post => {
        const matchesTitle = post.title?.toLowerCase().includes(filterState.searchQuery);
        const matchesSummary = post.summary?.toLowerCase().includes(filterState.searchQuery);
        return matchesTitle || matchesSummary;
      });
    }

    // Filter Step B: Tag Dropdown Selection
    if (filterState.selectedTag !== "all") {
      filteredResults = filteredResults.filter(post => {
        if (!post.tags) return false;
        return post.tags.some(tag => slugify(tag) === filterState.selectedTag);
      });
    }

    // Filter Step B: Tag Dropdown Selection
    if (filterState.selectedCategory !== "all") {
      filteredResults = filteredResults.filter(post => {
        if (!post.categories) return false;
        return post.categories.some(category => slugify(category) === filterState.selectedCategory);
      });
    }

    // Filter Step C: Author Dropdown Selection
    if (filterState.selectedAuthor !== "all") {
      filteredResults = filteredResults.filter(post => {
        if (!post.authors) return false;
        return post.authors.some(author => slugify(author) === filterState.selectedAuthor);
      });
    }

    // Sort Step D: Sort by string/date sequence order
    filteredResults.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (filterState.sortOrder === "asc") {
        return dateA - dateB; // Oldest first
      } else {
        return dateB - dateA; // Newest first
      }
    });

    renderPosts(filteredResults);
  }

  // 4. Inject matching elements into the DOM
  function renderPosts(posts) {
    if (posts.length === 0) {
      container.innerHTML = "<p class='no-results'>No matching posts found.</p>";
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="post-card col-4">

        <img src="${post.media}" class="img-fluid"/>
        
        <h2><a href="${post.permalink}">${post.title}</a></h2>
        
        <small>${post.date} ${post.author ? `by ${post.author}` : ''}</small>
        <p>${post.summary}</p>
        <div class="post-tags">
        tags
          ${post.tags ? post.tags.map(t => `<span class="tag-badge">${t}</span>`).join(",") : ""}
        </div>
        <div class="post-cats">
        cats
          ${post.categories ? post.categories.map(t => `<span class="cat-badge">${t}</span>`).join(",") : ""}
        </div>
        <div class="post-authors">
        authors
          ${post.authors ? post.authors.map(t => `<span class="author-badge">${t}</span>`).join(",") : ""}
        </div>
      </div>
    `).join("");
  }
});
