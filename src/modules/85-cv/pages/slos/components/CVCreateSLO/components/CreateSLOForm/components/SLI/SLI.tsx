import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Heading,
  FontVariation,
  Card,
  FormInput,
  useToaster,
  SelectOption,
  Layout,
  Container
} from '@wings-software/uicore'
import type { RadioButtonProps } from '@wings-software/uicore/dist/components/RadioButton/RadioButton'
import { useStrings } from 'framework/strings'
import { useGetAllMonitoredServicesWithTimeSeriesHealthSources } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { defaultOption } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import { SLIProps, SLOFormFields, SLITypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import {
  getMonitoredServiceOptions,
  getHealthSourceOptions
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import CVRadioLabelTextAndDescription from '@cv/components/CVRadioLabelTextAndDescription'
import SLIContextualHelpText from './components/SLIContextualHelpText'
import PickMetric from './views/PickMetric'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLI: React.FC<SLIProps> = ({ children, formikProps }) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { values } = formikProps

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    if (monitoredServicesDataError) {
      showError(getErrorMessage(monitoredServicesDataError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServicesDataError])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServiceOptions(monitoredServicesData?.data),
    [monitoredServicesData]
  )

  const healthSourcesOptions = useMemo(
    () => getHealthSourceOptions(monitoredServicesData?.data, values?.monitoredServiceRef),
    [values?.monitoredServiceRef, monitoredServicesData]
  )

  const activeHealthSource: SelectOption = useMemo(
    () => healthSourcesOptions.find(healthSource => healthSource.value === values.healthSourceRef) ?? defaultOption,
    [healthSourcesOptions, values.healthSourceRef]
  )

  const radioItems: Pick<RadioButtonProps, 'label' | 'value'>[] = useMemo(() => {
    const { AVAILABILITY, LATENCY } = SLITypes
    return [
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.type.availability"
            description="cv.slos.contextualHelp.sli.availabilityDescription"
          />
        ),
        value: AVAILABILITY
      },
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.type.latency"
            description="cv.slos.contextualHelp.sli.latencyDescription"
          />
        ),
        value: LATENCY
      }
    ]
  }, [])

  return (
    <>
      <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'xsmall' }}>
        {getString('cv.slos.configureSLIQueries')}
      </Heading>
      <Card className={css.cardSli}>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Container width="50%" border={{ right: true }}>
            <Layout.Vertical width={350}>
              <FormInput.Select
                name={SLOFormFields.MONITORED_SERVICE_REF}
                label={getString('connectors.cdng.monitoredService.label')}
                placeholder={
                  monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectMonitoredService')
                }
                items={monitoredServicesOptions}
                className={css.selectPrimary}
                onChange={() => {
                  formikProps.setFieldValue(SLOFormFields.HEALTH_SOURCE_REF, undefined)
                  formikProps.setFieldValue(SLOFormFields.VALID_REQUEST_METRIC, undefined)
                  formikProps.setFieldValue(SLOFormFields.GOOD_REQUEST_METRIC, undefined)
                }}
              />
              <FormInput.Select
                name={SLOFormFields.HEALTH_SOURCE_REF}
                label={getString('cv.slos.healthSourceForSLI')}
                placeholder={monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectHealthsource')}
                items={healthSourcesOptions}
                className={css.selectPrimary}
                disabled={!values.monitoredServiceRef}
                value={activeHealthSource}
                onChange={healthSource => {
                  formikProps.setFieldValue(SLOFormFields.HEALTH_SOURCE_REF, healthSource.value)
                  formikProps.setFieldValue(SLOFormFields.VALID_REQUEST_METRIC, undefined)
                  formikProps.setFieldValue(SLOFormFields.GOOD_REQUEST_METRIC, undefined)
                }}
              />
            </Layout.Vertical>
            <Layout.Vertical width="80%">
              <Heading
                level={4}
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                margin={{ top: 'xlarge', bottom: 'small' }}
              >
                {getString('cv.slos.sliTypeChooseMetric')}
              </Heading>
              <FormInput.RadioGroup name={SLOFormFields.SLI_TYPE} className={css.radioGroup} items={radioItems} />
            </Layout.Vertical>
          </Container>
          <Container className={css.contextualHelp} width="50%" padding={{ left: 'large', right: 'large' }}>
            <SLIContextualHelpText />
          </Container>
        </Layout.Horizontal>
      </Card>

      <PickMetric formikProps={formikProps} />

      {children}
    </>
  )
}

export default SLI
