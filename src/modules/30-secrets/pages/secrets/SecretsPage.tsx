import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Popover, Icon, TextInput, Container } from '@wings-software/uicore'
import { Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useListSecretsV2, ResponsePageSecretResponseWrapper, Error } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/strings'

import type { UseGetMockData } from '@common/utils/testUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { Module, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import SecretsList from './views/SecretsListView/SecretsList'

import i18n from './SecretsPage.i18n'
import css from './SecretsPage.module.scss'

interface SecretsPageProps {
  module?: Module
  mock?: UseGetMockData<ResponsePageSecretResponseWrapper>
}

const SecretsPage: React.FC<SecretsPageProps> = ({ module, mock }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  const [openPopOver, setOpenPopOver] = useState<boolean>(false)
  useDocumentTitle(getString('common.secrets'))

  const { data: secretsResponse, loading, error, refetch } = useListSecretsV2({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      orgIdentifier,
      projectIdentifier
    },
    debounce: 300,
    mock
  })

  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: /* istanbul ignore next */ () => {
      refetch()
    }
  })
  const { openCreateSSHCredModal } = useCreateSSHCredModal({
    onSuccess: /* istanbul ignore next */ () => {
      refetch()
    }
  })

  return (
    <div className={css.page}>
      <Layout.Horizontal flex className={css.header}>
        <Layout.Horizontal spacing="small">
          <Popover minimal position={Position.BOTTOM_LEFT} interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}>
            <RbacButton
              intent="primary"
              text={i18n.newSecret.button}
              icon="plus"
              rightIcon="chevron-down"
              permission={{
                permission: PermissionIdentifier.UPDATE_SECRET,
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                }
              }}
              onClick={() => {
                setOpenPopOver(true)
              }}
            />
            {openPopOver && (
              <Menu large>
                <Menu.Item
                  text={i18n.newSecret.text}
                  labelElement={<Icon name="text" />}
                  onClick={/* istanbul ignore next */ () => openCreateSecretModal('SecretText')}
                />
                <Menu.Item
                  text={i18n.newSecret.file}
                  labelElement={<Icon name="document" color="blue600" />}
                  onClick={/* istanbul ignore next */ () => openCreateSecretModal('SecretFile')}
                />
                <Menu.Item
                  text={i18n.newSecret.ssh}
                  labelElement={<Icon name="secret-ssh" />}
                  onClick={/* istanbul ignore next */ () => openCreateSSHCredModal()}
                />
              </Menu>
            )}
          </Popover>
          <RbacButton
            text={getString('createViaYaml')}
            onClick={
              /* istanbul ignore next */ () => {
                history.push(routes.toCreateSecretFromYaml({ accountId, orgIdentifier, projectIdentifier, module }))
              }
            }
            permission={{
              permission: PermissionIdentifier.UPDATE_SECRET,
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }}
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small">
          <TextInput
            leftIcon="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value.trim())
              setPage(0)
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>

      {loading ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : error ? (
        <div style={{ paddingTop: '200px' }}>
          <PageError
            message={(error.data as Error)?.message || error.message}
            onClick={/* istanbul ignore next */ () => refetch()}
          />
        </div>
      ) : !secretsResponse?.data?.empty ? (
        <SecretsList
          secrets={secretsResponse?.data}
          refetch={refetch}
          gotoPage={/* istanbul ignore next */ pageNumber => setPage(pageNumber)}
        />
      ) : (
        <Container flex={{ align: 'center-center' }} padding="xxlarge">
          No Data
        </Container>
      )}
    </div>
  )
}

export default SecretsPage
