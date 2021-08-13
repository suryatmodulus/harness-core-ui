import type { FormikProps } from 'formik'
import type { EnvironmentResponseDTO } from 'services/cd-ng'

export interface DeployEnvData {
  environmentRef?: string
}

export interface HarnessEnvironmentModalProps {
  isEdit: boolean
  isEnvironment: boolean
  data: EnvironmentResponseDTO
  envIdentifier?: string
  formik?: FormikProps<DeployEnvData>
  onCreateOrUpdate(data: EnvironmentResponseDTO): void
  closeModal?: () => void
  onClose?: () => void
  className?: string
  modalTitle?: string
}
