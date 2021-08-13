import React from 'react'
import type { FormikProps } from 'formik'
import { Text, Layout, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import {
  useGetHarnessServices,
  useGetHarnessEnvironments,
  HarnessServiceAsFormField,
  HarnessEnvironmentAsFormField
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import css from './MonitoredServiceEnvironment.module.scss'

function ServiceEnvironment({ formik }: { formik: FormikProps<any> }): JSX.Element {
  const { getString } = useStrings()
  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()

  return (
    <CardWithOuterTitle title={getString('cv.monitoredServices.serviceAndEnvironment')}>
      <Layout.Horizontal spacing={'large'}>
        <HarnessServiceAsFormField
          customRenderProps={{
            name: 'serviceRef',
            label: (
              <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
                {getString('cv.healthSource.serviceLabel')}
              </Text>
            )
          }}
          serviceProps={{
            className: cx(css.dropdown, formik?.values?.isEdit && css.disabled),
            item: serviceOptions.find(item => item?.value === formik?.values?.serviceRef),
            options: serviceOptions,
            onSelect: selectedService => {
              formik.setFieldValue('serviceRef', selectedService?.value)
            },
            onNewCreated: newOption => {
              if (newOption?.identifier && newOption.name) {
                const newServiceOption = { label: newOption.name, value: newOption.identifier }
                setServiceOptions([newServiceOption, ...serviceOptions])
                formik.setFieldValue('serviceRef', newServiceOption.value)
              }
            }
          }}
        />
        <HarnessEnvironmentAsFormField
          customRenderProps={{
            name: 'environmentRef',
            label: (
              <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
                {getString('cv.healthSource.environmentLabel')}
              </Text>
            )
          }}
          environmentProps={{
            className: cx(css.dropdown, formik?.values?.isEdit && css.disabled),
            item: environmentOptions.find(item => item?.value === formik?.values?.environmentRef),
            options: environmentOptions,
            onSelect: environment => {
              formik.setFieldValue('environmentRef', environment.value)
            },
            onNewCreated: newOption => {
              if (newOption?.identifier && newOption.name) {
                const newEnvOption = { label: newOption.name, value: newOption.identifier }
                setEnvironmentOptions([newEnvOption, ...environmentOptions])
                formik.setFieldValue('environmentRef', newEnvOption.value)
              }
            }
          }}
        />
      </Layout.Horizontal>
    </CardWithOuterTitle>
  )
}

export default ServiceEnvironment
