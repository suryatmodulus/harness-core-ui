import { validateConnectorPromise } from 'services/cv'
import type { ValidateSubmitProp } from './SelectKubernetesConnector.types'

export function validateAndSubmit({ values, params, onSubmit, showError }: ValidateSubmitProp): void {
  const { connectorRef } = values
  if (connectorRef?.value) {
    const { accountId, projectIdentifier, orgIdentifier } = params
    const { value } = connectorRef || {}
    validateConnectorPromise({
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        connectorIdentifier: value.toString(),
        // TODO: replace with correct value once BE confirms
        tracingId: 'tracingId',
        dataSourceType: 'KUBERNETES'
      }
    })
      .then((res: any) => {
        const { status, message } = res || {}
        status === 'ERROR' ? showError(message) : onSubmit({ ...values })
      })
      .catch(err => {
        showError(err?.message || 'Error')
      })
  }
}
