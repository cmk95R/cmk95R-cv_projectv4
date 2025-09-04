import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Stack,
  Link,
  IconButton,
} from '@mui/material';

import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'white', mt: 8, pt: 4, pb: 1 } }>
      <Container maxWidth="lg">
        <Grid container spacing={4} display={'flex'} justifyContent={'space-between'}>

          {/* Columna contacto */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>Contacto</Typography>
            <Typography variant="body2">Av. Siempre Viva 742, CABA</Typography>
            <Typography variant="body2">Tel: +54 11 1234-5678</Typography>
            <Typography variant="body2">Email: rrhh@rrhh.com</Typography>
          </Grid>

          {/* Columna redes sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>Seguinos</Typography>
            <Stack direction="row" spacing={2}>
              <IconButton color="inherit" href="https://linkedin.com" target="_blank"><LinkedInIcon /></IconButton>
              <IconButton color="inherit" href="https://facebook.com" target="_blank"><FacebookIcon /></IconButton>
              <IconButton color="inherit" href="https://twitter.com" target="_blank"><TwitterIcon /></IconButton>
              <IconButton color="inherit" href="https://instagram.com" target="_blank"><InstagramIcon /></IconButton>
            </Stack>
          </Grid>
        </Grid>

        {/* Línea inferior */}
        <Box sx={{ textAlign: 'center', mt: 5, borderTop: '1px solid rgba(255,255,255,0.2)', pt: 3 }}>
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} RRHH. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
