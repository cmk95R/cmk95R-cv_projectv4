import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stack, TextField, Autocomplete, CircularProgress } from "@mui/material";

const BASE = "https://apis.datos.gob.ar/georef/api";

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
                const r = await fetch(`${BASE}/provincias?campos=id,nombre&orden=nombre`);
                const j = await r.json();
                if (!alive) return;
                setProvincias(dedupeById(j?.provincias || []));
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
                const r = await fetch(
                    `${BASE}/localidades?provincia=${encodeURIComponent(provId)}&campos=id,nombre&orden=nombre&max=5000`
                );
                const j = await r.json();
                if (!alive) return;
                const list = dedupeById(j?.localidades || []);
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
        }
    }, [prov, loc]); // no incluimos onChange

    return (
        <Stack spacing={2}>
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
        </Stack>
    );
}
