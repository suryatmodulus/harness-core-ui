import React, { useContext, useMemo, useRef, useState } from 'react'
import { Tabs, Tab, Text, Container, Layout, Button, Heading, Color, Utils, Pagination } from '@wings-software/uicore'
import { get } from 'lodash-es'
import type { Column } from 'react-table'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { ApiKey, useGetAllAPIKeys, useDeleteApiKey } from 'services/cf'
import { useToaster } from '@common/exports'
import Table from '@common/components/Table/Table'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import { useEnvStrings } from '@cf/hooks/environment'
import { CF_DEFAULT_PAGE_SIZE, EnvironmentSDKKeyType, getErrorMessage } from '@cf/utils/CFUtils'
import { withTableData } from '../../utils/table-utils'
import AddKeyDialog from '../../components/AddKeyDialog/AddKeyDialog'
import css from './EnvironmentDetails.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T>

type RowFunctions = {
  isNew: (id: string) => boolean
  onDelete: (id: string) => void
  getSecret: (id: string, fallback: string) => string
}
const defaultContext = { isNew: () => false, onDelete: () => false, getSecret: () => '' }
const RowContext = React.createContext<RowFunctions>(defaultContext)

const withApiKey = withTableData<ApiKey, { apiKey: ApiKey }>(({ row }) => ({ apiKey: row.original }))

const NameCell = withApiKey(({ apiKey }) => <Text font={{ weight: 'bold' }}>{apiKey.name}</Text>)
const TypeCell = withApiKey(({ apiKey }) => {
  const { getEnvString } = useEnvStrings()

  return <Text>{getEnvString(`apiKeys.${apiKey.type.toLowerCase()}Type`)}</Text>
})

const ApiInfoCell = withApiKey(({ apiKey }) => {
  const { isNew, onDelete, getSecret } = useContext(RowContext) ?? defaultContext
  const { getString, getEnvString } = useEnvStrings()
  const { showSuccess, showError } = useToaster()
  const textRef = useRef<HTMLDivElement>(null)
  const showCopy = isNew(apiKey.identifier) || apiKey.type === EnvironmentSDKKeyType.CLIENT

  const handleCopy = () => {
    if (textRef.current) {
      Utils.copy(textRef.current.innerText)
        .then(() => showSuccess(getString('clipboardCopySuccess')))
        .catch(() => showError(getString('clipboardCopyFail')))
    }
  }

  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
        <Text font={{ weight: 'bold' }}>
          {apiKey.type === EnvironmentSDKKeyType.CLIENT ? getEnvString(`apiKeys.clientId`) : getString('secretType')}
        </Text>
        {showCopy ? (
          <div ref={textRef}>
            <Text
              font={{ mono: true }}
              rightIcon="main-clone"
              rightIconProps={{
                onClick: handleCopy,
                color: Color.GREY_350,
                style: { cursor: 'pointer', marginLeft: 'var(--spacing-small)' }
              }}
              padding="small"
              style={{ borderRadius: '4px', backgroundColor: '#F3F3FA' }}
            >
              {getSecret(apiKey.identifier, apiKey.apiKey)}
            </Text>
          </div>
        ) : (
          <Text>{apiKey.apiKey}</Text>
        )}
      </Layout.Horizontal>
      <Container>
        <Button
          minimal
          icon="trash"
          iconProps={{
            size: 16
          }}
          style={{ color: 'var(--grey-300)' }}
          tooltip={
            <Container width="350px" padding="medium">
              <Heading level={2} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getEnvString('apiKeys.deleteTitle')}
              </Heading>
              <Text margin={{ bottom: 'medium' }}>
                {getEnvString('apiKeys.deleteMessage', { keyName: apiKey.name })}
              </Text>
              <Container flex>
                <span />
                <Layout.Horizontal spacing="small">
                  <Button text={getString('cancel')} className="bp3-popover-dismiss" />
                  <Button
                    intent="danger"
                    text={getString('delete')}
                    className="bp3-popover-dismiss"
                    onClick={() => onDelete(apiKey.identifier)}
                  />
                </Layout.Horizontal>
              </Container>
            </Container>
          }
          tooltipProps={{
            interactionKind: 'click'
          }}
        />
      </Container>
    </Layout.Horizontal>
  )
})

