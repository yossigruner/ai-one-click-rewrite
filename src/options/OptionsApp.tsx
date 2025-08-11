import DebugSection from '@/components/DebugSection'
import HeaderSection from '@/components/HeaderSection'
import ModeSection from '@/components/ModeSection'
import ProviderSection from '@/components/ProviderSection'
import { DEFAULT_SETTINGS, ExtensionSettings } from '@/types'
import { loadSettings, saveSettings } from '@/utils/storage'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BugReportIcon from '@mui/icons-material/BugReport'
import EditIcon from '@mui/icons-material/Edit'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Fade,
  Grid,
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
        sx={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
        }}
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
      }}
    >
      <HeaderSection />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Tab Navigation */}
        <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 72,
                px: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                },
                '& .MuiTab-iconWrapper': {
                  marginBottom: '4px !important',
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              },
            }}
          >
            <Tab icon={<SmartToyIcon />} label="AI Provider Configuration" iconPosition="start" />
            <Tab icon={<EditIcon />} label="Rewrite Mode" iconPosition="start" />
            <Tab icon={<BugReportIcon />} label="Debug Settings" iconPosition="start" />
          </Tabs>
        </Card>

        <Grid container spacing={4}>
          {/* Main Content Area - Now Full Width */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* AI Provider Configuration Tab */}
              <Fade in={activeTab === 0} timeout={300}>
                <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                  <Card
                    className="animate-slide-in"
                    sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <ProviderSection
                        settings={settings}
                        onSettingsChange={handleSettingsChange}
                      />
                    </CardContent>
                  </Card>
                </Box>
              </Fade>

              {/* Rewrite Mode Tab */}
              <Fade in={activeTab === 1} timeout={300}>
                <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                  <Card
                    className="animate-slide-in"
                    sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <ModeSection settings={settings} onSettingsChange={handleSettingsChange} />
                    </CardContent>
                  </Card>
                </Box>
              </Fade>

              {/* Debug Settings Tab */}
              <Fade in={activeTab === 2} timeout={300}>
                <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                  <Card
                    className="animate-slide-in"
                    sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <DebugSection settings={settings} onSettingsChange={handleSettingsChange} />
                    </CardContent>
                  </Card>
                </Box>
              </Fade>

              {/* Security Notice - Now at Bottom of Main Content */}
              <Card
                className="animate-slide-in"
                sx={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '2px solid #86efac',
                  boxShadow: '0 4px 20px rgba(134, 239, 172, 0.2)',
                  mt: 2,
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}
                  >
                    <AutoAwesomeIcon sx={{ color: '#059669', fontSize: 32, mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                      Secure & Private
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#047857', lineHeight: 1.6 }}>
                    Your API keys are stored locally in your browser and never sent to our servers.
                    All data remains private and secure on your device.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

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
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
              }}
            >
              {saveStatus.message}
            </Alert>
          </Box>
        </Fade>
      </Container>

      {/* Footer with Author Information */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
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
                color: 'rgba(0, 0, 0, 0.6)',
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
                  color: 'rgba(0, 0, 0, 0.6)',
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
                  color: 'rgba(0, 0, 0, 0.6)',
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
