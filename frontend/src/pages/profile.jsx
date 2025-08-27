// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Box, Container, Paper, Typography, Divider, Grid, TextField,
    MenuItem, Button, Stack, Chip, Snackbar, Alert, Skeleton, Switch, FormControlLabel
} from "@mui/material";
import { profileApi } from "../api/auth";
import { getMyCvApi, upsertMyCvJson } from "../api/cv";

const NIVELES_ACAD = [
    "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
    "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
    "Posgrado en curso", "Posgrado completo",
];
const NIVELES_INGLES = ["Sin conocimientos", "Nivel básico", "Nivel intermedio", "Nivel avanzado"];
const AMBITOS = ["Freelancer", "Soy estudiante y trabajo", "Soy estudiante", "Pasante", "Otro"];
const DISPONIBILIDAD = ["Full-time", "Part-time", "Freelance"];
const AREAS = ["Desarrollo", "Administrativo", "Recursos Humanos", "Soporte Técnico", "Ciberseguridad"];

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editable, setEditable] = useState(false);

    const [user, setUser] = useState(null);  // /auth/profile
    const [cv, setCv] = useState(null);  // /cv/me

    const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });

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
        return r.nombre && r.email && r.telefono && r.pais && r.nivelAcademico && r.ambitoLaboral;
    }, [form]);

    const setFromCv = (cvData, fallbackUser) => {
        setForm({
            nombre: cvData?.nombre ?? fallbackUser?.nombre ?? "",
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleAddSkill = (e) => {
        const val = e.target.value;
        if (!val) return;
        setForm(f => {
            if (f.habilidades.includes(val) || f.habilidades.length >= 5) return f;
            return { ...f, habilidades: [...f.habilidades, val] };
        });
    };

    const handleRemoveSkill = (val) => {
        setForm(f => ({ ...f, habilidades: f.habilidades.filter(s => s !== val) }));
    };

    const handleAddSoft = (e) => {
        const val = e.target.value;
        if (!val) return;
        setForm(f => {
            if (f.competencias.includes(val) || f.competencias.length >= 5) return f;
            return { ...f, competencias: [...f.competencias, val] };
        });
    };

    const handleRemoveSoft = (val) => {
        setForm(f => ({ ...f, competencias: f.competencias.filter(s => s !== val) }));
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
                                { name: "nombre", label: "Nombre completo *" },
                                { name: "nacimiento", label: "Fecha de nacimiento", type: "date", InputLabelProps: { shrink: true } },
                                { name: "ciudad", label: "Ciudad" },
                                { name: "provincia", label: "Provincia/Estado" },
                                { name: "pais", label: "País de residencia *" },
                                { name: "email", label: "Correo electrónico *" },
                                { name: "telefono", label: "Teléfono *" },
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

                        <Divider sx={{ my: 3 }} />

                        {/* Área y habilidades */}
                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Área / Rol
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Área/Rol"
                                    name="areaRol" value={form.areaRol} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {AREAS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Agregar habilidad (máx. 5)"
                                    value=""
                                    disabled={!editable || (form.habilidades?.length || 0) >= 5}
                                    onChange={handleAddSkill}
                                >
                                    {["React", "Node.js", "Python", "Docker", "Kubernetes", "Excel/Sheets", "AD/Azure AD", "SIEM", "Otro"].map(opt =>
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    )}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {(form.habilidades || []).map(h => (
                                        <Chip
                                            key={h}
                                            label={h}
                                            onDelete={editable ? () => handleRemoveSkill(h) : undefined}
                                            variant="outlined"
                                            color="primary"
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Stack>
                                {form.habilidades?.includes("Otro") && (
                                    <TextField
                                        fullWidth label="Especificá otra habilidad"
                                        name="otraHabilidad" value={form.otraHabilidad} onChange={handleChange}
                                        sx={{ mt: 1 }} disabled={!editable}
                                    />
                                )}
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Competencias blandas */}
                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Habilidades blandas
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Agregar competencia (máx. 5)"
                                    value=""
                                    disabled={!editable || (form.competencias?.length || 0) >= 5}
                                    onChange={handleAddSoft}
                                >
                                    {["Comunicación efectiva", "Trabajo en equipo", "Empatía", "Proactividad", "Resolución de conflictos", "Adaptabilidad", "Liderazgo"].map(opt =>
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    )}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {(form.competencias || []).map(s => (
                                        <Chip
                                            key={s}
                                            label={s}
                                            onDelete={editable ? () => handleRemoveSoft(s) : undefined}
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Educación / Idiomas / Laboral */}
                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Educación, Idiomas y Situación
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth required label="Nivel académico"
                                    name="nivelAcademico" value={form.nivelAcademico} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {NIVELES_ACAD.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Nivel de inglés"
                                    name="nivelIngles" value={form.nivelIngles} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {NIVELES_INGLES.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Certificación en inglés"
                                    name="certIngles" value={form.certIngles} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {["SI", "NO", ""].map(v => <MenuItem key={v} value={v}>{v || "—"}</MenuItem>)}
                                </TextField>
                            </Grid>

                            {form.certIngles === "SI" && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Detalle certificación (TOEFL/IELTS/CEFR)"
                                        name="detalleCertIngles" value={form.detalleCertIngles} onChange={handleChange}
                                        disabled={!editable}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth required label="Situación laboral actual"
                                    name="ambitoLaboral" value={form.ambitoLaboral} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {AMBITOS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                                </TextField>
                            </Grid>

                            {form.ambitoLaboral === "Otro" && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Otra situación"
                                        name="otraSituacion" value={form.otraSituacion} onChange={handleChange}
                                        disabled={!editable}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="¿Tu empleo tiene relación con IT?"
                                    name="relacionIT" value={form.relacionIT} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {["SI", "NO", ""].map(v => <MenuItem key={v} value={v}>{v || "—"}</MenuItem>)}
                                </TextField>
                            </Grid>

                            {form.relacionIT === "SI" && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth type="number" label="Años de experiencia en IT"
                                        name="aniosIT" value={form.aniosIT} onChange={handleChange}
                                        inputProps={{ min: 0, max: 50 }}
                                        disabled={!editable}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Disponibilidad"
                                    name="disponibilidad" value={form.disponibilidad} onChange={handleChange}
                                    disabled={!editable}
                                >
                                    {DISPONIBILIDAD.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Perfil / redes */}
                        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Perfil y redes
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth multiline minRows={3}
                                    label="Perfil profesional"
                                    name="perfil" value={form.perfil} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Expectativa salarial"
                                    name="salario" value={form.salario} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="LinkedIn"
                                    name="linkedin" value={form.linkedin} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="GitHub / GitLab / Otro"
                                    name="repositorio" value={form.repositorio} onChange={handleChange}
                                    disabled={!editable}
                                />
                            </Grid>
                        </Grid>

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
