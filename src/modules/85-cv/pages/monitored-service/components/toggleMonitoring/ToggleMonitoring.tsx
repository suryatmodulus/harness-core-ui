import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { MutateMethod } from 'restful-react'
import { useToaster } from '@common/exports'
import type {
  RestResponseHealthMonitoringFlagResponse,
  SetHealthMonitoringFlagQueryParams,
  SetHealthMonitoringFlagPathParams
} from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ToggleOnOff from '@common/components/ToggleOnOff/ToggleOnOff'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'

export default function ToggleMonitoring({
  identifier,
  enabled,
  refetch,
  setHealthMonitoringFlag,
  loading
}: {
  identifier: string
  enabled: boolean
  refetch: () => void
  setHealthMonitoringFlag: MutateMethod<
    RestResponseHealthMonitoringFlagResponse,
    void,
    SetHealthMonitoringFlagQueryParams,
    SetHealthMonitoringFlagPathParams
  >
  loading?: boolean
}): JSX.Element {
  const params = useParams<ProjectPathProps>()
  const { showError, showSuccess, clear } = useToaster()
  const { getString } = useStrings()

  const onToggleMonitoringSource = useCallback(
    async (checked: boolean): Promise<void> => {
      try {
        const output: RestResponseHealthMonitoringFlagResponse = await setHealthMonitoringFlag(undefined, {
          pathParams: {
            identifier
          },
          queryParams: {
            enable: checked,
            accountId: params.accountId,
            projectIdentifier: params.projectIdentifier,
            orgIdentifier: params.orgIdentifier
          }
        })
        if (output) {
          refetch()
          showSuccess(
            getString('cv.monitoredServices.monitoredServiceToggle', {
              enabled: output.resource?.healthMonitoringEnabled ? 'enabled' : 'disabled'
            })
          )
        }
      } catch (err) {
        clear()
        showError(getErrorMessage(err))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return <ToggleOnOff checked={enabled} beforeOnChange={onToggleMonitoringSource} loading={loading} />
}
