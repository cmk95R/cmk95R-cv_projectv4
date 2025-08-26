import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Chip,
  Drawer,
  Divider,
  Button,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// ===== MOCK DATA (sin backend) =====
const MOCK_ROWS = [
  {
    id: "cv_1",
    cvId: "cv_1",
    userId: "u_1",
    nombre: "María Sosa",
    email: "maria@empresa.com",
    rol: "candidato",
    tecnologias: ["React", "Node", "SQL"],
    originalName: "CV_MariaSosa.pdf",
    size: 356000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    path: "/uploads/cv/CV_MariaSosa.pdf",
  },
  {
    id: "cv_2",
    cvId: "cv_2",
    userId: "u_2",
    nombre: "Diego Rivas",
    email: "diego@empresa.com",
    rol: "admin",
    tecnologias: ["Python", "Django", "Docker"],
    originalName: "Diego_Rivas_CV.pdf",
    size: 842000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    path: "/uploads/cv/Diego_Rivas_CV.pdf",
  },
  {
    id: "cv_3",
    cvId: "cv_3",
    userId: "u_3",
    nombre: "Sofía Pérez",
    email: "sofia@empresa.com",
    rol: "candidato",
    tecnologias: ["Java", "Spring", "AWS"],
    originalName: "Sofia-Perez-CV.pdf",
    size: 512000,
    createdAt: new Date().toISOString(),
    path: "/uploads/cv/Sofia-Perez-CV.pdf",
  },
];

const MOCK_HISTORY = {
  u_1: [
    {
      _id: "cv_1",
      originalName: "CV_MariaSosa.pdf",
      size: 356000,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      tecnologias: ["React", "Node", "SQL"],
    },
    {
      _id: "cv_old_1",
      originalName: "CV_MariaSosa_2024.pdf",
      size: 298000,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      tecnologias: ["React", "Node"],
    },
  ],
  u_2: [
    {
      _id: "cv_2",
      originalName: "Diego_Rivas_CV.pdf",
      size: 842000,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      tecnologias: ["Python", "Django", "Docker"],
    },
  ],
  u_3: [
    {
      _id: "cv_3",
      originalName: "Sofia-Perez-CV.pdf",
      size: 512000,
      createdAt: new Date().toISOString(),
      tecnologias: ["Java", "Spring", "AWS"],
    },
  ],
};

// ===== Utils =====
function bytesToSize(bytes = 0) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AdminUsersGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [selection, setSelection] = React.useState([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(null);

  // Simula carga inicial
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setRows(MOCK_ROWS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // Simula refresh
  const fetchList = () => {
    setLoading(true);
    setTimeout(() => {
      setRows(MOCK_ROWS);
      setLoading(false);
    }, 400);
  };

  const handleDownload = async (row) => {
    // Sin backend: simulamos descarga
    alert(`Descargando: ${row.originalName}`);
    // Cuando tengas backend: fetch blob y download
  };

  const handleDelete = async (row) => {
    if (!confirm(`¿Eliminar el CV de ${row.nombre}?`)) return;
    // Sin backend: actualizamos estado local
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const handleToggleRole = async (row) => {
    const newRole = row.rol === "admin" ? "candidato" : "admin";
    if (!confirm(`Cambiar rol de ${row.nombre} a "${newRole}"?`)) return;
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, rol: newRole } : r))
    );
  };

  const openDetails = async (row) => {
    setDetail(null);
    setDrawerOpen(true);
    // Sin backend: buscamos en MOCK_HISTORY
    setTimeout(() => {
      setDetail({
        user: { id: row.userId, nombre: row.nombre, email: row.email, rol: row.rol },
        history: MOCK_HISTORY[row.userId] ?? [],
      });
    }, 300);
  };

  const columns = [
    {
      field: "nombre",
      headerName: "Usuario",
      flex: 1,
      minWidth: 160,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontWeight={600}>{p.row.nombre}</Typography>
        </Stack>
      ),
    },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 200 },
    {
      field: "rol",
      headerName: "Rol",
      width: 120,
      renderCell: (p) => (
        <Chip
          label={p.value}
          size="small"
          color={p.value === "admin" ? "secondary" : "default"}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "tecnologias",
      headerName: "Tecnologías",
      flex: 1.2,
      minWidth: 220,
      sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ py: 0.5 }}>
          {p.value?.length ? (
            p.value.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)
          ) : (
            <Typography variant="caption" color="text.secondary">—</Typography>
          )}
        </Stack>
      ),
    },
    {
      field: "originalName",
      headerName: "CV",
      flex: 1,
      minWidth: 200,
      renderCell: (p) => <Typography noWrap title={p.value}>{p.value}</Typography>,
    },
    {
      field: "size",
      headerName: "Tamaño",
      width: 110,
      valueFormatter: ({ value }) => bytesToSize(value),
    },
    {
      field: "createdAt",
      headerName: "Subido",
      width: 160,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "—",
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="info" onClick={() => openDetails(p.row)} title="Ver detalle">
            <InfoOutlinedIcon />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => handleDownload(p.row)} title="Descargar CV">
            <DownloadIcon />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleToggleRole(p.row)}
            title={p.row.rol === "admin" ? "Pasar a candidato" : "Hacer admin"}
          >
            {p.row.rol === "admin" ? <PersonIcon /> : <AdminPanelSettingsIcon />}
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(p.row)} title="Eliminar CV">
            <DeleteOutlineIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Administración de Usuarios & CVs
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={fetchList}>Refrescar</Button>
        </Stack>
      </Stack>

      <Box sx={{ height: 600, width: "100%", borderRadius: 3, overflow: "hidden", boxShadow: 4, bgcolor: "background.paper" }}>
<DataGrid
  rows={rows}
  columns={columns}
  loading={loading}
  disableRowSelectionOnClick
  checkboxSelection

  // MUY IMPORTANTE si tus filas no tienen "id" estándar
  getRowId={(row) => row.id || row.cvId}

  // Dejá que el grid maneje la paginación
  initialState={{
    pagination: { paginationModel: { pageSize: 10, page: 0 } },
    sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
  }}
  pageSizeOptions={[5, 10, 25, 50]}

  // Toolbar con Quick Filter
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 400 } },
  }}
/>
      </Box>

      {/* Drawer de detalle (mock) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>Detalle del Usuario</Typography>
          {!detail && <Typography sx={{ mt: 1 }} color="text.secondary">Cargando…</Typography>}
          {detail && (
            <>
              <Typography sx={{ mt: 1 }}><strong>Nombre:</strong> {detail.user.nombre}</Typography>
              <Typography><strong>Email:</strong> {detail.user.email}</Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Rol:</strong>{" "}
                <Chip
                  label={detail.user.rol}
                  size="small"
                  color={detail.user.rol === "admin" ? "secondary" : "default"}
                  sx={{ textTransform: "capitalize" }}
                />
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600}>Historial de CVs</Typography>
              <Box sx={{ mt: 1, display: "grid", gap: 1.5 }}>
                {detail.history?.length ? detail.history.map((cv) => (
                  <Box key={cv._id} sx={{ p: 1.2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Typography noWrap title={cv.originalName}><strong>Archivo:</strong> {cv.originalName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Subido:</strong> {cv.createdAt ? new Date(cv.createdAt).toLocaleString("es-AR") : "—"} · <strong>Tamaño:</strong> {bytesToSize(cv.size)}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {cv.tecnologias?.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => alert(`Descargar: ${cv.originalName}`)}>
                        Descargar
                      </Button>
                    </Stack>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">Sin historial.</Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Container>
  );
}
