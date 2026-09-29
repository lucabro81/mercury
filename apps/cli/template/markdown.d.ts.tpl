/** Markdown imported as text (`with { type: "text" }`), as the persona files are. */
declare module "*.md" {
  const text: string;
  export default text;
}
