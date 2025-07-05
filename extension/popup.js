// Platform detection and conversation extraction
const SUPPORTED_PLATFORMS = {
  "chatgpt.com": {
    name: "ChatGPT",
    selectors: [
      '[data-message-author-role="user"]',
      '[data-message-author-role="assistant"]',
      ".message",
      '[class*="Message"]',
    ],
    extractMethod: "chatgpt",
  },
  "chat.openai.com": {
    name: "ChatGPT",
    selectors: ['[data-message-author-role="user"]', '[data-message-author-role="assistant"]', ".message"],
    extractMethod: "chatgpt",
  },
  "claude.ai": {
    name: "Claude",
    selectors: ['[data-is-streaming="false"]', ".font-claude-message", '[class*="Message"]'],
    extractMethod: "claude",
  },
  "perplexity.ai": {
    name: "Perplexity",
    selectors: [".prose", '[class*="message"]', '[class*="query"]'],
    extractMethod: "perplexity",
  },
  "poe.com": {
    name: "Poe",
    selectors: ['[class*="Message"]', '[class*="ChatMessage"]'],
    extractMethod: "poe",
  },
  "gemini.google.com": {
    name: "Gemini",
    selectors: ['[data-test-id*="conversation"]', ".conversation-turn"],
    extractMethod: "gemini",
  },
}

let extractedConversation = ""
let currentPlatform = null

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await detectPlatform()
  setupEventListeners()
})

async function detectPlatform() {
  try {
    const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })
    const url = new URL(tab.url)
    const hostname = url.hostname

    // Find matching platform
    currentPlatform = Object.keys(SUPPORTED_PLATFORMS).find(
      (domain) => hostname.includes(domain) || hostname.endsWith(domain),
    )

    const statusEl = document.getElementById("status")
    const platformInfoEl = document.getElementById("platform-info")
    const actionsEl = document.getElementById("actions")

    if (currentPlatform) {
      const platform = SUPPORTED_PLATFORMS[currentPlatform]
      statusEl.className = "status supported"
      statusEl.innerHTML = `✅ ${platform.name} detected - Ready to extract`

      platformInfoEl.style.display = "block"
      platformInfoEl.innerHTML = `
        <strong>${platform.name}</strong> conversation detected<br>
        Click "Extract Conversation" to analyze this chat for psychological safety risks.
      `

      actionsEl.style.display = "block"
    } else {
      statusEl.className = "status unsupported"
      statusEl.innerHTML = `❌ Unsupported platform: ${hostname}`

      platformInfoEl.style.display = "block"
      platformInfoEl.innerHTML = `
        <strong>Supported platforms:</strong><br>
        ${Object.values(SUPPORTED_PLATFORMS)
          .map((p) => p.name)
          .join(", ")}
      `
    }
  } catch (error) {
    console.error("Platform detection failed:", error)
    document.getElementById("status").innerHTML = "❌ Error detecting platform"
  }
}

function setupEventListeners() {
  document.getElementById("extract-btn").addEventListener("click", extractConversation)
  document.getElementById("analyze-btn").addEventListener("click", analyzeConversation)
}

async function extractConversation() {
  const extractBtn = document.getElementById("extract-btn")
  const analyzeBtn = document.getElementById("analyze-btn")
  const previewEl = document.getElementById("conversation-preview")

  try {
    extractBtn.innerHTML = '<div class="loading"><div class="spinner"></div>Extracting...</div>'
    extractBtn.disabled = true

    const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })

    // Inject content script to extract conversation
    const results = await window.chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractConversationFromPage,
      args: [currentPlatform],
    })

    extractedConversation = results[0].result

    if (extractedConversation && extractedConversation.length > 50) {
      extractBtn.innerHTML = "✅ Conversation Extracted"
      analyzeBtn.disabled = false

      // Show preview
      previewEl.style.display = "block"
      previewEl.textContent =
        extractedConversation.substring(0, 300) + (extractedConversation.length > 300 ? "..." : "")
    } else {
      throw new Error("No conversation content found")
    }
  } catch (error) {
    console.error("Extraction failed:", error)
    extractBtn.innerHTML = "❌ Extraction Failed"
    extractBtn.disabled = false
  }
}

