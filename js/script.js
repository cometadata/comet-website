document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector("header nav");
    if (nav) {
        const menuToggle = nav.querySelector(".menu-toggle");
        const submenuToggles = nav.querySelectorAll(".submenu-toggle");

        const setMenuOpen = (open) => {
            nav.classList.toggle("menu-open", open);
            if (menuToggle) {
                menuToggle.setAttribute("aria-expanded", String(open));
                menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            }
        };

        if (menuToggle) {
            menuToggle.addEventListener("click", () => {
                const isOpen = nav.classList.contains("menu-open");
                setMenuOpen(!isOpen);
            });
        }

        submenuToggles.forEach((toggle) => {
            toggle.addEventListener("click", () => {
                const item = toggle.closest("li");
                const isOpen = toggle.getAttribute("aria-expanded") === "true";

                submenuToggles.forEach((otherToggle) => {
                    if (otherToggle !== toggle) {
                        otherToggle.setAttribute("aria-expanded", "false");
                        otherToggle.closest("li")?.classList.remove("submenu-open");
                    }
                });

                toggle.setAttribute("aria-expanded", String(!isOpen));
                item?.classList.toggle("submenu-open", !isOpen);
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") {
                return;
            }

            if (nav.classList.contains("menu-open")) {
                setMenuOpen(false);
                menuToggle?.focus();
                return;
            }

            const openSubmenu = nav.querySelector(".submenu-toggle[aria-expanded='true']");
            if (openSubmenu) {
                openSubmenu.setAttribute("aria-expanded", "false");
                openSubmenu.closest("li")?.classList.remove("submenu-open");
                openSubmenu.focus();
            }
        });
    }

    const $tocNav = $('#toc-nav');
    const $aside = $('.article-aside');

    if (!$tocNav.length) {
        return;
    }

    // Loop through all h2 and h3 headings inside the main content
    $('.the-content h2, .the-content h3, .the-content h4, .the-content h5').each(function(index) {
        
        // 1. Get the text of the heading
        var headingText = $(this).text();
        
        // 2. Create a unique, URL-friendly ID from the text
        var uniqueId = headingText
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special chars with hyphens
            .replace(/(^-|-$)/g, '');    // Clean up trailing/leading hyphens
            
        // 3. Assign the ID to the heading element
        $(this).attr('id', uniqueId);
        
        // 4. Determine the heading level for styling (h2 or h3)
        var headingLevel = "tag-level-" + this.tagName.toLowerCase();

        
        // 5. Build the navigation link and append it to the menu
        $('#toc-nav').append(
            '<li><a href="#' + uniqueId + '" id="link-' + uniqueId + '" class="nav-link ' + headingLevel + '">' + headingText + '</a></li>'
        );
    });


    // 2. Configure the Intersection Observer for ScrollSpy
    var observerOptions = {
        root: null,         // Uses the browser viewport
        rootMargin: '0px 0px -60% 0px', // Triggers when heading hits upper part of screen
        threshold: 0        // Triggers as soon as the heading enters the area
    };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            // Find the matching navigation link using the heading's ID
            var targetId = entry.target.id;
            var $navLink = $('#link-' + targetId);

            if (entry.isIntersecting) {
                // Remove active class from all links, then add to the current visible one
                $('.nav-link').removeClass('active');
                $navLink.addClass('active');
            }
        });
    }, observerOptions);


    $('.the-content h2, .the-content h3, .the-content h4').each(function() {
        observer.observe(this);
    });

    if ($tocNav.children().length === 0) {
        $('#toc-aside-box').hide();
    }

    if ($aside.length && $aside.find('.aside-box:visible').length === 0) {
        $aside.addClass('is-empty');
    }
});


document.addEventListener("DOMContentLoaded", () => {
  // 1. Select absolutely every table cell on the page
  const allCells = document.querySelectorAll(".bignumbers td");

  allCells.forEach(cell => {
    const text = cell.textContent.trim();
    
    // 2. Skip completely empty cells
    if (text === "") return;

    // 3. Convert text to a number
    const num = Number(text);

    // 4. If it is a valid pure number, format it with commas
    if (!isNaN(num)) {
      cell.textContent = num.toLocaleString('en-UK');
      
      // Optional: Automatically right-align the cell via JS
      cell.style.textAlign = "right"; 
    }
  });
});

