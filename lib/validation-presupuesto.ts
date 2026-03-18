import { z } from "zod";

export const ConfiguracionEmpresaSchema = z.object({
  nombreEmpresa: z.string().min(1, "Nombre de empresa requerido"),
  ruc: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
});

export type ConfiguracionEmpresaInput = z.infer<typeof ConfiguracionEmpresaSchema>;

export const LineaPresupuestoInputSchema = z.object({
  numero: z.number().min(1).optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().nonnegative("Precio no puede ser negativo"),
  descuento: z.coerce.number().nonnegative("Descuento no puede ser negativo").default(0),
});

export type LineaPresupuestoInput = z.infer<typeof LineaPresupuestoInputSchema>;

export const PresupuestoCreateSchema = z.object({
  clienteNombre: z.string().min(1, "Nombre del cliente requerido"),
  clienteRuc: z.string().nullable().optional(),
  clienteDireccion: z.string().nullable().optional(),
  clienteTelefono: z.string().nullable().optional(),
  clienteEmail: z.string().email().nullable().optional(),
  fechaValidez: z.string().nullable().optional(),
  igvPorcentaje: z.coerce.number().nonnegative().default(18),
  descuentoTotal: z.coerce.number().nonnegative().default(0),
  notas: z.string().nullable().optional(),
  lineas: z.array(LineaPresupuestoInputSchema).min(1, "Debe tener al menos una línea"),
});

export type PresupuestoCreateInput = z.infer<typeof PresupuestoCreateSchema>;

export const PresupuestoUpdateSchema = PresupuestoCreateSchema.partial();

export type PresupuestoUpdateInput = z.infer<typeof PresupuestoUpdateSchema>;
