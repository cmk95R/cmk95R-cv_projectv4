import React, { useEffect, useMemo, useRef, useState } from "react";
import { Grid, TextField, Autocomplete, CircularProgress } from "@mui/material";

import { fetchProvinciasApi, fetchLocalidadesApi } from "../api/apiGeo";
// dedup por id
const dedupeById = (arr = []) => Array.from(new Map(arr.map((x) => [x.id, x])).values());

export default function DireccionAR({ value, onChange, required }) {
    // value: { provincia?: {id,nombre}, localidad?: {id,nombre} }
    const [provincias, setProvincias] = useState([]);
    const [prov, setProv] = useState(value?.provincia || null);

    const [localidades, setLocalidades] = useState([]);
    const [loc, setLoc] = useState(value?.localidad || null);

    const [loadingProv, setLoadingProv] = useState(false);
    const [loadingLoc, setLoadingLoc] = useState(false);

    const cacheLocalidades = useMemo(() => new Map(), []);
    const lastEmittedRef = useRef("");

    // Cargar provincias
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingProv(true);
                // Usamos nuestra nueva API del backend
                const { data } = await fetchProvinciasApi();
                if (!alive) return;
                setProvincias(dedupeById(data?.provincias || []));
            } catch (e) {
                console.error("Error provincias", e);
            } finally {
                if (alive) setLoadingProv(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    // Cargar localidades cuando cambia provincia
    useEffect(() => {
        let alive = true;

        async function load(provId) {
            if (!provId) { setLocalidades([]); return; }
            if (cacheLocalidades.has(provId)) {
                setLocalidades(cacheLocalidades.get(provId));
                return;
            }
            try {
                setLoadingLoc(true);
                // Usamos nuestra nueva API del backend
                const { data } = await fetchLocalidadesApi(provId);
                if (!alive) return;
                const list = dedupeById(data?.localidades || []);
                cacheLocalidades.set(provId, list);
                setLocalidades(list);
            } catch (e) {
                console.error("Error localidades", e);
                if (alive) setLocalidades([]);
            } finally {
                if (alive) setLoadingLoc(false);
            }
        }

        load(prov?.id);
        setLoc(null);

        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prov]);

    // --- CORRECCIÓN ---
    // Asegurarse de que la provincia se establezca solo cuando la lista de provincias esté cargada.
    useEffect(() => {
        if (provincias.length > 0 && value?.provincia?.id) {
            const initialProv = provincias.find(p => p.id === value.provincia.id);
            if (initialProv) setProv(initialProv);
        }
    }, [provincias, value?.provincia?.id]);

    // Emitir cambios al padre (idempotente)
    useEffect(() => {
        const payload = {
            provincia: prov ? { id: prov.id, nombre: prov.nombre } : undefined,
            localidad: loc ? { id: loc.id, nombre: loc.nombre } : undefined,
        };
        const key = JSON.stringify(payload);
        if (key !== lastEmittedRef.current) {
            lastEmittedRef.current = key;
            onChange?.(payload);
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prov, loc]); // no incluimos onChange

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} width={150}>
                <Autocomplete
                    options={provincias}
                    value={prov}
                    getOptionLabel={(o) => o?.nombre || ""}
                    onChange={(_e, val) => setProv(val)}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={loadingProv}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            {option.nombre}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Provincia"
                            required={required}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loadingProv ? <CircularProgress size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} width={150}>
                <Autocomplete
                    options={localidades}
                    value={loc}
                    getOptionLabel={(o) => o?.nombre || ""}
                    onChange={(_e, val) => setLoc(val)}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={loadingLoc}
                    disabled={!prov}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            {option.nombre}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Localidad"
                            required={required}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loadingLoc ? <CircularProgress size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>
        </Grid>
    );
}
