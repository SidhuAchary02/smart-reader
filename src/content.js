function extractMediumArticle() {
  try {
    // 1. Remove all paywall-related elements
    const elementsToRemove = [
      // Paywall containers
      '.meteredContent',
      '.paywall',
      '.overlay',
      '.pw-overlay',
      '.pw-header',
      '.membershipPaywall',
      '.member-only-content',
      '.premium-content',
      '.meteredPaywall',
      // Medium-specific elements
      '.postMeterBar',
      '.metabar',
      '.postActions',
      '.recommendations',
      '.highlightMenu',
      '.postFade',
      // Common blockers
      '.subscribe-wall',
      '.newsletter-signup',
      '.popup',
      '.overlay'
    ];

    elementsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 2. Enable scrolling and remove fixed positions
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.documentElement.style.overflow = 'auto';
    document.querySelectorAll('*').forEach(el => {
      el.style.position = 'static';
      el.style.overflow = 'visible';
    });

    // 3. Find the main content section
    let article = document.querySelector('article');
    
    // Fallbacks for different Medium layouts
    if (!article) {
      article = document.querySelector('[role="article"]') || 
                document.querySelector('.postArticle') || 
                document.querySelector('.meteredContent') || 
                document.querySelector('.post') || 
                document.body;
    }

    // 4. Remove remaining unwanted elements
    const unwantedElements = [
      'nav', 'header', 'footer', 'aside',
      '.comments', '.social-share',
      '.recommendations', '.related-posts',
      '.subscribe', '.newsletter'
    ];
    
    unwantedElements.forEach(selector => {
      article.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 5. Extract all paragraphs and images
    const paragraphs = Array.from(article.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
      .map(el => el.outerHTML)
      .join('');

    const images = Array.from(article.querySelectorAll('img'))
      .filter(img => img.naturalWidth > 100) // filter out small icons
      .map(img => `<img src="${img.src}" alt="${img.alt}" style="max-width:100%;">`)
      .join('');

    return {
      title: document.title.replace(' | Medium', '').replace(' – Medium', ''),
      author: document.querySelector('[data-testid="author-name"]')?.textContent || 'Unknown author',
      content: paragraphs + images,
      url: window.location.href
    };
  } catch (error) {
    console.error('Extraction error:', error);
    return null;
  }
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    const content = extractMediumArticle();
    sendResponse({ content });
  }
  return true; // Required for async response
});

// Make the function available to the extension
window.extractMediumArticle = extractMediumArticle;