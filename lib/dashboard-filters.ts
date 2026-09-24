import { VEHICLE_TYPES, type VehicleType } from "@/lib/validation/vehicle";

type FilterParams = {
  tipo?: string | string[];
  ver?: string | string[];
};

// "?tipo=moto&ver=archivados" or "" — only whitelisted values are forwarded,
// so unrelated search params never leak into vehicle/detail URLs.
export function filterSuffix(params: FilterParams): string {
  const tipo = Array.isArray(params.tipo) ? params.tipo[0] : params.tipo;
  const ver = Array.isArray(params.ver) ? params.ver[0] : params.ver;
  const sp = new URLSearchParams();
  if (tipo && VEHICLE_TYPES.includes(tipo as VehicleType)) {
    sp.set("tipo", tipo);
  }
  if (ver === "archivados") sp.set("ver", "archivados");
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
