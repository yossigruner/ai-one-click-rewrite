import { ExtensionSettings, DEFAULT_SETTINGS } from '@/types'

export const loadSettings = (): Promise<ExtensionSettings> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result as ExtensionSettings)
    })
  })
}

export const saveSettings = (settings: ExtensionSettings): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export const getSettings = loadSettings // Alias for backward compatibility
