import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Layout,
  Container,
  Icon,
  Text,
  // ExpandingSearchInput,
  Button,
  FlexExpander,
  Select,
  SelectOption,
  Heading,
  Utils,
  Pagination,
  Color
} from '@wings-software/uicore'
import ReactTimeago from 'react-timeago'
import { /*Drawer,*/ Position, Switch, Classes } from '@blueprintjs/core'
import type { CellProps, Renderer, Column, Cell } from 'react-table'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { useConfirmAction, useLocalStorage } from '@common/hooks'
import Table from '@common/components/Table/Table'
import type { GetEnvironmentListForProjectQueryParams } from 'services/cd-ng'
import { useGetAllFeatures, Feature, useDeleteFeatureFlag, Features, FeatureState } from 'services/cf'
import { useStrings } from 'framework/exports'
import { OptionsMenuButton } from '@common/components'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { VariationTypeIcon } from '@cf/components/VariationTypeIcon/VariationTypeIcon'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { ListingPageTemplate, ListingPageTitle } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { NoData } from '@cf/components/NoData/NoData'
import {
  CF_LOCAL_STORAGE_ENV_KEY,
  DEFAULT_ENV,
  isFeatureFlagOn,
  CF_DEFAULT_PAGE_SIZE,
  featureFlagHasCustomRules,
  FeatureFlagActivationStatus,
  getErrorMessage
} from '../../utils/CFUtils'
import { FlagTypeVariations } from '../../components/CreateFlagDialog/FlagDialogUtils'
// import FlagDrawerFilter from '../../components/FlagFilterDrawer/FlagFilterDrawer'
import FlagDialog from '../../components/CreateFlagDialog/FlagDialog'
import { useEnvironments } from '../../hooks/environment'
import imageURL from './flag.svg'
import { FeatureFlagStatus, FlagStatus } from './FlagStatus'
import { FlagResult } from './FlagResult'
import css from './CFFeatureFlagsPage.module.scss'

interface RenderColumnFlagProps {
  cell: Cell<Feature>
  update: (status: boolean) => void
}

