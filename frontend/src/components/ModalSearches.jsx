import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Chip
} from "@mui/material";
import { listApplicationsApi } from "../api/applications";
// Define los colores de estado (ajusta según tu app)
const STATE_COLORS = {
    Activa: "success",
    Pausada: "warning",
    Cerrada: "default",
    Aprobada: "success",
    Rechazada: "error",
    Pendiente: "warning",
    "En revisión": "warning",
    Retirada: "default",
};

function ApplicationDetailDialog({ open, onClose, application }) {
    if (!application) return null;
    const cv = application.cvSnapshot || {};
    const search = application.search || {};

    // Estado legible y color
    const estado = application.state || application.status || "Pendiente";
    const color = STATE_COLORS[estado] || "default";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalle de Postulación</DialogTitle>
            <DialogContent dividers>
                <Typography variant="caption" color="text.secondary">
                    {application.createdAt
                        ? new Date(application.createdAt).toLocaleString()
                        : "Fecha no disponible"}
                </Typography>

                <Stack spacing={2} sx={{ mt: 2 }}>
                    <div>
                        <Typography variant="subtitle2">Estado</Typography>
                        <Chip
                            label={estado}
                            size="small"
                            color={color}
                            sx={{ mt: 0.5 }}
                        />
                    </div>

                    <div>
                        <Typography variant="subtitle2">Postulante</Typography>
                        <Stack>
                            <Typography>
                                {cv.nombre || "-"} {cv.apellido || ""}
                            </Typography>
                            <Typography variant="body2">{cv.email || "-"}</Typography>
                            <Typography variant="body2">{cv.telefono || "-"}</Typography>
                            <Typography variant="body2">{cv.linkedin || "-"}</Typography>
                            <Typography variant="body2">
                                Área: {cv.areaInteres || "-"} · Nivel: {cv.nivelAcademico || "-"}
                            </Typography>
                        </Stack>
                    </div>

                    <div>
                        <Typography variant="subtitle2">Búsqueda</Typography>
                        <Stack>
                            <Typography>{search.titulo || search._id || "-"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {search.ubicacion || "-"} · {search.area || "-"} · {search.estado || "-"}
                            </Typography>
                        </Stack>
                    </div>

                    {application.message && (
                        <div>
                            <Typography variant="subtitle2">Mensaje del postulante</Typography>
                            <Typography variant="body2">{application.message}</Typography>
                        </div>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ApplicationDetailDialog;