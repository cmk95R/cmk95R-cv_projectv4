import * as React from "react";
import {
  Box, Stack, Button, Chip, TextField, MenuItem,
  Snackbar, Alert, Paper, Typography, CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { listUsersApi, makeAdminApi, revokeAdminApi } from "../api/users";

function formatDateSafe(v) {
  if (!v) return "";
  const d =
    v instanceof Date ? v :
    typeof v === "number" ? new Date(v) :
    typeof v === "string" ? new Date(v) :
    v?.$date ? new Date(v.$date) :
    null;
  return d && !isNaN(d) ? d.toLocaleDateString() : "";
}

export default function AdminUsersGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [snack, setSnack] = React.useState({ open: false, severity: "success", msg: "" });
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listUsersApi();
      const mapped = (data?.users ?? []).map((u) => ({
        id: u._id || u.id,
        nombre: u.nombre ?? "",
        apellido: u.apellido ?? "",
        email: u.email ?? "",
        rol: u.rol ?? "user",
        createdAt: u.createdAt ?? u.created_at ?? u?.timestamps ?? null,
      }));
      setRows(mapped);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudieron cargar los usuarios" });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const promote = async (row) => {
    try {
      await makeAdminApi(row.id);
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, rol: "admin" } : r));
      setSnack({ open: true, severity: "success", msg: `Ahora ${row.nombre} es admin` });
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo promover" });
    }
  };

  const demote = async (row) => {
    try {
      await revokeAdminApi(row.id);
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, rol: "user" } : r));
      setSnack({ open: true, severity: "success", msg: `Rol de ${row.nombre} cambiado a user` });
    } catch (e) {
      console.error(e);
      setSnack({ open: true, severity: "error", msg: e?.response?.data?.message || "No se pudo revertir" });
    }
  };

  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "apellido", headerName: "Apellido", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1.4, minWidth: 220 },
    {
      field: "rol",
      headerName: "Rol",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={params.value === "admin" ? "secondary" : "default"} size="small" />
      ),
    },
    {
      field: "createdAt",
      headerName: "Creado",
      width: 160,
      valueGetter: (params) => formatDateSafe(params?.row?.createdAt),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const isAdmin = params.row.rol === "admin";
        return (
          <Stack direction="row" spacing={1}>
            {!isAdmin ? (
              <Button size="small" variant="outlined" onClick={() => promote(params.row)}>Hacer admin</Button>
            ) : (
              <Button size="small" color="warning" variant="outlined" onClick={() => demote(params.row)}>Quitar admin</Button>
            )}
          </Stack>
        );
      },
    },
  ];

  const filtered = (rows ?? []).filter(r => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      r.nombre?.toLowerCase().includes(q) ||
      r.apellido?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" ? true : r.rol === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 400 }}>
        ABM de Usuarios
      </Typography>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Buscar (nombre, apellido o email)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="Rol"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <Button onClick={fetchUsers} variant="outlined">Actualizar</Button>
        </Stack>
      </Paper>

      <Paper sx={{ height: 520, borderRadius: 2 }} elevation={2}>
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
