import { useEffect, useState } from "react";
import "./index.css";

function Popup() {
  const [status, setStatus] = useState("Ready");
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        setCurrentUrl(tabs[0].url || "");
      }
    });
  }, []);

  const handleExtract = async () => {
    setStatus("Extracting...");

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.id) {
        setStatus("No active tab found");
        return;
      }

      // First inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      // Then execute our extraction function
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return window.extractMediumArticle
            ? window.extractMediumArticle()
            : null;
        },
      });

      if (results?.[0]?.result) {
        const content = results[0].result;
        if (content) {
          // Create new tab with content
          // In your handleExtract function, update the readerHtml creation:
          const readerHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${content.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 740px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { 
      font-size: 2em;
      margin-bottom: 0.5em;
      line-height: 1.2;
    }
    .author {
      color: #666;
      margin-bottom: 2em;
      font-size: 0.9em;
    }
    img {
      max-width: 100%;
      height: auto;
      margin: 1em 0;
    }
    p, li {
      font-size: 1.1em;
      margin-bottom: 1.2em;
    }
    a {
      color: #06c;
      text-decoration: none;
    }
    .original-link {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #eee;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>${content.title}</h1>
  ${content.author ? `<div class="author">By ${content.author}</div>` : ""}
  <div>${content.content}</div>
  <div class="original-link">
    <a href="${content.url}" target="_blank">View original article on Medium</a>
  </div>
</body>
</html>`;


          const blob = new Blob([readerHtml], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          chrome.tabs.create({ url });

          setStatus("Success! Opening reader view...");
        } else {
          setStatus("Failed: No content found");
        }
      } else {
        setStatus("Failed: Could not extract content");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 w-64">
      <h1 className="text-xl font-bold mb-4">Smart Reader</h1>
      {currentUrl.includes("medium.com") ? (
        <>
          <p className="mb-3">Medium article detected</p>
          <button
            onClick={handleExtract}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={status.includes("Extracting")}
          >
            {status.includes("Extracting")
              ? "Extracting..."
              : "Extract Content"}
          </button>
        </>
      ) : (
        <p>Navigate to a Medium article to use this extension</p>
      )} 
      <p className="mt-3 text-sm text-gray-600">{status}</p>
    </div>
  );
}

export default Popup;
