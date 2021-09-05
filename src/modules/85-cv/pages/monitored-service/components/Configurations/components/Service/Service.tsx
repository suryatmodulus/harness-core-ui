import React, { useEffect, useState, useMemo, useCallback } from 'react'
import * as Yup from 'yup'
import { parse } from 'yaml'
import { isEqual } from 'lodash-es'
import { Formik, FormikContext } from 'formik'
import { matchPath, useHistory, useParams, Link } from 'react-router-dom'
import { Text, Color } from '@wings-software/uicore'
import { PageSpinner, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import {
  MonitoredServiceDTO,
  MonitoredServiceResponse,
  useGetMonitoredService,
  useSaveMonitoredService,
  useUpdateMonitoredService,
  useGetMonitoredServiceYamlTemplate,
  ChangeSourceDTO
} from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { accountPathProps, projectPathProps, modulePathProps } from '@common/utils/routeUtils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import { ChangeSourceDrawer } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer'
import SaveAndDiscardButton from '@common/components/SaveAndDiscardButton/SaveAndDiscardButton'
import { useIndexedDBHook, CVObjectStoreNames } from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import HealthSourceTable from '@cv/pages/health-source/HealthSourceTable'
import ChangeSourceTable from '@cv/pages/ChangeSource/ChangeSourceTable/ChangeSourceTable'
import type { MonitoredServiceForm } from './Service.types'
import { getInitFormData } from './Service.utils'
import MonitoredServiceDetails from '../../../monitoredServiceDetails/MonitoredServiceDetails'
import ServiceEnvironment from '../../../serviceEnvironment/MonitoredServiceEnvironment'
import css from './Service.module.scss'

function Service(): JSX.Element {
  const history = useHistory()
  const { getString } = useStrings()
  const { showWarning, showError, showSuccess } = useToaster()
  const [validMonitoredSource, setValidMonitoredSource] = useState(false)
  const [defaultMonitoredService, setDefaultMonitoredService] = useState<MonitoredServiceDTO>()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const [cachedInitialValues, setCachedInitialValue] = useState<MonitoredServiceForm | null>(null)
  const [overrideBlockNavigation, setOverrideBlockNavigation] = useState<boolean>(false)
  const isEdit = !!identifier
  const {
    data: dataMonitoredServiceById,
    refetch: fetchMonitoredService,
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

  const {
    data: yamlMonitoredService,
    loading: loadingFetchMonitoredServiceYAML,
    refetch: fetchMonitoredServiceYAML
  } = useGetMonitoredServiceYamlTemplate({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId
    },
    lazy: true
  })

  useEffect(() => {
    if (yamlMonitoredService && yamlMonitoredService?.resource) {
      // This only executed on creating new Monitored Service
      const { monitoredService }: { monitoredService: MonitoredServiceDTO } = parse(yamlMonitoredService?.resource)
      // Category is not present in default changeSource object
      // hence adding here
      monitoredService.sources?.changeSources?.forEach(changeSource => {
        changeSource['category'] = 'Deployment'
        changeSource['spec'] = {}
      })
      setDefaultMonitoredService(monitoredService)
    }
  }, [yamlMonitoredService])

  const { mutate: saveMonitoredService } = useSaveMonitoredService({
    queryParams: { accountId }
  })
  const { mutate: updateMonitoredService, loading: loadingUpdateMonitoredService } = useUpdateMonitoredService({
    identifier,
    queryParams: { accountId }
  })

  useEffect(() => {
    if (isEdit) {
      fetchMonitoredService()
    } else {
      fetchMonitoredServiceYAML()
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

  const onSubmit = useCallback(
    async (formikValues: MonitoredServiceForm): Promise<void> => {
      const {
        serviceRef,
        environmentRef,
        identifier: monitoredServiceId,
        name,
        description,
        tags,
        sources = {}
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
        fetchMonitoredService()
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
    () => getInitFormData(dataMonitoredServiceById?.data?.monitoredService, defaultMonitoredService, isEdit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataMonitoredServiceById?.data?.monitoredService.name, isEdit, defaultMonitoredService, loadingGetMonitoredService]
  )

  useEffect(() => {
    // In case user refereshes page with saved changes
    if (isEqual(cachedInitialValues, initialValues)) {
      dbInstance?.clear(CVObjectStoreNames.MONITORED_SERVICE)
      setCachedInitialValue(null)
    }
  }, [cachedInitialValues, initialValues])

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
      if (formik?.values.serviceRef && formik?.values.environmentRef && formik?.values.name) {
        showDrawer()
        setDrawerContentProps({
          hideDrawer,
          tableData: formik?.values?.sources?.changeSources || [],
          onSuccess: onSuccessChangeSource
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
                {(loadingUpdateMonitoredService || loadingFetchMonitoredServiceYAML) && <PageSpinner />}
                <NavigationCheck
                  when={formik.dirty}
                  shouldBlockNavigation={nextLocation => {
                    const matchDefault = matchPath(nextLocation.pathname, {
                      path: isEdit
                        ? routes.toCVAddMonitoringServicesEdit({
                            ...accountPathProps,
                            ...projectPathProps,
                            ...modulePathProps,
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
