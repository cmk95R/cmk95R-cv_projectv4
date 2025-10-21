import React, { useEffect, useMemo, useState } from "react";
import { Grid, TextField, Autocomplete, CircularProgress } from "@mui/material";

import { getProvinciasApi, getLocalidadesApi } from "../api/apiGeo";
// dedup por id
const dedupeById = (arr = []) => Array.from(new Map(arr.map((x) => [x.id, x])).values());

export default function DireccionAR({ value, onChange, required }) {
    // value: { provincia?: {id,nombre}, localidad?: {id,nombre} }
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);

    const [loadingProv, setLoadingProv] = useState(false);
    const [loadingLoc, setLoadingLoc] = useState(false);

    const cacheLocalidades = useMemo(() => new Map(), []);

    // Cargar provincias
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingProv(true);
                const { data } = await getProvinciasApi();
                if (!alive) return;
                setProvincias(dedupeById(data?.provincias || []));
            } catch (e) {
                console.error("Error provincias", e);
            } finally {
                if (alive) {
                    setLoadingProv(false);
                }
            }
        })();
        return () => { alive = false; };
    }, []);

    // Cargar localidades cuando cambia la provincia en el `value` prop
    useEffect(() => {
        let alive = true;
        const provId = value?.provincia?.id;

        async function load() {
            if (!provId) {
                setLocalidades([]);
                return;
            }
            if (cacheLocalidades.has(provId)) {
                setLocalidades(cacheLocalidades.get(provId));
                return;
            }
            try {
                setLoadingLoc(true);
                const { data } = await getLocalidadesApi(provId);
                if (!alive) return;
                const list = dedupeById(data?.localidades || []);
                cacheLocalidades.set(provId, list);
                setLocalidades(list);
            } catch (e) {
                console.error("Error localidades", e);
                if (alive) {
                    setLocalidades([]);
                }
            } finally {
                if (alive) {
                    setLoadingLoc(false);
                }
            }
        }

        load();

        return () => { alive = false; };
    }, [value?.provincia?.id, cacheLocalidades]);

    const handleProvinciaChange = (event, newProv) => {
        // Al cambiar la provincia, reseteamos la localidad
        onChange({ provincia: newProv, localidad: null });
    };

    const handleLocalidadChange = (event, newLoc) => {
        onChange({ ...value, localidad: newLoc });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} width={150}>
                <Autocomplete
                    options={provincias}
                    value={value?.provincia || null}
                    getOptionLabel={(o) => o?.nombre || ""}
                    onChange={handleProvinciaChange}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={loadingProv}
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
                    value={value?.localidad || null}
                    getOptionLabel={(o) => o?.nombre || ""}
                    onChange={handleLocalidadChange}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={loadingLoc}
                    disabled={!value?.provincia || localidades.length === 0}
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
