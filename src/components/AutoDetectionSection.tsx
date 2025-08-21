import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Alert,
  Divider,
} from '@mui/material'
import { Settings as SettingsIcon } from '@mui/icons-material'
import { ExtensionSettings } from '@/types'

interface AutoDetectionSectionProps {
  settings: ExtensionSettings
  onSettingsChange: (settings: Partial<ExtensionSettings>) => void
}

const AutoDetectionSection: React.FC<AutoDetectionSectionProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [autoDetection, setAutoDetection] = useState(settings.autoDetection || 'always')

  useEffect(() => {
    setAutoDetection(settings.autoDetection || 'always')
  }, [settings.autoDetection])

  const handleAutoDetectionChange = (value: string) => {
    const newValue = value as 'always' | 'right-click-only' | 'disabled'
    setAutoDetection(newValue)
    onSettingsChange({ autoDetection: newValue })
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            mb: 2,
          }}
        >
          <SettingsIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Auto-Detection Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Control how the extension detects and responds to text selection on web pages
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Box
        sx={{
          p: 4,
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: '#f8f9fa',
          transition: 'all 0.2s ease',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Text Selection Detection
        </Typography>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={autoDetection}
            onChange={(e) => handleAutoDetectionChange(e.target.value)}
          >
            <FormControlLabel
              value="always"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Always show floating button
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shows the floating ✨ button whenever you select text. This is the default behavior
                    and provides the most convenient experience.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start' }}
            />

            <FormControlLabel
              value="right-click-only"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Only right-click context menu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No floating button. You can only access the extension through the right-click
                    context menu "Rewrite with AI" option.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start' }}
            />

            <FormControlLabel
              value="disabled"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Disabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completely disables automatic text selection detection. The extension will not
                    respond to text selection at all.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Information Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> This setting affects both Auto-Replace and Preview modes. When set to
          "right-click-only" or "disabled", you can still access the extension through the browser's
          extension menu or by clicking the extension icon in the toolbar.
        </Typography>
      </Alert>

      {/* Behavior Details */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          How it works
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3b82f6' }}>
              Always show floating button
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Floating ✨ button appears when you select text
              • Works with both Auto-Replace and Preview modes
              • Most interactive and user-friendly option
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f59e0b' }}>
              Only right-click context menu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • No floating button appears
              • Right-click selected text → "Rewrite with AI"
              • Cleaner interface, less visual clutter
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ef4444' }}>
              Disabled
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • No automatic detection or visual feedback
              • Access only through extension icon in toolbar
              • Minimal interference with browsing experience
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default AutoDetectionSection 