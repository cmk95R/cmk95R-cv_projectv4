import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Container, Grid, Typography, Avatar, Card, CardContent, IconButton,
  Chip, Button, TextField, MenuItem, Stack, Divider, Snackbar, Alert, Switch,
  FormControlLabel, Skeleton
} from "@mui/material";
import { styled } from "@mui/system";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import { profileApi } from "../api/auth";
import { getMyCvApi, upsertMyCvJson } from "../api/cv";

// ---------- Styled ----------
const ProfileContainer = styled(Card)({
  padding: "2rem",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  borderRadius: 16,
  background: "#fff",
});
const ProfileAvatar = styled(Avatar)({
  width: 150, height: 150, border: "4px solid #fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)", margin: "0 auto",
});
const InfoCard = styled(Card)({
  height: "100%", padding: "1.5rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 12,
});
const ActionButton = styled(Button)({
  margin: 8, padding: "8px 24px", borderRadius: 8, textTransform: "none",
});

// ---------- Consts ----------
const nivelesAcademicos = [
  "Secundario completo", "Secundario incompleto", "Terciario/Técnico en curso",
  "Terciario/Técnico completo", "Universitario en curso", "Universitario completo",
  "Posgrado en curso", "Posgrado completo",
];

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editable, setEditable] = useState(false);

  const [user, setUser] = useState(null);
  const [cv, setCv] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });

  // ---------- FORM ----------
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    nacimiento: "", ciudad: "", provincia: "", pais: "",
    linkedin: "",
    perfil: "", // summary
    nivelAcademico: "", institucion: "", periodoEduDesde: "", periodoEduHasta: "",
    experiencia: [], // [{puesto, empresa, desde, hasta}]
  });

  const requiredOk = useMemo(() => !!(form.nombre && form.email), [form]);
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setExp = (i, patch) =>
    setForm(f => {
      const arr = [...(f.experiencia || [])];
      arr[i] = { ...arr[i], ...patch };
      return { ...f, experiencia: arr };
    });
  const addExp = () => setForm(f => ({ ...f, experiencia: [...(f.experiencia || []), { puesto: "", empresa: "", desde: "", hasta: "" }] }));
  const removeExp = (idx) => setForm(f => ({ ...f, experiencia: (f.experiencia || []).filter((_, i) => i !== idx) }));

  // ---------- LOAD ----------
  const setFromCv = (cvData, fallbackUser) => {
    const exp = Array.isArray(cvData?.experiencia) ? cvData.experiencia : [];
    setForm({
      nombre: cvData?.nombre ?? fallbackUser?.nombre ?? "",
      apellido: cvData?.apellido ?? fallbackUser?.apellido ?? "",
      email: cvData?.email ?? fallbackUser?.email ?? "",
      telefono: cvData?.telefono ?? "",
      nacimiento: cvData?.nacimiento ? String(cvData.nacimiento).slice(0, 10) : "",
      ciudad: cvData?.ciudad ?? "",
      provincia: cvData?.provincia ?? "",
      pais: cvData?.pais ?? "",
      linkedin: cvData?.linkedin ?? "",
      perfil: cvData?.perfil ?? "",
      nivelAcademico: cvData?.nivelAcademico ?? "",
      institucion: cvData?.institucion ?? "",
      periodoEduDesde: cvData?.periodoEduDesde ?? "",
      periodoEduHasta: cvData?.periodoEduHasta ?? "",
      experiencia: exp.map(e => ({
        puesto: e.puesto ?? "",
        empresa: e.empresa ?? "",
        desde: e.desde ? String(e.desde).slice(0, 10) : (e.desde ?? ""),
        hasta: e.hasta ? String(e.hasta).slice(0, 10) : (e.hasta ?? ""),
      })),
    });
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: me }, { data: cvResp }] = await Promise.all([profileApi(), getMyCvApi()]);
      const u = me?.user || null;
      const c = cvResp?.cv || null;
      setUser(u); setCv(c);
      setFromCv(c || {}, u || {});
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo cargar tu perfil" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ---------- SAVE ----------
  const handleSave = async () => {
    if (!requiredOk) {
      setSnack({ open: true, severity: "warning", msg: "Completá Nombre y Email" });
      return;
    }
    try {
      setSaving(true);
      await upsertMyCvJson(form);
      setSnack({ open: true, severity: "success", msg: "Datos guardados ✅" });
      setEditable(false);
      fetchAll();
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo guardar" });
    } finally { setSaving(false); }
  };
  const handleCancel = () => { setFromCv(cv || {}, user || {}); setEditable(false); };

  // ---------- UI ----------
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Volver (opcional) */}
      <Box sx={{ mb: 2 }}>
        <ActionButton startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => window.history.back()}>
          Volver
        </ActionButton>
      </Box>

      {loading ? (
        <Card sx={{ p: 4, borderRadius: 3 }}>
          <Skeleton height={48} width="30%" />
          <Skeleton height={240} sx={{ mt: 2 }} />
        </Card>
      ) : (
        
        <Grid container spacing={3}>
          {/* LEFT */}
          
          <Grid item xs={12} md={4}>
            <ProfileContainer>
              <Box sx={{ textAlign: "center" }}>
                <ProfileAvatar src={user?.avatarUrl || ""} alt={form.nombre}>
                  {(form?.nombre?.[0] || "").toUpperCase()}
                </ProfileAvatar>
                <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                  {form.nombre} {form.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>

                <ActionButton
                  startIcon={<FolderOpenIcon />}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setEditable(true)}
                >
                  Editar perfil
                </ActionButton>

                <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                  {form.pais && <Chip label={form.pais} variant="outlined" color="primary" />}
                  {form.provincia && <Chip label={form.provincia} variant="outlined" color="primary" />}
                  {form.ciudad && <Chip label={form.ciudad} variant="outlined" color="primary" />}
                </Box>

                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Typography variant="body2"><b>Teléfono:</b> {form.telefono || "-"}</Typography>
                  <Typography variant="body2"><b>LinkedIn:</b> {form.linkedin || "-"}</Typography>
                  <Typography variant="body2"><b>Nacimiento:</b> {form.nacimiento || "-"}</Typography>
                </Stack>

                <FormControlLabel
                  sx={{ mt: 2 }}
                  control={<Switch checked={editable} onChange={(_, v) => setEditable(v)} />}
                  label="Modo edición"
                />
              </Box>
            </ProfileContainer>
          

          {/* RIGHT */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* Datos Personales */}
              <Grid item xs={6}>
                <InfoCard>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" color="primary">Datos Personales</Typography>
                    
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Nombre *" value={form.nombre} disabled={!editable}
                        onChange={(e) => setField("nombre", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Apellido *" value={form.apellido} disabled={!editable}
                        onChange={(e) => setField("apellido", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email *" value={form.email} disabled={!editable}
                        onChange={(e) => setField("email", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Teléfono" value={form.telefono} disabled={!editable}
                        onChange={(e) => setField("telefono", e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth multiline minRows={1}
                        label="Sobre Mi"
                        value={form.perfil} disabled={!editable}
                        onChange={(e) => setField("perfil", e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  
                </InfoCard>
              </Grid>
              </Grid> 

              {/* Contacto */}
              <Grid item xs={12}>
                <InfoCard>
                  <Typography variant="h6" gutterBottom color="primary">Información de contacto</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="LinkedIn" value={form.linkedin} disabled={!editable}
                        onChange={(e) => setField("linkedin", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField type="date" fullWidth label="Fecha de nacimiento" value={form.nacimiento}
                        onChange={(e) => setField("nacimiento", e.target.value)}
                        InputLabelProps={{ shrink: true }} disabled={!editable} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="País" value={form.pais} disabled={!editable}
                        onChange={(e) => setField("pais", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Provincia/Estado" value={form.provincia} disabled={!editable}
                        onChange={(e) => setField("provincia", e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Ciudad" value={form.ciudad} disabled={!editable}
                        onChange={(e) => setField("ciudad", e.target.value)} />
                    </Grid>
                  </Grid>
                </InfoCard>
              </Grid>

              {/* Educación */}
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <Typography variant="h6" gutterBottom color="primary">Educación</Typography>
                  <Stack spacing={2}>
                    <TextField
                      select fullWidth label="Nivel académico"
                      value={form.nivelAcademico} disabled={!editable}
                      onChange={(e) => setField("nivelAcademico", e.target.value)}
                    >
                      {nivelesAcademicos.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                    </TextField>
                    <TextField fullWidth label="Institución" value={form.institucion} disabled={!editable}
                      onChange={(e) => setField("institucion", e.target.value)} />
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField type="date" fullWidth label="Desde"
                          value={form.periodoEduDesde} disabled={!editable}
                          onChange={(e) => setField("periodoEduDesde", e.target.value)}
                          InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField type="date" fullWidth label="Hasta"
                          value={form.periodoEduHasta} disabled={!editable}
                          onChange={(e) => setField("periodoEduHasta", e.target.value)}
                          InputLabelProps={{ shrink: true }} />
                      </Grid>
                    </Grid>
                  </Stack>
                </InfoCard>
              </Grid>

              {/* Experiencia */}
              <Grid item xs={12} sm={6}>
                <InfoCard>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom color="primary">Experiencia</Typography>
                    {editable && (
                      <Button startIcon={<AddCircleOutlineIcon />} onClick={addExp} variant="outlined">
                        Agregar
                      </Button>
                    )}
                  </Stack>

                  <Stack spacing={1.5}>
                    {(form.experiencia || []).map((e, idx) => (
                      <Card key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">Puesto #{idx + 1}</Typography>
                          {editable && (
                            <IconButton size="small" color="error" onClick={() => removeExp(idx)}>
                              <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                        <Stack spacing={1.2}>
                          <TextField label="Job Title" value={e.puesto} disabled={!editable}
                            onChange={(ev) => setExp(idx, { puesto: ev.target.value })} fullWidth />
                          <TextField label="Empresa" value={e.empresa} disabled={!editable}
                            onChange={(ev) => setExp(idx, { empresa: ev.target.value })} fullWidth />
                          <Grid container spacing={1.2}>
                            <Grid item xs={12} sm={6}>
                              <TextField type="date" label="Desde" value={e.desde} disabled={!editable}
                                onChange={(ev) => setExp(idx, { desde: ev.target.value })}
                                InputLabelProps={{ shrink: true }} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField type="date" label="Hasta" value={e.hasta} disabled={!editable}
                                onChange={(ev) => setExp(idx, { hasta: ev.target.value })}
                                InputLabelProps={{ shrink: true }} fullWidth />
                            </Grid>
                          </Grid>
                        </Stack>
                      </Card>
                    ))}
                    {!form.experiencia?.length && (
                      <Typography variant="body2" color="text.secondary">
                        {editable ? "Agregá tu primera experiencia laboral." : "Sin registros de experiencia."}
                      </Typography>
                    )}
                  </Stack>
                </InfoCard>
              </Grid>

              {/* Acciones al pie */}
            {editable && (
                      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: "flex-end" }}>
                        <Button onClick={handleSave} variant="contained" color="success" disabled={saving || !requiredOk}>
                          {saving ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button onClick={handleCancel} variant="outlined">Cancelar</Button>
                      </Stack>
                    )}
            </Grid>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
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
