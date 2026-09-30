/**
 * Naming helpers for what the CLI turns into paths: the folder a new app is
 * created in is always kebab case, whatever was typed.
 */

/** `text` in kebab case: accents dropped, camelCase split into words,
 * lowercase, every run of anything but ASCII letters and digits turned into a
 * single hyphen, no hyphen at either end. Empty when nothing usable is left. */
export function kebabCase(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
