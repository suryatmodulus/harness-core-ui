/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import type { Failure } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'

export function determineValidationStatus({
  isEdit,
  loading,
  error,
  result,
  getString
}: {
  isEdit?: boolean
  loading: boolean
  error?: GetDataError<Failure | Error> | null
  result?: boolean
  getString: UseStringsReturn['getString']
}): {
  status?: StatusOfValidation
  text?: string
} {
  if (isEdit) {
    return {}
  }

  if (loading) {
    return { status: StatusOfValidation.IN_PROGRESS, text: getString('cv.changeSource.kubernetes.validatingConnector') }
  }

  if (error) {
    return { status: StatusOfValidation.ERROR, text: getErrorMessage(error) }
  }

  if (result === true) {
    return { status: StatusOfValidation.SUCCESS }
  }

  if (result === false) {
    return {
      status: StatusOfValidation.ERROR,
      text: getString('cv.changeSource.kubernetes.invalidConnector')
    }
  }

  return {}
}
