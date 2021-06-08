import React from 'react'
import ReactTimeago from 'react-timeago'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { stringify } from 'yaml'
import { Button, Color, Layout, Popover, Text, Icon, Switch, Container, SparkChart } from '@wings-software/uicore'
import copy from 'clipboard-copy'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { isUndefined, isEmpty, sum } from 'lodash-es'
import cx from 'classnames'
import type { tagsType } from '@common/utils/types'
import Table from '@common/components/Table/Table'
import { NGTriggerDetailsResponse, useDeleteTrigger, useUpdateTrigger } from 'services/pipeline-ng'
import { useConfirmationDialog, useToaster } from '@common/exports'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { getTriggerIcon, GitSourceProviders, getEnabledStatusTriggerValues } from '../utils/TriggersListUtils'
import { TriggerTypes, clearNullUndefined, ResponseStatus } from '../utils/TriggersWizardPageUtils'

import css from './TriggersListSection.module.scss'
export interface GoToEditWizardInterface {
  triggerIdentifier: string
  // only used for url not showing undefined
  triggerType?: string
}
interface TriggersListSectionProps {
  data?: NGTriggerDetailsResponse[] // BE accidentally reversed. Will be changed to NGTriggerResponse later
  refetchTriggerList: () => void
  goToEditWizard: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
  goToDetails: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
}

// type CustomColumn<T extends object> = Column<T> & {
//   refetchTriggerList?: () => void
//   goToEditWizard?: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
//   getString?: (key: string) => string
// }

interface RenderColumnRow {
  original: NGTriggerDetailsResponse
}
interface RenderColumnMenuColumn {
  refetchTriggerList: () => void
  goToEditWizard: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
  showSuccess: (str: string) => void
  showError: (str: string) => void
  getString: (str: string) => string
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  isTriggerRbacDisabled: boolean
}

const RenderColumnMenu: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: RenderColumnMenuColumn
}) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { mutate: deleteTrigger } = useDeleteTrigger({
    queryParams: {
      accountIdentifier: column.accountId,
      orgIdentifier: column.orgIdentifier,
      projectIdentifier: column.projectIdentifier,
      targetIdentifier: column.pipelineIdentifier
    }
  })

  const { openDialog: confirmDelete } = useConfirmationDialog({
    contentText: `${column.getString('pipeline.triggers.confirmDelete')} ${data.name || /* istanbul ignore next */ ''}`,
    titleText: column.getString('pipeline.triggers.triggerLabel'),
    confirmButtonText: column.getString('delete'),
    cancelButtonText: column.getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        try {
          const deleted = await deleteTrigger(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */
          if (deleted.status === 'SUCCESS') {
            column.showSuccess(
              `${column.getString('pipeline.triggers.triggerLabel')} ${
                data.name || /* istanbul ignore next */ ''
              } ${column.getString('deleted')}`
            )
          }
          column.refetchTriggerList?.()
        } catch (err) {
          /* istanbul ignore next */
          column.showError(err?.data?.message)
        }
      }
    }
  })
  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
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
          className={css.actionButton}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            icon="edit"
            className={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            textClassName={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            text={column.getString('edit')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              if (column.isTriggerRbacDisabled) {
                return
              }
              if (data?.identifier && data.type) {
                column.goToEditWizard({ triggerIdentifier: data.identifier, triggerType: data.type })
              }
              setMenuOpen(false)
            }}
          />
          <Menu.Divider />
          <Menu.Item
            icon="trash"
            className={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            textClassName={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            text={column.getString('delete')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              if (column.isTriggerRbacDisabled) {
                return
              }
              confirmDelete()
              setMenuOpen(false)
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const RenderCenteredColumnHeader = (header: string): JSX.Element => <div className={css.textCentered}>{header}</div>

const RenderColumnTrigger: Renderer<CellProps<NGTriggerDetailsResponse>> = ({ row }) => {
  const data = row.original
  return (
    <>
      <Layout.Horizontal spacing="small" data-testid={data.identifier}>
        <Icon
          name={
            data.type
              ? getTriggerIcon({ type: data.type, webhookSourceRepo: data?.webhookDetails?.webhookSourceRepo })
              : 'yaml-builder-trigger'
          }
          size={26}
        />
        <Layout.Vertical padding={{ left: 'small' }}>
          <Layout.Horizontal spacing="small" data-testid={data.identifier}>
            <Text color={Color.BLACK}>{data.name}</Text>
            {!isEmpty(data.tags) ? <TagsPopover tags={data.tags as tagsType} /> : null}
          </Layout.Horizontal>
          <Text color={Color.GREY_400}>{data.identifier}</Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}

const RenderColumnStatus: Renderer<CellProps<NGTriggerDetailsResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small" data-testid={data.identifier}>
      <Text color={Color.GREY_400}></Text>
    </Layout.Horizontal>
  )
}

const RenderColumnActivity: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: { getString: (str: string, obj: { numActivations?: number; numDays?: number }) => string }
}) => {
  const data = row.original as any // temporary until API ready
  const executions = data.executions
  const numDays = executions?.length
  if (numDays === 0) return undefined
  const numActivations = sum(executions)
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xsmall">
      <span className={css.activityChart}>{numActivations !== 0 && <SparkChart data={executions} />}</span>
      <Container style={{ textAlign: 'start', paddingLeft: 'var(--spacing-xsmall)' }}>
        <span>{column.getString('pipeline.triggers.activityActivation', { numActivations })}</span>
        <Text>{column.getString('pipeline.triggers.activityDays', { numDays })}</Text>
      </Container>
    </Layout.Horizontal>
  )
}

