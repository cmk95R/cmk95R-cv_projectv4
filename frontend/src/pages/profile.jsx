// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Box, Container, Paper, Typography, Divider, Grid, TextField,
    MenuItem, Button, Stack, Chip, Snackbar, Alert, Skeleton, Switch, FormControlLabel
} from "@mui/material";
import { profileApi } from "../api/auth";
import { getMyCvApi, upsertMyCvJson } from "../api/cv";
import { motion } from "framer-motion";


const opcionesPorRol = [
    "Administracion",
    "Recursos Humanos",
    "Sistemas",
    "Pasantia"
];
const nivelesAcademicos = [
    "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
    "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
    "Posgrado en curso", "Posgrado completo",
];
export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editable, setEditable] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState("Desarrollo");
    const [user, setUser] = useState(null);  
    const [cv, setCv] = useState(null);  

    const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });
    // Animaciones suaves
    const sectionVariants = {
        hidden: { opacity: 0, y: 14 },
        visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" } }),
    };
    const [form, setForm] = useState({
        nombre: "", nacimiento: "", ciudad: "", provincia: "", pais: "",
        email: "", telefono: "",
        areaRol: "Desarrollo",
        habilidades: [], otraHabilidad: "",
        competencias: [],
        perfil: "", salario: "", linkedin: "", repositorio: "",
        nivelAcademico: "", carreraIT: "", nivelIngles: "Sin conocimientos",
        certIngles: "", detalleCertIngles: "",
        ambitoLaboral: "", otraSituacion: "",
        relacionIT: "", aniosIT: "", disponibilidad: "",
    });

    const requiredOk = useMemo(() => {
        const r = form;
        return r.nombre && r.email;
    }, [form]);

    const setFromCv = (cvData, fallbackUser) => {
        setForm({
            nombre: cvData?.nombre ?? fallbackUser?.nombre ?? "",
            apellido: cvData?.apellido ?? fallbackUser?.apellido ?? "",
            nacimiento: cvData?.nacimiento ? String(cvData.nacimiento).slice(0, 10) : "",
            ciudad: cvData?.ciudad ?? "",
            provincia: cvData?.provincia ?? "",
            pais: cvData?.pais ?? "",
            email: cvData?.email ?? fallbackUser?.email ?? "",
            telefono: cvData?.telefono ?? "",
            areaRol: cvData?.areaRol ?? "Desarrollo",
            habilidades: Array.isArray(cvData?.habilidades) ? cvData.habilidades : [],
            otraHabilidad: cvData?.otraHabilidad ?? "",
            competencias: Array.isArray(cvData?.competencias) ? cvData.competencias : [],
            perfil: cvData?.perfil ?? "",
            salario: cvData?.salario ?? "",
            linkedin: cvData?.linkedin ?? "",
            repositorio: cvData?.repositorio ?? "",
            nivelAcademico: cvData?.nivelAcademico ?? "",
            carreraIT: cvData?.carreraIT ?? "",
            nivelIngles: cvData?.nivelIngles ?? "Sin conocimientos",
            certIngles: cvData?.certIngles ?? "",
            detalleCertIngles: cvData?.detalleCertIngles ?? "",
            ambitoLaboral: cvData?.ambitoLaboral ?? "",
            otraSituacion: cvData?.otraSituacion ?? "",
            relacionIT: cvData?.relacionIT ?? "",
            aniosIT: cvData?.aniosIT ?? "",
            disponibilidad: cvData?.disponibilidad ?? "",
        });
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [{ data: me }, { data: cvResp }] = await Promise.all([
                profileApi(),     // GET /auth/profile
                getMyCvApi(),     // GET /cv/me
            ]);
            const u = me?.user || null;
            const c = cvResp?.cv || null;
            setUser(u);
            setCv(c);
            setFromCv(c || {}, u || {});
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo cargar tu perfil" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

    const handleDrop = (ev) => {
        ev.preventDefault();
        const file = ev.dataTransfer.files?.[0];
        if (file) setForm((prev) => ({ ...prev, cv: file }));
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };


    const handleSave = async () => {
        if (!requiredOk) {
            setSnack({ open: true, severity: "warning", msg: "Completá los campos obligatorios (*)" });
            return;
        }
        try {
            setSaving(true);
            await upsertMyCvJson(form); // POST /cv/me (upsert)
            setSnack({ open: true, severity: "success", msg: "Datos guardados ✅" });
            setEditable(false);
            fetchAll();
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo guardar" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h4" fontWeight={700}>Mi Perfil</Typography>
                    <FormControlLabel
                        control={<Switch checked={editable} onChange={(_, v) => setEditable(v)} />}
                        label="Editar"
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user ? `Sesión: ${user.nombre || ""} (${user.email})` : <Skeleton width={240} />}
                </Typography>

                {loading ? (
                    <Box>
                        <Skeleton height={32} width="40%" />
                        <Skeleton height={56} sx={{ my: 1 }} />
                        <Skeleton height={56} sx={{ my: 1 }} />
                        <Skeleton height={32} width="40%" sx={{ mt: 3 }} />
                        <Skeleton height={56} sx={{ my: 1 }} />
                    </Box>
                ) : (
                    <>
                        {/* Datos personales */}
                        <Typography variant="h6" sx={{ mt: 1, mb: 1.5, fontWeight: 600 }}>
                            Datos personales
                        </Typography>
                        <Grid container spacing={2}>
                            {[

                                { name: "nombre", label: "Nombre *" },
                                { name: "apellido", label: "Apellido *" },
                                { name: "email", label: "Correo electrónico *" },

                            ].map(f => (
                                <Grid key={f.name} item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={f.label}
                                        name={f.name}
                                        type={f.type || "text"}
                                        InputLabelProps={f.InputLabelProps}
                                        value={form[f.name] || ""}
                                        onChange={handleChange}
                                        disabled={!editable}
                                    />
                                </Grid>
                            ))}
                        </Grid>



                        <Grid container spacing={2} paddingTop={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Telefono"
                                    type="tel"
                                    name="telefono" value={form.telefono} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Fecha de nacimiento"
                                    type="date"
                                    name="nacimiento"
                                    value={form.nacimiento || ""}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="LinkedIn"
                                    name="linkedin" value={form.linkedin} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>

                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Area de Interes
                        </Typography>
                        {/* Select de rol */}
                        <TextField
                            select
                            fullWidth
                            label="Seleccioná el área de tu interés"
                            value={rolSeleccionado || ""}               // evitar warning controlled/uncontrolled
                            onChange={(e) => setRolSeleccionado(e.target.value)}
                        >
                            {opcionesPorRol.map((rol) => (
                                <MenuItem key={rol} value={rol}>
                                    {rol}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Divider sx={{ my: 3 }} />

                        {/* === Educación  === */}
                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Educacion <Typography component="span" variant="body2" color="text.secondary">    </Typography>
                        </Typography>

                        {/* Nivel académico */}
                        <Grid item xs={12} sm={6} component={motion.div} >
                            <TextField
                                select
                                fullWidth
                                required
                                label="Nivel académico"
                                name="nivelAcademico"
                                value={form.nivelAcademico}
                                onChange={handleChange}
                                helperText="Seleccioná tu máximo nivel educativo"
                            >
                                {nivelesAcademicos.map((nivel) => (
                                    <MenuItem key={nivel} value={nivel}>{nivel}</MenuItem>
                                ))}
                            </TextField>

                        </Grid>
                        <Grid container spacing={2} paddingTop={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Institución"
                                    type="text"
                                    name="Institución" value={form.institución} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Fecha de nacimiento"
                                    type="date"
                                    name="nacimiento"
                                    value={form.nacimiento || ""}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="LinkedIn"
                                    name="linkedin" value={form.linkedin} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>

                        </Grid>




                        <Divider sx={{ my: 3 }} />





                        {/* === Experiencia  === */}

                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Experiencia Laboral <Typography component="span" variant="body2" color="text.secondary">    </Typography>
                        </Typography>
                        <Divider sx={{ my: 3 }} />
                        {/* Subir CV con drag & drop */}
                        <motion.div variants={sectionVariants}>
                            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                                CV (PDF/DOC) *
                            </Typography>
                        </motion.div>

                        <Paper
                            variant="outlined"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderStyle: "dashed",
                                borderRadius: 2,
                                textAlign: "center",
                                transition: "all .2s",
                                "&:hover": { boxShadow: 3, borderColor: "primary.main" },
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Arrastrá tu archivo aquí o usá el botón.
                            </Typography>
                            <Button variant="contained" component="label">
                                Seleccionar archivo
                                <input type="file" hidden name="cv" onChange={handleChange} accept=".pdf,.doc,.docx" />
                            </Button>
                            {form.cv && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Archivo seleccionado: <Chip label={form.cv.name} size="small" />
                                </Typography>
                            )}
                        </Paper>


                        {/* Acciones */}
                        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                            {editable && (
                                <Button variant="contained" onClick={handleSave} disabled={!requiredOk || saving}>
                                    {saving ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            )}
                        </Stack>
                    </>
                )}

            </Paper>

            <Snackbar
                open={snack.open}
                autoHideDuration={2500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Container>
    );
}
