// Minimal ambient declarations for react-dom used in this project.
// This avoids TypeScript complaints in the editor when @types/react-dom
// isn't installed. Replace with the official types by installing
// `npm i -D @types/react-dom` for full typing.
declare module 'react-dom' {
  import * as React from 'react'

  export function createPortal(children: React.ReactNode, container: Element | null): any

  const ReactDOM: {
    createPortal: typeof createPortal
    // allow default import usage if present
    [key: string]: any
  }

  export default ReactDOM
}
