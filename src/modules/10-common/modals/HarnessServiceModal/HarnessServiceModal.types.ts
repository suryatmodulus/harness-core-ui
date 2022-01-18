/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
  skipServiceCreateOrUpdate?: boolean
  name?: string
  customLoading?: boolean
}
