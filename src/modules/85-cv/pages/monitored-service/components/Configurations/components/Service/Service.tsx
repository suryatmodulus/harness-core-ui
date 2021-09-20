import React, { useState, useCallback } from 'react'
import * as Yup from 'yup'
import { Formik, FormikContext } from 'formik'
import { useHistory, useParams, Link } from 'react-router-dom'
import { Text, Color } from '@wings-software/uicore'
import { PageSpinner, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { MonitoredServiceResponse, ChangeSourceDTO } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import { ChangeSourceDrawer } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer'
import SaveAndDiscardButton from '@common/components/SaveAndDiscardButton/SaveAndDiscardButton'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import HealthSourceTable from '@cv/pages/health-source/HealthSourceTable'
import ChangeSourceTable from '@cv/pages/ChangeSource/ChangeSourceTable/ChangeSourceTable'
import type { MonitoredServiceForm } from './Service.types'
import MonitoredServiceOverview from './components/MonitoredServiceOverview/MonitoredServiceOverview'
import { MonitoredServiceType } from './components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import { onSave, updateMonitoredServiceDTOOnTypeChange } from './Service.utils'
import { isUpdated } from '../../Configurations.utils'
import css from './Service.module.scss'

function Service({
  value: initialValues,
  onSuccess,
  cachedInitialValues,
  setDBData,
  onDiscard,
  serviceTabformRef,
  onChangeMonitoredServiceType
}: {
  value: MonitoredServiceForm
  onSuccess: (val: any) => Promise<void>
  cachedInitialValues?: MonitoredServiceForm | null
  setDBData?: (val: MonitoredServiceForm) => void
  onDiscard?: () => void
  serviceTabformRef?: any
  onChangeMonitoredServiceType: (updatedValues: MonitoredServiceForm) => void
}): JSX.Element {
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [validMonitoredSource, setValidMonitoredSource] = useState(false)
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const isEdit = !!identifier

  const onSuccessHealthSource = useCallback(
    (data: MonitoredServiceResponse, formik: FormikContext<MonitoredServiceForm>): void => {
      formik.setFieldValue('sources', data?.monitoredService?.sources)
      setValidMonitoredSource(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit]
  )

  const updateChangeSource = useCallback(
    (data: any, formik: FormikContext<MonitoredServiceForm>): void => {
      formik.setFieldValue('sources', {
        ...formik.values?.sources,
        changeSources: data
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit]
  )

  const createChangeSourceDrawerHeader = useCallback(() => {
    return (
      <>
        <Text
          className={css.breadCrumbLink}
          icon={'arrow-left'}
          iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
          color={Color.PRIMARY_7}
          onClick={() => {
            history.push(
              routes.toCVMonitoringServices({
                orgIdentifier: orgIdentifier,
                projectIdentifier: projectIdentifier,
                accountId: accountId
              })
            )
          }}
        >
          {getString('cv.healthSource.backtoMonitoredService')}
        </Text>
        <div className="ng-tooltip-native">
          <p>{isEdit ? getString('cv.changeSource.editChangeSource') : getString('cv.changeSource.addChangeSource')}</p>
        </div>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  const { showDrawer, hideDrawer, setDrawerContentProps } = useDrawer({
    createHeader: createChangeSourceDrawerHeader,
    createDrawerContent: props => <ChangeSourceDrawer {...props} />
  })

  const openChangeSourceDrawer = useCallback(
    async ({
      formik,
      onSuccessChangeSource
    }: {
      formik: FormikContext<MonitoredServiceForm>
      onSuccessChangeSource: (data: ChangeSourceDTO[]) => void
    }) => {
      // has required fields
      if (formik?.values.environmentRef && formik?.values.name) {
        showDrawer()
        setDrawerContentProps({
          hideDrawer,
          tableData: formik?.values?.sources?.changeSources || [],
          onSuccess: onSuccessChangeSource,
          monitoredServiceType: formik.values.type
        })
      } else {
        formik.submitForm()
      }
    },
    []
  )

  return (
    <Formik<MonitoredServiceForm>
      initialValues={cachedInitialValues || initialValues}
      onSubmit={() => {
        setValidMonitoredSource(true)
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().nullable().required(getString('cv.monitoredServices.nameValidation')),
        type: Yup.string().nullable().required(getString('common.validation.typeIsRequired')),
        serviceRef: Yup.string()
          .nullable()
          .when('type', {
            is: type => type === MonitoredServiceType.APPLICATION,
            then: Yup.string().required(getString('cv.monitoredServices.serviceValidation'))
          }),
        environmentRef: Yup.string().nullable().required(getString('cv.monitoredServices.environmentValidation'))
      })}
      enableReinitialize
    >
      {formik => {
        serviceTabformRef.current = formik
        const { name, identifier: monitoredServiceId, description, tags, serviceRef, environmentRef } = formik?.values
        if (formik.dirty) {
          setDBData?.(formik.values)
        }
        const onSuccessChangeSource = (data: ChangeSourceDTO[]): void => {
          updateChangeSource(data, formik)
          hideDrawer()
        }

        return (
          <div>
            {isEdit && !(serviceRef && environmentRef) ? (
              <PageSpinner />
            ) : (
              <>
                <div className={css.saveDiscardButton}>
                  <SaveAndDiscardButton
                    isUpdated={isUpdated(formik.dirty, initialValues, cachedInitialValues)}
                    onSave={() => onSave({ formik, isEdit, getString, onSuccess, showSuccess, showError })}
                    onDiscard={() => {
                      formik.resetForm()
                      onDiscard?.()
                    }}
                  />
                </div>
                <MonitoredServiceOverview
                  formikProps={formik}
                  isEdit={isEdit}
                  onChangeMonitoredServiceType={type => {
                    if (type === formik.values.type) return
                    formik.setFieldValue('type', type)
                    onChangeMonitoredServiceType({
                      isEdit,
                      ...updateMonitoredServiceDTOOnTypeChange(type, formik.values)
                    })
                  }}
                />
                <Text color={Color.BLACK} className={css.sourceTableLabel}>
                  {getString('cv.healthSource.defineYourSource')}
                </Text>
                <CardWithOuterTitle>
                  <>
                    <ChangeSourceTable
                      onEdit={values => {
                        showDrawer()
                        setDrawerContentProps({ ...values, hideDrawer })
                      }}
                      value={formik?.values?.sources?.changeSources || []}
                      onSuccess={onSuccessChangeSource}
                    />
                    <div>
                      <Link to={'#'} onClick={() => openChangeSourceDrawer({ formik, onSuccessChangeSource })}>
                        + {getString('cv.changeSource.addChangeSource')}
                      </Link>
                    </div>
                  </>
                </CardWithOuterTitle>
                <CardWithOuterTitle>
                  <HealthSourceTable
                    isEdit={isEdit}
                    value={formik.values.sources?.healthSources || []}
                    onSuccess={data => onSuccessHealthSource(data, formik)}
                    serviceRef={serviceRef}
                    environmentRef={environmentRef}
                    monitoredServiceRef={{
                      name,
                      identifier: monitoredServiceId,
                      description,
                      tags
                    }}
                    validMonitoredSource={validMonitoredSource}
                    onCloseDrawer={setValidMonitoredSource}
                    validateMonitoredSource={formik.submitForm}
                    changeSources={formik?.values?.sources?.changeSources || []}
                  />
                </CardWithOuterTitle>
              </>
            )}
          </div>
        )
      }}
    </Formik>
  )
}

export default Service
