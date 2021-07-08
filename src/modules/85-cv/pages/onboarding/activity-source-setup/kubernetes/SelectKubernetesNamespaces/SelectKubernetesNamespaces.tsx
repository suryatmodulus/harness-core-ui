import React, { useState } from 'react'
import { Color, Container, Heading, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { PageError } from '@common/components/Page/PageError'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import { useStrings } from 'framework/strings'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { useGetNamespaces } from 'services/cv'
import { PageSpinner, Table } from '@common/components'
import type { KubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import css from './SelectKubernetesNamespaces.module.scss'

interface SelectKubernetesNamespacesProps {
  onSubmit: (data: KubernetesActivitySourceInfo) => void
  onPrevious: () => void
  data?: KubernetesActivitySourceInfo
}

type TableData = { selected: boolean; namespace: string }

function validate(selectedNamespaces: Set<string>): boolean {
  return selectedNamespaces?.size > 0
}

function generateTableData(apiData: string[], selectedNamespaces?: Set<string>): TableData[] {
  const tableData = []
  for (const namespace of apiData) {
    tableData.push({
      selected: Boolean(selectedNamespaces?.has(namespace)),
      namespace
    })
  }

  return tableData
}

function NamespaceValue(tableProps: CellProps<TableData>): JSX.Element {
  const namespace = tableProps.value
  return (
    <Text
      icon="service-kubernetes"
      iconProps={{ size: 20, style: { marginRight: 'var(--spacing-small)' } }}
      color={Color.BLACK}
    >
      {namespace}
    </Text>
  )
}

export function SelectKubernetesNamespaces(props: SelectKubernetesNamespacesProps): JSX.Element {
  const { onSubmit, onPrevious, data: propsData } = props
  const [selectedNamespaces, setSelectedNamespaces] = useState(new Set<string>(propsData?.selectedNamespaces || []))
  const [isValid, setIsValid] = useState(true)
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [{ pageOffset, filteredNamespace }, setFilterAndPageOffset] = useState<{
    pageOffset: number
    filteredNamespace?: string
  }>({
    pageOffset: 0,
    filteredNamespace: undefined
  })
  const {
    loading,
    error,
    data,
    refetch: refetchNamespaces
  } = useGetNamespaces({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountId,
      connectorIdentifier: (propsData?.connectorRef?.value as string) || '',
      pageSize: 8,
      filter: filteredNamespace,
      offset: pageOffset
    }
  })

  if (loading) {
    return (
      <Container className={css.loading}>
        <PageSpinner />
      </Container>
    )
  }

  const { content, pageIndex = 0, totalItems = 0, totalPages = 0, pageSize = 0 } = data?.data || {}
  const nameSpaces = generateTableData(content || [], selectedNamespaces)
  return (
    <Container>
      <Container className={css.main}>
        <Heading level="3" color={Color.BLACK}>
          {getString('cv.activitySources.kubernetes.namespaceMapping.headingText')}
        </Heading>
        <TableFilter
          appliedFilter={filteredNamespace}
          onFilter={namespaceSubstring =>
            setFilterAndPageOffset({ pageOffset: 0, filteredNamespace: namespaceSubstring })
          }
          className={css.searchNamespaces}
          placeholder={getString('cv.activitySources.kubernetes.namespaceMapping.searchNamespacePlaceholder')}
        />
        <Table<TableData>
          className={css.table}
          columns={[
            {
              accessor: 'selected',
              width: '5%',
              Cell: function CheckColumn(tableProps: CellProps<TableData>) {
                const namespace = tableProps.row.original?.namespace
                const isChecked = selectedNamespaces.has(namespace)
                return (
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (isChecked && !e.currentTarget.checked) {
                        selectedNamespaces.delete(namespace)
                      } else if (!isChecked && e.currentTarget.checked) {
                        selectedNamespaces.add(namespace)
                      }
                      setSelectedNamespaces(new Set(selectedNamespaces))
                    }}
                  />
                )
              },
              disableSortBy: true
            },
            {
              Header: getString('cv.activitySources.kubernetes.reviewPage.reviewTableColumns.namespace'),
              accessor: 'namespace',
              width: '95%',
              Cell: NamespaceValue,
              disableSortBy: true
            }
          ]}
          data={nameSpaces}
          onRowClick={rowData => {
            const { namespace } = rowData
            if (selectedNamespaces.has(namespace)) selectedNamespaces.delete(namespace)
            else selectedNamespaces.add(namespace)
            setSelectedNamespaces(new Set(selectedNamespaces))
          }}
          sortable={true}
          pagination={{
            pageSize: pageSize || 0,
            pageIndex: pageIndex,
            pageCount: totalPages,
            itemCount: totalItems,
            gotoPage: newPageIndex => setFilterAndPageOffset({ pageOffset: newPageIndex, filteredNamespace })
          }}
        />
        {error?.data && (
          <Container className={css.noDataError}>
            <PageError message={getErrorMessage(error)} onClick={() => refetchNamespaces()} />
          </Container>
        )}
        {!error?.data && !content?.length && (
          <Container className={css.noDataError}>
            <NoDataCard
              icon="warning-sign"
              message={getString('cv.activitySources.kubernetes.namespaceMapping.noNamespaces')}
              buttonText={getString('retry')}
              onClick={() => refetchNamespaces()}
            />
          </Container>
        )}
        {!isValid ? (
          <Text data-name="validation" intent="danger">
            {getString('cv.activitySources.kubernetes.namespaceMapping.validateNamespace')}
          </Text>
        ) : null}
      </Container>
      <SubmitAndPreviousButtons
        onPreviousClick={onPrevious}
        onNextClick={() => {
          if (!validate(selectedNamespaces)) setIsValid(false)
          else
            onSubmit({
              ...propsData,
              selectedNamespaces: Array.from(selectedNamespaces.values())
            } as KubernetesActivitySourceInfo)
        }}
      />
    </Container>
  )
}
