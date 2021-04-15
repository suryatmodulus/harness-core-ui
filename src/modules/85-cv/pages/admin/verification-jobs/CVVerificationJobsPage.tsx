import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { PopoverInteractionKind, Tooltip } from '@blueprintjs/core'
import { Container, Icon, Text, Color, Button, TextInput } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { Page, useToaster } from '@common/exports'
import { useStrings, String } from 'framework/exports'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetVerificationJobs,
  useDeleteVerificationJob,
  VerificationJobDTO,
  DeleteVerificationJobQueryParams
} from 'services/cv'
import Table from '@common/components/Table/Table'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { CopyText } from '@common/components/CopyText/CopyText'
import ContextMenuActions from '../../../components/ContextMenuActions/ContextMenuActions'
import styles from './CVVerificationJobsPage.module.scss'

const ENV_IDENTIFIER = '${envIdentifier}'
const SERVICE_IDENTIFIER = '${serviceIdentifier}'

export default function CVVerificationJobsPage() {
  const { getString } = useStrings()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const { showError, clear } = useToaster()
  const [textFilter, setTextFilter] = useState('')
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const { data, loading, error, refetch } = useGetVerificationJobs({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      offset: page,
      pageSize: 10,
      filter: textFilter
    },
    debounce: 400
  })

  const { mutate: deleteVerificationJob, loading: isDeleting } = useDeleteVerificationJob({})

  const onCreateNew = () =>
    history.push(
      routes.toCVAdminSetupVerificationJob({
        accountId,
        projectIdentifier,
        orgIdentifier
      })
    )

  const onEdit = (verificationId: string) =>
    history.push(
      routes.toCVAdminSetupVerificationJobEdit({
        accountId,
        projectIdentifier,
        orgIdentifier,
        verificationId
      })
    )

  const onDelete = async (identifier?: string) => {
    try {
      await deleteVerificationJob('' as any, {
        queryParams: { accountId, identifier, projectIdentifier, orgIdentifier } as DeleteVerificationJobQueryParams
      })
      const { pageItemCount, pageIndex } = (data?.data ?? {}) as any // TODO - swagger issue, remove when fixed
      if (pageIndex! > 0 && pageItemCount === 1) {
        setPage(page - 1)
      } else {
        refetch()
      }
    } catch (e) {
      if (e?.data) {
        clear()
        showError(getErrorMessage(e))
      }
    }
  }

  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.data ?? ({} as any)

  return (
    <>
      <Page.Header
        title={
          <Breadcrumbs
            links={[
              {
                url: routes.toCVProjectOverview({ accountId, projectIdentifier, orgIdentifier }),
                label: projectIdentifier
              },
              {
                url: '#',
                label: getString('verificationJobs')
              }
            ]}
          />
        }
        toolbar={
          <TextInput
            leftIcon="search"
            placeholder={getString('cv.admin.monitoringSources.searchPlaceholder')}
            className={styles.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPage(0)
              setTextFilter(e.target.value.trim())
            }}
          />
        }
      />
      <Page.Body
        className={styles.main}
        error={getErrorMessage(error)}
        noData={{
          when: () => !loading && !content?.length,
          icon: 'warning-sign',
          buttonText: getString('cv.admin.verificationJobs.newVerificationJob'),
          message: getString('cv.admin.verificationJobs.noDataMessage'),
          onClick: onCreateNew
        }}
      >
        <Button
          intent="primary"
          icon="plus"
          text={getString('cv.admin.verificationJobs.newVerificationJob')}
          margin={{ bottom: 'small' }}
          onClick={onCreateNew}
        />
        {(loading || isDeleting) && <PageSpinner />}
        <Table<VerificationJobDTO>
          onRowClick={val => {
            if (!val.defaultJob) onEdit(val.identifier!)
          }}
          columns={[
            {
              Header: getString('name'),
              width: '15%',
              accessor: 'jobName',
              Cell: TableCell
            },
            {
              Header: getString('typeLabel'),
              width: '5%',
              accessor: 'type',
              Cell: TypeCell
            },
            {
              Header: getString('services'),
              width: '12%',
              accessor: 'serviceIdentifier',
              Cell: TableCell
            },
            {
              Header: getString('environment'),
              width: '12%',
              accessor: 'envIdentifier',
              Cell: TableCell
            },
            {
              Header: getString('changeSource'),
              width: '12%',
              accessor: 'activitySourceIdentifier',
              Cell: ChangeSourceCell
            },
            {
              Header: getString('duration'),
              width: '10%',
              accessor: 'duration',
              Cell: TableCell
            },
            {
              Header: getString('execution.triggerType.WEBHOOK'),
              width: '33%',
              Cell: function WebHookCellWrapper(props: CellProps<VerificationJobDTO>) {
                return (
                  <WebHookCell
                    {...props}
                    onDelete={() => onDelete(props.row.original?.identifier)}
                    onEdit={() => onEdit(props.row.original?.identifier!)}
                  />
                )
              }
            }
          ]}
          data={content || []}
          pagination={{
            pageSize,
            pageIndex,
            pageCount: totalPages,
            itemCount: totalItems,
            gotoPage: setPage
          }}
        />
      </Page.Body>
    </>
  )
}

