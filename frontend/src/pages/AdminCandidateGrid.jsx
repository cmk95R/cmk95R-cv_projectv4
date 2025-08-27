import * as React from "react";
import {
  Box, Stack, Paper, Typography, TextField, MenuItem,
  Button, Chip, Snackbar, Alert, CircularProgress, Autocomplete
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listUsersApi } from "../api/users"; // GET /users
// Si no lo tenés, en api/users.js: export const listUsersApi = () => api.get("/users");

export default function AdminCandidatesGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [snack, setSnack] = React.useState({ open: false, severity: "success", msg: "" });

  // filtros
  const [q, setQ] = React.useState("");
  const [areaFilter, setAreaFilter] = React.useState("all");
  const [skillsFilter, setSkillsFilter] = React.useState([]); // array de strings

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listUsersApi();

      const users = Array.isArray(data?.users) ? data.users : [];

      // Mapear SOLO candidatos (rol "user")
      const mapped = users
        .filter(u => (u?.rol ?? "user") === "user")
        .map((u) => {
          // Ajustá NOMBRES DE CAMPOS si tu backend usa otros:
          const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(" ");
          const ciudad = u?.ciudad ?? "";
          const provincia = u?.provincia ?? "";
          const pais = u?.pais ?? "";
          const ubicacion = [ciudad, provincia, pais].filter(Boolean).join(", ");
          const area = u?.area ?? u?.areaPostulada ?? u?.areaInteres ?? "";
          const puesto = u?.puesto ?? u?.rolPostulado ?? ""; // “rol al que se postula”
          const habilidades = Array.isArray(u?.habilidades)
            ? u.habilidades
            : Array.isArray(u?.skills)
            ? u.skills
            : [];

          return {
            id: u?._id || u?.id,
            nombre,
            email: u?.email ?? "",
            ubicacion,
            area,
            puesto,
            habilidades,
          };
        });

      setRows(mapped);
    } catch (e) {
      console.error(e);
      setSnack({
        open: true,
        severity: "error",
        msg: e?.response?.data?.message || "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Construir opciones dinámicas para filtros
  const allAreas = React.useMemo(() => {
    const set = new Set(rows.map(r => r.area).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const allSkills = React.useMemo(() => {
    const set = new Set();
    rows.forEach(r => (r.habilidades || []).forEach(h => set.add(h)));
    return Array.from(set);
  }, [rows]);

  // Filtro en memoria
  const filtered = rows.filter((r) => {
    const query = q.trim().toLowerCase();
    const byText =
      !query ||
      r.nombre.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query);

    const byArea = areaFilter === "all" || r.area === areaFilter;

    const bySkills =
      skillsFilter.length === 0 ||
      (Array.isArray(r.habilidades) &&
        skillsFilter.every((s) => r.habilidades.includes(s)));

    return byText && byArea && bySkills;
  });

  // Columnas del DataGrid
  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1.2, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 220 },
    { field: "ubicacion", headerName: "Ubicación", flex: 1.4, minWidth: 220 },
    { field: "area", headerName: "Área", width: 140 },
    { field: "puesto", headerName: "Rol/Puesto", flex: 1, minWidth: 160 },
    {
      field: "habilidades",
      headerName: "Habilidades",
      flex: 1.6,
      minWidth: 240,
      renderCell: (params) => {
        const list = Array.isArray(params.value) ? params.value : [];
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {list.map((h, i) => (
              <Chip key={`${params.id}-${h}-${i}`} label={h} size="small" />
            ))}
          </Box>
        );
      },
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Panel de Candidatos 
      </Typography>

      {/* Panel de filtros */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={2}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <TextField
            label="Buscar por nombre o email"
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
            onChange={(_e, newValue) => setSkillsFilter(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Habilidades técnicas" placeholder="Filtrar por habilidad" />
            )}
            sx={{ minWidth: 260, flexGrow: 1 }}
          />

          <Button variant="outlined" onClick={fetchUsers}>
            Refrescar
          </Button>
        </Stack>
      </Paper>

      {/* Tabla */}
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
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
