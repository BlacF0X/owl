/**
 * Formate une date ISO en chaîne lisible (ex: "12/11/2025 14:30")
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  // On utilise une locale 'fr-FR' par défaut
  return new Date(dateString).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

/**
 * Calcule la durée écoulée entre une date donnée et une date de référence.
 * @param since Date de début (string ISO)
 * @param referenceDate Date de fin (Date object), par défaut maintenant
 * @returns Chaîne formatée (ex: "1h 30min") ou "" si since est null
 */
export const calculateDuration = (
  since: string | null,
  referenceDate: Date = new Date()
): string => {
  if (!since) return '';

  const sinceDate = new Date(since);
  const diffMs = referenceDate.getTime() - sinceDate.getTime();
  const safeDiffMs = Math.max(0, diffMs);

  const diffHours = Math.floor(safeDiffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((safeDiffMs % (1000 * 60 * 60)) / (1000 * 60));

  let duration = '';
  if (diffHours > 0) duration += `${diffHours}h `;
  if (diffMins > 0 || diffHours === 0) duration += `${diffMins}min`;

  return duration.trim();
};
