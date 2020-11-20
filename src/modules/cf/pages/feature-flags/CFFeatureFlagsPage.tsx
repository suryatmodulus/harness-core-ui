import React, { useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Color,
  Layout,
  Container,
  Icon,
  Text,
  ExpandingSearchInput,
  Button,
  FlexExpander,
  Select,
  Popover,
  SelectOption
} from '@wings-software/uikit'
import { Drawer, Menu, Spinner, Position } from '@blueprintjs/core'
import type { CellProps, Renderer, Column, Cell } from 'react-table'
import moment from 'moment'
import { routeCFFeatureFlagsDetail } from 'navigation/cf/routes'
import { useToaster, useConfirmationDialog } from '@common/exports'
import Table from '@common/components/Table/Table'
import { useGetAllFeatures, Feature, useDeleteFeatureFlag } from 'services/cf'
import { useRouteParams } from 'framework/exports'
import { Page } from '@common/exports'
import { FlagTypeVariations } from '../../components/CreateFlagDialog/FlagDialogUtils'
import FlagDrawerFilter from '../../components/FlagFilterDrawer/FlagFilterDrawer'
import FlagDialog from '../../components/CreateFlagDialog/FlagDialog'
import { useEnvironments } from '../../hooks/environment'
import i18n from './CFFeatureFlagsPage.i18n'
import css from './CFFeatureFlagsPage.module.scss'

type CustomColumn<T extends object> = Column<T>

const RenderColumnFlag: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal flex>
      {/* FIXME: Check with BE */}
      {/* <Switch checked={data.isChecked} /> */}
      <Layout.Vertical>
        <Layout.Horizontal flex>
          <Text color={Color.BLACK} font={{ weight: 'bold', size: 'medium' }} margin={{ right: 'xsmall' }}>
            {data.name}
          </Text>
          <Text color={Color.GREY_450} font={{ size: 'small' }}>
            ( {i18n.created.toLowerCase()}
            <span style={{ marginLeft: '3px' }}>{moment(data.createdAt).format(`YY[yrs] [and] D [days ago]`)} )</span>
          </Text>
        </Layout.Horizontal>
        <Text>{data.description}</Text>
        <Text color={Color.GREY_450} font={{ size: 'small' }}>
          {data.identifier}
        </Text>
      </Layout.Vertical>
      <Container margin={{ right: 'medium' }}>
        <Text
          icon="main-tags"
          tooltip={
            data?.tags?.length ? (
              <>
                <Text>{i18n.tags.toUpperCase()}</Text>
                {data.tags.map((elem, i) => (
                  <Text key={`${elem.value}-${i}`}>{elem.value}</Text>
                ))}
              </>
            ) : undefined
          }
          tooltipProps={{ portalClassName: css.tagsPopover, position: Position.RIGHT }}
        >
          {data?.tags?.length ? data.tags.length : 0}
        </Text>
      </Container>
    </Layout.Horizontal>
  )
}

const RenderColumnDetails: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        {/* TODO: Check with BE about kind tooltip */}
        <Text tooltip={'To be implemented...'} tooltipProps={{ isDark: true }}>
          {data.kind === FlagTypeVariations.booleanFlag
            ? i18n.boolean
            : `${i18n.multivariate} (${data.variations.length} ${i18n.variations})`}
        </Text>
      </Layout.Horizontal>
      {/* TODO: Maybe this needs fixing */}
      <Text>{data.variations[0].name}</Text>
      <Text>{data.variations[0].description}</Text>
    </Layout.Vertical>
  )
}

const RenderColumnStatus: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original

  return (
    // FIXME: Check this with BE
    <Layout.Vertical>
      <Text>Lorem ipsum</Text>
      <Text color={Color.GREY_450} font={{ size: 'small' }}>
        {moment(data.modifiedAt).format('MM/DD/YYYY')}
      </Text>
    </Layout.Vertical>
  )
}

