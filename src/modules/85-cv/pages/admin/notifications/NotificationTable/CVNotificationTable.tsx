import React, { useState, useMemo } from 'react'
import { Text, Layout, Icon, Button, Popover, Switch, Color } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Menu, Classes, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'

import Table from '@common/components/Table/Table'

import { NotificationType } from '@notifications/interfaces/Notifications'

import { PageAlertRuleDTO, AlertRuleDTO, useUpdateAlert, useDeleteAlert } from 'services/cv'
import { useToaster } from '@common/exports'
import useCVNotificationsModal from '@cv/components/CVNotifications/useCVNotificationsModal'
import { useStrings } from 'framework/strings'
import { pluralize } from '@common/utils/StringUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../CVNotificationPage.module.scss'
interface CVNotificationTableProps {
  data?: PageAlertRuleDTO
  reload?: () => Promise<void>
  gotoPage: (pageNumber: number) => void
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  reload?: () => Promise<void>
}

const RenderNotificationMethod: Renderer<CellProps<AlertRuleDTO>> = ({ row }) => {
  const rowData = row.original

  const getEmailTooltip = () => {
    const emails =
      rowData.notificationMethod &&
      rowData.notificationMethod.emails?.length &&
      rowData?.notificationMethod.emails
        .slice(2)
        .map(item => {
          return item
        })
        .toString()
    return emails as string
  }

  return (
    <>
      {rowData.notificationMethod?.notificationSettingType === NotificationType.Slack ? (
        <Layout.Horizontal spacing="small">
          <Icon name="service-slack" />
          <Text
            color={Color.BLACK}
            tooltip={rowData.notificationMethod.slackWebhook}
            className={css.maxWidthCol}
            lineClamp={1}
          >
            {rowData.notificationMethod.slackWebhook}
          </Text>
        </Layout.Horizontal>
      ) : null}

      {rowData.notificationMethod?.notificationSettingType === NotificationType.PagerDuty ? (
        <Layout.Horizontal spacing="small" color={Color.BLACK}>
          <Icon name="service-pagerduty" />
          <Text
            color={Color.BLACK}
            className={css.maxWidthCol}
            lineClamp={1}
            tooltip={rowData.notificationMethod.pagerDutyKey}
          >
            {rowData.notificationMethod.pagerDutyKey}
          </Text>
        </Layout.Horizontal>
      ) : null}
      {rowData.notificationMethod?.notificationSettingType === NotificationType.Email ? (
        <Layout.Horizontal spacing="small" color={Color.BLACK} className={css.maxWidthCol}>
          <Icon name="main-email" color={Color.GREY_400} />
          <Text color={Color.BLACK}>
            {rowData.notificationMethod.emails?.[0]}, {rowData.notificationMethod.emails?.[1]}
          </Text>
          {rowData.notificationMethod.emails?.length && rowData.notificationMethod.emails.length > 2 ? (
            <Text tooltip={getEmailTooltip()} color={Color.BLUE_500}>
              {`+${rowData.notificationMethod.emails.length - 2}`}
            </Text>
          ) : null}
        </Layout.Horizontal>
      ) : null}
    </>
  )
}

