import React, { useEffect, useState, useMemo, useCallback } from 'react'
import * as Yup from 'yup'
import { isEqual } from 'lodash-es'
import { Formik, FormikContext } from 'formik'
import { matchPath, useHistory, useParams } from 'react-router-dom'
import { PageSpinner, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import {
  MonitoredServiceDTO,
  MonitoredServiceResponse,
  useGetMonitoredService,
  useSaveMonitoredService,
  useUpdateMonitoredService
} from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import SaveAndDiscardButton from '@common/components/SaveAndDiscardButton/SaveAndDiscardButton'
import { useIndexedDBHook, CVObjectStoreNames } from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import ServiceEnvironment from './serviceEnvironment/MonitoredServiceEnvironment'
import MonitoredServiceDetails from './monitoredServiceDetails/MonitoredServiceDetails'
import CardWithOuterTitle from '../../health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import HealthSourceTable from '../../health-source/HealthSourceTable'
import type { MonitoredServiceForm } from './MonitoredService.types'
import { getInitFormData } from './MonitoredService.utils'
import css from './MonitoredService.module.scss'

function MonitoredService(): JSX.Element {
  const { getString } = useStrings()
  const history = useHistory()
  const { showWarning, showError, showSuccess } = useToaster()
  const [validMonitoredSource, setValidMonitoredSource] = useState(false)
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const [cachedInitialValues, setCachedInitialValue] = useState<MonitoredServiceForm | null>(null)
  const [overrideBlockNavigation, setOverrideBlockNavigation] = useState<boolean>(false)
  const isEdit = !!identifier
  const {
    data: dataMonitoredServiceById,
    refetch,
    loading: loadingGetMonitoredService
  } = useGetMonitoredService({
    lazy: true,
    identifier,
    pathParams: {
      identifier
    },
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId
    }
  })

  const { mutate: saveMonitoredService } = useSaveMonitoredService({
    queryParams: { accountId }
  })
  const { mutate: updateMonitoredService, loading: loadingUpdateMoniotredService } = useUpdateMonitoredService({
    identifier,
    queryParams: { accountId }
  })

  useEffect(() => {
    if (isEdit) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  useEffect(() => {
    if (overrideBlockNavigation) {
      history.push(
        routes.toCVMonitoringServices({
          orgIdentifier,
          projectIdentifier,
          accountId
        })
      )
    }
  }, [overrideBlockNavigation])

  const { isInitializingDB, dbInstance } = useIndexedDBHook({
    clearStroreList: [CVObjectStoreNames.MONITORED_SERVICE]
  })

  useEffect(() => {
    if (!isInitializingDB && dbInstance) {
      dbInstance.get(CVObjectStoreNames.MONITORED_SERVICE, 'monitoredService')?.then(data => {
        setCachedInitialValue(data?.currentData)
      })
    }
  }, [isInitializingDB, dbInstance])

  const setDBData = async (data: unknown) => {
    try {
      await dbInstance?.put(CVObjectStoreNames.MONITORED_SERVICE, {
        monitoredService: 'monitoredService',
        currentData: data
      })
    } catch (e) {
      showWarning(e)
    }
  }

  const onSuccess = useCallback(
    (data: MonitoredServiceResponse, formik: FormikContext<MonitoredServiceForm>): void => {
      formik.setFieldValue('sources', data?.monitoredService?.sources)
      setValidMonitoredSource(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit]
  )

  const onSubmit = useCallback(
    async (formikValues: MonitoredServiceForm): Promise<void> => {
      const {
        serviceRef,
        environmentRef,
        identifier: monitoredServiceId,
        name,
        description,
        tags,
        sources
      } = formikValues
      const payload: MonitoredServiceDTO = {
        orgIdentifier,
        projectIdentifier,
        serviceRef,
        environmentRef,
        identifier: monitoredServiceId,
        name,
        description,
        tags,
        sources,
        type: 'Application'
      }
      isEdit ? await updateMonitoredService(payload) : await saveMonitoredService(payload)

      if (isEdit) {
        refetch()
      } else {
        setOverrideBlockNavigation(true)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit]
  )

  const onSave = useCallback(
    async (formik: FormikContext<any>): Promise<void> => {
      const validResponse = await formik?.validateForm()
      if (!Object.keys(validResponse).length) {
        try {
          await onSubmit(formik?.values)
          showSuccess(
            getString(
              isEdit ? 'cv.monitoredServices.monitoredServiceUpdated' : 'cv.monitoredServices.monitoredServiceCreated'
            )
          )
        } catch (error) {
          showError(getErrorMessage(error))
        }
      } else {
        formik?.submitForm()
      }
    },
    [isEdit]
  )

  const initialValues: MonitoredServiceForm = useMemo(
    () => getInitFormData(dataMonitoredServiceById?.data?.monitoredService, isEdit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataMonitoredServiceById?.data?.monitoredService.name, isEdit, loadingGetMonitoredService]
  )

  useEffect(() => {
    // In case user refereshes page with saved changes
    if (isEqual(cachedInitialValues, initialValues)) {
      dbInstance?.clear(CVObjectStoreNames.MONITORED_SERVICE)
      setCachedInitialValue(null)
    }
  }, [cachedInitialValues, initialValues])

  return (
    <Formik<MonitoredServiceForm>
      initialValues={cachedInitialValues || initialValues}
      onSubmit={() => {
        setValidMonitoredSource(true)
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('cv.monitoredServices.nameValidation')),
        serviceRef: Yup.string().required(getString('cv.monitoredServices.serviceValidation')),
        environmentRef: Yup.string().required(getString('cv.monitoredServices.environmentValidation'))
      })}
      enableReinitialize
    >
      {formik => {
        const { name, identifier: monitoredServiceId, description, tags, serviceRef, environmentRef } = formik?.values
        const isUpdated = formik.dirty || !!cachedInitialValues
        if (formik.dirty) {
          setDBData(formik.values)
        }
        return (
          <div>
            {isEdit && !(serviceRef && environmentRef) ? (
              <PageSpinner />
            ) : (
              <>
                {loadingUpdateMoniotredService && <PageSpinner />}
                <NavigationCheck
                  when={formik.dirty}
                  shouldBlockNavigation={nextLocation => {
                    const matchDefault = matchPath(nextLocation.pathname, {
                      path: isEdit
                        ? routes.toCVAddMonitoringServicesEdit({
                            ...accountPathProps,
                            ...projectPathProps,
                            identifier: ':identifier'
                          })
                        : routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
                      exact: true
                    })
                    return overrideBlockNavigation ? false : formik.dirty && !matchDefault?.isExact
                  }}
                  navigate={newPath => {
                    history.push(newPath)
                  }}
                />
                <div className={css.saveDiscardButton}>
                  <SaveAndDiscardButton
                    isUpdated={isUpdated}
                    onSave={() => onSave(formik)}
                    onDiscard={() => {
                      formik.resetForm()
                      dbInstance?.clear(CVObjectStoreNames.MONITORED_SERVICE)
                      setCachedInitialValue(initialValues)
                    }}
                  />
                </div>
                <MonitoredServiceDetails formik={formik} />
                <ServiceEnvironment formik={formik} />
                <CardWithOuterTitle title={getString('cv.healthSource.defineYourSource')}>
                  <HealthSourceTable
                    isEdit={isEdit}
                    value={formik.values.sources?.healthSources || []}
                    onSuccess={data => onSuccess(data, formik)}
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

export default MonitoredService
