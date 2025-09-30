import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Stack,
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
  Link as MUILink,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Link as RouterLink } from "react-router-dom";
import { myApplicationsApi } from "../api/applications";

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

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

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
  const company = s?.area || app?.area || "";
  const location = s?.ubicacion || s?.ciudad || app?.location || app?.ciudad || null;
  const salary = s?.salary || s?.sueldo || s?.compensation || app?.salary || null;
  const createdAt = app?.createdAt || app?.appliedAt || app?.created_at || app?.fecha || null;
  const state = (app?.state || app?.estado || "pending").toString().toLowerCase();
  const logoUrl = s?.logo || s?.logoUrl || s?.logo_url || null;

  return { id, title, company, location, salary, createdAt, state, logoUrl, raw: app };
}

export default function MyApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusOptions, setStatusOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Cargar datos desde la API y calcular estados únicos
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const { data } = await myApplicationsApi();
        const arr = Array.isArray(data) ? data : data?.items || [];
        setItems(arr);

        // Calcular estados únicos
        const estados = arr
          .map(app => (app.state || app.estado || "pending").toString().toLowerCase());
        setStatusOptions(["ALL", ...Array.from(new Set(estados))]);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Error inesperado";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Normalizar datos
  const normalized = useMemo(() => items.map(normalize), [items]);

  // Filtrar por estado y búsqueda
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized.filter(({ title, company, state }) => {
      const passesStatus = statusFilter === "ALL" || state === statusFilter;
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
      setLoading(true);
      setTimeout(() => {
        alert(`Postulación a "${applicationTitle}" retirada exitosamente (simulado).`);
        window.location.reload(); // O vuelve a llamar a la API real
      }, 1000);
    }
  };

  // Handler para contactar (simulado)
  const handleContactar = (applicationId, companyName) => {
    alert(`Abriendo chat/formulario para contactar a ${companyName} (simulado).`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Título y refresco */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Mis postulaciones</Typography>
          <Typography variant="body2" color="text.secondary">Acá vas a ver todas las búsquedas a las que te postulaste.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualizar">
            <IconButton onClick={() => window.location.reload()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filtros */}
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
                {statusOptions.map(opt => (
                  <MenuItem value={opt} key={opt}>
                    {opt === "ALL" ? "Todas" : (statusMap[opt]?.label || opt)}
                  </MenuItem>
                ))}
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

      {/* Contenido principal */}
      <Box mt={3}>
        {error && (
          <Card sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, mb: 3 }}>
            <CardContent>
              <Typography color="error" fontWeight={600} mb={1}>No pudimos cargar tus postulaciones</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{error}</Typography>
              <Button variant="outlined" onClick={() => window.location.reload()} startIcon={<RefreshIcon />}>Reintentar</Button>
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
                    <Skeleton height={36} width={100} />
                    <Skeleton height={36} width={80} />
                    <Skeleton height={20} width={80} />
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
            const { id, title, company, location, salary, createdAt, state, logoUrl } = item;
            const statusCfg = statusMap[state] || statusMap["pending"];

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
                      <Chip size="small" color={statusCfg.color} label={typeof state === "string" ? state : `${state}`} />
                      
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

                  <CardActions sx={{ justifyContent: "space-between", flexWrap: 'wrap', rowGap: 1 }}>
                    <Stack direction="row" spacing={1}>
                      {state !== 'withdrawn' && state !== 'rejected' && state !== 'accepted' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRetirarPostulacion(item.raw?._id || item.raw?.id, title)}
                        >
                          Retirar
                        </Button>
                      )}
                      {state !== 'rejected' && (
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