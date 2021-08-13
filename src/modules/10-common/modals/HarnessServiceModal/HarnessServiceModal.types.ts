import type { FormikProps } from 'formik'
import type { ServiceRequestDTO } from 'services/cd-ng'

interface ServiceData {
  serviceRef?: string
}

export interface HarnessServicetModalProps {
  isEdit: boolean
  isService: boolean
  formik?: FormikProps<ServiceData>
  data: ServiceRequestDTO
  serviceIdentifier?: string
  onCreateOrUpdate(data: ServiceRequestDTO): void
  closeModal?: () => void
  onClose?: () => void
  className?: string
  modalTitle?: string
}
