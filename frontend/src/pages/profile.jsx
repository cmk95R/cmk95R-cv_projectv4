import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Grid, Typography, Avatar, Card,
  Button, TextField, MenuItem, Stack, Snackbar, Alert, Skeleton,
  Stepper, Step, StepLabel, CircularProgress, Fade, IconButton // Añadido IconButton
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Person as PersonIcon,
  ContactMail as ContactMailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";

// APIs (asumidos)
import { profileApi } from "../api/auth";
import { getMyCvApi, upsertMyCvJson } from "../api/cv";
import DireccionAR from "../components/DireccionAR";

// Constantes (sin cambios)
const nivelesAcademicos = [
    "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
    "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
    "Posgrado en curso", "Posgrado completo",
];
const steps = ['Datos Personales', 'Contacto y Ubicación', 'Educación', 'Experiencia Laboral', 'Revisar y Guardar'];

// --- Componente principal (con cambios en el manejo de estado) ---
export default function ProfileWizard() {
  const [loading, setLoading] = useState(true);
  const [cvData, setCvData] = useState({});
  const [user, setUser] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });
  const [activeStep, setActiveStep] = useState(0);
  const [isSavingStep, setIsSavingStep] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: me }, { data: cvResp }] = await Promise.all([profileApi(), getMyCvApi()]);
      const userData = me?.user || {};
      const cv = cvResp?.cv || {};
      setUser(userData);
      setCvData({
        ...cv,
        nombre: cv.nombre || userData.nombre || '',
        apellido: cv.apellido || userData.apellido || '',
        nacimiento: cv.nacimiento || userData.nacimiento || '',
        email: cv.email || userData.email || '',
        // La dirección ahora se carga SIEMPRE desde el perfil del usuario
        // para mantener una única fuente de verdad.
        direccion: userData.direccion || {},
      });
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: "No se pudo cargar tu perfil." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // **CAMBIO #1: Función para actualizar el estado centralizado**
  const handleDataChange = (field, value) => {
    setCvData(prevData => ({ ...prevData, [field]: value }));
  };
  
  // **NUEVO: Función específica para manejar el cambio de dirección**
  const handleDireccionChange = useCallback((dir) => {
    // `dir` viene de DireccionAR como { provincia: {id, nombre}, localidad: {id, nombre} }
    setCvData(prevData => ({ ...prevData, direccion: dir }));
  }, []);

  // **CAMBIO #2: Función para manejar cambios en la lista de experiencias**
  const handleExperienceChange = (newExperiences) => {
    setCvData(prevData => ({...prevData, experiencia: newExperiences}));
  };

  const handleSaveStep = async () => {
    setIsSavingStep(true);
    try { 
      // Preparamos los datos para el backend.
      // El backend del CV ahora entiende el objeto 'direccion' si los campos están en ALLOWED_FIELDS.
      const payload = {
        ...cvData,
        provincia: cvData.direccion?.provincia?.nombre, // Aplanamos para el CV
        localidad: cvData.direccion?.localidad?.nombre, // Aplanamos para el CV
      };
      await upsertMyCvJson(payload);
      setSnack({ open: true, severity: "success", msg: "Paso guardado correctamente." });
      return true;
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: "Error al guardar el paso." });
      return false;
    } finally {
      setIsSavingStep(false);
    }
  };
  
  // El resto de los handlers (handleNext, handleBack, handleFinalSave) no necesitan cambios

  const handleNext = () => setActiveStep(p => p + 1);
  const handleBack = () => setActiveStep(p => p - 1);
  const handleFinalSave = async () => {
    setIsSavingStep(true);
    try {
      await upsertMyCvJson(cvData);
      setSnack({ open: true, severity: "success", msg: "Perfil guardado con éxito!" });
      await fetchAll();
      setActiveStep(0);
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Error al guardar el perfil final." });
    } finally {
      setIsSavingStep(false);
    }
  };


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  const getStepContent = (step) => {
    // **CAMBIO #3: Pasamos los datos y la función `onChange` a cada formulario**
    switch (step) {
      case 0:
        return <PersonalForm data={cvData} onChange={handleDataChange} onSave={handleSaveStep} isSaving={isSavingStep} />;
      case 1:
        return <ContactLocationForm data={cvData} onFieldChange={handleDataChange} onDireccionChange={handleDireccionChange} onSave={handleSaveStep} isSaving={isSavingStep} />;
      case 2:
        return <EducationForm data={cvData} onChange={handleDataChange} onSave={handleSaveStep} isSaving={isSavingStep} />;
      case 3:
        return <ExperienceForm data={cvData.experiencia || []} onChange={handleExperienceChange} onSave={handleSaveStep} isSaving={isSavingStep} />;
      case 4:
        return <ReviewAndSaveForm data={cvData} onFinalSave={handleFinalSave} isSaving={isSavingStep} />;
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => window.history.back()} sx={{ mb: 3 }}>Volver</Button>
      <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
          Configurar Perfil Profesional
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        <Box sx={{ minHeight: 400, p: 2 }}>
          {getStepContent(activeStep)}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button color="inherit" disabled={activeStep === 0 || isSavingStep} onClick={handleBack} sx={{ mr: 1 }}>
            Anterior
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleFinalSave} disabled={isSavingStep}>
              {isSavingStep ? <CircularProgress size={24} /> : 'Guardar Perfil'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} disabled={isSavingStep}>
              Siguiente
            </Button>
          )}
        </Box>
      </Card>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}

