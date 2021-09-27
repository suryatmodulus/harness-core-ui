import React, { useMemo } from 'react'
import { Layout, FormInput, Utils } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { MonitoredServiceDTO } from 'services/cv'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import {
  useGetHarnessServices,
  useGetHarnessEnvironments,
  HarnessServiceAsFormField,
  HarnessEnvironmentAsFormField
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { MonitoredServiceTypeOptions } from './MonitoredServiceOverview.constants'
import {
  updateMonitoredServiceNameForService,
  updatedMonitoredServiceNameForEnv
} from './MonitoredServiceOverview.utils'
import type { MonitoredServiceOverviewProps } from './MonitoredSourceOverview.types'
import css from './MonitoredServiceOverview.module.scss'

export default function MonitoredServiceOverview(props: MonitoredServiceOverviewProps): JSX.Element {
  const { formikProps, isEdit, onChangeMonitoredServiceType } = props
  const { getString } = useStrings()
  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()
  const values = formikProps.values || {}
  const keys = useMemo(() => [Utils.randomId(), Utils.randomId()], [values.serviceRef, values.environmentRef])

  return (
    <CardWithOuterTitle title={getString('overview')} className={css.monitoredService}>
      {!isEdit ? (
        <>
          <Layout.Horizontal spacing="large">
            <FormInput.Select
              name="type"
              items={MonitoredServiceTypeOptions}
              label={getString('typeLabel')}
              value={
                formikProps.values?.type === 'Infrastructure'
                  ? MonitoredServiceTypeOptions[1]
                  : MonitoredServiceTypeOptions[0]
              }
              onChange={item => onChangeMonitoredServiceType?.(item.value as MonitoredServiceDTO['type'])}
            />
            <HarnessServiceAsFormField
              key={keys[0]}
              customRenderProps={{
                name: 'serviceRef',
                label: getString('cv.healthSource.serviceLabel')
              }}
              serviceProps={{
                className: css.dropdown,
                disabled: isEdit,
                item: serviceOptions.find(item => item?.value === values.serviceRef),
                options: serviceOptions,
                onSelect: selectedService => updateMonitoredServiceNameForService(formikProps, selectedService),
                onNewCreated: newOption => {
                  if (newOption?.identifier && newOption.name) {
                    const newServiceOption = { label: newOption.name, value: newOption.identifier }
                    setServiceOptions([newServiceOption, ...serviceOptions])
                    updateMonitoredServiceNameForService(formikProps, newServiceOption)
                  }
                }
              }}
            />
            <HarnessEnvironmentAsFormField
              key={keys[1]}
              customRenderProps={{
                name: 'environmentRef',
                label: getString('cv.healthSource.environmentLabel')
              }}
              environmentProps={{
                className: css.dropdown,
                disabled: isEdit,
                item: environmentOptions.find(item => item?.value === values.environmentRef),
                options: environmentOptions,
                onSelect: environment => updatedMonitoredServiceNameForEnv(formikProps, environment),
                onNewCreated: newOption => {
                  if (newOption?.identifier && newOption.name) {
                    const newEnvOption = { label: newOption.name, value: newOption.identifier }
                    setEnvironmentOptions([newEnvOption, ...environmentOptions])
                    updatedMonitoredServiceNameForEnv(formikProps, newEnvOption)
                  }
                }
              }}
            />
          </Layout.Horizontal>
          <hr className={css.divider} />
        </>
      ) : null}
      <NameIdDescriptionTags
        formikProps={formikProps}
        inputGroupProps={{ disabled: true }}
        className={css.nameTagsDescription}
        identifierProps={{
          isIdentifierEditable: false,
          inputLabel: getString('cv.monitoredServices.monitoredServiceName')
        }}
      />
    </CardWithOuterTitle>
  )
}
