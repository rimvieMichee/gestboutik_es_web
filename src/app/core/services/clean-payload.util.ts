// Les champs optionnels vides ('') sont transformés en `undefined` avant l'envoi :
// le backend valide leur format (ex: @IsEmail()) uniquement quand ils sont fournis.
export function cleanPayload<T extends object>(payload: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(payload)) {
    (result as Record<string, unknown>)[key] = value === '' ? undefined : value;
  }
  return result;
}
