// src/pages/AdminCandidatesGrid.jsx
import * as React from "react";
import {
  Box, Stack, Paper, Typography, TextField, MenuItem,
  Button, Snackbar, Alert, CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listCandidatesApi } from "../api/candidates";
import { listUsersApi } from "../api/users"; // fallback si tu backend aún usa /users

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toLocaleDateString();
};

const normalizeLink = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

export default function AdminCandidatesGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [snack, setSnack] = React.useState({ open: false, severity: "success", msg: "" });

  // filtros
  const [q, setQ] = React.useState("");
  const [areaFilter, setAreaFilter] = React.useState("all");

  const mapFromCV = (cv) => {
    const u = cv?.user || {};
    const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(" ") || "(sin nombre)";
    
    const publicId = u?.publicId || "";
    const email = u?.email || "";

    // ubicacion prioriza User.direccion (tu modelo actual)
    const dir = u?.direccion || {};
    const ubicacion = [dir?.ciudad, dir?.provincia, dir?.pais].filter(Boolean).join(", ");

    return {
      id: cv?._id,
      publicId,
      nombre,
      email,
      ubicacion,
      area: cv?.areaInteres || "",
      nivel: cv?.nivelAcademico || "",
      telefono: cv?.telefono || "",
      linkedin: cv?.linkedin || "",
      creado: cv?.createdAt,
    };
  };

  const mapFromUserOnly = (u) => {
    const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(" ") || "(sin nombre)";
    
    const dir = u?.direccion || {};
    const ubicacion = [dir?.ciudad, dir?.provincia, dir?.pais].filter(Boolean).join(", ");

    return {
      id: u?._id || u?.id,
      publicId: u?.publicId || "",
      nombre,
      email: u?.email || "",
      ubicacion: ubicacion || "",
      area: "",   // sin CV no hay área
      nivel: "",  // sin CV no hay nivel
      telefono: "",
      linkedin: "",
      creado: u?.createdAt,
    };
  };

  const fetchCandidates = React.useCallback(async () => {
    setLoading(true);
    try {
      // INTENTO 1: endpoint de CVs (GET /cv -> { cvs: [...] }) con populate(user)
      const { data } = await listCandidatesApi();
      const cvs = Array.isArray(data?.cvs) ? data.cvs : [];
      if (cvs.length) {
        const mapped = cvs
          .filter(cv => (cv?.user?.rol ?? "user") === "user")
          .map(mapFromCV);
        setRows(mapped);
      } else {
        // INTENTO 2 (fallback): /users si aún no creaste GET /cv
        const resp = await listUsersApi();
        const users = Array.isArray(resp?.data?.users) ? resp.data.users : [];
        const mapped = users
          .filter(u => (u?.rol ?? "user") === "user")
          .map(mapFromUserOnly);
        setRows(mapped);
      }
    } catch (e) {
      console.error(e);
      setSnack({
        open: true,
        severity: "error",
        msg: e?.response?.data?.message || "No se pudieron cargar los candidatos",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const allAreas = React.useMemo(() => {
    const set = new Set(rows.map(r => r.area).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const filtered = rows.filter((r) => {
    const query = q.trim().toLowerCase();
    const byText = !query
      || r.nombre.toLowerCase().includes(query)
      || r.email.toLowerCase().includes(query);
    const byArea = areaFilter === "all" || r.area === areaFilter;
    return byText && byArea;
  });

  const columns = [
      { field: "publicId", headerName: "ID", width: 120 }, // si lo tenés
    { field: "nombre", headerName: "Nombre", flex: 1.2, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 220 },
    {
      field: "ubicacion",
      headerName: "Ubicación",
      flex: 1.2,
      minWidth: 150,
      renderCell: (p) => p.value ? p.value : <span style={{ opacity: .6 }}>—</span>
    },
    {
      field: "area",
      headerName: "Área de interés",
      width: 150,
      renderCell: (p) => p.value ? p.value : <span style={{ opacity: .6 }}>—</span>
    },
    {
      field: "nivel",
      headerName: "Nivel académico",
      width: 220,
      renderCell: (p) => p.value ? p.value : <span style={{ opacity: .6 }}>—</span>
    },
    {
      field: "linkedin",
      headerName: "LinkedIn",
      width: 240,
      renderCell: (p) =>
        p.value
          ? <a href={normalizeLink(p.value)} target="_blank" rel="noreferrer">{p.value}</a>
          : <span style={{ opacity: .6 }}>—</span>
    },
    {
      field: "telefono",
      headerName: "Teléfono",
      width: 140,
      renderCell: (p) => p.value ? p.value : <span style={{ opacity: .6 }}>—</span>
    },
    { field: "creado", headerName: "Creado", width: 120, valueGetter: (p) => fmtDate(p.row?.creado) },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        ABM de Candidatos
      </Typography>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={2}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <TextField
            label="Buscar (nombre o email)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Área"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            {allAreas.map((a) => (
              <MenuItem key={a} value={a}>
                {a === "all" ? "Todas" : a}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={fetchCandidates}>Actualizar</Button>
        </Stack>
      </Paper>

      <Paper sx={{ height: 560, borderRadius: 2 }} elevation={2}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <CircularProgress />
          </Stack>
        ) : (
          <DataGrid
            rows={Array.isArray(filtered) ? filtered : []}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            getRowId={(row) => row.id}
          />
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
    </Box>
  );
}
