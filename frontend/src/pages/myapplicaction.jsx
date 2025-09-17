import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Stack,
  Link as MUILink,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Chip,
  Button,
  Avatar,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Skeleton,
  Pagination,
  InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline"; // Icono para "Contactar"
import { Link as RouterLink } from "react-router-dom";

// API
import { myApplicationsApi } from "../api/applications"; // Mantén tu importación real

// Si sigues usando el mock de la API para desarrollo, asegúrate de que esté descomentado aquí
// Si ya estás usando tu API real, asegúrate de que el mock de arriba esté comentado/eliminado.
/*
const myApplicationsApi = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            _id: "app1",
            status: "submitted",
            createdAt: "2023-11-20T10:00:00Z",
            search: {
              _id: "search1",
              titulo: "Desarrollador Full Stack Senior",
              area: "Tech Solutions Inc.",
              ciudad: "Buenos Aires",
              salary: "USD 3000-4000",
              logo: "https://via.placeholder.com/40/2196F3/FFFFFF?text=TS",
            },
          },
          {
            _id: "app2",
            status: "interviewing",
            createdAt: "2023-11-15T10:00:00Z",
            search: {
              _id: "search2",
              titulo: "Analista de Datos Jr.",
              area: "Global Metrics",
              ciudad: "Remoto",
              salary: "$150.000 - $200.000 ARS",
              logo: "https://via.placeholder.com/40/4CAF50/FFFFFF?text=GM",
            },
          },
          {
            _id: "app3",
            status: "rejected",
            createdAt: "2023-11-10T10:00:00Z",
            search: {
              _id: "search3",
              titulo: "Gerente de Proyecto",
              area: "Innovate Corp.",
              ciudad: "Córdoba",
              salary: null,
              logo: "https://via.placeholder.com/40/FF9800/FFFFFF?text=IC",
            },
          },
          {
            _id: "app4",
            status: "accepted",
            createdAt: "2023-11-05T10:00:00Z",
            search: {
              _id: "search4",
              titulo: "Especialista en Marketing Digital",
              area: "01/07/Brands",
              ciudad: "Rosario",
              salary: "Competitivo",
              logo: "https://via.placeholder.com/40/9C27B0/FFFFFF?text=01",
            },
          },
          {
            _id: "app5",
            status: "viewed",
            createdAt: "2023-10-25T10:00:00Z",
            search: {
              _id: "search5",
              titulo: "Diseñador UX/UI",
              area: "Creative Hub",
              ciudad: "Buenos Aires",
              salary: "$180.000 ARS",
              logo: "https://via.placeholder.com/40/E91E63/FFFFFF?text=CH",
            },
          },
          {
            _id: "app6",
            status: "withdrawn",
            createdAt: "2023-10-15T10:00:00Z",
            search: {
              _id: "search6",
              titulo: "Contador Senior",
              area: "Auditorías Globales",
              ciudad: "Remoto",
              salary: null,
              logo: "https://via.placeholder.com/40/607D8B/FFFFFF?text=AG",
            },
          },
        ],
      });
    }, 1000);
  });
};
*/

