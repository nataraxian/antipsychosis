// Background script for SecondThought extension
const chrome = window.chrome // Declare the chrome variable

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopup") {
    // Open the extension popup
    chrome.action.openPopup()
  }
})

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("SecondThought extension installed")
})