const RenderColumnResults: Renderer<CellProps<Feature>> = () => {
  // const data = row.original

  {
    /* TODO: Check with BE about results tooltip */
  }
  return (
    <>
      {/* FIXME: Check with BE */}
      <div style={{ backgroundColor: '#ccc', height: '15px', width: '60px' }}></div>
      <Text>Lorem Ipsum</Text>
    </>
  )
}

const RenderColumnOwners: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original

  return (
    <Text
      tooltip={data?.owner?.join(',')}
      tooltipProps={{ isDark: true }}
      flex
      style={{ justifyContent: 'flex-start' }}
    >
      {/* FIXME: Check with BE */}
      {/* <img src="" alt={data.owner} /> */}
      <Icon name="main-user" size={20} style={{ position: 'relative', zIndex: 1 }} />
      <Button
        icon="add"
        minimal
        intent="primary"
        iconProps={{ size: 20 }}
        style={{ marginLeft: '-5px', border: 0 }}
        onClick={() => alert('To be implemented')}
      />
    </Text>
  )
}

interface ColumnMenuProps {
  cell: Cell<Feature>
  environment?: string
}

const RenderColumnEdit: React.FC<ColumnMenuProps> = ({ cell: { row, column }, environment }) => {
  const data = row.original
  const { showError } = useToaster()

  const [menuOpen, setMenuOpen] = useState(false)

  const {
    params: { projectIdentifier, orgIdentifier }
  } = useRouteParams()

  const history = useHistory()

  const { mutate: deleteFeatureFlag } = useDeleteFeatureFlag({
    queryParams: {
      project: projectIdentifier as string
    }
  })

  const { openDialog: openDeleteFlagDialog } = useConfirmationDialog({
    contentText: i18n.deleteDialog.textSubject(data.name),
    titleText: i18n.deleteDialog.textHeader,
    confirmButtonText: i18n.delete,
    cancelButtonText: i18n.cancel,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          // FIXME: Check with BE about delete status
          // const deleted = await deleteFeatureFlag(data.identifier)
          // if (deleted.status === 'SUCCESS') {
          //   showSuccess('Successfully deleted...')
          // }
          await deleteFeatureFlag(data.identifier)
          ;(column as any).refetch?.()
        } catch (e) {
          showError(e)
        }
      }
    }
  })

  const onDetailPage = (): void => {
    history.push(
      routeCFFeatureFlagsDetail.url({
        orgIdentifier: orgIdentifier as string,
        projectIdentifier: projectIdentifier as string,
        environmentIdentifier: environment as string,
        featureFlagIdentifier: data.identifier
      })
    )
  }

  return (
    <Layout.Horizontal flex>
      {/* TODO: Check with BE about pin */}
      <Icon name="pin" margin={{ right: 'small' }} />
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
      >
        <Button
          minimal
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            icon="edit"
            text={i18n.edit}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onDetailPage()
            }}
          />
          <Menu.Item
            icon="trash"
            text={i18n.delete}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              openDeleteFlagDialog()
              setMenuOpen(false)
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const CFFeatureFlagsPage: React.FC = () => {
  const [isSaveFiltersOn, setIsSaveFiltersOn] = useState(false)
  const [isDrawerOpened, setIsDrawerOpened] = useState(false)

  const [environment, setEnvironment] = useState<SelectOption | null>(null)

  const { showError } = useToaster()

  const {
    params: { projectIdentifier }
  } = useRouteParams()

  const { data: environments, loading: envsLoading, error: envsError } = useEnvironments(projectIdentifier as string)

  const { data: flagList, loading: flagsLoading, error: flagsError, refetch } = useGetAllFeatures({
    queryParams: {
      project: projectIdentifier as string,
      environment: environment?.value as string
    }
  })

  useEffect(() => {
    if (!envsLoading) {
      setEnvironment(environments?.length > 0 ? environments[0] : null)
    }
  }, [environments.length, envsLoading])

  const error = flagsError || envsError
  const loading = flagsLoading || envsLoading

  const columns: CustomColumn<Feature>[] = useMemo(
    () => [
      {
        Header: i18n.featureFlag.toUpperCase(),
        accessor: row => row.name,
        width: '35%',
        Cell: RenderColumnFlag
      },
      {
        Header: i18n.details.toUpperCase(),
        accessor: row => row.kind,
        width: '15%',
        Cell: RenderColumnDetails
      },
      {
        Header: i18n.status.toUpperCase(),
        accessor: 'archived',
        width: '20%',
        Cell: RenderColumnStatus
      },
      {
        Header: i18n.results.toUpperCase(),
        // TODO: Check for the accessor field
        accessor: 'prerequisites',
        width: '15%',
        Cell: RenderColumnResults,
        disableSortBy: true
      },
      {
        Header: i18n.owners.toUpperCase(),
        accessor: row => row.owner,
        width: '10%',
        Cell: RenderColumnOwners,
        disableSortBy: true
      },
      {
        Header: '',
        // TODO: Check for the accessor field
        accessor: row => row.envProperties?.version,
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

  const onDrawerOpened = (): void => {
    setIsDrawerOpened(true)
  }

  const onDrawerClose = (): void => {
    setIsDrawerOpened(false)
  }

  if (loading) {
    return (
      <Container flex style={{ justifyContent: 'center', height: '100%' }}>
        <Spinner size={50} />
      </Container>
    )
  }

  // TODO: Show more meaningful error
  if (error) {
    showError(error)
  }

  const onEnvChange = (item: SelectOption) => {
    setEnvironment(item)
  }

  return (
    <>
      <Page.Header title={i18n.featureFlag} size="medium" />
      {flagList?.data?.features && flagList?.data?.features?.length > 0 ? (
        <Container className={css.ffListContainer}>
          <Layout.Horizontal className={css.ffPageBtnsHeader}>
            <FlagDialog />

            <FlexExpander />

            <ExpandingSearchInput name="findFlag" placeholder={i18n.searchInputFlag} className={css.ffPageBtnsSearch} />

            <Select
              items={environments}
              className={css.ffPageBtnsSelect}
              inputProps={{ placeholder: i18n.selectEnv }}
              onChange={onEnvChange}
              value={environment}
            />

            {/* TODO: Filters length/count should be displayed next to the button, check with BE */}
            <Button
              icon="settings"
              iconProps={{ size: 20, color: Color.BLUE_500 }}
              minimal
              intent="primary"
              onClick={onDrawerOpened}
            />
          </Layout.Horizontal>

          <Drawer
            isOpen={isDrawerOpened}
            title={isSaveFiltersOn ? i18n.saveFilters : i18n.drawerFilter}
            icon="settings"
            onClose={onDrawerClose}
            className={css.drawerContainer}
          >
            <FlagDrawerFilter isSaveFiltersOn={isSaveFiltersOn} setIsSaveFiltersOn={setIsSaveFiltersOn} />
          </Drawer>

          <Layout.Vertical className={css.ffTableContainer}>
            {/* TODO: Pagination needs to be communicated with BE */}
            <Table<Feature>
              columns={columns}
              data={flagList?.data?.features || []}
              pagination={{
                itemCount: flagList?.data?.itemCount || 0,
                pageSize: flagList?.data?.pageSize || 7,
                pageCount: flagList?.data?.pageCount || -1,
                pageIndex: flagList?.data?.pageIndex || 0,
                gotoPage: () => undefined
              }}
            />
          </Layout.Vertical>
        </Container>
      ) : (
        <Layout.Vertical className={css.heightOverride}>
          <Icon name="main-flag" size={120} color={Color.GREY_300} className={css.ffContainerImg} />
          <Text font="large" margin={{ bottom: 'huge' }} color="grey400">
            {i18n.noFeatureFlags}.
          </Text>
          <FlagDialog />
        </Layout.Vertical>
      )}
    </>
  )
}

export default CFFeatureFlagsPage
