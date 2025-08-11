import React from 'react'
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  BugReport as DebugIcon,
  Api as ApiIcon,
  TouchApp as SelectionIcon,
  Refresh as ProcessIcon,
  Error as ErrorIcon,
  Visibility as ConsoleIcon,
} from '@mui/icons-material'
import { ExtensionSettings } from '@/types'

interface DebugSectionProps {
  settings: ExtensionSettings
  onSettingsChange: (updates: Partial<ExtensionSettings>) => void
}

const DebugSection: React.FC<DebugSectionProps> = ({ settings, onSettingsChange }) => {
  const handleDebugToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ debugLogs: event.target.checked })
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
            background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
          }}
        >
          <DebugIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h5">Debug Settings</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Developer tools and troubleshooting options
      </Typography>

      {/* Debug Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          border: '2px solid',
          borderColor: settings.debugLogs ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          backgroundColor: settings.debugLogs ? 'primary.50' : 'grey.50',
          mb: 3,
          transition: 'all 0.2s ease',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Enable debug logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log detailed information to browser console
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch checked={settings.debugLogs} onChange={handleDebugToggle} color="primary" />
          }
          label=""
          sx={{ margin: 0 }}
        />
      </Box>

      {/* Debug Status */}
      {settings.debugLogs && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: 20,
            },
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Debug logging is active
          </Typography>
          <Typography variant="body2">
            Detailed logs are being written to the browser console. Press F12 to open Developer
            Tools.
          </Typography>
        </Alert>
      )}

      {/* What gets logged */}
      <Alert
        severity="info"
        sx={{
          borderRadius: 2,
          backgroundColor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <ConsoleIcon fontSize="small" />
          What gets logged:
        </Typography>
        <List dense sx={{ mt: 1 }}>
          <ListItem sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ApiIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="API requests and responses"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SelectionIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Text selection events"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ProcessIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Rewrite operations"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ErrorIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Error diagnostics"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
          Open browser console (F12) to view logs when enabled.
        </Typography>
      </Alert>
    </Box>
  )
}

export default DebugSection
