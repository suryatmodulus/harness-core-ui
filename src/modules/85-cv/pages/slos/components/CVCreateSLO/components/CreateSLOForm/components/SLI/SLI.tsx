import React, { useCallback, useEffect, useMemo } from 'react'
import { Color, FormInput, Text, useToaster } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { useGetAllMonitoredServicesWithTimeSeriesHealthSources } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { SLIProps } from './SLI.types'
import {
  getHealthSourcesOptions,
  getMonitoredServicesOptions,
  getSliMetricOptions,
  getSliTypeOptions
} from './SLI.utils'
import { SLIMetricEnum } from './SLI.constants'
import RatioMetricType from './components/RatioMetricType/RatioMetricType'
import ThresholdMetricType from './components/ThresholdMetricType/ThresholdMetricType'
import css from './SLI.module.scss'

export default function SLI(props: SLIProps): JSX.Element {
  const {
    formikProps: { values },
    children
  } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId
    }
  })

  useEffect(() => {
    if (monitoredServicesDataError) {
      showError(getErrorMessage(monitoredServicesDataError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServicesDataError])

  const renderSelectedMetricTypeLayout = useCallback(() => {
    if (values?.serviceLevelIndicators?.spec?.type === SLIMetricEnum.RATIO) {
      return <RatioMetricType />
    }
    return <ThresholdMetricType />
  }, [values?.serviceLevelIndicators?.spec?.type])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServicesOptions(monitoredServicesData),
    [monitoredServicesData]
  )

  const healthSourcesOptions = useMemo(
    () => getHealthSourcesOptions(monitoredServicesData, values?.monitoredServiceRef),
    [values?.monitoredServiceRef, monitoredServicesData]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sliMetricOptions = useMemo(() => getSliMetricOptions(getString), [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sliTypeOptions = useMemo(() => getSliTypeOptions(getString), [])

  return (
    <>
      <Text color={Color.BLACK} className={css.label}>
        {getString('connectors.cdng.monitoredService.label')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.Select
          name="monitoredServiceRef"
          label={<Text font={{ size: 'small' }}>{getString('cv.slos.selectMonitoredServiceForSlo')}</Text>}
          placeholder={monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectMonitoredService')}
          items={monitoredServicesOptions}
          className={css.dropdown}
        />
      </CardWithOuterTitle>
      <Text color={Color.BLACK} className={css.label}>
        {getString('cv.slos.healthSourceForSLI')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.Select
          name="healthSourceRef"
          placeholder={monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectHealthsource')}
          items={healthSourcesOptions}
          className={css.dropdown}
        />
      </CardWithOuterTitle>
      <Text color={Color.BLACK} className={css.label}>
        {getString('cv.slos.sliType')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.RadioGroup name="serviceLevelIndicators.type" radioGroup={{ inline: true }} items={sliTypeOptions} />
        <Text font={{ size: 'small' }}>{getString('cv.slos.latencySLI')}</Text>
      </CardWithOuterTitle>

      <Text color={Color.BLACK} className={css.label}>
        {getString('cv.slos.pickMetricsSLI')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.RadioGroup
          name="serviceLevelIndicators.spec.type"
          radioGroup={{ inline: true }}
          items={sliMetricOptions}
        />
        {renderSelectedMetricTypeLayout()}
      </CardWithOuterTitle>
      {children}
    </>
  )
}
