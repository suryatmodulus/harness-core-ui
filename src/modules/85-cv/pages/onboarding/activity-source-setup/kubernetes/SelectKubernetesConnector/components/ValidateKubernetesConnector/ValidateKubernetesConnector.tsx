import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useValidateConnector } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { KubernetesActivitySourceInfo } from '../../../KubernetesActivitySourceUtils'
import LoaderAndLabel from './components/loaderAndLabel'

export default function ValidateConnector(props: {
  values: KubernetesActivitySourceInfo | null
  callRefetch?: { current: { call: () => void } }
  onSuccess: (values: KubernetesActivitySourceInfo) => void
}): JSX.Element | null {
  const { values, onSuccess, callRefetch } = props
  const { connectorRef } = values || {}
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { loading, error, refetch } = useValidateConnector({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      connectorIdentifier: connectorRef?.value.toString() || '',
      tracingId: `${connectorRef?.value.toString()}:testConnection`,
      dataSourceType: 'KUBERNETES'
    }
  })
  if (callRefetch) callRefetch.current.call = refetch

  useEffect(() => {
    if (!loading && !error) {
      values && onSuccess({ ...values })
    }
  }, [loading, error, values])

  if (!loading) {
    if (error) {
      return LoaderAndLabel('error', (error?.data as Error)?.message || error?.message)
    } else {
      return LoaderAndLabel('success', getString('cv.connectorValidation.successful'))
    }
  } else {
    return LoaderAndLabel('progress', getString('cv.connectorValidation.inProgress'))
  }
}
