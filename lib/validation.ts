import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const categoriaSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  slug: z.string().min(1, "Slug es requerido"),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
});

export const productoSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  slug: z.string().min(1, "Slug es requerido"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  precio: z.string().min(1, "Precio es requerido"),
  especificaciones: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock debe ser positivo"),
  categoriaId: z.string().min(1, "Categoría es requerida"),
});

export const categoriaColorSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  slug: z.string().min(1, "Slug es requerido"),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
});

export const colorSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  slug: z.string().min(1, "Slug es requerido"),
  descripcion: z.string().optional(),
  especificaciones: z.string().optional(),
  imagenColor: z.string().optional(),
  imagenReferencia: z.string().optional(),
  categoriColorId: z.string().min(1, "Categoría de color es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CategoriaInput = z.infer<typeof categoriaSchema>;
export type ProductoInput = z.infer<typeof productoSchema>;
export type CategoriaColorInput = z.infer<typeof categoriaColorSchema>;
export type ColorInput = z.infer<typeof colorSchema>;
