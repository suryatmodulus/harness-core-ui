import React from 'react'
import { Text, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetSelectionLogsV2 } from 'services/portal'
import { String, useStrings } from 'framework/strings'
import type { DelegateTaskData } from '@common/components/DelegateSelectionLogs/DelegateSelectionLogs'
import { PageSpinner } from '..'
import DelegateSelectionLogsTable from './DelegateSelectionLogsTable'

export interface DelegateSelectionLogsTaskProps {
  task: DelegateTaskData
}
const PAGE_SIZE = 5

export function DelegateSelectionLogsTask({ task }: DelegateSelectionLogsTaskProps): JSX.Element {
  const { accountId } = useParams<{
    accountId: string
  }>()

  const [page, setPage] = React.useState(0)
  const { getString } = useStrings()

  const { data, loading } = useGetSelectionLogsV2({ queryParams: { accountId, taskId: task.taskId } })
  if (loading) {
    return <PageSpinner />
  }

  return (
    <>
      {data?.resource?.delegateSelectionLogs && data?.resource?.delegateSelectionLogs.length > 0 ? (
        <>
          <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
            <Text>
              <String
                stringID="common.delegateForTask"
                vars={{ delegate: task.delegateName, taskName: task.taskName }}
                useRichText
              />
            </Text>
            <Text>{getString('taskId', { id: task.taskId })}</Text>
          </Layout.Horizontal>

          <DelegateSelectionLogsTable
            pageIndex={page}
            pageCount={Math.ceil(data.resource.delegateSelectionLogs.length / PAGE_SIZE)}
            pageSize={PAGE_SIZE}
            itemCount={data.resource.delegateSelectionLogs.length}
            selectionLogs={data.resource.delegateSelectionLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
            gotoPage={setPage}
          />
        </>
      ) : (
        <Text>{getString('common.logs.noLogsText')}</Text>
      )}
    </>
  )
}
