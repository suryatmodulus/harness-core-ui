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
