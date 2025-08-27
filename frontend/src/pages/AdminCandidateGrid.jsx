import * as React from "react";
import {
  Box, Stack, Paper, Typography, TextField, MenuItem,
  Button, Chip, Snackbar, Alert, CircularProgress, Autocomplete
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listCandidatesApi } from "../api/candidates";
import { listUsersApi } from "../api/users"; // fallback si tu backend aún usa /users

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toLocaleDateString();
};

export default function AdminCandidatesGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [snack, setSnack] = React.useState({ open: false, severity: "success", msg: "" });

  // filtros
  const [q, setQ] = React.useState("");
  const [areaFilter, setAreaFilter] = React.useState("all");
  const [skillsFilter, setSkillsFilter] = React.useState([]);

  const mapFromCV = (cv) => {
    const u = cv?.user || {};
    const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(" ") || cv?.nombre || "(sin nombre)";
    const email = u?.email || cv?.email || "";
    const ciudad = cv?.ciudad || "";
    const provincia = cv?.provincia || "";
    const pais = cv?.pais || "";
    const ubicacion = [ciudad, provincia, pais].filter(Boolean).join(", ");
    const area = cv?.areaRol || "";
    const habilidades = Array.isArray(cv?.habilidades) ? cv.habilidades : [];
    const competencias = Array.isArray(cv?.competencias) ? cv.competencias : [];

    return {
      id: cv?._id,
      nombre,
      email,
      ubicacion,
      area,
      puesto: "", // si luego agregás "puesto" al CV
      habilidades,
      competencias,
      creado: cv?.createdAt,
    };
  };

  const mapFromUserOnly = (u) => {
    // Fallback si aún venís de /users (sin CVs)
    const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(" ") || "(sin nombre)";
    const ciudad = u?.ciudad || "";
    const provincia = u?.provincia || "";
    const pais = u?.pais || "";
    const ubicacion = [ciudad, provincia, pais].filter(Boolean).join(", ");

    return {
      id: u?._id || u?.id,
      nombre,
      email: u?.email || "",
      ubicacion,            // probablemente vacío si aún no lo guardabas en user
      area: u?.areaRol || u?.area || "",   // por si lo guardaste en user
      puesto: u?.puesto || "",
      habilidades: Array.isArray(u?.habilidades) ? u.habilidades : [],
      competencias: Array.isArray(u?.competencias) ? u.competencias : [],
      creado: u?.createdAt,
    };
  };

  const fetchCandidates = React.useCallback(async () => {
    setLoading(true);
    try {
      // INTENTO 1: endpoint de CVs
      const { data } = await listCandidatesApi(); // espera { cvs: [...] }
      const cvs = Array.isArray(data?.cvs) ? data.cvs : [];
      if (cvs.length) {
        const mapped = cvs
          .filter(cv => (cv?.user?.rol ?? "user") === "user") // solo candidatos
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

  const allSkills = React.useMemo(() => {
    const set = new Set();
    rows.forEach(r => (r.habilidades || []).forEach(h => set.add(h)));
    return Array.from(set);
  }, [rows]);

  const filtered = rows.filter((r) => {
    const query = q.trim().toLowerCase();
    const byText = !query || r.nombre.toLowerCase().includes(query) || r.email.toLowerCase().includes(query);
    const byArea = areaFilter === "all" || r.area === areaFilter;
    const bySkills = skillsFilter.length === 0
      ? true
      : (Array.isArray(r.habilidades) && skillsFilter.every(s => r.habilidades.includes(s)));
    return byText && byArea && bySkills;
  });

  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1.2, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 220 },
    { field: "ubicacion", headerName: "Ubicación", flex: 1.3, minWidth: 200,
      renderCell: (p) => p.value ? p.value : <span style={{opacity:.6}}>—</span> },
    { field: "area", headerName: "Área", width: 140,
      renderCell: (p) => p.value ? p.value : <span style={{opacity:.6}}>—</span> },
    { field: "puesto", headerName: "Rol/Puesto", flex: 1, minWidth: 160,
      renderCell: (p) => p.value ? p.value : <span style={{opacity:.6}}>—</span> },
    {
      field: "habilidades",
      headerName: "Habilidades",
      flex: 1.6,
      minWidth: 260,
      renderCell: (params) => {
        const list = Array.isArray(params.value) ? params.value : [];
        if (list.length === 0) return <span style={{ opacity: 0.6 }}>—</span>;
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {list.map((h, i) => <Chip key={`${params.id}-${h}-${i}`} label={h} size="small" />)}
          </Box>
        );
      },
      sortable: false,
      filterable: false,
    },
    {
      field: "competencias",
      headerName: "Blandas",
      flex: 1.2,
      minWidth: 220,
      renderCell: (params) => {
        const list = Array.isArray(params.value) ? params.value : [];
        if (list.length === 0) return <span style={{ opacity: 0.6 }}>—</span>;
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {list.map((h, i) => <Chip key={`${params.id}-soft-${h}-${i}`} label={h} size="small" variant="outlined" />)}
          </Box>
        );
      },
      sortable: false,
      filterable: false,
    },
    { field: "creado", headerName: "Creado", width: 120, valueGetter: (p) => fmtDate(p.row?.creado) },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Panel de Candidatos
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
            sx={{ width: 240 }}
          >
            {allAreas.map((a) => (
              <MenuItem key={a} value={a}>
                {a === "all" ? "Todas" : a}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            options={allSkills}
            value={skillsFilter}
            onChange={(_e, v) => setSkillsFilter(v)}
            renderInput={(params) => (
              <TextField {...params} label="Habilidades técnicas" placeholder="Filtrar por habilidad" />
            )}
            sx={{ minWidth: 260, flexGrow: 1 }}
          />

          <Button variant="outlined" onClick={fetchCandidates}>Refrescar</Button>
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
