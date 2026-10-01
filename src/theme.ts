export const colors = {
  background: '#121212', // neutral de la paleta oficial
  surface: '#1c1b1b', // surface-container-low
  surfaceAlt: '#201f1f', // surface-container
  surfaceHigh: '#2a2a2a', // surface-container-high
  text: '#e5e2e1', // on-surface / on-background
  textMuted: '#e9bcb6', // on-surface-variant (tinte cálido a propósito, Material You)
  accentPrimary: '#e50914', // primary-container — rojo "cine", fondos sólidos (CTAs, badges)
  onAccentPrimary: '#fff7f6', // on-primary-container — texto/íconos sobre accentPrimary
  accentPrimarySoft: '#ffb4aa', // primary — mismo rojo pero suave, para texto/íconos sobre fondo oscuro (wordmark, header)
  accentSecondary: '#007aff', // tertiary de la paleta oficial — azul, social/interactivo
  onAccentSecondary: '#f9f8ff', // on-tertiary-container
  rating: '#ffc107', // secondary de la paleta oficial — dorado, solo para calificaciones/gamificación
  border: 'rgba(255,255,255,0.08)', // glass border (white/5–white/10 en el export)
  danger: '#ffb4ab', // error
};

// Tipografía de la marca: Be Vietnam Pro en toda la app.
// Con fuentes propias cada peso es una familia distinta, por eso no se usa fontWeight.
export const fonts = {
  title: 'BeVietnamPro_700Bold',
  label: 'BeVietnamPro_600SemiBold',
  body: 'BeVietnamPro_400Regular',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
};