// --- Componentes de Formulario por Paso (Refactorizados) ---

// **CAMBIO #4: Los formularios ahora son "componentes controlados" por el padre**
const PersonalForm = ({ data, onChange, onSave, isSaving }) => {
  return (
    <Fade in={true}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>Cuéntanos un poco sobre ti</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Nombre *" value={data.nombre || ''} onChange={e => onChange('nombre', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Apellido" value={data.apellido || ''} onChange={e => onChange('apellido', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12}><TextField type="date" label="Fecha de nacimiento" value={String(data.nacimiento || '').slice(0, 10)} InputLabelProps={{ shrink: true }} onChange={e => onChange('nacimiento', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Resumen Profesional" multiline rows={4} value={data.perfil || ''} onChange={e => onChange('perfil', e.target.value)} fullWidth /></Grid>
        </Grid>
        <Button variant="outlined" onClick={onSave} disabled={isSaving} sx={{ alignSelf: 'flex-end' }}>
          {isSaving ? <CircularProgress size={24} /> : 'Guardar y Continuar'}
        </Button>
      </Stack>
    </Fade>
  );
};

const ContactLocationForm = ({ data, onFieldChange, onDireccionChange, onSave, isSaving }) => {
  // El valor para DireccionAR debe tener el formato { provincia: {id, nombre}, localidad: {id, nombre} }
  // Si solo tenemos strings, los convertimos a ese formato para la carga inicial.
  const direccionValue = data.direccion || {
    provincia: typeof data.provincia === 'string' ? { nombre: data.provincia } : data.provincia,
    localidad: typeof data.ciudad === 'string' ? { nombre: data.ciudad } : data.ciudad,
  };

  return (
    <Fade in={true}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>Información de Contacto y Ubicación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Email *" value={data.email || ''} onChange={e => onFieldChange('email', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Teléfono" value={data.telefono || ''} onChange={e => onFieldChange('telefono', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12}><TextField label="URL de LinkedIn" value={data.linkedin || ''} onChange={e => onFieldChange('linkedin', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12}><DireccionAR value={direccionValue} onChange={onDireccionChange} required /></Grid>
        </Grid>
        <Button variant="outlined" onClick={onSave} disabled={isSaving} sx={{ alignSelf: 'flex-end' }}>
          {isSaving ? <CircularProgress size={24} /> : 'Guardar y Continuar'}
        </Button>
      </Stack>
    </Fade>
  );
};

const EducationForm = ({ data, onChange, onSave, isSaving }) => {
    return (
        <Fade in={true}>
            <Stack spacing={3}>
                <Typography variant="h6" gutterBottom>Tu Trayectoria Académica</Typography>
                <TextField select fullWidth label="Máximo nivel académico" value={data.nivelAcademico || ''} onChange={e => onChange('nivelAcademico', e.target.value)}>
                    {nivelesAcademicos.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </TextField>
                <TextField fullWidth label="Institución Educativa" value={data.institucion || ''} onChange={e => onChange('institucion', e.target.value)} />
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextField type="date" fullWidth label="Fecha de Inicio" value={String(data.periodoEduDesde || '').slice(0, 10)} InputLabelProps={{ shrink: true }} onChange={e => onChange('periodoEduDesde', e.target.value)} /></Grid>
                    <Grid item xs={6}><TextField type="date" fullWidth label="Fecha de Fin" value={String(data.periodoEduHasta || '').slice(0, 10)} InputLabelProps={{ shrink: true }} onChange={e => onChange('periodoEduHasta', e.target.value)} /></Grid>
                </Grid>
                <Button variant="outlined" onClick={onSave} disabled={isSaving} sx={{ alignSelf: 'flex-end' }}>
                    {isSaving ? <CircularProgress size={24} /> : 'Guardar y Continuar'}
                </Button>
            </Stack>
        </Fade>
    );
};

const ExperienceForm = ({ data, onChange, onSave, isSaving }) => {
  const experiences = data; // Ahora `data` es directamente el array

  const addExperience = () => onChange([...experiences, { puesto: '', empresa: '', desde: '', hasta: '' }]);
  const removeExperience = (idx) => onChange(experiences.filter((_, i) => i !== idx));
  const updateExperience = (idx, field, value) => {
    const newExperiences = experiences.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp);
    onChange(newExperiences);
  };

  return (
    <Fade in={true}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>Tu Historial Laboral</Typography>
        {experiences.map((exp, idx) => (
          <Card key={idx} variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight="medium">Experiencia #{idx + 1}</Typography>
              <IconButton color="error" size="small" onClick={() => removeExperience(idx)}><DeleteIcon /></IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField label="Puesto / Título" value={exp.puesto} onChange={e => updateExperience(idx, 'puesto', e.target.value)} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="Empresa" value={exp.empresa} onChange={e => updateExperience(idx, 'empresa', e.target.value)} fullWidth /></Grid>
              <Grid item xs={6}><TextField type="date" label="Desde" value={String(exp.desde || '').slice(0, 10)} InputLabelProps={{ shrink: true }} onChange={e => updateExperience(idx, 'desde', e.target.value)} fullWidth /></Grid>
              <Grid item xs={6}><TextField type="date" label="Hasta" value={String(exp.hasta || '').slice(0, 10)} InputLabelProps={{ shrink: true }} onChange={e => updateExperience(idx, 'hasta', e.target.value)} fullWidth /></Grid>
            </Grid>
          </Card>
        ))}
        <Button startIcon={<AddIcon />} onClick={addExperience} variant="outlined" sx={{ alignSelf: 'flex-start' }}>Añadir Experiencia</Button>
        <Button variant="outlined" onClick={onSave} disabled={isSaving} sx={{ alignSelf: 'flex-end' }}>
          {isSaving ? <CircularProgress size={24} /> : 'Guardar y Continuar'}
        </Button>
      </Stack>
    </Fade>
  );
};

// El componente ReviewAndSaveForm no necesita cambios, ya que solo muestra datos.
const ReviewAndSaveForm = ({ data, onFinalSave, isSaving }) => (
    <Fade in={true}>
        <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>Revisa tu Perfil</Typography>
            {/* ...cuerpo del componente sin cambios... */}
            <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Datos Personales:</Typography>
                <Typography>Nombre: {data.nombre || '—'} {data.apellido || ''}</Typography>
                <Typography>Nacimiento: {data.nacimiento ? new Date(data.nacimiento + 'T00:00:00').toLocaleDateString() : '—'}</Typography>
                <Typography>Resumen: {data.perfil || '—'}</Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Contacto y Ubicación:</Typography>
                <Typography>Email: {data.email || '—'}</Typography>
                <Typography>Teléfono: {data.telefono || '—'}</Typography>
                <Typography>LinkedIn: {data.linkedin || '—'}</Typography>
                <Typography>Ubicación: {`${data.localidad || ''}${data.provincia ? ', ' + data.provincia : ''}${data.pais ? ', ' + data.pais : ''}` || '—'}</Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Educación:</Typography>
                <Typography>Nivel: {data.nivelAcademico || '—'}</Typography>
                <Typography>Institución: {data.institucion || '—'}</Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Experiencia Laboral:</Typography>
                {data.experiencia?.length ? data.experiencia.map((exp, idx) => (
                <Box key={idx} sx={{ ml: 2, mt: 1 }}>
                    <Typography fontWeight="medium">{exp.puesto} en {exp.empresa}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {exp.desde ? new Date(exp.desde + 'T00:00:00').toLocaleDateString() : '—'} - {exp.hasta ? new Date(exp.hasta + 'T00:00:00').toLocaleDateString() : '—'}
                    </Typography>
                </Box>
                )) : <Typography>Sin experiencia registrada.</Typography>}
            </Card>
            <Button variant="contained" color="primary" onClick={onFinalSave} disabled={isSaving} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-end' }}>
                {isSaving ? <CircularProgress size={24} /> : 'Confirmar y Guardar Todo'}
            </Button>
        </Stack>
    </Fade>
);