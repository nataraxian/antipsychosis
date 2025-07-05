// Content script for SecondThought extension
;(() => {
  // Declare chrome variable
  const chrome = window.chrome

  // Add floating analyze button to supported pages
  function addAnalyzeButton() {
    if (document.querySelector(".secondthought-overlay")) return

    const overlay = document.createElement("div")
    overlay.className = "secondthought-overlay"
    overlay.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 20px; height: 20px; background: #1e293b; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">🛡</div>
        <strong style="font-size: 14px;">SecondThought</strong>
      </div>
      <button class="secondthought-button" id="st-analyze-btn">
        Analyze Conversation
      </button>
    `

    document.body.appendChild(overlay)

    // Add click handler
    document.getElementById("st-analyze-btn").addEventListener("click", () => {
      // This will trigger the popup to open
      chrome.runtime.sendMessage({ action: "openPopup" })
    })
  }

  // Check if we're on a supported platform
  const hostname = window.location.hostname
  const supportedDomains = [
    "chatgpt.com",
    "chat.openai.com",
    "claude.ai",
    "perplexity.ai",
    "poe.com",
    "gemini.google.com",
  ]

  if (supportedDomains.some((domain) => hostname.includes(domain))) {
    // Wait for page to load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addAnalyzeButton)
    } else {
      addAnalyzeButton()
    }
  }
})()