const RenderColumnLastActivation: Renderer<CellProps<NGTriggerDetailsResponse>> = ({ row }) => {
  const data = row.original
  const lastExecutionTime = data.lastTriggerExecutionDetails?.lastExecutionTime
  const lastExecutionSuccessful = data.lastTriggerExecutionDetails?.lastExecutionSuccessful

  return (
    <Layout.Horizontal style={{ justifyContent: 'center' }} spacing="small" data-testid={data.identifier}>
      <div className={css.activityStatement}>
        {!isUndefined(lastExecutionTime) && !isUndefined(lastExecutionSuccessful) ? (
          <>
            <Layout.Horizontal style={{ alignItems: 'center' }}>
              <Container style={{ textAlign: 'end', marginLeft: 'var(--spacing-small)' }}>
                <Text>{lastExecutionTime ? <ReactTimeago date={lastExecutionTime} /> : null}</Text>
              </Container>
              <Icon
                style={{ paddingLeft: 'var(--spacing-xsmall)' }}
                name="dot"
                color={lastExecutionSuccessful ? 'green500' : 'red500'}
                size={20}
              />
            </Layout.Horizontal>
          </>
        ) : null}
      </div>
    </Layout.Horizontal>
  )
}

const RenderWebhookIcon = ({
  type,
  webhookSourceRepo,
  webhookSecret,
  webhookUrl,
  triggerIdentifier,
  column
}: {
  type?: string
  webhookSourceRepo?: string
  webhookSecret?: string
  webhookUrl?: string
  triggerIdentifier?: string
  column: {
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
    getString: (str: string) => string
    isTriggerRbacDisabled: boolean
  }
}): JSX.Element => {
  const [optionsOpen, setOptionsOpen] = React.useState(false)
  if (!type || type !== TriggerTypes.WEBHOOK || !webhookUrl) {
    return <Text color={Color.GREY_400}>N/A</Text>
  }

  if (webhookSourceRepo === GitSourceProviders.CUSTOM.value) {
    const curlCommand = `curl -X POST 
    ${
      (webhookSecret && `-H 'X-Harness-Webhook-Token: ${webhookSecret}'`) || ''
    } -H 'content-type: application/json' -H 'X-HARNESS-TRIGGER-ID: ${triggerIdentifier}'
     --url ${webhookUrl}
      -d '{
        "object_kind": "merge_request",
        ...
        }'`

    return (
      <Popover
        isOpen={optionsOpen}
        onInteraction={nextOpenState => {
          setOptionsOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          className={cx(css.webhookUrl, column.isTriggerRbacDisabled ? css.disabledOption : '')}
          icon="main-link"
          onClick={e => {
            e.stopPropagation()
            if (column.isTriggerRbacDisabled) {
              return
            }
            setOptionsOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            text={column.getString('pipeline.triggers.copyAsUrl')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              copy(webhookUrl)
              ;(column as any).showSuccess(column.getString('pipeline.triggers.toast.webhookUrlCopied'))
              setOptionsOpen(false)
            }}
          />
          <Menu.Divider />
          <Menu.Item
            text={column.getString('pipeline.triggers.copyAsCurl')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              copy(curlCommand)
              ;(column as any).showSuccess(column.getString('pipeline.triggers.toast.webhookCurlCopied'))
              setOptionsOpen(false)
            }}
          />
        </Menu>
      </Popover>
    )
  } else {
    return (
      <Button
        className={css.webhookUrl}
        icon="main-link"
        color={Color.BLUE_500}
        minimal
        onClick={e => {
          e.stopPropagation()
          copy(webhookUrl)
          ;(column as any).showSuccess(column.getString('pipeline.triggers.toast.webhookUrlCopied'))
        }}
      />
    )
  }
}

const RenderColumnWebhook: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: {
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
    getString: (str: string) => string
    isTriggerRbacDisabled: boolean
  }
}) => {
  const data = row.original

  return (
    <div className={css.textCentered}>
      {RenderWebhookIcon({
        type: data?.type,
        webhookSourceRepo: data?.webhookDetails?.webhookSourceRepo,
        webhookUrl: data?.webhookUrl,
        webhookSecret: data?.webhookDetails?.webhookSecret,
        triggerIdentifier: data?.identifier,
        column
      })}
    </div>
  )
}

