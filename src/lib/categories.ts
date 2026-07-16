// Lista base de categorias do EventGo. O organizador tambem pode criar categorias
// personalizadas (ver model Category / isCustom no schema do Prisma).
export const DEFAULT_CATEGORIES = [
  "Musica", "Shows", "Festivais", "Cinema", "Teatro", "Stand-up", "Danca",
  "Arte", "Exposicoes", "Museus", "Fotografia", "Cultura", "Gastronomia",
  "Food Trucks", "Vinhos e Cervejas", "Turismo", "Trilhas", "Esportes",
  "Futebol", "Corrida", "Ciclismo", "Surf", "Artes Marciais", "Yoga e Bem-estar",
  "Educacao", "Cursos e Workshops", "Tecnologia", "Games e eSports",
  "Cultura Pop", "Automobilismo", "Empreendedorismo", "Moda e Beleza",
  "Eventos Religiosos", "Voluntariado", "Sustentabilidade", "Pet", "Ciencia",
  "Encontros Sociais", "Feiras e Brechos", "Datas Comemorativas", "Outros",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {};
