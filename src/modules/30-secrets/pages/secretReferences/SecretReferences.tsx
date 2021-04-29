import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Container, ExpandingSearchInput } from '@wings-software/uicore'
import {
  useListReferredByEntities,
  ResponsePageEntitySetupUsageDTO,
  ResponseSecretResponseWrapper
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { OrgPathProps, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import SecretReferencesList from './views/SecretReferencesListView/SecretReferencesList'
import css from './SecretReferences.module.scss'

interface ReferencedByProps {
  mockData?: UseGetMockData<ResponsePageEntitySetupUsageDTO>
  secretData?: ResponseSecretResponseWrapper
}
const SecretReferences: React.FC<ReferencedByProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier, secretId } = useParams<
    OrgPathProps & ProjectPathProps & SecretsPathProps
  >()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  useDocumentTitle([
    getString('secrets.references'),
    props.secretData?.data?.secret.name || '',
    getString('common.secrets')
  ])

  const { data, loading, refetch, error } = useListReferredByEntities({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      identifier: secretId,
      referredEntityType: 'Secrets',
      searchTerm: searchTerm,
      pageIndex: page,
      pageSize: 10
    },
    debounce: 300,
    mock: props.mockData
  })

  return (
    <>
      <PageHeader
        size="standard"
        title={getString('secrets.references')}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="small">
              <ExpandingSearchInput
                placeholder={getString('projectSelector.placeholder')}
                onChange={text => {
                  setPage(0)
                  setSearchTerm(text.trim())
                }}
                className={css.search}
              />
            </Layout.Horizontal>
          </Container>
        }
      />
      <PageBody
        loading={loading}
        retryOnError={() => refetch()}
        error={(error?.data as Error)?.message || error?.message}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('secrets.noRefData')
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('entityReference.noRecordFound')
              }
        }
      >
        <SecretReferencesList secrets={data?.data} gotoPage={pageNumber => setPage(pageNumber)} />
      </PageBody>
    </>
  )
}

export default SecretReferences
