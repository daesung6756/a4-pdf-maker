import { FormData } from './form'

export type Handlers = {
  onSave: () => void
  onReset: () => void
  onPdfSubmit: (data: FormData) => Promise<void>
}

export type ContextShape = {
  handlers: Handlers
  registerHandlers: (h: Partial<Handlers>) => void
}
