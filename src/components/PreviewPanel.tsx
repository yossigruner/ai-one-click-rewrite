import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Compare as CompareIcon,
} from '@mui/icons-material'
import { PreviewPanelState, AIProvider, PRESET_OPTIONS } from '@/types'

interface PreviewPanelProps {
  state: PreviewPanelState
  onClose: () => void
  onApply: (rewrittenText: string) => void
  onRegenerate: () => void
  onStyleChange: (style: string) => void
  onProviderChange: (provider: AIProvider) => void
  onModelChange: (model: string) => void
  onCustomInstructionsChange: (instructions: string) => void
  onCopy: () => void
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  state,
  onClose,
  onApply,
  onRegenerate,
  onStyleChange,
  onProviderChange,
  onModelChange,
  onCustomInstructionsChange,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  if (!state.isOpen) return null

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 400,
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
        borderLeft: '1px solid #e5e7eb',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AI One-Click Rewrite
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Provider and Model Selection */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              value={state.currentProvider}
              onChange={(e) => onProviderChange(e.target.value as AIProvider)}
              label="Provider"
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="anthropic">Anthropic</MenuItem>
              <MenuItem value="gemini">Gemini</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={state.currentModel}
              onChange={(e) => onModelChange(e.target.value)}
              label="Model"
            >
              <MenuItem value="gpt-4o-mini">GPT-4o Mini</MenuItem>
              <MenuItem value="gpt-4o">GPT-4o</MenuItem>
              <MenuItem value="claude-3-haiku-20240307">Claude Haiku</MenuItem>
              <MenuItem value="gemini-1.5-flash-latest">Gemini Flash</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Writing Style Selection */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Writing Style
        </Typography>
        <RadioGroup
          value={state.currentStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          sx={{ mb: 2 }}
        >
          {PRESET_OPTIONS.slice(0, 5).map((style) => (
            <FormControlLabel
              key={style}
              value={style}
              control={<Radio size="small" />}
              label={style}
              sx={{ fontSize: '0.875rem' }}
            />
          ))}
          <FormControlLabel
            value="Custom"
            control={<Radio size="small" />}
            label="Custom..."
            sx={{ fontSize: '0.875rem' }}
          />
        </RadioGroup>

        {/* Custom Instructions */}
        {state.currentStyle === 'Custom' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Custom Instructions
            </Typography>
            <TextField
              multiline
              rows={3}
              value={state.customInstructions}
              onChange={(e) => onCustomInstructionsChange(e.target.value)}
              placeholder="Enter custom rewriting instructions..."
              size="small"
              fullWidth
              inputProps={{ maxLength: 500 }}
            />
            <Typography variant="caption" color="text.secondary">
              {state.customInstructions.length}/500 characters
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={onRegenerate}
            disabled={state.isLoading}
            startIcon={state.isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
            sx={{ flex: 1 }}
          >
            {state.isLoading ? 'Processing...' : 'Rewrite'}
          </Button>
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Original Text */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Original Text
        </Typography>
        <TextField
          multiline
          rows={4}
          value={state.selectedText}
          InputProps={{ readOnly: true }}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {wordCount(state.selectedText)} words
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Rewritten Text */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Rewritten Text
        </Typography>
        <TextField
          multiline
          rows={4}
          value={state.rewrittenText}
          onChange={() => {
            // Allow editing of rewritten text
          }}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {wordCount(state.rewrittenText)} words
          </Typography>
          {state.isLoading && (
            <Chip
              icon={<CircularProgress size={16} />}
              label="Processing..."
              size="small"
              color="primary"
            />
          )}
        </Box>

        {/* Error Display */}
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => onApply(state.rewrittenText)}
            disabled={!state.rewrittenText || state.isLoading}
            startIcon={<CheckIcon />}
            sx={{ flex: 1 }}
          >
            Apply to Page
          </Button>
          <Button
            variant="outlined"
            onClick={onRegenerate}
            disabled={state.isLoading}
            startIcon={<RefreshIcon />}
          >
            Regenerate
          </Button>
          <Button
            variant="outlined"
            onClick={handleCopy}
            disabled={!state.rewrittenText}
            startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            size="small"
          >
            Compare
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default PreviewPanel 