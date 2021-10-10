import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { RestResponseHealthMonitoringFlagResponse, useSetHealthMonitoringFlag } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ToggleOnOff from '@common/components/ToggleOnOff/ToggleOnOff'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'

export default function ToggleMonitoring({
  identifier,
  enable,
  refetch
}: {
  identifier: string
  enable: boolean
  refetch: () => void
}): JSX.Element {
  const params = useParams<ProjectPathProps>()
  const { showError, showSuccess, clear } = useToaster()
  const { getString } = useStrings()
  const [isEnabled, setIsEnabled] = useState(enable)
  const { mutate: toggleMonitoringService, loading } = useSetHealthMonitoringFlag({
    identifier
  })

  const onToggleMonitoringSource = useCallback(async (checked: boolean): Promise<void> => {
    try {
      const output: RestResponseHealthMonitoringFlagResponse = await toggleMonitoringService(undefined, {
        queryParams: {
          enable: checked,
          accountId: params.accountId,
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier
        }
      })
      setIsEnabled(!!output.resource?.healthMonitoringEnabled)
      refetch()
      showSuccess(
        getString('cv.monitoredServices.monitoredServiceToggle', {
          enabled: output.resource?.healthMonitoringEnabled ? 'enabled' : 'disabled'
        })
      )
    } catch (err) {
      clear()
      showError(getErrorMessage(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Container onClick={e => e.stopPropagation()}>
        <ToggleOnOff checked={isEnabled} beforeOnChange={onToggleMonitoringSource} loading={loading} />
      </Container>
    </>
  )
}