const RenderColumnFlag: React.FC<RenderColumnFlagProps> = ({ cell: { row }, update }) => {
  const data = row.original
  const [environment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const [status, setStatus] = useState(isFeatureFlagOn(data))
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: data.envProperties?.environment as string,
    flagIdentifier: data.identifier
  })
  const { showError } = useToaster()
  const [flagNameTextSize, setFlagNameTextSize] = useState(300)
  const ref = useRef<HTMLDivElement>(null)

  const switchTooltip = (
    <Container width={'350px'} padding="xxxlarge">
      <Heading level={2} style={{ fontWeight: 600, fontSize: '24px', lineHeight: '32px', color: '#22222A' }}>
        {getString(status ? 'cf.featureFlags.turnOffHeading' : 'cf.featureFlags.turnOnHeading')}
      </Heading>
      <Text margin={{ top: 'medium', bottom: 'small' }} style={{ lineHeight: '22px', color: '#383946' }}>
        <span
          // This is used to retain simple HTML markup in i18n string like <strong>
          // to make sure formating is aligned with translations
          dangerouslySetInnerHTML={{
            __html: getString(status ? 'cf.featureFlags.turnOffMessage' : 'cf.featureFlags.turnOnMessage', {
              name: data.name,
              env: environment?.label
            })
          }}
        />
      </Text>
      <Text margin={{ top: 'xsmall', bottom: 'xlarge' }} style={{ lineHeight: '22px', color: '#383946' }}>
        {(!featureFlagHasCustomRules(data) && (
          <span
            // This is used to retain simple HTML markup in i18n string like <strong>
            // to make sure formating is aligned with translations
            dangerouslySetInnerHTML={{
              __html: getString('cf.featureFlags.defaultWillBeServed', {
                defaultVariation: status ? data.defaultOffVariation : data.defaultOnVariation
              })
            }}
          />
        )) ||
          getString('cf.featureFlags.customRuleMessage')}
      </Text>
      <Container flex>
        <Layout.Horizontal spacing="small">
          <Button
            intent="primary"
            text={getString('confirm')}
            className={Classes.POPOVER_DISMISS}
            onClick={() => {
              const toggleFn = status ? toggleFeatureFlag.off() : toggleFeatureFlag.on()

              toggleFn
                .then(() => {
                  setStatus(!status)
                  update(!status)
                })
                .catch(error => {
                  showError(getErrorMessage(error), 0)
                })
            }}
          />
          <Button text={getString('cancel')} className={Classes.POPOVER_DISMISS} />
        </Layout.Horizontal>
        <span />
      </Container>
    </Container>
  )

  const onResize = () => {
    if (ref.current) {
      setFlagNameTextSize((ref.current.closest('div[role="cell"]') as HTMLDivElement)?.offsetWidth - 174)
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <Container flex>
      <Container onMouseDown={Utils.stopEvent} onClick={Utils.stopEvent}>
        <Button
          noStyling
          tooltip={switchTooltip}
          tooltipProps={{ interactionKind: 'click', hasBackdrop: true, position: Position.TOP_LEFT }}
          className={css.toggleFlagButton}
        >
          <Switch
            style={{ alignSelf: 'baseline', marginLeft: '-10px' }}
            alignIndicator="right"
            className={Classes.LARGE}
            checked={status}
            // Empty onChange() to avoid React warning
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onChange={() => {}}
          />
        </Button>
      </Container>
      <Layout.Horizontal spacing="small" style={{ flexGrow: 1, paddingLeft: 'var(--spacing-medium)' }}>
        <Layout.Vertical flex className={css.generalInfo} ref={ref}>
          <Text
            style={{
              color: '#22222A',
              fontWeight: 500,
              fontSize: '13px',
              lineHeight: '16px'
            }}
            margin={{ right: 'xsmall' }}
            width={flagNameTextSize}
            lineClamp={2}
          >
            {data.name}
          </Text>
          {data.description && (
            <Text
              style={{
                color: '#22222A',
                fontSize: '12px',
                lineHeight: '24px'
              }}
            >
              {data.description}
            </Text>
          )}
        </Layout.Vertical>
        <Text
          width="100px"
          flex
          icon="main-tags"
          style={{ justifyContent: 'center' }}
          tooltip={
            data?.tags?.length ? (
              <>
                <Text>{getString('tagsLabel').toUpperCase()}</Text>
                {data.tags.map((elem, i) => (
                  <Text key={`${elem.value}-${i}`}>{elem.value}</Text>
                ))}
              </>
            ) : undefined
          }
          tooltipProps={{
            portalClassName: css.tagsPopover,
            position: Position.RIGHT
          }}
        >
          {data?.tags?.length || 0}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}

const RenderColumnDetails: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  const isOn = isFeatureFlagOn(data)
  const hasCustomRules = featureFlagHasCustomRules(data)
  const index = data.variations.findIndex(
    d => d.identifier === (isOn ? data.defaultOnVariation : data.defaultOffVariation)
  )

  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Text>
          <VariationTypeIcon multivariate={data.kind !== FlagTypeVariations.booleanFlag} />
          {getString(data.kind === FlagTypeVariations.booleanFlag ? 'cf.boolean' : 'cf.multivariate')}
        </Text>
      </Layout.Horizontal>
      {!hasCustomRules && (
        <Container style={{ display: 'flex', alignItems: 'center' }}>
          <VariationWithIcon
            variation={data.variations[index]}
            index={index}
            textStyle={{
              fontSize: '12px',
              lineHeight: '24px',
              color: '#9293AB',
              paddingLeft: 'var(--spacing-xsmall)'
            }}
            textElement={getString(isOn ? 'cf.featureFlags.defaultServedOn' : 'cf.featureFlags.defaultServedOff', {
              defaultVariation: data.variations[index].name || data.variations[index].value
            })}
          />
        </Container>
      )}
    </Layout.Vertical>
  )
}

const RenderColumnLastUpdated: Renderer<CellProps<Feature>> = ({ row }) => {
  return row.original?.modifiedAt ? (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      <ReactTimeago date={row.original?.modifiedAt} />
    </Layout.Horizontal>
  ) : null
}

interface ColumnMenuProps {
  cell: Cell<Feature>
  environment?: string
}

