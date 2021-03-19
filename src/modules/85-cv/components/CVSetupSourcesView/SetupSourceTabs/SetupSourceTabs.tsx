import React, { createContext, useEffect, useMemo, useState } from 'react'
import { Container, Tab, Tabs } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getRoutePathByType } from '@cv/utils/routeUtils'
import { CVObjectStoreNames, useIndexedDBHook } from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { ONBOARDING_ENTITIES } from '@cv/pages/admin/setup/SetupUtils'
import css from './SetupSourceTabs.module.scss'

type TabStatus = 'SUCCESS' | 'WARNING' | 'ERROR' | 'NO_STATUS'

type TabInfo = {
  tabStatus?: TabStatus
}

export interface SetupSourceTabsProps<T> {
  data: T
  children: JSX.Element[] | JSX.Element
  tabTitles: string[]
  determineMaxTab: (data: T) => number
}

export interface SetupSourceTabsProviderProps<T> {
  sourceData: T
  tabsInfo?: TabInfo[]
  onPrevious: (updatedData: T, updatedTabInfo?: TabInfo) => Promise<void>
  onNext: (updatedData: T, updatedTabInfo?: TabInfo) => Promise<void>
  children: React.ReactNode
}

type CachedSourceObject = {
  type: string
  name: string
  identifier: string
  routeUrl: string
}

type CachedSetupObject = {
  setupId: string
  monitoringSources?: CachedSourceObject[]
  changeSources?: CachedSourceObject[]
  verificationJobs?: CachedSourceObject[]
}

type UseSetupSourceTabsHookReturnValues = {
  isInitializingDB: boolean
  sourceData: any
  tabsInfo: TabInfo[]
  activeTabIndex: number
  onSwitchTab: (updatedData: any, newTabIndex: number, updatedTabInfo?: TabInfo) => Promise<void>
  onPrevious: (updatedData: any, updatedTabInfo?: TabInfo) => Promise<void>
  onNext: (updatedData: any, updatedTabInfo?: TabInfo) => Promise<void>
}

export const SetupSourceTabsContext = createContext<{
  tabsInfo?: TabInfo[]
  sourceData: any
  onNext: (updatedData: any, updatedTabInfo?: TabInfo) => Promise<void>
  onPrevious: (updatedData: any, updatedTabInfo?: TabInfo) => Promise<void>
}>({
  tabsInfo: [],
  sourceData: {},
  onNext: () => Promise.resolve(),
  onPrevious: () => Promise.resolve()
})

function initializeTabsInfo(tabTitles: string[]): TabInfo[] {
  const tabsInfo: TabInfo[] = []
  tabTitles?.forEach(tabTitle => {
    if (tabTitle?.length) {
      tabsInfo.push({ tabStatus: 'NO_STATUS' })
    }
  })
  return tabsInfo
}

export function addItemToCache(sources: CachedSourceObject[], item: CachedSourceObject): CachedSourceObject[] {
  if (!sources?.length) {
    return [item]
  }

  const existingIndex = sources.findIndex(source => {
    if (!source.identifier) return
    return source.identifier === item.identifier
  })

  if (existingIndex !== -1) {
    sources[existingIndex] = item
  } else {
    sources.push(item)
  }

  return sources
}

function getRouteUrlForOnboarding(
  type: string,
  sourceType: string,
  identifier: string,
  params: ProjectPathProps
): string {
  if (sourceType === ONBOARDING_ENTITIES.CHANGE_SOURCE) {
    return routes.toCVActivitySourceEditSetup({
      ...params,
      activitySource: getRoutePathByType(type),
      activitySourceId: identifier
    })
  } else if (sourceType === ONBOARDING_ENTITIES.MONITORING_SOURCE) {
    return routes.toCVAdminSetupMonitoringSourceEdit({
      ...params,
      monitoringSource: getRoutePathByType(type),
      identifier
    })
  }

  return ''
}

export function buildObjectToStore(
  data: any,
  savedData: CachedSetupObject,
  params: ProjectPathProps
): CachedSetupObject {
  const dataToSave: CachedSourceObject = {
    type: data.type,
    name: data.name,
    identifier: data.identifier,
    routeUrl: getRouteUrlForOnboarding(data.type, data.sourceType, data.identifier, params)
  }

  const objectToStore: CachedSetupObject = { ...savedData }
  switch (data.type) {
    case ONBOARDING_ENTITIES.MONITORING_SOURCE:
      objectToStore.monitoringSources = addItemToCache(objectToStore.monitoringSources || [], dataToSave)
      break
    case ONBOARDING_ENTITIES.CHANGE_SOURCE:
      objectToStore.changeSources = addItemToCache(objectToStore.changeSources || [], dataToSave)
      break
    case ONBOARDING_ENTITIES.VERIFICATION_JOBS:
      objectToStore.verificationJobs = addItemToCache(objectToStore.verificationJobs || [], dataToSave)
      break
  }

  return objectToStore
}

