import React from 'react'
import {
  Box,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  Alert,
} from '@mui/material'
import { Bolt as ModeIcon, FlashOn as AutoIcon, Visibility as PreviewIcon } from '@mui/icons-material'
import { ExtensionSettings } from '@/types'

interface ModeSectionProps {
  settings: ExtensionSettings
  onSettingsChange: (updates: Partial<ExtensionSettings>) => void
}

const ModeSection: React.FC<ModeSectionProps> = ({ settings, onSettingsChange }) => {
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ mode: event.target.value as 'auto-replace' | 'preview' })
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
          }}
        >
          <ModeIcon sx={{ color: '#666', fontSize: 24 }} />
        </Box>
        <Typography variant="h4">Rewrite Mode</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose how the extension transforms your text
      </Typography>

      {/* Mode Change Alert */}
      {settings.mode === 'preview' && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Preview Mode Active:</strong> Select text to open a side panel where you can choose writing styles and preview results before applying changes.
          </Typography>
        </Alert>
      )}

      <RadioGroup value={settings.mode} onChange={handleModeChange} sx={{ gap: 3 }}>
        {/* Auto-Replace Mode */}
        <Box
          sx={{
            border: settings.mode === 'auto-replace' ? '2px solid #f97316' : '1px solid #e0e0e0',
            backgroundColor: settings.mode === 'auto-replace' ? '#fff7ed' : '#fff',
            borderRadius: 2,
            p: 3,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#f97316',
              backgroundColor: '#fff7ed',
            },
          }}
        >
          <FormControlLabel
            value="auto-replace"
            control={
              <Radio
                sx={{
                  color: '#f97316',
                  '&.Mui-checked': {
                    color: '#f97316',
                  },
                }}
              />
            }
            label={
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AutoIcon sx={{ color: '#f97316', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Auto-Replace Mode
                  </Typography>
                  {settings.mode === 'auto-replace' && (
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        backgroundColor: '#fed7aa',
                        color: '#ea580c',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Directly replaces selected text without preview (instant and seamless)
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#fef3c7', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600 }}>
                    How it works:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#d97706', display: 'block', mt: 0.5 }}>
                    1. Select text → 2. Click floating button → 3. Text is instantly rewritten
                  </Typography>
                </Box>
              </Box>
            }
            sx={{ margin: 0, alignItems: 'flex-start' }}
          />
        </Box>

        {/* Preview Mode */}
        <Box
          sx={{
            border: settings.mode === 'preview' ? '2px solid #3b82f6' : '1px solid #e0e0e0',
            backgroundColor: settings.mode === 'preview' ? '#eff6ff' : '#fff',
            borderRadius: 2,
            p: 3,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#3b82f6',
              backgroundColor: '#eff6ff',
            },
          }}
        >
          <FormControlLabel
            value="preview"
            control={
              <Radio
                sx={{
                  color: '#3b82f6',
                  '&.Mui-checked': {
                    color: '#3b82f6',
                  },
                }}
              />
            }
            label={
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PreviewIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Preview Mode
                  </Typography>
                  {settings.mode === 'preview' && (
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Show results in a side panel before applying changes
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#eff6ff', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 600 }}>
                    How it works:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1d4ed8', display: 'block', mt: 0.5 }}>
                    1. Select text → 2. Side panel opens → 3. Choose style → 4. Preview → 5. Apply
                  </Typography>
                </Box>
              </Box>
            }
            sx={{ margin: 0, alignItems: 'flex-start' }}
          />
        </Box>
      </RadioGroup>
    </Box>
  )
}

export default ModeSection
