// src/pages/AdminSearches.jsx
import * as React from "react";
import {
    Box, Paper, Stack, Typography, Button, TextField, MenuItem,
    Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listSearchesApi, createSearchApi, updateSearchApi, deleteSearchApi } from "../api/searches";

const AREAS = ["Administracion", "Recursos Humanos", "Sistemas", "Pasantia"];
const ESTADOS = ["Activa", "Pausada", "Cerrada"];

const emptyForm = {
    titulo: "",
    area: "",
    estado: "Activa",
    ubicacion: "",
    descripcion: "",
};

export default function AdminSearches() {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [snack, setSnack] = React.useState({ open: false, severity: "success", msg: "" });

    // filtros simples
    const [q, setQ] = React.useState("");

    // modal
    const [openDlg, setOpenDlg] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState(emptyForm);
    const [editingId, setEditingId] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await listSearchesApi(); // GET /admin/searches
            const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
            setRows(items.map((s) => ({
                id: s._id || s.id,
                titulo: s.titulo,
                area: s.area,
                estado: s.estado,
                ubicacion: s.ubicacion,
                descripcion: s.descripcion,
                updatedAt: s.updatedAt,
            })));
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudieron cargar las búsquedas" });
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = rows.filter((r) => {
        const term = q.trim().toLowerCase();
        if (!term) return true;
        return (
            r.titulo?.toLowerCase().includes(term) ||
            r.area?.toLowerCase().includes(term) ||
            r.estado?.toLowerCase().includes(term) ||
            r.ubicacion?.toLowerCase().includes(term)
        );
    });

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setOpenDlg(true);
    };
    const openEdit = (row) => {
        setEditingId(row.id);
        setForm({
            titulo: row.titulo || "",
            area: row.area || "",
            estado: row.estado || "Activa",
            ubicacion: row.ubicacion || "",
            descripcion: row.descripcion || "",
        });
        setOpenDlg(true);
    };
    const closeDlg = () => {
        setOpenDlg(false);
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!form.titulo || !form.area || !form.estado) {
            setSnack({ open: true, severity: "warning", msg: "Completá título, área y estado." });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await updateSearchApi(editingId, form);
                setSnack({ open: true, severity: "success", msg: "Búsqueda actualizada ✅" });
            } else {
                await createSearchApi(form);
                setSnack({ open: true, severity: "success", msg: "Búsqueda creada ✅" });
            }
            closeDlg();
            fetchData();
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo guardar" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`¿Eliminar la búsqueda "${row.titulo}"?`)) return;
        try {
            await deleteSearchApi(row.id);
            setSnack({ open: true, severity: "success", msg: "Búsqueda eliminada" });
            fetchData();
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo eliminar" });
        }
    };

    const columns = [
        { field: "titulo", headerName: "Título", flex: 1.2, minWidth: 200 },
        { field: "area", headerName: "Área", width: 160 },
        { field: "estado", headerName: "Estado", width: 140 },
        {
            field: "ubicacion", headerName: "Ubicación", flex: 1, minWidth: 180,
            renderCell: (p) => p.value || <span style={{ opacity: .6 }}>—</span>
        },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => openEdit(params.row)}>Editar</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(params.row)}>Borrar</Button>
                </Stack>
            ),
        },
    ];

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 400 }}>
                ABM de Búsquedas
            </Typography>

            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField label="Buscar (título/área/estado/ubicación)" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
                    <Button variant="contained" onClick={openCreate}>Nueva búsqueda</Button>
                </Stack>
            </Paper>

            <Paper sx={{ height: 560, borderRadius: 2 }} elevation={2}>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <DataGrid
                        rows={filtered}
                        columns={columns}
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                        getRowId={(row) => row.id}
                    />
                )}
            </Paper>

            {/* Modal alta/edición */}
            <Dialog open={openDlg} onClose={closeDlg} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? "Editar búsqueda" : "Nueva búsqueda"}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Título *"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Área *"
                            value={form.area}
                            onChange={(e) => setForm({ ...form, area: e.target.value })}
                            fullWidth
                        >
                            {AREAS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                        </TextField>
                        <TextField
                            select
                            label="Estado *"
                            value={form.estado}
                            onChange={(e) => setForm({ ...form, estado: e.target.value })}
                            fullWidth
                        >
                            {ESTADOS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                        </TextField>
                        <TextField
                            label="Ubicación"
                            placeholder="Ej: CABA, Buenos Aires, AR"
                            value={form.ubicacion}
                            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Descripción"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                            fullWidth
                            multiline
                            minRows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDlg}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
