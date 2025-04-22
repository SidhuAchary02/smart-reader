chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.includes('medium.com')) {
    try {
      // Clear cookies and storage
      await clearMediumData(tab.id);
      
      // Extract content
      const content = await extractContent(tab.id);
      
      // Create new tab with extracted content
      createReaderTab(content);
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

async function clearMediumData(tabId) {
  // Clear cookies
  const cookies = await chrome.cookies.getAll({ domain: 'medium.com' });
  for (const cookie of cookies) {
    const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
    await chrome.cookies.remove({ url, name: cookie.name });
  }
  
  // Clear local storage
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      localStorage.clear();
      sessionStorage.clear();
    }
  });
}

async function extractContent(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: extractMediumArticle,
    args: []
  });
  
  return results[0].result;
}

function createReaderTab(content) {
  const readerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${content.title}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        img { max-width: 100%; }
      </style>
    </head>
    <body>
      <h1>${content.title}</h1>
      <div>${content.content}</div>
      <p><a href="${content.url}" target="_blank">Original Article</a></p>
    </body>
    </html>
  `;
  
  const blob = new Blob([readerHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  chrome.tabs.create({ url });
}