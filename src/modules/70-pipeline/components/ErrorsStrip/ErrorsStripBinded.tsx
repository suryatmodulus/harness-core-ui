/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty, merge } from 'lodash-es'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useGlobalEventListener } from '@common/hooks'

declare global {
  interface WindowEventMap {
    UPDATE_ERRORS_STRIP: CustomEvent<string>
  }
}

export default React.memo(function ErrorsStripBinded() {
  const {
    state: { errors, forms }
  } = React.useContext(StageErrorContext)
  const [errorsLocal, setErrorsLocal] = React.useState<FormikErrors<unknown>>({})

  React.useEffect(() => {
    if (errors) {
      setErrorsLocal(errors)
    }
  }, [errors])

  const updateForm = React.useCallback(
    (tab: string): void => {
      if (forms[tab]) {
        let errorsNew = {}
        for (const form of forms[tab]) {
          errorsNew = merge(errorsNew, form.current?.errors ?? {})
        }
        setErrorsLocal(errorsNew)
      }
    },
    [forms]
  )
  useGlobalEventListener('UPDATE_ERRORS_STRIP', event => {
    if (event.detail && !isEmpty(errorsLocal)) {
      window.requestAnimationFrame(() => {
        updateForm(event.detail)
      })
    }
  })
  return <ErrorsStrip formErrors={errorsLocal} />
})
