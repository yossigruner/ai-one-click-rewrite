import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
} from '@mui/material'
import { Bolt as ModeIcon, FlashOn as AutoIcon } from '@mui/icons-material'
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          }}
        >
          <ModeIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h4">Rewrite Mode</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose how the extension transforms your text
      </Typography>

      <RadioGroup value={settings.mode} onChange={handleModeChange} sx={{ gap: 2 }}>
        {/* Auto-Replace Mode */}
        <Card
          sx={{
            border:
              settings.mode === 'auto-replace' ? '2px solid #f97316' : '2px solid transparent',
            background:
              settings.mode === 'auto-replace'
                ? 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)'
                : 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
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
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Directly replaces selected text without preview (instant and seamless)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ea580c', mt: 1, display: 'block' }}>
                    ✨ Streamlined experience with immediate results
                  </Typography>
                </Box>
              }
              sx={{ margin: 0, alignItems: 'flex-start' }}
            />
          </CardContent>
        </Card>

        {/* Preview Mode - Disabled */}
        <Card
          sx={{
            border: '2px solid #e5e7eb',
            background: '#f9fafb',
            opacity: 0.6,
            position: 'relative',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <FormControlLabel
              value="preview"
              control={
                <Radio
                  disabled
                  sx={{
                    color: '#9ca3af',
                  }}
                />
              }
              label={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      Preview Mode
                    </Typography>
                    <Chip
                      label="Coming Soon"
                      size="small"
                      sx={{
                        backgroundColor: '#e5e7eb',
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Show results in a side panel before applying changes
                  </Typography>
                </Box>
              }
              sx={{ margin: 0, alignItems: 'flex-start' }}
              disabled
            />
          </CardContent>
        </Card>
      </RadioGroup>
    </Box>
  )
}

export default ModeSection
