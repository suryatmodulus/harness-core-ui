import React from 'react'
import { Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetSelectionLogsV2 } from 'services/portal'
import { useStrings, String } from 'framework/exports'
import { PageSpinner } from '..'
import DelegateSelectionLogsTable from './DelegateSelectionLogsTable'

export interface DelegateSelectionLogsTaskProps {
  taskId: string
  taskName: string
  delegateName: string
}
const PAGE_SIZE = 5

export function DelegateSelectionLogsTask({
  taskId,
  taskName,
  delegateName
}: DelegateSelectionLogsTaskProps): JSX.Element {
  const { accountId } = useParams<{
    accountId: string
  }>()

  const [page, setPage] = React.useState(0)
  const { getString } = useStrings()

  const { data, loading } = useGetSelectionLogsV2({ queryParams: { accountId, taskId } })
  if (loading) {
    return <PageSpinner />
  }

  return (
    <>
      {data?.resource?.delegateSelectionLogs && data?.resource?.delegateSelectionLogs.length > 0 ? (
        <>
          <Text>
            <String
              stringID="common.delegateForTask"
              vars={{ delegate: delegateName, taskName: taskName }}
              useRichText
            />
          </Text>
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
