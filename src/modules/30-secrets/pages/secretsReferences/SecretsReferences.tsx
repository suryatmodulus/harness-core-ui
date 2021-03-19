import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Container, Color ,Text,ExpandingSearchInput} from '@wings-software/uicore'
import { useListSecretsV2, ResponsePageSecretResponseWrapper, Error } from 'services/cd-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/exports'
import { PageHeader } from '@common/components/Page/PageHeader'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { Module } from '@common/interfaces/RouteInterfaces'
import SecretsReferencesList from './views/SecretsReferencesListView/SecretsReferencesList'
import mockData from './SecretsReferencesMock.json'
import css from './SecretsReferences.module.scss'
interface SecretsPageProps {
  module?: Module
  mock?: UseGetMockData<ResponsePageSecretResponseWrapper>
}

const SecretsReferences: React.FC<SecretsPageProps> = ({ module, mock }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  useDocumentTitle([getString('resources'), getString('secrets'),getString('references')])

  const { data: secretsResponse, loading, error, refetch } = useListSecretsV2({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: searchTerm,
      pageIndex: page,
      pageSize: 10,
      orgIdentifier,
      projectIdentifier
    },
    debounce: 300,
    mock
  })
  

  return (
    <div>
      <PageHeader
      size="standard"
        title={
          <Layout.Horizontal>
            <Text font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('references')}
            </Text>
          </Layout.Horizontal>
        }
        toolbar={
          <Container>
            <Layout.Horizontal spacing="small">
           <ExpandingSearchInput
                placeholder={getString('projectSelector.placeholder')}
                onChange={text => {
                  setSearchTerm(text.trim())
                }}
                className={css.search}
              />
            </Layout.Horizontal>
          </Container>
        }
      />
      {/* {loading ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : error ? (
        <div style={{ paddingTop: '200px' }}>
          <PageError
            message={(error.data as Error)?.message || error.message}
            onClick={() => refetch()}
          />
        </div>
      ) : !secretsResponse?.data?.empty ? (
        <SecretsReferencesList
          secrets={secretsResponse?.data}
          refetch={refetch}
          gotoPage={pageNumber => setPage(pageNumber)}
        />
      ) : (
        <Container flex={{ align: 'center-center' }} padding="xxlarge">
           { getString('noData')}
        </Container>
      )} */}
      {mockData.loading ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : error ? (
        <div style={{ paddingTop: '200px' }}>
          <PageError
            message={(error.data as Error)?.message || error.message}
            onClick={() => refetch()}
          />
        </div>
      ) : mockData.data?.empty ? (
        <SecretsReferencesList
          secrets={mockData.data}
          refetch={refetch}
          gotoPage={pageNumber => setPage(pageNumber)}
        />
      ) : (
        <SecretsReferencesList
          secrets={mockData.data}
          refetch={refetch}
          gotoPage={pageNumber => setPage(pageNumber)}
        />
      )}
    </div>
  )
}

export default SecretsReferences
