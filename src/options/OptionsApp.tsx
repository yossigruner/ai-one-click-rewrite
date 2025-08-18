import DebugSection from '@/components/DebugSection'
import HeaderSection from '@/components/HeaderSection'
import ModeSection from '@/components/ModeSection'
import ProviderSection from '@/components/ProviderSection'
import AutoDetectionSection from '@/components/AutoDetectionSection'
import { DEFAULT_SETTINGS, ExtensionSettings } from '@/types'
import { loadSettings, saveSettings } from '@/utils/storage'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BugReportIcon from '@mui/icons-material/BugReport'
import EditIcon from '@mui/icons-material/Edit'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Alert,
  Box,
  Container,
  Fade,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

const OptionsApp: React.FC = () => {
  const theme = useTheme()
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean
    message: string
    severity: 'success' | 'error'
  }>({ show: false, message: '', severity: 'success' })

  useEffect(() => {
    loadSettings().then((loadedSettings) => {
      setSettings(loadedSettings)
      setLoading(false)
    })
  }, [])

  const handleSettingsChange = async (updates: Partial<ExtensionSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)

    try {
      await saveSettings(newSettings)
      setSaveStatus({
        show: true,
        message: 'Settings saved automatically ✓',
        severity: 'success',
      })

      // Notify content scripts about mode changes
      if (updates.mode !== undefined) {
        try {
          // Get all tabs and notify them about the mode change
          const tabs = await chrome.tabs.query({})
          for (const tab of tabs) {
            if (tab.id) {
              try {
                await chrome.tabs.sendMessage(tab.id, {
                  type: 'toggle-preview-mode',
                  enabled: updates.mode === 'preview'
                })
              } catch (error) {
                // Ignore errors for tabs that don't have content scripts
                console.log(`Could not send message to tab ${tab.id}:`, error)
              }
            }
          }
          console.log(`Preview mode ${updates.mode === 'preview' ? 'enabled' : 'disabled'} for all tabs`)
        } catch (error) {
          console.error('Failed to notify content scripts about mode change:', error)
        }
      }

      // Notify content scripts about auto-detection changes
      if (updates.autoDetection !== undefined) {
        try {
          // Get all tabs and notify them about the auto-detection change
          const tabs = await chrome.tabs.query({})
          for (const tab of tabs) {
            if (tab.id) {
              try {
                await chrome.tabs.sendMessage(tab.id, {
                  type: 'update-auto-detection',
                  mode: updates.autoDetection
                })
              } catch (error) {
                // Ignore errors for tabs that don't have content scripts
                console.log(`Could not send message to tab ${tab.id}:`, error)
              }
            }
          }
          console.log(`Auto-detection mode changed to: ${updates.autoDetection}`)
        } catch (error) {
          console.error('Failed to notify content scripts about auto-detection change:', error)
        }
      }
    } catch (error) {
      setSaveStatus({
        show: true,
        message: 'Failed to save settings',
        severity: 'error',
      })
    }

    // Hide status after 2 seconds
    setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, show: false }))
    }, 2000)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: '#fafafa' }}
      >
        <AutoAwesomeIcon
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
            animation: 'spin 2s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <HeaderSection />

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Simplified Tab Navigation */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              backgroundColor: '#fff',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 64,
                px: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  backgroundColor: '#f8f9fa',
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <Tab icon={<SmartToyIcon />} label="AI Provider" iconPosition="start" />
            <Tab icon={<EditIcon />} label="Rewrite Mode" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="Auto-Detection" iconPosition="start" />
            <Tab icon={<BugReportIcon />} label="Debug" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Content Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* AI Provider Configuration Tab */}
          <Fade in={activeTab === 0} timeout={300}>
            <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <ProviderSection
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                />
              </Paper>
            </Box>
          </Fade>

          {/* Rewrite Mode Tab */}
          <Fade in={activeTab === 1} timeout={300}>
            <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <ModeSection settings={settings} onSettingsChange={handleSettingsChange} />
              </Paper>
            </Box>
          </Fade>

          {/* Auto-Detection Settings Tab */}
          <Fade in={activeTab === 2} timeout={300}>
            <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
              <AutoDetectionSection settings={settings} onSettingsChange={handleSettingsChange} />
            </Box>
          </Fade>

          {/* Debug Settings Tab */}
          <Fade in={activeTab === 3} timeout={300}>
            <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <DebugSection settings={settings} onSettingsChange={handleSettingsChange} />
              </Paper>
            </Box>
          </Fade>

          {/* Simplified Security Notice */}
          <Paper 
            elevation={0}
            sx={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 2,
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <AutoAwesomeIcon sx={{ color: '#0369a1', fontSize: 20 }} />
              <Typography variant="h6" sx={{ color: '#0369a1', fontWeight: 600 }}>
                Secure & Private
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#0c4a6e', lineHeight: 1.6 }}>
              Your API keys are stored locally in your browser and never sent to our servers.
              All data remains private and secure on your device.
            </Typography>
          </Paper>
        </Box>

        {/* Save Status */}
        <Fade in={saveStatus.show}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <Alert
              severity={saveStatus.severity}
              sx={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: 2,
              }}
            >
              {saveStatus.message}
            </Alert>
          </Box>
        </Fade>
      </Container>

      {/* Simplified Footer */}
      <Box
        sx={{
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          py: 3,
          mt: 6,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontWeight: 500,
              }}
            >
              Made with ❤️ by{' '}
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                }}
              >
                Yossi Gruner
              </Typography>
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Typography
                component="a"
                href="https://github.com/yossigruner"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                sx={{
                  color: '#666',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline',
                  },
                }}
              >
                GitHub
              </Typography>
              <Typography
                component="a"
                href="mailto:yossigruner@gmail.com"
                variant="body2"
                sx={{
                  color: '#666',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline',
                  },
                }}
              >
                Contact
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default OptionsApp