const RenderColumnEdit: React.FC<ColumnMenuProps> = ({ cell: { row, column }, environment }) => {
  const data = row.original
  const { showError, showSuccess, clear } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<any>()
  const history = useHistory()
  const { getString } = useStrings()
  const { mutate } = useDeleteFeatureFlag({
    queryParams: {
      project: projectIdentifier as string,
      account: accountId,
      org: orgIdentifier
    }
  })
  const refetch = ((column as unknown) as { refetch: () => void }).refetch
  const deleteFlag = useConfirmAction({
    title: getString('cf.featureFlags.deleteFlag'),
    confirmText: getString('delete'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.deleteFlagMessage', { name: data.name }) }}
        />
      </Text>
    ),
    action: async () => {
      try {
        clear()
        await mutate(data.identifier)
          .then(() => {
            showSuccess(
              <Text color={Color.WHITE}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: getString('cf.featureFlags.deleteFlagSuccess', { name: data.name })
                  }}
                />
              </Text>
            )
            refetch?.()
          })
          .catch(error => {
            showError(getErrorMessage(error))
          })
      } catch (error) {
        showError(getErrorMessage(error))
      }
    }
  })

  const gotoDetailPage = (): void => {
    history.push(
      routes.toCFFeatureFlagsDetail({
        orgIdentifier: orgIdentifier as string,
        projectIdentifier: projectIdentifier as string,
        environmentIdentifier: environment as string,
        featureFlagIdentifier: data.identifier,
        accountId
      })
    )
  }

  return (
    <Container style={{ textAlign: 'right' }} onClick={Utils.stopEvent}>
      <OptionsMenuButton
        items={[
          {
            icon: 'edit',
            text: getString('edit'),
            onClick: gotoDetailPage
          },
          {
            icon: 'trash',
            text: getString('delete'),
            onClick: deleteFlag
          }
        ]}
      />
    </Container>
  )
}

