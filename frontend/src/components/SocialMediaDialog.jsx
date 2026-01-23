import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, IconButton, Box
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import CloseIcon from '@mui/icons-material/Close';

export default function SocialMediaDialog({ open, onClose }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, textAlign: 'center', p: 1 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#084a70' }}>
          ¡Postulación Exitosa!
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Tu solicitud ha sido enviada correctamente.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Te invitamos a seguirnos en nuestras redes sociales para enterarte de nuevas búsquedas y novedades.
        </Typography>
        
        <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 1 }}>
          <IconButton
            href="https://www.linkedin.com/company/asytec/"
            target="_blank"
            sx={{ 
              color: '#0077b5',
              '&:hover': { transform: 'scale(1.1)', bgcolor: 'transparent' },
              transition: 'transform 0.2s'
            }}
          >
            <LinkedInIcon sx={{ fontSize: 50 }} />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/asytecsistemas/"
            target="_blank"
            sx={{ 
              color: '#E1306C',
              '&:hover': { transform: 'scale(1.1)', bgcolor: 'transparent' },
              transition: 'transform 0.2s'
            }}
          >
            <InstagramIcon sx={{ fontSize: 50 }} />
          </IconButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}