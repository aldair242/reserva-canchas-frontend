export type RolUsuario = 'JUGADOR' | 'ADMIN_SEDE' | 'ADMIN';

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: RolUsuario;
  apodo?: string;
  fotoUrl?: string;
  posicionPreferida?: string;
}

export interface AuthContextType {
  token: string | null;
  usuario: UsuarioAutenticado | null;
  estaAutenticado: boolean;
  rol: RolUsuario | null;
  login: (token: string, usuario: UsuarioAutenticado) => void;
  logout: () => void;
}