async function analyzeConversation() {
  if (!extractedConversation) return

  const analyzeBtn = document.getElementById("analyze-btn")

  try {
    analyzeBtn.innerHTML = '<div class="loading"><div class="spinner"></div>Opening SecondThought...</div>'

    // Store conversation in extension storage
    await window.chrome.storage.local.set({
      pendingAnalysis: extractedConversation,
      timestamp: Date.now(),
    })

    // Open SecondThought web app with extracted conversation
    window.chrome.tabs.create({
      url: "https://your-secondthought-app.vercel.app/?from=extension",
    })

    // Close popup
    window.close()
  } catch (error) {
    console.error("Analysis failed:", error)
    analyzeBtn.innerHTML = "❌ Analysis Failed"
  }
}

// This function runs in the context of the web page
function extractConversationFromPage(platformKey) {
  const platform = {
    "chatgpt.com": {
      name: "ChatGPT",
      selectors: [
        '[data-message-author-role="user"]',
        '[data-message-author-role="assistant"]',
        ".message",
        '[class*="Message"]',
      ],
      extractMethod: "chatgpt",
    },
    "chat.openai.com": {
      name: "ChatGPT",
      selectors: ['[data-message-author-role="user"]', '[data-message-author-role="assistant"]', ".message"],
      extractMethod: "chatgpt",
    },
    "claude.ai": {
      name: "Claude",
      selectors: ['[data-is-streaming="false"]', ".font-claude-message", '[class*="Message"]'],
      extractMethod: "claude",
    },
    "perplexity.ai": {
      name: "Perplexity",
      selectors: [".prose", '[class*="message"]', '[class*="query"]'],
      extractMethod: "perplexity",
    },
    "poe.com": {
      name: "Poe",
      selectors: ['[class*="Message"]', '[class*="ChatMessage"]'],
      extractMethod: "poe",
    },
    "gemini.google.com": {
      name: "Gemini",
      selectors: ['[data-test-id*="conversation"]', ".conversation-turn"],
      extractMethod: "gemini",
    },
  }[platformKey]

  if (!platform) return ""

  let conversation = ""
  let messages = []

  // Try each selector until we find messages
  for (const selector of platform.selectors) {
    const elements = document.querySelectorAll(selector)
    if (elements.length > 0) {
      messages = Array.from(elements)
      break
    }
  }

  // Extract based on platform
  switch (platform.extractMethod) {
    case "chatgpt":
      messages.forEach((msg) => {
        const role =
          msg.getAttribute("data-message-author-role") || (msg.textContent.trim().length > 0 ? "unknown" : "")
        if (role && msg.textContent.trim()) {
          const speaker = role === "user" ? "Human" : role === "assistant" ? "AI" : "Unknown"
          conversation += `${speaker}: ${msg.textContent.trim()}\n\n`
        }
      })
      break

    case "claude":
      messages.forEach((msg) => {
        const text = msg.textContent.trim()
        if (text) {
          // Claude messages often alternate, try to detect pattern
          const isUser = msg.classList.contains("user") || msg.closest('[class*="user"]') || text.length < 500 // Heuristic: user messages often shorter
          const speaker = isUser ? "Human" : "AI"
          conversation += `${speaker}: ${text}\n\n`
        }
      })
      break

    default:
      // Generic extraction
      messages.forEach((msg, index) => {
        const text = msg.textContent.trim()
        if (text) {
          const speaker = index % 2 === 0 ? "Human" : "AI" // Alternate assumption
          conversation += `${speaker}: ${text}\n\n`
        }
      })
  }

  return conversation.trim()
}
