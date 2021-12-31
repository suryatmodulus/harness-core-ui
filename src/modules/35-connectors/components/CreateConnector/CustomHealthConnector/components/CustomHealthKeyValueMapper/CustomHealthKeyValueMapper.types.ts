import type { ConnectorConfigDTO } from 'services/cv'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'

export interface CustomHealthKeyValueMapperProps {
  name: string
  formik: FormData
  prevStepData: ConnectorConfigDTO
  addRowButtonLabel: string
  className?: string
}
