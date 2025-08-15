import React from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Alert,
  Link,
  SelectChangeEvent,
} from '@mui/material'
import {
  Memory as OpenAIIcon,
  Psychology as AnthropicIcon,
  AutoAwesome as GeminiIcon,
  Key as KeyIcon,
  Settings as ModelIcon,
  Edit as PresetIcon,
} from '@mui/icons-material'
import { ExtensionSettings, AIProvider, PRESET_OPTIONS, MODEL_OPTIONS } from '@/types'

interface ProviderSectionProps {
  settings: ExtensionSettings
  onSettingsChange: (updates: Partial<ExtensionSettings>) => void
}

const ProviderSection: React.FC<ProviderSectionProps> = ({ settings, onSettingsChange }) => {
  const handleProviderChange = (event: SelectChangeEvent<AIProvider>) => {
    onSettingsChange({ provider: event.target.value as AIProvider })
  }

  const handleKeyChange = (provider: AIProvider, value: string) => {
    onSettingsChange({
      keys: { ...settings.keys, [provider]: value },
    })
  }

  const handleModelChange = (provider: AIProvider, value: string) => {
    onSettingsChange({
      models: { ...settings.models, [provider]: value },
    })
  }

  const handlePresetChange = (provider: AIProvider, value: string) => {
    onSettingsChange({
      presets: { ...settings.presets, [provider]: value },
    })
  }

  const handleCustomPresetChange = (provider: AIProvider, value: string) => {
    onSettingsChange({
      customPresets: { ...settings.customPresets, [provider]: value },
    })
  }

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return <OpenAIIcon sx={{ color: '#10b981' }} />
      case 'anthropic':
        return <AnthropicIcon sx={{ color: '#f97316' }} />
      case 'gemini':
        return <GeminiIcon sx={{ color: '#6366f1' }} />
    }
  }

  const getProviderInfo = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return {
          name: 'OpenAI',
          description: 'GPT-4 and GPT-3.5 models for professional writing',
          color: '#10b981',
          apiUrl: 'https://platform.openai.com',
          keyPlaceholder: 'sk-...',
        }
      case 'anthropic':
        return {
          name: 'Anthropic Claude',
          description: 'Claude 3 family models for thoughtful, nuanced writing',
          color: '#f97316',
          apiUrl: 'https://console.anthropic.com',
          keyPlaceholder: 'sk-ant-...',
        }
      case 'gemini':
        return {
          name: 'Google Gemini',
          description: 'Gemini Pro and Flash models for creative and versatile writing',
          color: '#6366f1',
          apiUrl: 'https://makersuite.google.com',
          keyPlaceholder: 'AIza...',
        }
    }
  }

  const currentProvider = settings.provider
  const providerInfo = getProviderInfo(currentProvider)

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {getProviderIcon(currentProvider)}
        AI Provider Configuration
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select and configure your preferred AI service
      </Typography>

      {/* Provider Selection */}
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth sx={{ maxWidth: 400 }}>
          <InputLabel>Active Provider</InputLabel>
          <Select
            value={currentProvider}
            label="Active Provider"
            onChange={handleProviderChange}
            sx={{ fontWeight: 600 }}
          >
            <MenuItem value="openai">🤖 OpenAI - GPT Models</MenuItem>
            <MenuItem value="anthropic">🎭 Anthropic - Claude Models</MenuItem>
            <MenuItem value="gemini">✨ Google Gemini - Gemini Models</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Provider Configuration */}
      <Box
        sx={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 2,
          p: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: providerInfo.color,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          },
        }}
      >
        {/* Provider Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              backgroundColor: `${providerInfo.color}15`,
              border: `1px solid ${providerInfo.color}30`,
            }}
          >
            {getProviderIcon(currentProvider)}
          </Box>
          <Typography variant="h5" gutterBottom>
            {providerInfo.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {providerInfo.description}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* API Key */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={settings.keys[currentProvider]}
              onChange={(e) => handleKeyChange(currentProvider, e.target.value)}
              placeholder={providerInfo.keyPlaceholder}
              InputProps={{
                startAdornment: <KeyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Model Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={settings.models[currentProvider]}
                label="Model"
                onChange={(e) => handleModelChange(currentProvider, e.target.value)}
                startAdornment={<ModelIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {MODEL_OPTIONS[currentProvider].map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Preset Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Writing Style Preset</InputLabel>
              <Select
                value={settings.presets[currentProvider]}
                label="Writing Style Preset"
                onChange={(e) => handlePresetChange(currentProvider, e.target.value)}
                startAdornment={<PresetIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {PRESET_OPTIONS.map((preset) => (
                  <MenuItem key={preset} value={preset}>
                    {preset}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Preset Input */}
          {settings.presets[currentProvider] === 'Custom' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Custom Instructions"
                value={settings.customPresets[currentProvider]}
                onChange={(e) => handleCustomPresetChange(currentProvider, e.target.value)}
                placeholder="Enter your custom rewriting instructions..."
                helperText="Example: 'Rewrite in a formal academic tone with citations'"
              />
            </Grid>
          )}
        </Grid>

        {/* API Key Help */}
        <Alert
          severity="info"
          sx={{
            mt: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: providerInfo.color,
            },
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Getting your API key:
          </Typography>
          <Typography variant="body2">
            Visit{' '}
            <Link
              href={providerInfo.apiUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: providerInfo.color, fontWeight: 600 }}
            >
              {providerInfo.apiUrl}
            </Link>{' '}
            and create an API key in your account settings.
          </Typography>
        </Alert>
      </Box>
    </Box>
  )
}

export default ProviderSection
