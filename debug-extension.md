# AI One-Click Rewrite Extension Debugging Guide

## Issue: Right-click context menu not working

### Step 1: Verify Extension Loading

1. Open Chrome and go to `chrome://extensions/`
2. Make sure "Developer mode" is enabled (toggle in top right)
3. Look for "AI One‑Click Rewrite" in the list
4. Verify it's **enabled** (toggle should be blue/on)
5. Check if there are any error badges or warnings

### Step 2: Reload Extension

1. Click the **reload button** (circular arrow) on the extension card
2. This ensures you're running the latest built version

### Step 3: Check Console Logs

1. Go to `chrome://extensions/`
2. Find "AI One‑Click Rewrite"
3. Click **"service worker"** (this opens the background script console)
4. Try the right-click → "Rewrite with AI" again
5. Look for any error messages or logs

### Step 4: Verify API Key Configuration

1. Click the extension icon in the toolbar (puzzle piece icon)
2. Find "AI One‑Click Rewrite" and click **"Options"**
3. Make sure you have configured an API key for at least one provider:
   - **AI Provider Configuration** tab
   - Select a provider (OpenAI, Anthropic, or Gemini)
   - Enter a valid API key
   - Save the settings

### Step 5: Test on a Simple Page

1. Open a new tab and go to a simple website (like a news article)
2. Select some plain text
3. Right-click and look for **"Rewrite with AI"** in the context menu
4. If you don't see this option, the context menu isn't being created

### Step 6: Check for JavaScript Errors

1. On the webpage where you're testing, press `F12` to open DevTools
2. Go to the **Console** tab
3. Try selecting text and right-clicking
4. Look for any error messages in red

### Expected Behavior:

1. Select text on any webpage
2. Right-click → you should see **"Rewrite with AI"** option
3. Click it → you should see a loading spinner overlay the selected text
4. After a few seconds → the text should be replaced with AI-rewritten version
5. A green success notification should appear

### Common Issues:

#### A. Context Menu Not Visible

- Extension not properly loaded
- Permissions issue
- Background script error

#### B. Context Menu Visible But Nothing Happens

- No API key configured
- Invalid API key
- Network connection issue
- Content script not loaded

#### C. Error Messages

- Check browser console for specific error details

### Debug Commands:

Open the background script console (Step 3 above) and run:

```javascript
// Check if context menu exists
chrome.contextMenus.getAll(console.log)

// Check extension settings
chrome.storage.sync.get(console.log)
```

## Quick Fix Checklist:

- [ ] Extension is loaded and enabled
- [ ] Extension has been reloaded after building
- [ ] API key is configured in options
- [ ] Testing on a regular webpage (not chrome:// pages)
- [ ] Text is properly selected before right-clicking
- [ ] No JavaScript errors in console