const RenderColumnEnable: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: {
    showSuccess: (str: string) => void
    showError: (str: string) => void
    // getString: (key: StringKeys) => string
    getString: (str: string, obj?: { enabled: string; name: string }) => string
    refetchTriggerList: () => void
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
    isTriggerRbacDisabled: boolean
  }
}) => {
  const data = row.original

  const { mutate: updateTrigger, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier: data.identifier as string,
    queryParams: {
      accountIdentifier: column.accountId,
      orgIdentifier: column.orgIdentifier,
      projectIdentifier: column.projectIdentifier,
      targetIdentifier: column.pipelineIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  return (
    <div className={css.textCentered} onClick={e => e.stopPropagation()}>
      <Switch
        label=""
        className={column.isTriggerRbacDisabled ? css.disabledOption : ''}
        checked={data.enabled}
        disabled={updateTriggerLoading}
        onChange={async () => {
          if (column.isTriggerRbacDisabled) {
            return
          }
          const { values, error } = getEnabledStatusTriggerValues({
            data,
            enabled: !data.enabled,
            getString: column.getString
          })
          if (error) {
            column.showError(error)
            return
          }
          try {
            const { status, data: dataResponse } = await updateTrigger(
              stringify({ trigger: clearNullUndefined(values) }) as any
            )
            if (status === ResponseStatus.SUCCESS && dataResponse) {
              column.showSuccess(
                column.getString('pipeline.triggers.toast.toggleEnable', {
                  enabled: dataResponse.enabled ? 'enabled' : 'disabled',
                  name: dataResponse.name || ''
                })
              )
              column.refetchTriggerList?.()
            }
          } catch (err) {
            column.showError(err?.data?.message)
          }
        }}
      />
    </div>
  )
}

export const TriggersListSection: React.FC<TriggersListSectionProps> = ({
  data,
  refetchTriggerList,
  goToEditWizard,
  goToDetails
}): JSX.Element => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
  }>()
  const [isExecutable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const isTriggerRbacDisabled = !isExecutable

  const columns: any = React.useMemo(
    // const columns: CustomColumn<NGTriggerDetailsResponse>[] = React.useMemo( // wait for backend to support condition
    () => [
      {
        Header: getString('pipeline.triggers.triggerLabel').toUpperCase(),
        accessor: 'name',
        width: '25%',
        Cell: RenderColumnTrigger
      },
      {
        Header: 'STATUS',
        accessor: 'status',
        width: '16%',
        disableSortBy: true,

        Cell: RenderColumnStatus
      },
      {
        Header: RenderCenteredColumnHeader(getString('activity').toUpperCase()),
        accessor: 'activity',
        width: '18%',
        Cell: RenderColumnActivity,
        disableSortBy: true,
        getString
      },
      {
        Header: RenderCenteredColumnHeader(getString('pipeline.triggers.lastActivationLabel')),
        accessor: 'lastExecutionTime',
        width: '18%',
        Cell: RenderColumnLastActivation,
        disableSortBy: true
      },

      {
        Header: RenderCenteredColumnHeader(getString('execution.triggerType.WEBHOOK').toUpperCase()),
        accessor: 'webhook',
        width: '10%',
        Cell: RenderColumnWebhook,
        disableSortBy: true,
        showSuccess,
        orgIdentifier,
        projectIdentifier,
        accountId,
        getString,
        isTriggerRbacDisabled
      },
      {
        Header: RenderCenteredColumnHeader(getString('pipeline.triggers.enableLabel')),
        accessor: 'enable',
        width: '10%',
        Cell: RenderColumnEnable,
        disableSortBy: true,
        projectIdentifier,
        orgIdentifier,
        accountId,
        pipelineIdentifier,
        showSuccess,
        showError,
        refetchTriggerList,
        getString,
        isTriggerRbacDisabled
      },
      {
        Header: '',
        accessor: 'type',
        width: '3%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        refetchTriggerList,
        goToEditWizard,
        showSuccess,
        showError,
        projectIdentifier,
        orgIdentifier,
        accountId,
        pipelineIdentifier,
        getString,
        isTriggerRbacDisabled
      }
    ],
    [goToEditWizard, refetchTriggerList, getString]
  )
  return (
    <Table<NGTriggerDetailsResponse>
      className={css.table}
      columns={columns}
      data={data || /* istanbul ignore next */ []}
      onRowClick={item => goToDetails({ triggerIdentifier: item.identifier || '' })}
    />
  )
}
