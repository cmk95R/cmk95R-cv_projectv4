import React, { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import {
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  InputAdornment,
  Container,
  Typography,
  Paper,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SocialLogin from "../components/socialLogin";
import DireccionAR from "../components/DireccionAR";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    id: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: { provincia: undefined, localidad: undefined },
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDireccionChange = useCallback(
    (dir) => setForm((p) => ({ ...p, direccion: dir })),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form?.direccion?.provincia?.id || !form?.direccion?.localidad?.id) {
      alert("Seleccioná provincia y localidad");
      return;
    }

    setLoading(true);
    try {
      const { data } = await registerApi({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        direccion: form.direccion,
      });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Bienvenido
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Registrate para ver nuestras ofertas de empleo
        </Typography>

        <form id="register-form" onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Apellido"
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              fullWidth
              required
            />

            <DireccionAR
              value={form.direccion}
              onChange={handleDireccionChange}
              required
            />

            <TextField
              label="Correo electrónico"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Contraseña"
              type={showPass ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPass((v) => !v)}
                      edge="end"
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.remember}
                  onChange={handleChange}
                  name="remember"
                />
              }
              label="Recordarme"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1.2, fontWeight: 600 }}
            >
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </Stack>
        </form>

        <SocialLogin />

        <Typography align="center" sx={{ mt: 2 }}>
          ¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a>
        </Typography>
      </Paper>
    </Container>
  );
}
