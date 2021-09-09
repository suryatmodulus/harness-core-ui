import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Popover, Icon, ExpandingSearchInput, Container, ButtonVariation, Color } from '@wings-software/uicore'
import { Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useListSecretsV2, ResponsePageSecretResponseWrapper, Error } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { Page } from '@common/exports'
import SecretsList from './views/SecretsListView/SecretsList'

import SecretEmptyState from './secrets-empty-state.png'

import css from './SecretsPage.module.scss'

interface SecretsPageProps {
  mock?: UseGetMockData<ResponsePageSecretResponseWrapper>
}
interface CreateSecretBtnProp {
  setOpenPopOverProp: (val: boolean) => void
}

const SecretsPage: React.FC<SecretsPageProps> = ({ mock }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const history = useHistory()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  const [openPopOver, setOpenPopOver] = useState<boolean>(false)
  const [emptyStateOpenPopOver, setEmptyStateOpenPopOver] = useState<boolean>(false)
  useDocumentTitle(getString('common.secrets'))

  const {
    data: secretsResponse,
    loading,
    error,
    refetch
  } = useListSecretsV2({
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
  const CreateSecretBtn: React.FC<CreateSecretBtnProp> = ({ setOpenPopOverProp }) => {
    return (
      <RbacButton
        intent="primary"
        text={getString('secretType')}
        icon="plus"
        rightIcon="chevron-down"
        permission={{
          permission: PermissionIdentifier.UPDATE_SECRET,
          resource: {
            resourceType: ResourceType.SECRET
          }
        }}
        onClick={() => {
          setOpenPopOverProp(true)
        }}
        variation={ButtonVariation.PRIMARY}
      />
    )
  }
  const CreateSecretBtnMenu: React.FC = () => {
    return (
      <Menu large>
        <Menu.Item
          text={getString('secret.labelText')}
          labelElement={<Icon name="text" />}
          onClick={/* istanbul ignore next */ () => openCreateSecretModal('SecretText')}
        />
        <Menu.Item
          text={getString('secret.labelFile')}
          labelElement={<Icon name="document" color={Color.BLUE_600} />}
          onClick={/* istanbul ignore next */ () => openCreateSecretModal('SecretFile')}
        />
        <Menu.Item
          text={getString('ssh.sshCredential')}
          labelElement={<Icon name="secret-ssh" />}
          onClick={/* istanbul ignore next */ () => openCreateSSHCredModal()}
        />
      </Menu>
    )
  }
  return (
    <>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('common.secrets')} />
      <Layout.Horizontal flex className={css.header}>
        <Layout.Horizontal spacing="small">
          <Popover minimal position={Position.BOTTOM_LEFT} interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}>
            <CreateSecretBtn setOpenPopOverProp={setOpenPopOver} />
            {openPopOver && <CreateSecretBtnMenu />}
          </Popover>

          <RbacButton
            text={getString('createViaYaml')}
            minimal
            onClick={
              /* istanbul ignore next */ () => {
                history.push(routes.toCreateSecretFromYaml({ accountId, orgIdentifier, projectIdentifier, module }))
              }
            }
            permission={{
              permission: PermissionIdentifier.UPDATE_SECRET,
              resource: {
                resourceType: ResourceType.SECRET
              },
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }}
            variation={ButtonVariation.SECONDARY}
          />
        </Layout.Horizontal>
        <ExpandingSearchInput
          alwaysExpanded
          onChange={text => {
            setSearchTerm(text.trim())
            setPage(0)
          }}
          width={250}
        />
      </Layout.Horizontal>
      <Page.Body
        className={css.body}
        noData={{
          when: () => !loading && !searchTerm && !secretsResponse?.data?.content?.length,
          image: SecretEmptyState,
          message: getString('secrets.noSecrets', { resourceName: projectIdentifier ? 'project' : 'organization' }),
          button: (
            <Popover minimal position={Position.BOTTOM_LEFT} interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}>
              <CreateSecretBtn setOpenPopOverProp={setEmptyStateOpenPopOver} />
              {emptyStateOpenPopOver && <CreateSecretBtnMenu />}
            </Popover>
          )
        }}
      >
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
      </Page.Body>
    </>
  )
}

export default SecretsPage
