import type { ServiceResponseDTO } from 'services/cd-ng'

export interface NewServiceFormInterface {
  onSubmit: (val: ServiceResponseDTO) => void
  onClose: () => void
}

export interface NewServiceDataInterface {
  name: string
  description: string
  identifier: string
  tags: string[]
}
