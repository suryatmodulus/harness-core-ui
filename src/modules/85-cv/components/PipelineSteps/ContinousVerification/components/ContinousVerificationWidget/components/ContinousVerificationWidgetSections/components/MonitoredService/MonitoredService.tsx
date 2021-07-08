import React, { useCallback, useEffect } from 'react'
import cx from 'classnames'
import { Container, FormInput, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { isEmpty } from 'lodash-es'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  HealthSource,
  useCreateDefaultMonitoredService,
  useGetMonitoredServiceFromServiceAndEnvironment
} from 'services/cv'
import HealthSources from '@cv/components/PipelineSteps/ContinousVerification/components/HealthSources/HealthSources'
import { useStrings } from 'framework/strings'
import Card from '@cv/components/Card/Card'
import type { MonitoredServiceProps } from './MonitoredService.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './MonitoredService.module.scss'

export default function MonitoredService({
  formik: { values: formValues, setFieldValue }
}: MonitoredServiceProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { getString } = useStrings()
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const selectedStage = getStageFromPipeline(selectedStageId as string)?.stage
  const environmentIdentifier =
    selectedStage?.stage?.spec?.infrastructure?.environment?.identifier ||
    selectedStage?.stage?.spec?.infrastructure?.environmentRef
  const serviceIdentifier =
    selectedStage?.stage?.spec?.serviceConfig?.service?.identifier ||
    selectedStage?.stage?.spec?.serviceConfig?.serviceRef

  const createServiceQueryParams = useMemo(
    () => ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      serviceIdentifier
    }),
    [accountId, projectIdentifier, orgIdentifier, environmentIdentifier, serviceIdentifier]
  )

  const { mutate: createDefaultMonitoredService } = useCreateDefaultMonitoredService({
    queryParams: createServiceQueryParams
  })

  const { data, loading, error } = useGetMonitoredServiceFromServiceAndEnvironment({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      serviceIdentifier
    }
  })
  const monitoredServiceData = data?.data?.monitoredService

  useEffect(() => {
    if (environmentIdentifier === RUNTIME_INPUT_VALUE || serviceIdentifier === RUNTIME_INPUT_VALUE) {
      //when serviceIdentifier and environmentIdentifier are runtime
      const newSpecs = { ...formValues.spec, monitoredServiceRef: RUNTIME_INPUT_VALUE }
      setFieldValue('spec', newSpecs)
    } else if (monitoredServiceData && !loading && !error) {
      //when monitoredServiceData is derived from service and env.
      const healthSources = !isEmpty(monitoredServiceData?.sources?.healthSources)
        ? monitoredServiceData?.sources?.healthSources?.map(el => {
            return { identifier: (el as HealthSource)?.identifier }
          })
        : []
      const newSpecs = { ...formValues.spec, monitoredServiceRef: monitoredServiceData?.name, healthSources }
      setFieldValue('spec', newSpecs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServiceData, error, loading, environmentIdentifier, serviceIdentifier])

  const createMonitoredService = useCallback(async () => {
    const createdMonitoredService = await createDefaultMonitoredService()
    const newSpecs = {
      ...formValues.spec,
      monitoredServiceRef: createdMonitoredService?.resource?.monitoredService?.name
    }
    setFieldValue('spec', newSpecs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.spec])

  if (loading) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.fetchingMonitoredService')}</>
      </Card>
    )
  } else if (error) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.fetchingMonitoredServiceError')}</>
      </Card>
    )
  } else if (formValues.spec.monitoredServiceRef) {
    return (
      <>
        <Card>
          <div className={cx(stepCss.formGroup)}>
            <Container className={css.monitoredService}>
              <FormInput.Text
                name={'spec.monitoredServiceRef'}
                label={getString('connectors.cdng.monitoredService.label')}
                disabled
              />
              <div className={css.monitoredServiceText}>
                {getString('connectors.cdng.monitoredService.monitoredServiceText')}
              </div>
            </Container>
          </div>
        </Card>
        {formValues?.spec?.monitoredServiceRef !== RUNTIME_INPUT_VALUE ? (
          <HealthSources healthSources={monitoredServiceData?.sources?.healthSources} />
        ) : null}
      </>
    )
  } else {
    // case when monitoredServiceRef is empty
    return (
      <Card>
        <FormInput.CustomRender
          name={'spec.monitoredServiceRef'}
          label={getString('connectors.cdng.monitoredService.label')}
          render={() => (
            <a onClick={createMonitoredService}>
              {getString('connectors.cdng.monitoredService.autoCreateMonitoredService')}
            </a>
          )}
        />
      </Card>
    )
  }
}
