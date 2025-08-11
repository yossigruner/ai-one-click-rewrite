import { Box, Container, Typography } from '@mui/material'
import React from 'react'

const HeaderSection: React.FC = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box textAlign="center">
          {/* Logo and Brand Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
            }}
          >
            {/* Icon Container */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(15px)',
                borderRadius: 3,
                mb: 2,
                p: 1,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src="/icons/icon48.png"
                alt="AI One-Click Rewrite"
                style={{
                  width: '32px',
                  height: '32px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
              />
            </Box>

            {/* Brand Name */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 0.5,
                letterSpacing: '-0.02em',
              }}
            >
              AI One‑Click Rewrite
            </Typography>

            {/* Version/Subtitle */}
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
                fontSize: '0.875rem',
                mb: 0.5,
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
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 400,
              fontSize: '1rem',
              maxWidth: 500,
              margin: '0 auto',
              lineHeight: 1.5,
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
