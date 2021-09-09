import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { Container, FormInput, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  MonitoredServiceResponse,
  useCreateDefaultMonitoredService,
  useGetMonitoredServiceFromServiceAndEnvironment
} from 'services/cv'
import { useStrings } from 'framework/strings'
import Card from '@cv/components/Card/Card'
import HealthSourceTable from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable'
import type { RowData } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { MonitoredServiceProps } from './MonitoredService.types'
import { getNewSpecs, isAnExpression } from './MonitoredService.utils'
import { MONITORED_SERVICE_EXPRESSION } from './MonitoredService.constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './MonitoredService.module.scss'

export default function MonitoredService({
  formik: { values: formValues, setFieldValue }
}: MonitoredServiceProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const [monitoredService, setMonitoredService] = useState({
    identifier: '',
    name: ''
  })
  const [healthSourcesList, setHealthSourcesList] = useState<RowData[]>([])
  const { getString } = useStrings()
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const selectedStage = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId as string)?.stage
  const environmentIdentifier =
    selectedStage?.stage?.spec?.infrastructure?.environment?.identifier ||
    selectedStage?.stage?.spec?.infrastructure?.environmentRef ||
    ''
  const serviceIdentifier =
    selectedStage?.stage?.spec?.serviceConfig?.service?.identifier ||
    selectedStage?.stage?.spec?.serviceConfig?.serviceRef ||
    ''

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

  const {
    mutate: createDefaultMonitoredService,
    loading: createMonitoredServiceLoading,
    error: errorCreatingMonitoredService
  } = useCreateDefaultMonitoredService({
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
      //when serviceIdentifier or environmentIdentifier are runtime
      const newSpecs = { ...formValues.spec, monitoredServiceRef: RUNTIME_INPUT_VALUE }
      setFieldValue('spec', newSpecs)
    } else if (isAnExpression(environmentIdentifier) || isAnExpression(serviceIdentifier)) {
      //when serviceIdentifier or environmentIdentifier is an expression
      const newSpecs = { ...formValues.spec, monitoredServiceRef: MONITORED_SERVICE_EXPRESSION }
      setFieldValue('spec', newSpecs)
    } else if (!loading && !error) {
      //when monitoredServiceData is derived from service and env.
      const newSpecs = getNewSpecs(monitoredServiceData, formValues)
      setFieldValue('spec', newSpecs)
      setHealthSourcesList(monitoredServiceData?.sources?.healthSources as RowData[])
      setMonitoredService({
        identifier: monitoredServiceData?.identifier as string,
        name: monitoredServiceData?.name as string
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServiceData, error, loading, environmentIdentifier, serviceIdentifier])

  const createMonitoredService = useCallback(async () => {
    const createdMonitoredService = await createDefaultMonitoredService()
    const newSpecs = {
      ...formValues.spec,
      monitoredServiceRef: createdMonitoredService?.resource?.monitoredService?.identifier
    }
    setFieldValue('spec', newSpecs)

    setMonitoredService({
      identifier: createdMonitoredService?.resource?.monitoredService?.identifier as string,
      name: createdMonitoredService?.resource?.monitoredService?.name as string
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.spec])

  const onSuccess = useCallback(
    (updatedMonitoredService: MonitoredServiceResponse) => {
      const { sources } = updatedMonitoredService?.monitoredService || { sources: { healthSources: [] } }
      const newSpecs = getNewSpecs(updatedMonitoredService?.monitoredService, formValues)
      setFieldValue('spec', newSpecs)
      setHealthSourcesList(sources?.healthSources as RowData[])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formValues.spec, monitoredServiceData?.identifier]
  )

  if (loading) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.fetchingMonitoredService')}</>
      </Card>
    )
  } else if (createMonitoredServiceLoading) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.creatingMonitoredService')}</>
      </Card>
    )
  } else if (error) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.fetchingMonitoredServiceError')}</>
      </Card>
    )
  } else if (errorCreatingMonitoredService) {
    return (
      <Card>
        <>{getString('connectors.cdng.monitoredService.creatingMonitoredServiceError')}</>
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
              {serviceIdentifier !== RUNTIME_INPUT_VALUE &&
              environmentIdentifier !== RUNTIME_INPUT_VALUE &&
              formValues?.spec?.monitoredServiceRef !== MONITORED_SERVICE_EXPRESSION ? (
                <div className={css.monitoredServiceText}>
                  {`
                    ${getString('connectors.cdng.monitoredService.monitoredServiceText')}
                    ${serviceIdentifier} ${getString('and').toLocaleLowerCase()} ${environmentIdentifier}
                  `}
                </div>
              ) : null}
            </Container>
          </div>
        </Card>
        {formValues?.spec?.monitoredServiceRef !== RUNTIME_INPUT_VALUE &&
        formValues?.spec?.monitoredServiceRef !== MONITORED_SERVICE_EXPRESSION ? (
          <HealthSourceTable
            isEdit={true}
            shouldRenderAtVerifyStep={true}
            value={healthSourcesList}
            onSuccess={onSuccess}
            serviceRef={serviceIdentifier || ''}
            environmentRef={environmentIdentifier || ''}
            monitoredServiceRef={monitoredService}
            breadCrumbRoute={{ routeTitle: getString('connectors.cdng.monitoredService.backToVerifyStep') }}
          />
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