function TableCell(tableProps: CellProps<VerificationJobDTO>): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={styles.tableCell}>
      <Text lineClamp={1} color={Color.BLACK}>
        {tableProps.value === SERVICE_IDENTIFIER || tableProps.value === ENV_IDENTIFIER
          ? getString('all')
          : tableProps.value}
      </Text>
    </Container>
  )
}

function ChangeSourceCell(tableProps: CellProps<VerificationJobDTO>): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={styles.tableCell}>
      <Text lineClamp={1} color={Color.BLACK}>
        {tableProps.row.original?.defaultJob ? getString('all') : tableProps.value}
      </Text>
    </Container>
  )
}

function TypeCell(tableProps: CellProps<VerificationJobDTO>): JSX.Element {
  const iconProps = {
    size: 18
  }
  switch (tableProps.value) {
    case 'TEST':
      return (
        <Tooltip
          interactionKind={PopoverInteractionKind.HOVER}
          content={<String stringID="cv.admin.verificationJobs.jobTypes.test" />}
        >
          <Icon name="lab-test" {...iconProps} />
        </Tooltip>
      )
    case 'CANARY':
      return (
        <Tooltip
          interactionKind={PopoverInteractionKind.HOVER}
          content={<String stringID="cv.admin.verificationJobs.jobTypes.canary" />}
        >
          <Icon name="canary-outline" {...iconProps} />
        </Tooltip>
      )
    case 'BLUE_GREEN':
      return (
        <Tooltip
          interactionKind={PopoverInteractionKind.HOVER}
          content={<String stringID="cv.admin.verificationJobs.jobTypes.blueGreen" />}
        >
          <Icon name="bluegreen" {...iconProps} />
        </Tooltip>
      )
    case 'HEALTH':
      return (
        <Tooltip
          interactionKind={PopoverInteractionKind.HOVER}
          content={<String stringID="cv.admin.verificationJobs.jobTypes.health" />}
        >
          <Icon name="health" {...iconProps} />
        </Tooltip>
      )
    default:
      return <Text />
  }
}

function WebHookCell(tableProps: CellProps<VerificationJobDTO> & { onDelete(): void; onEdit(): void }): JSX.Element {
  const { getString } = useStrings()
  const transformWebhookUrl = (url: string) => {
    if (url && url.startsWith('/')) {
      return location.origin + url
    } else {
      return url
    }
  }
  const webhookUrl = transformWebhookUrl(tableProps.row.original.verificationJobUrl!)
  return (
    <Container flex>
      <Container className={styles.webhook} onClick={e => e.stopPropagation()}>
        {tableProps.row.original?.defaultJob ? (
          getString('cv.admin.verificationJobs.cantBeCopied')
        ) : (
          <CopyText textToCopy={webhookUrl}>{webhookUrl}</CopyText>
        )}
      </Container>
      {!tableProps.row.original?.defaultJob ? (
        <ContextMenuActions
          titleText={getString('cv.admin.verificationJobs.confirmDeleteTitle')}
          contentText={
            getString('cv.admin.verificationJobs.confirmDeleteContent', {
              jobName: tableProps.row.original.jobName
            }) + '?'
          }
          onDelete={tableProps.onDelete}
          onEdit={tableProps.onEdit}
        />
      ) : null}
    </Container>
  )
}
