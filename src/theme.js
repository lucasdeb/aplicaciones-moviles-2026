// Paleta "Cinematic Social" (sistema de diseño exportado de Stitch, ver
// stitch_cineconnect_rewards/cinematic_social/DESIGN.md) — Material You,
// tema oscuro. No inventar valores nuevos acá: si falta un token, sacarlo
// de ese DESIGN.md en vez de aproximar a ojo.
export const colors = {
  background: '#131313', // background / surface / surface-dim
  surface: '#1c1b1b', // surface-container-low
  surfaceAlt: '#201f1f', // surface-container
  surfaceHigh: '#2a2a2a', // surface-container-high
  text: '#e5e2e1', // on-surface / on-background
  textMuted: '#e9bcb6', // on-surface-variant (tinte cálido a propósito, Material You)
  accentPrimary: '#e50914', // primary-container — rojo "cine", fondos sólidos (CTAs, badges)
  onAccentPrimary: '#fff7f6', // on-primary-container — texto/íconos sobre accentPrimary
  accentPrimarySoft: '#ffb4aa', // primary — mismo rojo pero suave, para texto/íconos sobre fondo oscuro (wordmark, header)
  accentSecondary: '#006ee7', // tertiary-container — azul, social/interactivo
  onAccentSecondary: '#f9f8ff', // on-tertiary-container
  rating: '#fabd00', // secondary-container — dorado, solo para calificaciones/gamificación
  border: 'rgba(255,255,255,0.08)', // glass border (white/5–white/10 en el export)
  danger: '#ffb4ab', // error
};
