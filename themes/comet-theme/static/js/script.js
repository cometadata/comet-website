document.addEventListener("DOMContentLoaded", () => {
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
});