export default function MyApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const { data } = await myApplicationsApi();
      const arr = Array.isArray(data) ? data : data?.items || [];
      setItems(arr);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error inesperado";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
  }

  const statusMap = {
    accepted: { label: "Aprobada", color: "success" },
    approved: { label: "Aprobada", color: "success" },
    hired: { label: "Contratado/a", color: "success" },
    rejected: { label: "Rechazada", color: "error" },
    declined: { label: "Rechazada", color: "error" },
    withdrawn: { label: "Retirada", color: "default" },
    interviewing: { label: "Entrevista", color: "info" },
    interview: { label: "Entrevista", color: "info" },
    viewed: { label: "Visto", color: "secondary" },
    pending: { label: "En revisión", color: "warning" },
    submitted: { label: "En revisión", color: "warning" },
    in_review: { label: "En revisión", color: "warning" },
  };

  function normalize(app) {
    const s = app?.search && typeof app.search === "object" ? app.search : {};
    const id =
      (typeof app?.search === "string" && app.search) ||
      s?._id ||
      app?.searchId ||
      app?.search_id ||
      app?.jobId ||
      app?.job_id ||
      null;

    const title = s?.titulo || app?.titulo || app?.searchtiTitulo || "Búsqueda";
    const company = s?.area || s?.area || app?.area || app?.area || "";
    const location = s?.ubicacion || s?.ciudad || app?.location || app?.ciudad || null;
    const salary = s?.salary || s?.sueldo || s?.compensation || app?.salary || null;
    const createdAt = app?.createdAt || app?.appliedAt || app?.created_at || app?.fecha || null;
    const statusRaw = (app?.status || app?.estado || "pending").toString().toLowerCase();
    const logoUrl = s?.logo || s?.logoUrl || s?.logo_url || null;
    // Removido linkPath ya que no se usará el botón "Ver búsqueda"
    // const linkPath = id ? `/searches/${id}` : s?.url || app?.url || null;

    return { id, title, company, location, salary, createdAt, statusRaw, logoUrl, raw: app }; // Ya no se devuelve linkPath
  }

  const normalized = useMemo(() => items.map(normalize), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized.filter(({ title, company, statusRaw }) => {
      const passesStatus = statusFilter === "ALL" || statusRaw === statusFilter;
      const passesQuery = !q || title.toLowerCase().includes(q) || (company || "").toLowerCase().includes(q);
      return passesStatus && passesQuery;
    });
  }, [normalized, statusFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query]);

  // Handler para retirar postulación (simulado)
  const handleRetirarPostulacion = (applicationId, applicationTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres retirar tu postulación a "${applicationTitle}"?`)) {
      console.log(`Retirando postulación con ID: ${applicationId}`);
      // Aquí integrarías la lógica de tu API para retirar la postulación
      // Por ejemplo: withdrawApplicationApi(applicationId).then(fetchData).catch(handleError)
      // Por ahora, solo simulamos un refresh después de un tiempo
      setLoading(true);
      setTimeout(() => {
        alert(`Postulación a "${applicationTitle}" retirada exitosamente (simulado).`);
        fetchData(); // Recarga los datos para reflejar el cambio
      }, 1000);
    }
  };

  // Handler para contactar (simulado)
  const handleContactar = (applicationId, companyName) => {
    console.log(`Contactando por postulación con ID: ${applicationId} para ${companyName}`);
    // Aquí abrirías un modal de contacto, un chat, o redirigirías a una sección de mensajes.
    alert(`Abriendo chat/formulario para contactar a ${companyName} (simulado).`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Sección superior de título y botón de refresco */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Mis postulaciones</Typography>
          <Typography variant="body2" color="text.secondary">Acá vas a ver todas las búsquedas a las que te postulaste.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualizar">
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Sección de filtros */}
      <Box mt={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              label="Buscar por título o empresa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Desarrollador, Google"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                label="Estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">Todas</MenuItem>
                <MenuItem value="submitted">En revisión</MenuItem>
                <MenuItem value="viewed">Visto</MenuItem>
                <MenuItem value="interviewing">Entrevista</MenuItem>
                <MenuItem value="accepted">Aprobada</MenuItem>
                <MenuItem value="rejected">Rechazada</MenuItem>
                <MenuItem value="withdrawn">Retirada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box height="100%" display="flex" alignItems="center" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Typography variant="body2" color="text.secondary">
                {loading && !items.length ? "Cargando…" : `${filtered.length} postulaci${filtered.length === 1 ? "ón" : "ones"}`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Contenido principal: Error, Skeletons, Empty State o Cards */}
      <Box mt={3}>
        {error && (
          <Card sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, mb: 3 }}>
            <CardContent>
              <Typography color="error" fontWeight={600} mb={1}>No pudimos cargar tus postulaciones</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{error}</Typography>
              <Button variant="outlined" onClick={fetchData} startIcon={<RefreshIcon />}>Reintentar</Button>
            </CardContent>
          </Card>
        )}

        {/* Loading skeletons */}
        {loading && !items.length && (
          <Grid container spacing={2} mt={0.5}>
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <Grid item xs={12} md={6} lg={4} key={`sk-${i}`}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardHeader
                    avatar={<Skeleton variant="circular" width={40} height={40} />}
                    title={<Skeleton width="60%" />}
                    subheader={<Skeleton width="40%" />}
                  />
                  <CardContent>
                    <Skeleton height={24} width="30%" sx={{ mb: 1 }} />
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={20} width="50%" />
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Skeleton height={36} width={100} /> {/* Para "Retirar" */}
                    <Skeleton height={36} width={80} /> {/* Para "Contactar" */}
                    <Skeleton height={20} width={80} /> {/* Para "Ver detalle" */}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <Card sx={{ borderRadius: 3, textAlign: "center", py: 6, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Aún no tenés postulaciones
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Cuando te postules a una búsqueda, la vas a ver listada acá.
              </Typography>
              <Button component={RouterLink} to="/searches" variant="contained" startIcon={<WorkIcon />}>Explorar búsquedas</Button>
            </CardContent>
          </Card>
        )}

        {/* Cards */}
        <Grid container spacing={2} mt={0.5}>
          {paginated.map((item, idx) => {
            const { id, title, company, location, salary, createdAt, statusRaw, logoUrl } = item;
            const statusCfg = statusMap[statusRaw] || statusMap["pending"];

            return (
              <Grid item xs={12} md={6} lg={4} key={`${id || "app"}-${idx}`}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: (t) => t.shadows[3],
                    }
                  }}
                >
                  <CardHeader
                    avatar={
                      logoUrl ? (
                        <Avatar alt={company || title} src={logoUrl} />
                      ) : (
                        <Avatar><WorkIcon fontSize="small" /></Avatar>
                      )
                    }
                    title={
                      <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                        {title}
                      </Typography>
                    }
                    subheader={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary", mt: 0.5 }}>
                        <Typography variant="body2">{company || "—"}</Typography>
                        {location && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <LocationOnIcon fontSize="inherit" />
                            <Typography variant="body2">{location}</Typography>
                          </Stack>
                        )}
                      </Stack>
                    }
                  />

                  <CardContent sx={{ pt: 0 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
                      <Chip size="small" color={statusCfg.color} label={statusCfg.label} />
                      {salary && (
                        <Chip
                          size="small"
                          icon={<PaidIcon fontSize="small" />}
                          label={typeof salary === "string" ? salary : `${salary}`}
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center" color="text.secondary">
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2">
                        Postulado: <strong>{formatDate(createdAt)}</strong>
                      </Typography>
                    </Stack>
                  </CardContent>

                  <Box flexGrow={1} />
                  <Divider />

                  <CardActions sx={{ justifyContent: "space-between", flexWrap: 'wrap', rowGap: 1 }}> {/* Añadido flexWrap y rowGap */}
                    <Stack direction="row" spacing={1}>
                        {/* Botón de Retirar Postulación */}
                        {statusRaw !== 'withdrawn' && statusRaw !== 'rejected' && statusRaw !== 'accepted' && ( // Ejemplo: No mostrar si ya está retirada/rechazada/aceptada
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleRetirarPostulacion(item.raw?._id || item.raw?.id, title)}
                            >
                                Retirar
                            </Button>
                        )}

                        {/* Botón de Contactar */}
                        {statusRaw !== 'rejected' && ( // Ejemplo: No mostrar "Contactar" si la postulación fue rechazada
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<MailOutlineIcon fontSize="small" />}
                                onClick={() => handleContactar(item.raw?._id || item.raw?.id, company)}
                            >
                                Contactar
                            </Button>
                        )}
                    </Stack>
                    
                    {/* Enlace "Ver detalle" */}
                    <MUILink
                      component={RouterLink}
                      to={`/applications/${item?.raw?._id || item?.raw?.id || idx}`}
                      underline="hover"
                      sx={{ fontSize: 14 }}
                      color="primary"
                    >
                      Ver detalle
                    </MUILink>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Pagination */}
        {filtered.length > PER_PAGE && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, p) => setPage(p)}
              shape="rounded"
              color="primary"
              size="large"
            />
          </Stack>
        )}
      </Box>
    </Container>
  );
}