function useSetupSourceTabsHook<T>(data: T, tabsInformation: TabInfo[]): UseSetupSourceTabsHookReturnValues {
  const [{ activeTabIndex, sourceData, tabsInfo }, setTabsState] = useState({
    activeTabIndex: 0,
    sourceData: data,
    tabsInfo: tabsInformation
  })
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const indexedDBEntryKey = `${accountId}-${orgIdentifier}-${projectIdentifier}`

  const { isInitializingDB, dbInstance } = useIndexedDBHook({
    clearStroreList: [CVObjectStoreNames.ONBOARDING_SOURCES]
  })

  async function onSwitchTab<T>(updatedData: T, newTabIndex: number, updatedTabInfo?: TabInfo): Promise<void> {
    if (!dbInstance) return

    if (newTabIndex >= tabsInfo.length - 1) {
      dbInstance.get(CVObjectStoreNames.SETUP, indexedDBEntryKey)?.then(async (savedData: CachedSetupObject) => {
        try {
          await Promise.all([
            dbInstance.put(
              CVObjectStoreNames.SETUP,
              buildObjectToStore(updatedData, savedData, { projectIdentifier, orgIdentifier, accountId })
            ),
            dbInstance.clear(CVObjectStoreNames.ONBOARDING_SOURCES)
          ])
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`IDBP, saving on last tab - `, e)
        }
      })
    } else {
      setTabsState(currentState => {
        if (updatedTabInfo) currentState.tabsInfo[activeTabIndex] = updatedTabInfo
        return { activeTabIndex: newTabIndex, sourceData: updatedData as any, tabsInfo: [...currentState.tabsInfo] }
      })
      try {
        await dbInstance.put(CVObjectStoreNames.ONBOARDING_SOURCES, {
          sourceID: indexedDBEntryKey,
          sourceData: updatedData,
          tabsInfo,
          currentTabIndex: newTabIndex
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`IDBP, saving on tab currentTabIndex: ${newTabIndex}`, e)
      }
    }
  }

  useEffect(() => {
    if (!isInitializingDB && dbInstance) {
      dbInstance.get(CVObjectStoreNames.ONBOARDING_SOURCES, indexedDBEntryKey)?.then(cachedData => {
        if (cachedData) {
          setTabsState({
            activeTabIndex: cachedData.currentTabIndex,
            sourceData: cachedData.currentData,
            tabsInfo: cachedData.tabsInfo
          })
        }
      })
    }
  }, [isInitializingDB, dbInstance, indexedDBEntryKey])

  useEffect(() => {
    if (data) setTabsState(previousState => ({ ...previousState, tabsData: data }))
  }, [data])

  return {
    isInitializingDB,
    sourceData,
    tabsInfo,
    activeTabIndex,
    onSwitchTab,
    onPrevious: (updatedData, updatedTabInfo) => onSwitchTab(updatedData, activeTabIndex - 1, updatedTabInfo),
    onNext: (updatedData, updatedTabInfo) => onSwitchTab(updatedData, activeTabIndex + 1, updatedTabInfo)
  }
}

export function SetupSourceTabsProvider<T>(props: SetupSourceTabsProviderProps<T>): JSX.Element {
  const { children, ...restProps } = props
  return <SetupSourceTabsContext.Provider value={restProps}>{children}</SetupSourceTabsContext.Provider>
}

export function SetupSourceTabs<T>(props: SetupSourceTabsProps<T>): JSX.Element {
  const { data, tabTitles, children, determineMaxTab } = props
  const { sourceData, activeTabIndex, onSwitchTab, onNext, onPrevious } = useSetupSourceTabsHook(
    data,
    initializeTabsInfo(tabTitles)
  )
  const maxEnabledTab = determineMaxTab(sourceData)
  const updatedChildren = useMemo(() => (Array.isArray(children) ? children : [children]), [children])
  return (
    <SetupSourceTabsProvider sourceData={sourceData} onPrevious={onPrevious} onNext={onNext}>
      <Container className={css.tabWrapper}>
        <Tabs
          id="setup-sources"
          selectedTabId={activeTabIndex}
          onChange={(newTabId: number) => onSwitchTab(sourceData, newTabId)}
        >
          {updatedChildren.map((child, index) => (
            <Tab
              key={tabTitles[index]}
              id={index}
              title={tabTitles[index]}
              disabled={index > maxEnabledTab}
              panel={child}
            />
          ))}
        </Tabs>
      </Container>
    </SetupSourceTabsProvider>
  )
}