const RenderColumnMenu: Renderer<CellProps<AlertRuleDTO>> = ({ row, column }) => {
  const rowData = row.original
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { openNotificationModal } = useCVNotificationsModal({
    onSuccess: () => {
      ;(column as any).reload?.()
    }
  })
  const { mutate: deleteAlert } = useDeleteAlert({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })
  const handleDelete = async () => {
    try {
      await deleteAlert(rowData.identifier as string)
      ;(column as any).reload?.()
      showSuccess(getString('cv.admin.notifications.deleteSuccess'))
    } catch (e) {
      showError(e.message)
    }
  }

  return (
    <Layout.Horizontal>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.RIGHT_TOP}
      >
        <Button
          minimal
          icon="main-more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item icon="edit" text="Edit" onClick={() => openNotificationModal(true, rowData)} />
          <Menu.Item icon="trash" text="Delete" onClick={handleDelete} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const RenderNotificationSwitch: Renderer<CellProps<AlertRuleDTO>> = ({ row }) => {
  const rowData = row.original
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const [enableNotification, setEnableNotification] = useState<boolean>(!!rowData.enabled)

  const { mutate: updateAlert } = useUpdateAlert({ queryParams: { accountId, projectIdentifier, orgIdentifier } })

  const handleUpdate = async (data: any) => {
    try {
      await updateAlert(data)
      showSuccess(getString('cv.admin.notifications.updateSuccess'))
    } catch (e) {
      showError(e.message)
    }
  }
  return (
    <Switch
      checked={enableNotification}
      onChange={e => {
        setEnableNotification(e.currentTarget.checked)
        handleUpdate({ ...rowData, enabled: e.currentTarget.checked })
      }}
    />
  )
}

const RenderNameColumn: Renderer<CellProps<AlertRuleDTO>> = ({ row }) => {
  const rowData = row.original

  return (
    <Layout.Horizontal>
      <Text color={Color.BLACK} className={css.maxWidthCol} lineClamp={1}>
        {rowData.name}
      </Text>
    </Layout.Horizontal>
  )
}
const RenderConditions: Renderer<CellProps<AlertRuleDTO>> = ({ row }) => {
  const rowData = row.original
  const { getString } = useStrings()

  return (
    <Layout.Horizontal>
      <Text padding={{ right: 'medium' }} color={Color.BLUE_500}>
        {rowData.alertCondition?.services?.length}{' '}
        {`${getString('service')}${pluralize(rowData.alertCondition?.services?.length || 0)}`}
      </Text>

      {rowData.alertCondition?.enabledVerifications ? (
        <Layout.Horizontal>
          <Icon name="tick" color={Color.BLUE_500} />
          <Text padding={{ left: 'xsmall', right: 'medium' }} color={Color.BLACK}>
            {getString('cv.admin.notifications.create.stepThree.verification')}
          </Text>
        </Layout.Horizontal>
      ) : null}
      {rowData.alertCondition?.enabledRisk ? (
        <Layout.Horizontal>
          <Icon name="tick" color={Color.BLUE_500} />
          <Text padding={{ left: 'xsmall' }} color={Color.BLACK}>
            {getString('risk')}
          </Text>
        </Layout.Horizontal>
      ) : null}
    </Layout.Horizontal>
  )
}

const CVNotificationTable: React.FC<CVNotificationTableProps> = props => {
  const { data, reload, gotoPage } = props
  const { getString } = useStrings()

  const listData: AlertRuleDTO[] = useMemo(() => data?.content || [], [data?.content])
  const columns: CustomColumn<AlertRuleDTO>[] = useMemo(
    () => [
      {
        Header: getString('enabledLabel'),
        accessor: 'enabled',
        width: '10%',
        Cell: RenderNotificationSwitch,

        disableSortBy: true
      },
      {
        Header: getString('cv.admin.notifications.name'),
        accessor: 'name',

        width: '25%',
        Cell: RenderNameColumn,
        disableSortBy: true
      },
      {
        Header: getString('conditions'),
        accessor: 'alertCondition',

        width: '30%',
        Cell: RenderConditions,

        disableSortBy: true
      },
      {
        Header: getString('cv.admin.notifications.method'),
        accessor: 'notificationMethod',

        width: '30%',
        Cell: RenderNotificationMethod,
        disableSortBy: true
      },
      {
        Header: '',
        accessor: 'identifier',
        width: '5%',

        Cell: RenderColumnMenu,
        reload: reload,
        disableSortBy: true
      }
    ],
    [reload]
  )

  return (
    <Table<AlertRuleDTO>
      columns={columns}
      data={listData || []}
      pagination={{
        itemCount: data?.totalItems || 0,
        pageSize: data?.pageSize || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default CVNotificationTable
