import React, { useState, useMemo, useEffect } from 'react'
import { Container, Color, Text, Icon, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cloneDeep from 'lodash-es/cloneDeep'
import type { CellProps } from 'react-table'
import Table from '@common/components/Table/Table'
import { PageError } from '@common/components/Page/PageError'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import { useGetAppDynamicsApplications, AppDynamicsApplication } from 'services/cv'
import {
  useGetEnvironmentListForProject,
  ResponsePageEnvironmentResponseDTO,
  GetEnvironmentListForProjectQueryParams
} from 'services/cd-ng'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { EnvironmentSelect } from './EnvironmentSelect'
import { InternalState, useValidationErrors } from '../AppDOnboardingUtils'
import styles from './SelectApplications.module.scss'

interface SelectApplicationsProps {
  stepData?: { [key: string]: any }
  onCompleteStep: (data: Record<string, any>) => void
  onPrevious?: () => void
}

interface EnvironmentCellProps {
  value?: string
  disabled?: boolean
  onSelect(value: string): void
  options: SelectOption[]
  onUpdateOptions(options: SelectOption[]): void
}

const PAGE_SIZE = 7

export default function SelectApplications({ stepData, onCompleteStep, onPrevious }: SelectApplicationsProps) {
  const { getString } = useStrings()
  const [state, setState] = useState<InternalState>(cloneDeep(stepData?.applications || {}))
  const [environmentOptions, setEnvironmentOptions] = useState<Array<SelectOption>>([])
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const [pageIndex, setPageIndex] = useState(0)
  const [textFilter, setTextFilter] = useState('')
  const { setError, renderError } = useValidationErrors()

  const { data, loading, refetch, error } = useGetAppDynamicsApplications({
    queryParams: {
      accountId,
      connectorIdentifier: stepData?.connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: pageIndex,
      pageSize: PAGE_SIZE,
      filter: textFilter
    }
  })

  const { error: environmentError } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams,
    resolve: (res: ResponsePageEnvironmentResponseDTO) => {
      if (res?.data?.content?.length) {
        setEnvironmentOptions(
          res?.data?.content?.map(env => ({
            label: env.name as string,
            value: env.identifier as string
          }))
        )
      }
      return res
    }
  })

  useEffect(() => {
    if (environmentError) {
      showError(environmentError, 5000)
    }
  }, [environmentError])

  const {
    totalItems = 0,
    totalPages = 0,
    content = [],
    pageSize = PAGE_SIZE
  } = data?.data || {
    totalItems: 0,
    totalPages: 0,
    content: [],
    pageSize: PAGE_SIZE
  }

  const onNext = () => {
    const apps = Object.values(state).filter(app => !!app)
    if (!apps.length) {
      setError('selectApp', getString('cv.monitoringSources.appD.validations.selectApp'))
      return
    }
    for (const app of apps) {
      if (!app?.environment) {
        setError('selectApp', getString('cv.monitoringSources.appD.validations.selectApp'))
        return
      }
    }
    onCompleteStep({ applications: state })
  }

  return (
    <Container className={styles.main}>
      <Container className={styles.sideSpace} />
      <Container className={styles.mainPanel}>
        {loading && <PageSpinner />}
        <TableFilter
          className={styles.columnHeaderWithFilter}
          onFilter={val => {
            setPageIndex(0)
            setTextFilter(val)
          }}
          placeholder={getString('cv.monitoringSources.appD.searchPlaceholderApplications')}
          appliedFilter={textFilter}
        />
        <Table<AppDynamicsApplication>
          className={styles.table}
          columns={[
            {
              id: '1',
              Header: '',
              disableSortBy: true,
              width: '40px',
              Cell: function SelectAppCell({ row }: CellProps<AppDynamicsApplication>) {
                const appName = row.original.name!
                const isSelected = !!state[appName]
                return (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => {
                      const update = {
                        ...state,
                        [appName]: {
                          name: appName
                        }
                      }
                      if (!e.target.checked) {
                        delete update[appName]
                      }
                      setState(update)
                    }}
                  />
                )
              }
            },
            {
              id: '2',
              Header: (
                <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
                  {getString('cv.monitoringSources.appD.appDApplications')}
                </Text>
              ),
              disableSortBy: true,
              width: '45%',
              accessor: 'name',
              Cell: function AppName({ value }: CellProps<AppDynamicsApplication>) {
                return <Text icon="service-appdynamics">{value}</Text>
              }
            },
            {
              id: '3',
              Header: getString('cv.monitoringSources.appD.mapToHarnessEnvironment'),
              disableSortBy: true,
              width: '45%',
              Cell: function EnvironmentCellWrapper({ row }: CellProps<AppDynamicsApplication>) {
                const appName = row.original.name!
                const app = state[appName]
                return (
                  <EnvironmentCell
                    disabled={!app}
                    value={app?.environment}
                    onSelect={(environment: string) => {
                      setState({
                        ...state,
                        [appName]: {
                          ...app!,
                          environment
                        }
                      })
                    }}
                    options={environmentOptions}
                    onUpdateOptions={setEnvironmentOptions}
                  />
                )
              }
            }
          ]}
          data={content}
          pagination={{
            itemCount: totalItems,
            pageSize: pageSize,
            pageCount: totalPages,
            pageIndex: pageIndex,
            gotoPage: (page: number) => setPageIndex(page)
          }}
        />
        {!loading && !error?.data && !content?.length && (
          <Container height={250}>
            <NoDataCard
              message={getString('cv.monitoringSources.appD.noAppsMsg')}
              icon="warning-sign"
              onClick={() => refetch()}
              buttonText={getString('retry')}
            />
          </Container>
        )}
        {!loading && error?.data && (
          <Container height={250}>
            <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
          </Container>
        )}
        {renderError('selectApp')}
        <SubmitAndPreviousButtons onPreviousClick={onPrevious} onNextClick={onNext} />
      </Container>
    </Container>
  )
}

function EnvironmentCell({ value, disabled, onSelect, options = [], onUpdateOptions }: EnvironmentCellProps) {
  const item = useMemo(() => options?.find((opt: SelectOption) => opt.value === value), [options, value])
  return (
    <Container className={styles.selectEnvironmentCell}>
      <Icon name="harness" margin={{ right: 'small' }} />
      <EnvironmentSelect
        item={item}
        disabled={disabled}
        options={options}
        onSelect={opt => {
          onSelect(opt.value as string)
        }}
        onNewCreated={env => {
          onUpdateOptions?.([{ label: env.name!, value: env.identifier! }, ...options])
          onSelect(env.identifier as string)
        }}
      />
    </Container>
  )
}
