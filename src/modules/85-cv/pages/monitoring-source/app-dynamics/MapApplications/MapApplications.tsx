import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Container, Text, Checkbox, Color, SelectOption, Utils } from '@wings-software/uicore'
import xhr from '@wings-software/xhr-async'
import qs from 'qs'
import { useParams } from 'react-router-dom'
import cloneDeep from 'lodash-es/cloneDeep'
import type { CellProps } from 'react-table'
import isEmpty from 'lodash-es/isEmpty'
import Table from '@common/components/Table/Table'
import { useGetServiceListForProject, GetServiceListForProjectQueryParams } from 'services/cd-ng'
import {
  MetricPackDTO,
  useGetAppDynamicsTiers,
  useGetMetricPacks,
  AppDynamicsTier,
  MetricPackDTOArrayRequestBody
} from 'services/cv'
import { useStrings } from 'framework/exports'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useToaster } from '@common/exports'
import { PageError } from '@common/components/Page/PageError'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getConfig } from 'services/config'

import { ValidationCell, ServiceCell } from './MapApplicationsTableCells'
import AppDApplicationSelector from './AppDApplicationSelector'
import {
  TierRecord,
  InternalState,
  ValidationStatus,
  useValidationErrors,
  ApplicationRecord
} from '../AppDOnboardingUtils'
import styles from './MapApplications.module.scss'

export interface MapApplicationsProps {
  stepData?: { [key: string]: any }
  onCompleteStep: (data: object) => void
  onPrevious?: () => void
}

export async function validateTier(metricPacks: MetricPackDTOArrayRequestBody, queryParams: object) {
  const url = `${getConfig('cv/api')}/appdynamics/metric-data?${qs.stringify(queryParams)}`
  const { response }: any = await xhr.post(url, { data: metricPacks })
  const responseData = response?.data ?? response.resource
  if (responseData?.length) {
    let status
    if (responseData?.some((val: any) => val.overallStatus === 'FAILED')) {
      status = ValidationStatus.ERROR
    } else if (responseData?.some((val: any) => val.overallStatus === 'NO_DATA')) {
      status = ValidationStatus.NO_DATA
    } else if (responseData?.every((val: any) => val.overallStatus === 'SUCCESS')) {
      status = ValidationStatus.SUCCESS
    }
    return { validationStatus: status, validationResult: responseData }
  }
  return { validationStatus: undefined }
}

function hasMetricPackSelected(app?: ApplicationRecord, identifier?: string): boolean {
  return !!app?.metricPacks?.find(val => val.identifier === identifier) ?? false
}

function hasDuplicatedServiceMappings(tiers: ApplicationRecord['tiers']) {
  const appTiers = Object.values(tiers || {})
  return appTiers
    .map(t => t.service)
    .filter(s => !!s)
    .some((s, i, a) => a.indexOf(s) >= 0 && a.indexOf(s) !== i)
}

const PAGE_SIZE = 10