const CFFeatureFlagsPage: React.FC = () => {
  // const [isSaveFiltersOn, setIsSaveFiltersOn] = useState(false)
  // const [isDrawerOpened, setIsDrawerOpened] = useState(false)
  const [environment, setEnvironment] = useLocalStorage<typeof DEFAULT_ENV | undefined>(
    CF_LOCAL_STORAGE_ENV_KEY,
    DEFAULT_ENV
  )
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const history = useHistory()

  const { data: environments, loading: envsLoading, error: envsError, refetch: refetchEnvironments } = useEnvironments({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  } as GetEnvironmentListForProjectQueryParams)
  const [pageNumber, setPageNumber] = useState(0)
  const queryParams = useMemo(() => {
    return {
      project: projectIdentifier as string,
      environment: environment?.value as string,
      account: accountId,
      org: orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber
    }
  }, [projectIdentifier, environment?.value, accountId, orgIdentifier, pageNumber])
  const { data, loading: flagsLoading, error: flagsError, refetch } = useGetAllFeatures({
    lazy: true,
    queryParams
  })
  const [features, setFeatures] = useState<Features | null>()
  const { getString } = useStrings()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!envsLoading) {
      if (environments?.length > 0) {
        if (environment?.value && environments.find(v => v.value === environment.value)) {
          setEnvironment({ label: environment.label, value: environment.value })
          refetch({ queryParams: { ...queryParams, environment: environment.value } })
        } else {
          setEnvironment({ label: environments[0].label, value: environments[0].value as string })
          refetch({ queryParams: { ...queryParams, environment: environments[0].value as string } })
        }
      } else if (environments?.length === 0) {
        setEnvironment(undefined)
        setLoading(true)
        setTimeout(() => {
          refetch({ queryParams: { ...queryParams, environment: (undefined as unknown) as string } })
        }, 0)
      }
    }
  }, [environments?.length, envsLoading])

  useEffect(() => {
    setFeatures(data)
  }, [data])

  useEffect(() => {
    setLoading(flagsLoading || envsLoading)
  }, [flagsLoading, envsLoading])

  const error = flagsError || envsError

  const columns: Column<Feature>[] = useMemo(
    () => [
      {
        Header: getString('featureFlagsText').toUpperCase(),
        accessor: row => row.name,
        width: '35%',
        Cell: function WrapperRenderColumnFlag(cell: Cell<Feature>) {
          return (
            <RenderColumnFlag
              cell={cell}
              update={status => {
                // Update last updated column to reflect latest change without having to refetch the whole list
                // The setTimeout makes sure there's enough time for animation in the switch component before re-rendering
                // takes place and destroy it
                setTimeout(() => {
                  const feature = features?.features?.find(f => f.identifier === cell.row.original.identifier)
                  if (feature) {
                    if (feature.envProperties) {
                      feature.envProperties.state = (status
                        ? FeatureFlagActivationStatus.ON
                        : FeatureFlagActivationStatus.OFF) as FeatureState
                    }
                    feature.modifiedAt = Date.now()
                    setFeatures({ ...features } as Features)
                  }
                }, 1000)
              }}
            />
          )
        }
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.kind,
        width: '20%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        width: '19%',
        Cell: function StatusCell(cell: Cell<Feature>) {
          return (
            <FlagStatus
              status={cell.row.original.status?.status as FeatureFlagStatus}
              lastAccess={(cell.row.original.status?.lastAccess as unknown) as number}
            />
          )
        }
      },
      {
        Header: getString('cf.featureFlags.results').toUpperCase(),
        accessor: row => row.results,
        width: '11%',
        Cell: function ResultCell(cell: Cell<Feature>) {
          return <FlagResult feature={cell.row.original} />
        }
      },
      {
        Header: getString('lastUpdated').toUpperCase(),
        accessor: row => row.modifiedAt,
        width: '10%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        id: 'version',
        width: '5%',
        Cell: function WrapperRenderColumnEdit(cell: Cell<Feature>) {
          return <RenderColumnEdit cell={cell} environment={environment?.value as string} />
        },
        disableSortBy: true,
        refetch
      }
    ],
    [refetch]
  )

  // const onDrawerOpened = (): void => {
  //   setIsDrawerOpened(true)
  // }

  // const onDrawerClose = (): void => {
  //   setIsDrawerOpened(false)
  // }

  const onEnvironmentChanged = (item: SelectOption) => {
    setEnvironment({ label: item?.label, value: item.value as string })
    refetch({ queryParams: { ...queryParams, environment: item.value as string } })
  }
  const hasFeatureFlags = features?.features && features?.features?.length > 0
  const emptyFeatureFlags = !loading && features?.features?.length === 0
  const title = getString('featureFlagsText')
  const header = (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ flexGrow: 1 }} padding={{ right: 'xlarge' }}>
      <ListingPageTitle style={{ borderBottom: 'none' }}>{title}</ListingPageTitle>
      <FlexExpander />
      {!!environments?.length && (
        <Select
          items={environments}
          className={css.ffPageBtnsSelect}
          inputProps={{ placeholder: getString('cf.shared.selectEnvironment') }}
          onChange={onEnvironmentChanged}
          value={environment?.value ? environment : environments[0] || null}
          disabled={loading}
        />
      )}
    </Layout.Horizontal>
  )

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={header}
      headerStyle={{ display: 'flex' }}
      toolbar={
        <Layout.Horizontal>
          <FlagDialog disabled={loading} environment={environment?.value as string} />
          <FlexExpander />

          {/** TODO: Disable search as backend does not support it yet */}
          {/* <ExpandingSearchInput name="findFlag" placeholder={i18n.searchInputFlag} className={css.ffPageBtnsSearch} /> */}

          {/** TODO: Disable filter as backend does not fully support it yet */}
          {/* <Button
            disabled={loading}
            icon="settings"
            iconProps={{ size: 20, color: Color.BLUE_500 }}
            minimal
            intent="primary"
            onClick={onDrawerOpened}
          /> */}
        </Layout.Horizontal>
      }
      content={
        <>
          {hasFeatureFlags && (
            <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
              <Container className={css.list}>
                <Table<Feature>
                  columns={columns}
                  data={features?.features || []}
                  onRowClick={feature => {
                    history.push(
                      routes.toCFFeatureFlagsDetail({
                        orgIdentifier: orgIdentifier as string,
                        projectIdentifier: projectIdentifier as string,
                        environmentIdentifier: environment?.value || (environments[0]?.value as string),
                        featureFlagIdentifier: feature.identifier,
                        accountId
                      })
                    )
                  }}
                />
              </Container>
            </Container>
          )}

          {!loading && emptyFeatureFlags && (
            <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
              <NoData imageURL={imageURL} message={getString('cf.noFlag')}>
                <FlagDialog environment={environment?.value as string} />
              </NoData>
            </Container>
          )}
        </>
      }
      pagination={
        !!features?.features?.length && (
          <Pagination
            itemCount={features?.itemCount || 0}
            pageSize={features?.pageSize || 0}
            pageCount={features?.pageCount || 0}
            pageIndex={pageNumber}
            gotoPage={index => {
              setPageNumber(index)
              refetch({ queryParams: { ...queryParams, pageNumber: index } })
            }}
          />
        )
      }
      loading={loading}
      error={error}
      retryOnError={() => {
        setPageNumber(0)
        refetchEnvironments()
      }}
    />
  )
}

export default CFFeatureFlagsPage