const EnvironmentSDKKeys: React.FC<{ environment: EnvironmentResponseDTO }> = ({ environment }) => {
  const { showSuccess, showError } = useToaster()
  const { getString, getEnvString } = useEnvStrings()
  const [recents, setRecents] = useState<ApiKey[]>([])
  const [page, setPage] = useState<number>(0)

  const queryParams = {
    project: environment.projectIdentifier as string,
    environment: environment.identifier as string,
    account: environment.accountId as string,
    accountIdentifier: environment.accountId as string,
    org: environment.orgIdentifier as string
  }

  const { data, loading, error, refetch } = useGetAllAPIKeys({
    queryParams: {
      ...queryParams,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber: page
    }
  })

  const { mutate: deleteKey } = useDeleteApiKey({ queryParams })
  const handleDelete = (id: string) => {
    deleteKey(id)
      .then(() => showSuccess(`Succesfuly deleted Key: ${id}`))
      .then(() => refetch())
      .catch(deleteError => showError(get(deleteError, 'data.error', deleteError?.message)))
  }

  const { apiKeys, ...pagination } = data ?? {
    itemCount: 0,
    pageCount: 0,
    pageIndex: 0,
    pageSize: CF_DEFAULT_PAGE_SIZE
  }
  const hasData = !error && !loading && (apiKeys || []).length > 0
  const emptyData = !error && !loading && (apiKeys || []).length === 0

  const columns: CustomColumn<ApiKey>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'name',
        width: '35%',
        Cell: NameCell
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        accessor: 'type',
        width: '10%',
        Cell: TypeCell
      },
      {
        id: 'info',
        width: '55%',
        Cell: ApiInfoCell
      }
    ],
    []
  )

  return (
    <Container width="100%" height="calc(100vh - 174px)">
      {hasData && (
        <Layout.Vertical
          padding={{ top: 'xxxlarge', left: 'xxlarge' }}
          style={{ justifyContent: 'flex-start', alignItems: 'flex-start', height: '100%', overflow: 'hidden' }}
        >
          <Heading
            level={2}
            style={{
              display: 'flex',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '22px',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              paddingRight: 'var(--spacing-large)'
            }}
            color={Color.BLACK}
          >
            <span style={{ flexGrow: 1 }}>{getEnvString('apiKeys.title')}</span>
            <AddKeyDialog
              environment={environment}
              onCreate={(newKey: ApiKey, hideCreate) => {
                setRecents([...recents, newKey])
                hideCreate()
                refetch()
              }}
            />
          </Heading>
          <Text style={{ color: '#22222A' }} padding={{ top: 'small', bottom: 'xxlarge' }}>
            {getEnvString('apiKeys.message')}
          </Text>
          <Container className={css.content}>
            <Container className={css.table}>
              <RowContext.Provider
                value={{
                  isNew: (id: string) => Boolean(recents.find(r => r.identifier === id)),
                  onDelete: handleDelete,
                  getSecret: (id: string, fallback: string) =>
                    recents.find(r => r.identifier === id)?.apiKey || fallback
                }}
              >
                <Table<ApiKey> data={(apiKeys || []) as ApiKey[]} columns={columns} />
              </RowContext.Provider>
            </Container>
            {!!pagination.itemCount && (
              <Container className={css.paginationContainer}>
                <Pagination
                  itemCount={pagination.itemCount}
                  pageCount={pagination.pageCount}
                  pageIndex={pagination.pageIndex}
                  pageSize={CF_DEFAULT_PAGE_SIZE}
                  gotoPage={(index: number) => {
                    setPage(index)
                    refetch({ queryParams: { ...queryParams, pageNumber: index } })
                  }}
                />
              </Container>
            )}
          </Container>
        </Layout.Vertical>
      )}

      {emptyData && (
        <Layout.Vertical
          spacing="medium"
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <Text>{getEnvString('apiKeys.noKeysFound')}</Text>
          <AddKeyDialog
            primary
            environment={environment}
            onCreate={(newKey: ApiKey, hideCreate) => {
              setRecents([...recents, newKey])
              hideCreate()
              refetch()
            }}
          />
        </Layout.Vertical>
      )}

      {loading && (
        <Container
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <ContainerSpinner />
        </Container>
      )}

      {error && (
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            setPage(0)
            refetch()
          }}
        />
      )}
    </Container>
  )
}

const CFEnvironmentDetailsBody: React.FC<{
  environment: EnvironmentResponseDTO
}> = ({ environment }) => {
  return (
    <Container className={css.envTabs}>
      <Tabs id="envDetailsTabs">
        <Tab id="settings" title="Settings" panel={<EnvironmentSDKKeys environment={environment} />} />
      </Tabs>
    </Container>
  )
}

export default CFEnvironmentDetailsBody
