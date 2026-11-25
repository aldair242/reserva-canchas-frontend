// Re-exporta los clientes y tipos generados automáticamente por Orval desde el OpenAPI oficial
export {
  useListarAdministradoresSede,
  useCrearAdministradorSede,
  useActualizarAdministradorSede,
  useEliminarAdministradorSede,
} from '@/api/endpoints';

export type {
  AdministradorSedeResponse,
  CrearAdminSedeRequest,
  ActualizarAdminSedeRequest,
} from '@/api/model';
