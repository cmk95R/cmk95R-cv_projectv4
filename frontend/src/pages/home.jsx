import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
  CardMedia,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SchoolIcon from '@mui/icons-material/School';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PublicSearchesCarousel from "../components/PublicSearchesCarousel";
import Footer from '../components/footer';
// ===== Variants =====
// Hero: fondo con ken-burns + contenido fade-up
const heroBgVariants = {
  initial: { scale: 1.02 },
  animate: { scale: 1.07, transition: { duration: 12, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } },
};
const heroContentVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// Cards “¿Aceptás el desafío?”
const imgVariants = {
  rest: { scale: 1, filter: 'brightness(1)', transition: { type: 'spring', stiffness: 120, damping: 15 } },
  hover: { scale: 1.06, filter: 'brightness(0.8)', transition: { type: 'spring', stiffness: 120, damping: 15 } },
};
const overlayVariants = {
  rest: { opacity: 0, y: 20, transition: { duration: 0.25 } },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// Secciones animadas
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { when: 'beforeChildren', staggerChildren: 0.12 }
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18 }
  },
};

// ===== Datos =====
const valores = [
  { icon: LightbulbIcon, title: 'Innovación', text: 'Experimentamos, prototipamos y aprendemos rápido.' },
  { icon: SchoolIcon, title: 'Aprendizaje', text: 'Capacitación continua y mentorías internas.' },

  { icon: FavoriteIcon, title: 'Compromiso', text: 'Cercanía con las personas y foco en resultados.' },
];
const testimonios = [
  {
    nombre: 'María S.',
    rol: 'Frontend Developer',
    frase: 'Crecí más en 6 meses que en años anteriores. El mentoring hace la diferencia.',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop'
  },
  {
    nombre: 'Maria Sofía R.',
    rol: 'Product Manager',
    frase: 'La cultura de equipo y el feedback constante te empujan a mejorar.',
    foto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=300&auto=format&fit=crop'
  },
  {
    nombre: 'Juan Manuel V.',
    rol: 'IT Support',
    frase: 'Es un lugar humano: escuchan y te dan oportunidades reales de crecer.',
    foto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=300&auto=format&fit=crop'
  },
];

