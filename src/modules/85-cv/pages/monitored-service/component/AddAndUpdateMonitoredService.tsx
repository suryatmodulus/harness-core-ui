import React, { useState, useEffect, useCallback } from 'react'
import cx from 'classnames'
import { Container, Text, Layout, Formik, FormInput, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetHarnessServices,
  HarnessService,
  HarnessEnvironment,
  useGetHarnessEnvironments
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { MonitoredServiceResponse, useGetMonitoredService } from 'services/cv'
import HealthSourceTable from '@cv/pages/health-source/HealthSourceTable'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import type { updatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent'
import css from './AddAndUpdateMonitoredService.module.scss'

export default function AddAndUpdateMonitoredService(): JSX.Element {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const isEdit = !!params?.identifier
  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()
  const {
    data: dataMonitoredServiceById,
    refetch,
    loading: loadingMonitoredServiceById
  } = useGetMonitoredService({
    lazy: true,
    identifier: params?.identifier,
    pathParams: {
      identifier: params?.identifier
    },
    queryParams: {
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier,
      accountId: params.accountId
    }
  })
  const [healthTableData, setHealthTableData] = useState<Array<updatedHealthSource>>([])
  const [initValue, setInitValue] = useState<{
    serviceRef?: SelectOption
    environmentRef?: SelectOption
    monitoredServiceName?: string
    monitoredServiceIdentifier?: string
  }>({})

  useEffect(() => {
    isEdit && refetch()
  }, [isEdit])

  const setInitialState = useCallback(
    (data: MonitoredServiceResponse): void => {
      const { identifier, serviceRef, environmentRef, sources, name } = data?.monitoredService || {
        sources: { healthSources: [] }
      }
      const serviceOption = serviceOptions.find(item => item?.value === serviceRef)
      const environmentOption = environmentOptions.find(item => item?.value === environmentRef)

      const formikValues = {
        serviceRef: serviceOption,
        environmentRef: environmentOption,
        monitoredServiceName: name as string,
        monitoredServiceIdentifier: identifier as string
      }
      setInitValue(formikValues)

      const healthData: Array<updatedHealthSource> = sources?.healthSources
        ? sources?.healthSources.map((healthSource: any) => {
            return {
              ...healthSource,
              service: serviceRef,
              environment: environmentRef
            }
          })
        : []

      setHealthTableData(healthData)
    },
    [serviceOptions, environmentOptions]
  )

  useEffect(() => {
    if (dataMonitoredServiceById) {
      const { data } = dataMonitoredServiceById
      data && setInitialState(data)
    }
  }, [dataMonitoredServiceById, serviceOptions, environmentOptions])

  const onSuccess = (data: MonitoredServiceResponse) => {
    setInitialState(data)
  }

  const onDelete = (payload: MonitoredServiceResponse) => {
    onSuccess(payload)
  }

  const MonitoredServiceDetails = (): JSX.Element => {
    return (
      <>
        <CardWithOuterTitle title={getString('cv.monitoredServices.monitoredServiceDetails')}>
          <Container width={'400px'} color={'black'}>
            <FormInput.InputWithIdentifier
              isIdentifierEditable={!isEdit}
              inputName="monitoredServiceName"
              inputLabel={getString('cv.monitoredServices.monitoredServiceName')}
              idName="monitoredServiceIdentifier"
            />
          </Container>
        </CardWithOuterTitle>
      </>
    )
  }

  const ServiceAndEnvironment = ({ formik }: { formik: FormikProps<any> }): JSX.Element => {
    return (
      <>
        {loadingMonitoredServiceById && <PageSpinner />}
        <CardWithOuterTitle title={getString('cv.monitoredServices.serviceAndEnvironment')}>
          <Layout.Horizontal spacing={'large'}>
            <FormInput.CustomRender
              name={'serviceRef'}
              render={() => {
                return (
                  <>
                    <Text color={'black'} margin={{ bottom: 'small' }}>
                      {getString('cv.healthSource.serviceLabel')}
                    </Text>
                    <HarnessService
                      className={cx(css.dropdown, isEdit && css.disabled)}
                      item={formik?.values?.serviceRef}
                      key={'harnessService'}
                      onSelect={selectedService => {
                        formik.setFieldValue('serviceRef', selectedService)
                      }}
                      options={serviceOptions}
                      onNewCreated={newOption => {
                        if (newOption?.identifier && newOption.name) {
                          const newServiceOption = { label: newOption.name, value: newOption.identifier }
                          setServiceOptions([newServiceOption, ...serviceOptions])
                          formik.setFieldValue('serviceRef', newServiceOption)
                        }
                      }}
                    />
                  </>
                )
              }}
            />
            <FormInput.CustomRender
              name={'environmentRef'}
              render={() => {
                return (
                  <>
                    <Text color={'black'} margin={{ bottom: 'small' }}>
                      {getString('cv.healthSource.environmentLabel')}
                    </Text>
                    <HarnessEnvironment
                      className={cx(css.dropdown, isEdit && css.disabled)}
                      item={formik?.values?.environmentRef}
                      key={'harnessEnvironment'}
                      onSelect={env => {
                        formik.setFieldValue('environmentRef', env)
                      }}
                      options={environmentOptions}
                      onNewCreated={newOption => {
                        if (newOption?.identifier && newOption.name) {
                          const newEnvOption = { label: newOption.name, value: newOption.identifier }
                          setEnvironmentOptions([newEnvOption, ...environmentOptions])
                          formik.setFieldValue('environmentRef', newEnvOption)
                        }
                      }}
                    />
                  </>
                )
              }}
            />
          </Layout.Horizontal>
        </CardWithOuterTitle>
      </>
    )
  }

  return (
    <Formik formName={''} initialValues={initValue} onSubmit={() => undefined} enableReinitialize>
      {formik => {
        const {
          serviceRef,
          environmentRef,
          monitoredServiceIdentifier = '',
          monitoredServiceName = ''
        } = formik?.values || {}
        return (
          <>
            <MonitoredServiceDetails />
            <ServiceAndEnvironment formik={formik} />
            <CardWithOuterTitle title={getString('cv.healthSource.defineYourSource')}>
              <HealthSourceTable
                isEdit={isEdit} // check if this can be removed
                value={healthTableData}
                onSuccess={onSuccess}
                onDelete={onDelete}
                serviceRef={serviceRef}
                environmentRef={environmentRef}
                monitoringSourcRef={{
                  monitoredServiceIdentifier,
                  monitoredServiceName
                }}
              />
            </CardWithOuterTitle>
          </>
        )
      }}
    </Formik>
  )
}