export default function MapApplications({ stepData, onCompleteStep, onPrevious }: MapApplicationsProps) {
  const { getString } = useStrings()
  const [selectedAppName, setSelectedAppName] = useState<string>('')
  const [pageIndex, setPageIndex] = useState(0)
  const [textFilter, setTextFilter] = useState('')
  const [state, setState] = useState<InternalState>(cloneDeep(stepData?.applications || {}))
  const [serviceOptions, setServiceOptions] = useState<Array<SelectOption>>([])
  const [validationResult, setValidationResult] = useState<TierRecord['validationResult']>()
  const { errors, setError, renderError, hasError } = useValidationErrors()
  const [guidMap, setGuidMap] = useState(new Map())
  const { showError } = useToaster()
  const haveMPacksChanged = useRef<(name: string, val: any) => boolean>(() => false)
  const [metricPackChanged, setMetricPackChanged] = useState(false)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const { error: serviceError } = useGetServiceListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetServiceListForProjectQueryParams,
    resolve: res => {
      if (res?.data?.content?.length) {
        setServiceOptions(
          res.data.content.map((option: any) => ({
            label: option.name,
            value: option.identifier
          }))
        )
      }
      return res
    }
  })

  const { data: metricPacks, refetch: refetchMetricPacks, error: metricPackError } = useGetMetricPacks({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      dataSourceType: 'APP_DYNAMICS'
    }
  })

  const applicationStatuses = useMemo(() => {
    const statuses: any = {}
    if (state) {
      for (const app of Object.values(state)) {
        const appTiers = Object.values(app?.tiers ?? {})
        if (!appTiers.length) continue
        if (appTiers.some(val => val.validationStatus === ValidationStatus.ERROR)) {
          statuses[app!.name] = 'ERROR'
        } else if (hasError(`${app!.name}.metricPacks`) || hasError(`${app!.name}.uniqueService`)) {
          statuses[app!.name] = 'ERROR'
        } else if (
          appTiers.every(
            val =>
              val.validationStatus === ValidationStatus.SUCCESS || val.validationStatus === ValidationStatus.NO_DATA
          )
        ) {
          statuses[app!.name] = 'SUCCESS'
        }
      }
    }
    return statuses
  }, [state, errors])

  const { data: tiers, loading: loadingTiers, refetch: loadTiers, error: tiersError } = useGetAppDynamicsTiers({
    resolve: response => {
      if (Number.isInteger(response?.data?.totalItems)) {
        setState(old => ({
          ...old,
          [selectedAppName]: {
            ...old[selectedAppName]!,
            totalTiers: response?.data?.totalItems
          }
        }))
      }
      return response
    },
    lazy: true
  })

  useEffect(() => {
    if (serviceError) {
      showError(serviceError, 5000)
    }
  }, [serviceError])

  useEffect(() => {
    if (selectedAppName) {
      loadTiers({
        queryParams: {
          accountId,
          appName: selectedAppName,
          connectorIdentifier: stepData?.connectorIdentifier,
          orgIdentifier: orgIdentifier,
          projectIdentifier: projectIdentifier,
          offset: pageIndex,
          pageSize: PAGE_SIZE,
          filter: textFilter
        }
      })
    }
  }, [accountId, selectedAppName, pageIndex, PAGE_SIZE, textFilter])

  useEffect(() => {
    if (metricPacks?.resource?.length) {
      Object.keys(state || {}).forEach(app => {
        if (!state[app]?.metricPacks) {
          state[app] = { ...state[app], metricPacks: metricPacks.resource } as ApplicationRecord
        }
      })
    }
  }, [metricPacks])

  const onValidateTier = async (appName: string, tierName: string) => {
    if (state[appName]?.metricPacks?.length) {
      const guid = Utils.randomId()
      onSetTierData(appName, tierName, { validationStatus: ValidationStatus.IN_PROGRESS })
      setGuidMap(oldMap => {
        oldMap.set(tierName, guid)
        return new Map(oldMap)
      })
      const update = await validateTier(state[appName]?.metricPacks as MetricPackDTOArrayRequestBody, {
        accountId,
        appName,
        tierName,
        connectorIdentifier: stepData?.connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        requestGuid: guid
      })
      if (!haveMPacksChanged.current(appName, state[appName]?.metricPacks)) {
        onSetTierData(appName, tierName, update)
      }
    } else {
      onSetTierData(appName, tierName, { validationStatus: undefined })
    }
  }

  const onSelectMetricPack = (metricPack: MetricPackDTO, selected: boolean) => {
    setState(old => {
      const update = (state[selectedAppName]?.metricPacks ?? []).filter(val => val.identifier !== metricPack.identifier)
      if (selected) {
        update.push(metricPack)
      }
      return {
        ...old,
        [selectedAppName]: {
          ...old[selectedAppName]!,
          metricPacks: update
        }
      }
    })
    setMetricPackChanged(true)
    setError(`${selectedAppName}.metricPacks`, undefined)
  }

  const onSetTierData = (appName: string, tierName: string, value?: Partial<TierRecord>) => {
    setState(old => {
      const appTiers = { ...(old[appName]?.tiers || {}) }
      const tier = appTiers[tierName] || {}
      if (value) {
        appTiers[tierName] = { ...tier, ...value }
      } else {
        delete appTiers[tierName]
      }

      if (hasDuplicatedServiceMappings(appTiers)) {
        setError(`${appName}.uniqueService`, getString('cv.monitoringSources.appD.validationMsg'))
      } else if (hasError(`${appName}.uniqueService`)) {
        setError(`${appName}.uniqueService`, undefined)
      }

      return {
        ...old,
        [appName]: {
          ...old[appName]!,
          tiers: {
            ...appTiers
          }
        }
      }
    })
  }

  useEffect(() => {
    if (metricPackChanged) {
      haveMPacksChanged.current = (appName: string, val: any) => val !== state[appName]?.metricPacks
      Object.values(state[selectedAppName]?.tiers ?? {}).forEach(tier => {
        if (tier.service) {
          onValidateTier(selectedAppName, tier.name)
        }
      })
      setMetricPackChanged(false)
    }
  }, [metricPackChanged])

  const onNext = async () => {
    if (isEmpty(errors)) {
      const applications = cloneDeep(state)
      let foundSomeTiers = false
      for (const app of Object.values(applications)) {
        if (isEmpty(app?.metricPacks) && !isEmpty(app?.tiers)) {
          setError(`${app?.name}.metricPacks`, getString('cv.monitoringSources.appD.validations.selectMetricPack'))
          return
        }

        for (const tier of Object.values(app?.tiers ?? {})) {
          if (!tier.service) {
            setError('selectTier', getString('cv.monitoringSources.appD.validations.selectTier'))
            return
          } else if (tier.validationStatus === ValidationStatus.IN_PROGRESS) {
            delete tier.validationStatus
          }
          foundSomeTiers = true
        }
      }
      if (foundSomeTiers) {
        onCompleteStep({ applications })
      } else {
        setError('selectTier', getString('cv.monitoringSources.appD.validations.selectTier'))
      }
    }
  }

  const tableData = useMemo(() => tiers?.data?.content?.filter(tierInfo => Boolean(tierInfo)) || [], [tiers])

  return (
    <Container className={styles.tabWrapper}>
      <Container className={styles.main}>
        <AppDApplicationSelector
          applications={stepData?.applications}
          statuses={applicationStatuses}
          selectedAppName={selectedAppName}
          onSelect={appName => {
            setPageIndex(0)
            setSelectedAppName(appName)
          }}
        />
        <Container className={styles.content}>
          <Text font={{ size: 'medium' }} margin={{ bottom: 'large' }}>
            {getString('cv.monitoringSources.appD.mapApplicationsToEnv')}
          </Text>
          <Container className={styles.mappingDetails}>
            <Text icon="service-appdynamics">{selectedAppName}</Text>
            <Text>{getString('cv.admin.mapsTo')}</Text>
            <Text icon="harness">{stepData?.applications[selectedAppName!]?.environment}</Text>
          </Container>
          <Container className={styles.metricPacks}>
            <Text font={{ size: 'medium' }} margin={{ bottom: 'large' }}>
              {getString('metricPacks')}
            </Text>
            <Container margin={{ bottom: 'small' }}>
              {metricPacks?.resource?.map(mp => (
                <Checkbox
                  key={mp.identifier}
                  checked={hasMetricPackSelected(state[selectedAppName], mp.identifier)}
                  label={mp.identifier}
                  onChange={e => onSelectMetricPack(mp, e.currentTarget.checked)}
                />
              ))}
              {metricPackError?.data && (
                <PageError message={getErrorMessage(metricPackError)} onClick={() => refetchMetricPacks()} />
              )}
            </Container>
            {renderError(`${selectedAppName}.metricPacks`)}
          </Container>
          <Text font={{ size: 'medium' }} margin={{ bottom: 'large' }}>
            {getString('cv.monitoringSources.appD.mapTiersToServices')}
          </Text>
          {loadingTiers && <PageSpinner />}
          <TableFilter
            // className={styles.columnHeaderWithFilter}
            appliedFilter={textFilter}
            onFilter={val => {
              setPageIndex(0)
              setTextFilter(val)
            }}
            placeholder={getString('cv.monitoringSources.appD.searchTiersPlaceHolder')}
          />
          <Table<AppDynamicsTier>
            columns={[
              {
                id: '1',
                Header: '',
                width: '5%',
                disableSortBy: true,
                accessor: 'name',
                Cell: function SelectTierCell({ value: tierName }: CellProps<AppDynamicsTier>) {
                  return (
                    <input
                      type="checkbox"
                      className="select-tier"
                      checked={!!state[selectedAppName]?.tiers?.[tierName]}
                      onChange={e => {
                        onSetTierData(selectedAppName, tierName, e.target.checked ? { name: tierName } : undefined)
                      }}
                    />
                  )
                }
              },
              {
                id: '2',
                Header: (
                  <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
                    {getString('cv.monitoringSources.appD.appDTier')}
                  </Text>
                ),
                width: '25%',
                disableSortBy: true,
                accessor: 'name'
              },
              {
                id: '3',
                Header: getString('cv.monitoringSources.appD.mappingToHarnessService'),
                width: '40%',
                disableSortBy: true,
                accessor: 'name',
                Cell: function ServiceCellWrapper({ value: tierName }: any) {
                  return (
                    <ServiceCell
                      value={state[selectedAppName]?.tiers?.[tierName]?.service}
                      disabled={!state[selectedAppName]?.tiers?.[tierName]}
                      onSelect={service => {
                        onValidateTier(selectedAppName, tierName)
                        onSetTierData(selectedAppName, tierName, { name: tierName, service })
                        setError('selectTier', undefined)
                      }}
                      options={serviceOptions}
                      onUpdateOptions={setServiceOptions}
                    />
                  )
                }
              },
              {
                id: '4',
                Header: (
                  <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
                    {getString('cv.monitoringSources.appD.validation').toLocaleUpperCase()}
                  </Text>
                ),
                width: '30%',
                disableSortBy: true,
                accessor: 'name',
                Cell: function ValidationCellWrapper({ value: tierName }: CellProps<AppDynamicsTier>) {
                  return (
                    <ValidationCell
                      tier={state[selectedAppName]?.tiers?.[tierName]}
                      onValidateTier={() => onValidateTier(selectedAppName, tierName)}
                      onShowValidationResult={val => {
                        setValidationResult({ result: val, selectedTier: tierName })
                      }}
                    />
                  )
                }
              }
            ]}
            data={tableData ?? []}
            pagination={{
              itemCount: tiers?.data?.totalItems || 0,
              pageSize: tiers?.data?.pageSize || PAGE_SIZE,
              pageCount: tiers?.data?.totalPages || 0,
              pageIndex: tiers?.data?.pageIndex || 0,
              gotoPage: (page: number) => setPageIndex(page)
            }}
          />
          {renderError(`${selectedAppName}.uniqueService`)}
          {renderError('selectTier')}
          {!loadingTiers && !tiersError?.data && !tableData?.length && (
            <Container height={250}>
              <NoDataCard
                message={getString('cv.monitoringSources.appD.noTiersMsg')}
                icon="warning-sign"
                buttonText={getString('retry')}
                onClick={() =>
                  loadTiers({
                    queryParams: {
                      accountId,
                      appName: selectedAppName,
                      connectorIdentifier: stepData?.connectorIdentifier,
                      orgIdentifier: orgIdentifier,
                      projectIdentifier: projectIdentifier,
                      offset: pageIndex,
                      pageSize: PAGE_SIZE,
                      filter: textFilter
                    }
                  })
                }
              />
            </Container>
          )}
          {!loadingTiers && tiersError?.data && (
            <Container height={250}>
              <PageError
                message={getErrorMessage(tiersError)}
                onClick={() =>
                  loadTiers({
                    queryParams: {
                      accountId,
                      appName: selectedAppName,
                      connectorIdentifier: stepData?.connectorIdentifier,
                      orgIdentifier: orgIdentifier,
                      projectIdentifier: projectIdentifier,
                      offset: pageIndex,
                      pageSize: PAGE_SIZE,
                      filter: textFilter
                    }
                  })
                }
              />
            </Container>
          )}
        </Container>
      </Container>
      {validationResult && (
        <MetricsVerificationModal
          verificationData={validationResult.result}
          guid={guidMap.get(validationResult.selectedTier)}
          onHide={() => setValidationResult(undefined)}
          verificationType="AppDynamics"
        />
      )}
      <SubmitAndPreviousButtons onPreviousClick={onPrevious} onNextClick={onNext} />
    </Container>
  )
}