const areas = [
  { title: 'Recursos Humanos', tags: ['Seleccion', 'Capacitación', 'Clima'], img: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=1200&q=60', path: '/searches?area=Recursos Humanos' },
  { title: 'Administración', tags: ['Finanzas', 'Compras', 'Legal'], img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=60', path: '/searches?area=Administracion' },
  { title: 'Pasantias', tags: ['Aprendizaje', 'Crecimiento'], img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=60', path: '/searches?area=Pasantia' },
  { title: 'Sistemas', tags: ['Software', 'Soporte Tecnico', 'DevOps'], img: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg', path: '/searches?area=Sistemas' }
];

const Home = () => {
  const navigate = useNavigate();
  const [idxTestimonio, setIdxTestimonio] = React.useState(0);

  const nextTestimonio = () => setIdxTestimonio((p) => (p + 1) % testimonios.length);
  const prevTestimonio = () => setIdxTestimonio((p) => (p - 1 + testimonios.length) % testimonios.length);

  // Auto-rotate testimonios
  React.useEffect(() => {
    const t = setInterval(() => nextTestimonio(), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', py: 4 }}>

      {/* ===== HERO con animaciones ===== */}
      <Box
        sx={{
          position: 'relative',
          height: '50vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          mb: 4,
        }}
      >
        <motion.div
          variants={heroBgVariants}
          initial="initial"
          animate="animate"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://asytec.com/_next/static/media/gestion.04a56933.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }} />
        <Container maxWidth="md" sx={{ zIndex: 2 }}>
          <motion.div variants={heroContentVariants} initial="hidden" animate="visible">
            <Typography variant="h2" component="h1" gutterBottom>
              Bienvenido
            </Typography>
            <Typography variant="h5">
              Sumate a un equipo apasionado por la tecnología y la innovación.
            </Typography>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} style={{ marginTop: 24 }}>
              <Button variant="contained" color="primary" onClick={() => navigate('/register')} sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}>
                Postularme
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* ===== VALORES / CULTURA ===== */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom textAlign="center">Nuestros valores</Typography>
          <Grid container spacing={3}>
            {valores.map((v, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <motion.div variants={cardVariants} whileHover={{ y: -6 }}>
                  <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 3 }}>
                    <v.icon sx={{ fontSize: 60, mb: 1, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom>{v.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{v.text}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </motion.section>

      {/* ===== CARROUSEL DE PUBLICACIONES ===== */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <Container maxWidth="lg" sx={{ mb: 2 }}>
        <PublicSearchesCarousel />
        </Container>
      </motion.section>


      {/* ===== OPORTUNIDADES POR ÁREA ===== */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            Áreas de Oportunidad
          </Typography>
          <Grid container spacing={3}>
            {areas.map((a, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <motion.div variants={cardVariants} whileHover={{ y: -6, scale: 1.01 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: 4,
                      display: "flex",
                      flexDirection: "column",
                      height: "360px",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={a.img}
                      alt={a.title}
                      sx={{
                        height: 160,
                        width: "100%",
                        objectFit: "cover"
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {a.title}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ maxHeight: 60, overflow: "hidden" }}>
                        {a.tags.map((t) => (
                          <Chip key={t} label={t} size="small" />
                        ))}
                      </Stack>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(a.path)}
                      >
                        Ver vacantes
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </motion.section>


      {/* ===== SECCIÓN: ¿Aceptás el desafío? (cards grandes con hover) ===== */}
      {/* <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom display={'flex'} justifyContent={'center'}>
          ¿Aceptás el desafío?
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            {
              title: 'Crecé con nosotros',
              text: 'Impulsamos tu desarrollo profesional con capacitaciones constantes.',
              image: 'https://d19i1lccnoz5a9.cloudfront.net/img/article/importancia-de-la-administracion-del-recurso-humano.webp',
            },
            {
              title: 'Desafíos reales',
              text: 'Formá parte de proyectos reales que impactan en la industria.',
              image: 'https://talentohumano.com.sv/wp-content/uploads/2023/05/director-de-Recursos-Humanos.png',
            },
            {
              title: 'Equipo humano',
              text: 'Trabajamos con personas que valoran el compromiso y la innovación.',
              image: 'https://worldcampus.saintleo.edu/img/article/periodos-claves-de-la-historia-de-los-recursos-humanos.webp',
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div initial="rest" whileHover="hover" animate="rest" style={{ width: 380 }}>
                <Card sx={{ maxWidth: 380, borderRadius: 3, overflow: 'hidden', position: 'relative', boxShadow: 6 }}>
                  <Box sx={{ position: 'relative', height: 280 }}>
                    <motion.div variants={imgVariants} style={{ height: '100%' }}>
                      <CardMedia component="img" height="280" image={item.image} alt={item.title} />
                    </motion.div>
                    <motion.div
                      variants={overlayVariants}
                      style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.75) 100%)',
                        padding: 20, pointerEvents: 'none',
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#f0f0f0', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                          {item.text}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box> */}

      {/* ===== TESTIMONIOS (carrusel simple) ===== */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom textAlign="center">Historias reales</Typography>
        <Box sx={{ position: 'relative', backgroundColor: 'white', borderRadius: 3, boxShadow: 3, p: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <IconButton onClick={prevTestimonio}><ArrowBackIosNewIcon /></IconButton>
            <IconButton onClick={nextTestimonio}><ArrowForwardIosIcon /></IconButton>
          </Stack>
          <Box sx={{ minHeight: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={idxTestimonio}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                style={{ width: '100%' }}
              >
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Avatar src={testimonios[idxTestimonio].foto} sx={{ width: 72, height: 72 }} />
                  <Typography variant="h6" sx={{ maxWidth: 680 }}>
                    “{testimonios[idxTestimonio].frase}”
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonios[idxTestimonio].nombre} — {testimonios[idxTestimonio].rol}
                  </Typography>
                </Stack>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Container>




      {/* ===== FAQ ===== */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Typography variant="h4" gutterBottom textAlign="center">Preguntas frecuentes</Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>¿Cómo es el proceso de selección?</AccordionSummary>
          <AccordionDetails>
            Realizamos un primer screening de CV, entrevista con RRHH y entrevista técnica/cultural con el equipo. Te mantenemos informado en cada etapa.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>¿En qué áreas puedo postularme?</AccordionSummary>
          <AccordionDetails>
            Tecnología, Comercial, Administración y People. También recibimos postulaciones espontáneas.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>¿Qué pasa después de cargar mi CV?</AccordionSummary>
          <AccordionDetails>
            Nuestro equipo evalúa tu perfil y, si hay match, te contactamos para los siguientes pasos. Guardamos tu CV para futuras búsquedas.
          </AccordionDetails>
        </Accordion>
      </Container>

      {/* ===== CTA final ===== */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 6, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" gutterBottom>¿Te gustaría trabajar con nosotros?</Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>Subí tu CV y sumate a nuestra base de talentos.</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/register')} sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}>
            Cargar mi CV
          </Button>
        </Box>
      </Container>
      <Footer />
    </Box>

  );
};

export default Home;
