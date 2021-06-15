import React from 'react'
import type { GetDataError } from 'restful-react'
import { useStrings } from 'framework/strings'
import LoaderAndLabel from './loaderAndLabel/loaderAndLabel'
import { Status as validationStatus } from './loaderAndLabel/loaderAndLabel.constant'

export default function ValidateConnector(props: {
  progress: boolean
  error: GetDataError<unknown> | null
}): JSX.Element {
  const { getString } = useStrings()
  const { progress, error } = props
  return (
    <>
      {progress
        ? LoaderAndLabel(validationStatus.Progress, getString('cv.connectorValidation.inProgress'))
        : error
        ? LoaderAndLabel(validationStatus.Error, (error?.data as Error)?.message || error?.message)
        : LoaderAndLabel(validationStatus.Success, getString('cv.connectorValidation.successful'))}
    </>
  )
}
