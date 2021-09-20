import { Container, Tab, Tabs } from '@wings-software/uicore'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { isEqual, omit } from 'lodash-es'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { accountPathProps, projectPathProps, modulePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { editParams } from '@cv/utils/routeUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useIndexedDBHook, CVObjectStoreNames } from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import {
  ChangeSourceDTO,
  MonitoredServiceDTO,
  useGetMonitoredService,
  useGetMonitoredServiceYamlTemplate,
  useSaveMonitoredService,
  useUpdateMonitoredService
} from 'services/cv'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner, useToaster, NavigationCheck } from '@common/components'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { useStrings } from 'framework/strings'
import Service from './components/Service/Service'
import Dependency from './components/Dependency/Dependency'
import { getInitFormData } from './components/Service/Service.utils'
import type { MonitoredServiceForm } from './components/Service/Service.types'
import { determineUnSaveState, onTabChange, onSubmit, showErrorOnSubmit } from './Configurations.utils'
import css from './Configurations.module.scss'

export default function Configurations(): JSX.Element {
  const { getString } = useStrings()
  const { showWarning, showError } = useToaster()
  const history = useHistory()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const [cachedInitialValues, setCachedInitialValue] = useState<MonitoredServiceForm | null>(null)
  const [selectedTabID, setselectedTabID] = useState(getString('service'))
  const serviceTabformRef: React.MutableRefObject<FormikProps<MonitoredServiceForm> | null> = React.useRef(null)
  const dependencyTabformRef: React.MutableRefObject<FormikProps<MonitoredServiceForm> | null> = React.useRef(null)
  const [overrideBlockNavigation, setOverrideBlockNavigation] = useState<boolean>(false)
  const [defaultMonitoredService, setDefaultMonitoredService] = useState<MonitoredServiceDTO>()
  const {
    data: dataMonitoredServiceById,
    error: errorFetchMonitoredService,
    refetch: fetchMonitoredService,
    loading: loadingGetMonitoredService
  } = useGetMonitoredService({
    identifier,
    pathParams: {
      identifier
    },
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId
    },
    lazy: true
  })

  const {
    data: yamlMonitoredService,
    error: errorFetchMonitoredServiceYAML,
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

  const { mutate: saveMonitoredService, error: errorSaveMonitoredService } = useSaveMonitoredService({
    queryParams: { accountId }
  })
  const {
    mutate: updateMonitoredService,
    loading: loadingUpdateMonitoredService,
    error: errorUpdateMonitoredService
  } = useUpdateMonitoredService({
    identifier,
    queryParams: { accountId }
  })

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

  useEffect(() => {
    if (yamlMonitoredService && yamlMonitoredService?.resource) {
      // This only executed on creating new Monitored Service
      const { monitoredService }: { monitoredService: MonitoredServiceDTO } = parse(yamlMonitoredService?.resource)
      // Category is not present in default changeSource object
      // hence adding here
      monitoredService.sources?.changeSources?.forEach(changeSource => {
        changeSource['category'] = ChangeSourceCategoryName.DEPLOYMENT as ChangeSourceDTO['category']
        changeSource['spec'] = {}
      })
      setDefaultMonitoredService(prevService => {
        if (!prevService) {
          return monitoredService
        }
        const currSources = prevService.sources?.changeSources || []
        return {
          ...prevService,
          sources: {
            changeSources: currSources.concat(monitoredService.sources?.changeSources || []),
            healthSources: prevService.sources?.healthSources || []
          }
        }
      })
    }
  }, [yamlMonitoredService])

  useEffect(() => {
    if (identifier) {
      fetchMonitoredService()
    } else {
      fetchMonitoredServiceYAML()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  const initialValues: MonitoredServiceForm = useMemo(
    () => getInitFormData(dataMonitoredServiceById?.data?.monitoredService, defaultMonitoredService, !!identifier),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dataMonitoredServiceById?.data?.monitoredService.name,
      identifier,
      loadingGetMonitoredService,
      defaultMonitoredService
    ]
  )

  useEffect(() => {
    // In case user refereshes page with saved changes
    if (isEqual(cachedInitialValues, initialValues)) {
      dbInstance?.clear(CVObjectStoreNames.MONITORED_SERVICE)
      setCachedInitialValue(null)
    }
  }, [cachedInitialValues, initialValues])

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

  const setDBData = async (data: MonitoredServiceForm) => {
    try {
      await dbInstance?.put(CVObjectStoreNames.MONITORED_SERVICE, {
        monitoredService: 'monitoredService',
        currentData: data
      })
    } catch (e) {
      showWarning(e)
    }
  }

  const onDiscard = useCallback(() => {
    dbInstance?.clear(CVObjectStoreNames.MONITORED_SERVICE)
    setCachedInitialValue(initialValues)
  }, [initialValues])

  const onSuccess = useCallback(
    async (payload, tabId) => {
      await onSubmit({
        formikValues: payload,
        identifier,
        orgIdentifier,
        projectIdentifier,
        cachedInitialValues,
        updateMonitoredService,
        saveMonitoredService,
        fetchMonitoredService,
        setOverrideBlockNavigation
      })
      setCachedInitialValue(null)
      if (!identifier) {
        setselectedTabID(tabId)
      }
    },
    [identifier]
  )

  const onNavigationChange = useCallback(
    nextLocation => {
      const currentPath = nextLocation.pathname
      const createPath = routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps })
      const editPath = routes.toCVMonitoredServiceConfigurations({
        ...accountPathProps,
        ...projectPathProps,
        ...modulePathProps,
        ...editParams,
        module: 'cv'
      })
      const matchDefault = matchPath(currentPath, {
        path: identifier ? editPath : createPath,
        exact: true
      })
      return determineUnSaveState({
        cachedInitialValues,
        initialValues,
        overrideBlockNavigation,
        isExactPath: !!matchDefault?.isExact,
        selectedTabID,
        serviceTabformRef,
        dependencyTabformRef,
        getString
      })
    },
    [identifier, cachedInitialValues, initialValues, overrideBlockNavigation, selectedTabID]
  )

  if (identifier && errorFetchMonitoredService) {
    return <PageError message={getErrorMessage(errorFetchMonitoredService)} onClick={() => fetchMonitoredService()} />
  } else if (!identifier && errorFetchMonitoredService) {
    return (
      <PageError
        message={getErrorMessage(errorFetchMonitoredServiceYAML)}
        onClick={() => fetchMonitoredServiceYAML()}
      />
    )
  }

  return (
    <Container className={css.configurationTabs}>
      {(loadingGetMonitoredService || loadingFetchMonitoredServiceYAML || loadingUpdateMonitoredService) && (
        <PageSpinner />
      )}
      {showErrorOnSubmit(errorUpdateMonitoredService, errorSaveMonitoredService, showError, getErrorMessage)}
      <Tabs
        id="configurationTabs"
        selectedTabId={selectedTabID}
        onChange={async nextTab =>
          onTabChange({
            nextTab,
            getString,
            selectedTabID,
            dbInstance,
            serviceTabformRef,
            dependencyTabformRef,
            setselectedTabID,
            setCachedInitialValue
          })
        }
      >
        <Tab
          id={getString('service')}
          title={getString('service')}
          panel={
            <Service
              value={initialValues}
              onSuccess={async payload => onSuccess(payload, getString('service'))}
              serviceTabformRef={serviceTabformRef}
              cachedInitialValues={cachedInitialValues}
              setDBData={setDBData}
              onDiscard={onDiscard}
              onChangeMonitoredServiceType={updatedDTO => {
                setDefaultMonitoredService(omit(updatedDTO, ['isEdit']) as MonitoredServiceDTO)
                setCachedInitialValue(updatedDTO)
                fetchMonitoredServiceYAML({
                  queryParams: {
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    type: updatedDTO.type
                  }
                })
              }}
            />
          }
        />
        <Tab
          id={getString('pipelines-studio.dependenciesGroupTitle')}
          title={getString('pipelines-studio.dependenciesGroupTitle')}
          panel={
            <Dependency
              value={initialValues}
              dependencyTabformRef={dependencyTabformRef}
              onSuccess={async payload => onSuccess(payload, getString('pipelines-studio.dependenciesGroupTitle'))}
              cachedInitialValues={cachedInitialValues}
              setDBData={setDBData}
              onDiscard={onDiscard}
            />
          }
        />
      </Tabs>
      <NavigationCheck
        when={true}
        shouldBlockNavigation={onNavigationChange}
        navigate={newPath => {
          history.push(newPath)
        }}
      />
    </Container>
  )
}
