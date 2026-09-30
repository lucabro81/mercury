/** A template file (`template/**\/*.tpl`), imported as text so it ends up in the
 * CLI's bundle instead of being read from disk at run time. */
declare module "*.tpl" {
  const text: string;
  export default text;
}
