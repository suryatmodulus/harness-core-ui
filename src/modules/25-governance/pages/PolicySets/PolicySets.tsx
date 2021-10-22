//
// TODO: This file is just a place-holder
//
import React, { useState, useMemo } from 'react'
import * as moment from 'moment'
import {
  ButtonVariation,
  // ExpandingSearchInput,
  Layout,
  Toggle,
  Button,
  Text,
  Color,
  Popover,
  useModalHook,
  PageHeader
} from '@wings-software/uicore'
import { Classes, Position, Menu, Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer, Column } from 'react-table'
import { useToaster, useConfirmationDialog, StringUtils, Page } from '@common/exports'
import { useUpdatePolicySet, useDeletePolicySet, useGetPolicySetList } from 'services/pm'

import { useStrings } from 'framework/strings'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

// import { setPageNumber } from '@common/utils/utils'
import Table from '@common/components/Table/Table'
import PolicySetWizard from './components/PolicySetWizard'
import PolicyIcon from './PolicySetIcon.svg'
import css from './PolicySets.module.scss'

export interface PoliciesSetDTO {
  account_id?: number
  action: string
  created: number
  enabled: boolean
  id: number
  name: string
  org_id?: string
  project_id: string
  type: string
  updated: number
  identifier: string
}

const _useGetPolicySetList = useGetPolicySetList as any

// let page = 0
// let totalPages = 0
const PAGE_SIZE = 15

const PolicyEvaluations: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.policies'))
  // const [, setPage] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  // const [searchTerm, setsearchTerm] = useState<string>('')

  const queryParams = useMemo(
    () => ({
      accountId,
      per_page: PAGE_SIZE,
      page: pageIndex
    }),
    [accountId, pageIndex]
  )

  const [policySetData, setPolicySetData] = React.useState<any>()

  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1000,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }

  const {
    data: policyList,
    loading: fetchingPolicieSets,
    error,
    refetch,
    response
  } = _useGetPolicySetList({
    queryParams
  })

  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || 0), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || 0), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || 0), [response])

  // useEffect(() => {
  //   setPageNumber({ setPage, page, pageItemsCount: totalPages * pageSize })
  // }, [policyList])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <PolicySetWizard hideModal={hideModal} refetch={refetch} policySetData={policySetData}></PolicySetWizard>
        <Button
          minimal
          className={css.closeIcon}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            refetch()
            hideModal()
          }}
        />
      </Dialog>
    ),
    [policySetData]
  )

  const newUserGroupsBtn = (): JSX.Element => (
    <Button
      text={getString('common.policiesSets.newPolicyset')}
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      onClick={() => {
        setPolicySetData({})
        showModal()
      }}
    />
  )

  const RenderPolicyName: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Layout.Horizontal spacing="small" flex style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <img src={PolicyIcon} height="22" />
        <Text color={Color.BLACK} lineClamp={1} font={{ weight: 'semi-bold' }}>
          {record.name}
        </Text>
      </Layout.Horizontal>
    )
  }

  const getValue = (value: number) => {
    return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
  }

  const RenderCreatedAt: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.created)}
      </Text>
    )
  }

  const RenderLastUpdated: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.updated)}
      </Text>
    )
  }

  const RenderEntityType: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record.type}
      </Text>
    )
  }

  const RenderEnforced: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    const id = '' + row.original.id
    const { mutate: updatePolicySet } = useUpdatePolicySet({ policyset: id })

    return (
      <Toggle
        checked={record.enabled}
        onToggle={value => {
          const updatePayload = {
            action: row.original.action,
            enabled: value,
            name: row.original.name,
            type: row.original.type
          }
          updatePolicySet(updatePayload)
          refetch()
        }}
      />
    )
  }

  const RenderColumnMenu: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const data = row.original

    const [menuOpen, setMenuOpen] = useState(false)
    const { showSuccess, showError } = useToaster()

    const { mutate: deletePolicySet } = useDeletePolicySet({})

    const { openDialog: openDeleteDialog } = useConfirmationDialog({
      contentText: 'Are you sure you want to delete Policy Set?',
      titleText: 'Delete Policy Set',
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async didConfirm => {
        if (didConfirm && data) {
          try {
            await deletePolicySet(data?.identifier.toString())
            showSuccess('Successfully deleted Policy Set')
            refetch()
          } catch (err) {
            showError(err?.message)
          }
        }
      }
    })

    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.BOTTOM_RIGHT}
        >
          <Button
            minimal
            icon="Options"
            withoutBoxShadow
            data-testid={`menu-${data.id}`}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu>
            <Menu.Item
              icon="edit"
              text={getString('edit')}
              onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                event.stopPropagation()
                setMenuOpen(false)
                setPolicySetData(row.original)
                showModal()
              }}
            />
            <Menu.Item
              icon="trash"
              text={getString('delete')}
              onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                event.stopPropagation()
                setMenuOpen(false)
                openDeleteDialog()
              }}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const columns: Column<PoliciesSetDTO>[] = useMemo(
    () => [
      {
        Header: getString('common.policiesSets.table.name'),

        accessor: row => row.name,
        width: '35%',
        Cell: RenderPolicyName
      },
      {
        Header: getString('common.policiesSets.table.enforced'),

        accessor: row => row.enabled,
        width: '10%',
        Cell: RenderEnforced
      },
      {
        Header: getString('common.policiesSets.table.entityType'),

        accessor: row => row.type,
        width: '10%',
        Cell: RenderEntityType
      },
      {
        Header: getString('common.policy.table.createdAt'),

        accessor: row => row.updated,
        width: '20%',
        Cell: RenderCreatedAt
      },
      {
        Header: getString('common.policy.table.lastModified'),

        accessor: row => row.updated,
        width: '20%',
        Cell: RenderLastUpdated
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.id,
        width: '5%',
        Cell: RenderColumnMenu,

        disableSortBy: true
      }
    ],
    []
  )

  return (
    <>
      <PageHeader title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>} />
      <Page.Body
        loading={fetchingPolicieSets}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !policyList?.length,
          icon: 'nav-project',
          message: getString('common.policiesSets.noPolicySet'),
          button: newUserGroupsBtn()
        }}
      >
        <Table<PoliciesSetDTO>
          className={css.table}
          columns={columns}
          data={policyList || []}
          pagination={{
            itemCount,
            pageSize,
            pageCount,
            pageIndex,
            gotoPage: (index: number) => {
              setPageIndex(index)
            }
          }}
        />
      </Page.Body>
    </>
  )
}

export default PolicyEvaluations
