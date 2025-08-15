import { Box, Container, Typography } from '@mui/material'
import React from 'react'

const HeaderSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center">
          {/* Logo and Brand Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            {/* Icon Container */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                mb: 2,
                p: 1,
                border: '1px solid #e9ecef',
              }}
            >
              <img
                src="/icons/icon48.png"
                alt="AI One-Click Rewrite"
                style={{
                  width: '28px',
                  height: '28px',
                }}
              />
            </Box>

            {/* Brand Name */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 700,
                color: '#1a1a1a',
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              AI One‑Click Rewrite
            </Typography>

            {/* Version/Subtitle */}
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Chrome Extension Settings
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: '#666',
              fontWeight: 400,
              fontSize: '1rem',
              maxWidth: 500,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Transform your writing instantly with AI. Configure your providers and personalize your
            experience.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default HeaderSection
