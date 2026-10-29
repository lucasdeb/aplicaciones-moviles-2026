// Product copy stays independent of build tools and provider error messages.
export const notificationsUnavailable = 'Las notificaciones no están disponibles en este dispositivo.';
export const notificationPermissionHint = 'Activá las notificaciones en los ajustes del teléfono para recibir los avisos.';
export const notificationRegistrationFailed = 'El aviso quedó guardado. No pudimos activar las notificaciones. Intentá de nuevo desde Ajustes.';

export function notificationTestError(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;
  if (status === 429) return 'Esperá un minuto antes de enviar otra prueba.';
  if (status === 401) return 'Iniciá sesión para probar las notificaciones.';
  if (status === 0) return 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.';
  return 'No pudimos enviar la prueba. Intentá de nuevo en unos instantes.';
}
