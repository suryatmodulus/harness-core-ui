import React, { useState } from 'react'
import { Formik, FormikForm, Utils } from '@wings-software/uicore'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { useStrings } from 'framework/strings'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { updateSelectedMetricsMap, validateMappings } from './utils'
import { initialFormData } from './constants'
import MapQueriesToHarnessServiceLayout from './components/MapSplunkQueriesToService/components/MapQueriesToHarnessServiceLayout/MapQueriesToHarnessServiceLayout'
import type { MapSplunkQueryToService, SplunkQueryBuilderProps } from './types'
import css from './SplunkQueryBuilder.module.scss'

export function SplunkQueryBuilder(props: SplunkQueryBuilderProps): JSX.Element {
  const { getString } = useStrings()
  const { onSubmit, data: sourceData, onPrevious } = props

  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<{
    selectedMetric: string
    mappedMetrics: Map<string, MapSplunkQueryToService>
  }>({
    selectedMetric:
      (Array.from(sourceData?.mappedServicesAndEnvs?.keys() || [])?.[0] as string) ||
      getString('cv.monitoringSources.splunk.splunkLogsQuery'),
    mappedMetrics:
      sourceData?.mappedServicesAndEnvs?.size > 0
        ? sourceData?.mappedServicesAndEnvs
        : new Map<string, MapSplunkQueryToService>([
            [getString('cv.monitoringSources.splunk.splunkLogsQuery'), initialFormData]
          ])
  })

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState({
    createdMetrics: Array.from(mappedMetrics.keys()) || [getString('cv.monitoringSources.splunk.splunkLogsQuery')],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  })

  const connectorIdentifier = sourceData?.connectorRef
  const [rerenderKey, setRerenderKey] = useState('')

  return (
    <Formik<MapSplunkQueryToService | undefined>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onSubmit={async updatedSource => {
        if (updatedSource) {
          mappedMetrics.set(selectedMetric, updatedSource)
        }
        await onSubmit({ ...sourceData, mappedServicesAndEnvs: new Map(mappedMetrics) })
      }}
      formName="mapSplunk"
      initialValues={mappedMetrics.get(selectedMetric || '')}
      key={rerenderKey}
      isInitialValid={(args: any) => {
        return (
          Object.keys(validateMappings(getString, createdMetrics, selectedMetricIndex, args.initialValues)).length === 0
        )
      }}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(getString, createdMetrics, selectedMetricIndex, values)
      }}
    >
      {formikProps => (
        <FormikForm className={css.formFullheight}>
          <SetupSourceLayout
            leftPanelContent={
              <MultiItemsSideNav
                defaultMetricName={getString('cv.monitoringSources.splunk.splunkLogsQuery')}
                tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                addFieldLabel={getString('cv.monitoringSources.addQuery')}
                createdMetrics={createdMetrics}
                defaultSelectedMetric={selectedMetric}
                renamedMetric={formikProps.values?.metricName}
                onRemoveMetric={(removedMetric, updatedMetric, updatedList, smIndex) => {
                  setMappedMetrics(oldState => {
                    const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
                    const updatedMap = new Map(oldMappedMetric)

                    if (updatedMap.has(removedMetric)) {
                      updatedMap.delete(removedMetric)
                    } else {
                      // handle case where user updates the metric name for current selected metric
                      updatedMap.delete(oldMetric)
                    }

                    // update map with current values
                    if (formikProps.values?.metricName !== removedMetric) {
                      updatedMap.set(
                        updatedMetric,
                        { ...(formikProps.values as MapSplunkQueryToService) } || { metricName: updatedMetric }
                      )
                    } else {
                      setRerenderKey(Utils.randomId())
                    }

                    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                    return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
                  })
                }}
                onSelectMetric={(newMetric, updatedList, smIndex) => {
                  setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                  setMappedMetrics((oldState: any) => {
                    return updateSelectedMetricsMap({
                      updatedMetric: newMetric,
                      oldMetric: oldState.selectedMetric,
                      mappedMetrics: new Map<string, MapSplunkQueryToService>(oldState.mappedMetrics),
                      formikProps
                    })
                  })
                  setRerenderKey(Utils.randomId())
                }}
                isValidInput={formikProps.isValid}
              />
            }
            content={
              <>
                <SetupSourceCardHeader
                  mainHeading={getString('cv.monitoringSources.gcoLogs.querySpecificationsAndMappings')}
                  subHeading={getString('cv.monitoringSources.gcoLogs.customizeQuery')}
                />
                <MapQueriesToHarnessServiceLayout
                  onChange={formikProps.setFieldValue}
                  formikProps={formikProps}
                  connectorIdentifier={connectorIdentifier}
                />
              </>
            }
          />
          <DrawerFooter isSubmit onPrevious={onPrevious} onNext={formikProps.submitForm} />
        </FormikForm>
      )}
    </Formik>
  )
}
