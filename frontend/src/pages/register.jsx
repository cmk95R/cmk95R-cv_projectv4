import React from "react";
import { useState, useContext } from "react";
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

export default function RegisterForm() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // handler robusto: acepta e.target.value o un objeto { target:{ name, value } }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerApi({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        dni: form.dni,
        nacimiento: form.nacimiento
      });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/"); // o /profile
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  const [showPass, setShowPass] = useState(false);
  const handleClickShowPassword = () => setShowPass(!showPass);
  const handleMouseDownPassword = () => setShowPass(!showPass);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={4}>
        <form id="register-form" onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bienvenido
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Registrate para ver nuestras ofertas de empleo
          </Typography>

          <Stack spacing={2}>
            {/* Nombre */}
            <TextField
              label="Nombre"
              type="text" 
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Apellido */}
            <TextField
              label="Apellido"
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              fullWidth
              required
            />
            {/* Email */}
            <TextField
              label="Correo electrónico"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Contraseña con toggle */}
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

            {/* DNI: solo números */}
            <TextField
              label="DNI"
              type="text"
              name="dni"
              value={form.dni}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, "");
                setForm((prev) => ({ ...prev, dni: onlyNums }));
              }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
              fullWidth
              required
              helperText="Solo números"
            />

            {/* Fecha de nacimiento (no futura) */}
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              name="nacimiento"
              value={form.nacimiento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
              fullWidth
              required
            />

            {/* Recordarme */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.remember}
                  onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                  name="remember"
                />
              }
              label="Recordarme"
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
          >
            Registrar
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            ¿Ya tenés una cuenta? <a href="/login">Iniciá sesión</a>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
}
