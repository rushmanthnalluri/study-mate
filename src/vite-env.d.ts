interface ImportMetaEnv { readonly PROD: boolean; readonly DEV: boolean; }
interface ImportMeta { readonly env: ImportMetaEnv; }
declare module '*.css' { const content: string; export default content; }
declare module 'react-dom/client' { export function createRoot(container: Element | DocumentFragment): any; }
