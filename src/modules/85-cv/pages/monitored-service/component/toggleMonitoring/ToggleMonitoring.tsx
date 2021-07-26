import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Switch, Icon, Container } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { RestResponseHealthMonitoringFlagResponse, useSetHealthMonitoringFlag } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export default function ToggleMonitoring({ identifier, enable }: { identifier: string; enable: boolean }): JSX.Element {
  const params = useParams<ProjectPathProps>()
  const { showError, clear } = useToaster()
  const [isEnabled, setIsEnabled] = useState(enable)
  const { mutate: toggleMonitoringService, loading } = useSetHealthMonitoringFlag({
    identifier
  })

  const onToggleMonitoringSource = useCallback(async (event: React.FormEvent<HTMLInputElement>): Promise<void> => {
    event.stopPropagation()
    try {
      const output: RestResponseHealthMonitoringFlagResponse = await toggleMonitoringService(undefined, {
        queryParams: {
          enable: event?.currentTarget?.checked,
          accountId: params.accountId,
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier
        }
      })
      setIsEnabled(!!output.resource?.healthMonitoringEnabled)
    } catch (err) {
      clear()
      showError(err?.data?.message)
    }
  }, [])

  return (
    <>
      {loading ? (
        <Icon name="steps-spinner" />
      ) : (
        <Container onClick={e => e.stopPropagation()}>
          <Switch checked={isEnabled} onChange={onToggleMonitoringSource} />
        </Container>
      )}
    </>
  )
}
