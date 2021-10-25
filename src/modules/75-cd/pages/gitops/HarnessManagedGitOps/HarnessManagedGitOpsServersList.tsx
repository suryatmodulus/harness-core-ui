import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Text,
  useModalHook,
  ExpandingSearchInput,
  ButtonVariation,
  PageError,
  shouldShowError
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { PageSpinner } from '@common/components'

import { useAgentServiceList, AgentServiceListQueryParams, V1Agent, useAgentServiceDelete } from 'services/gitops'
import { useToaster, Page } from '@common/exports'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import NewGitOpsServerModal from './NewGitOpsServerModal/NewGitOpsServerModal'
import GitOpsServersGridView from './GitOpsServersGridView/GitOpsServersGridView'
import noGitOpsServersIllustration from '../images/noGitOpsServers.svg'

import css from './HarnessManagedGitOpsServersList.module.scss'

const GitOpsServersList: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

  const { showSuccess, showError } = useToaster()
  // Adding timeout to escape the timegap between loading set by useListGitOpsProviders and setting deleting to false
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeProvider, setActiveProvider] = useState<V1Agent | null>(null)
  const [page, setPage] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [editMode, setEditMode] = useState(false)
  const defaultQueryParams: AgentServiceListQueryParams = {
    pageIndex: page,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    accountIdentifier: accountId,
    searchTerm: '',
    type: 'MANAGED_ARGO_PROVIDER'
  }

  const { mutate: deleteAgent } = useAgentServiceDelete({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  useDocumentTitle(getString('cd.gitOps'))

  const handleEdit = (provider: V1Agent): void => {
    setActiveProvider(provider)
    setEditMode(true)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleDelete = async (provider: V1Agent): Promise<void> => {
    try {
      setDeleting(true)
      const deleted = await deleteAgent(provider?.identifier || '', {
        headers: { 'content-type': 'application/json' }
      })

      if (deleted) {
        refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm, pageIndex: 0 } })
        showSuccess(getString('cd.GitOpsServerDelete', { adapterName: provider?.name }))
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    } finally {
      timerRef.current = window.setTimeout(() => {
        setDeleting(false)
      }, 2000)
    }
  }

  const {
    data,
    loading,
    error: connectorFetchError,
    refetch: refetchConnectorList
  } = useAgentServiceList({
    queryParams: defaultQueryParams,
    debounce: 500
  })

  const [addNewProviderModal, closeNewProviderModal] = useModalHook(() => {
    const handleClose = (): void => {
      closeNewProviderModal()
      refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm /* pageIndex: 0 */ } })
    }

    return (
      <Dialog
        onClose={handleClose}
        isOpen={true}
        style={{
          width: 'auto',
          minWidth: 1175,
          height: 640,
          borderLeft: 0,
          paddingBottom: 0,
          position: 'relative',
          overflow: 'auto'
        }}
        enforceFocus={false}
      >
        <NewGitOpsServerModal
          isEditMode={editMode}
          onUpdateMode={(mode: boolean) => setEditMode(mode)}
          provider={activeProvider}
          onClose={handleClose}
        />
      </Dialog>
    )
  }, [activeProvider, editMode])

  /* Through page browsing */
  useEffect(() => {
    const updatedQueryParams: AgentServiceListQueryParams = {
      ...defaultQueryParams,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      pageIndex: page
    }
    refetchConnectorList({ queryParams: updatedQueryParams })
  }, [page, projectIdentifier, orgIdentifier])

  useEffect(() => {
    refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm, pageIndex: 0 } })
  }, [searchTerm])

  useEffect(() => {
    if (editMode && activeProvider) {
      addNewProviderModal()
    }
  }, [activeProvider, addNewProviderModal, editMode])

  /* Clearing filter from Connector Filter Panel */
  const reset = (): void => {
    refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm } })
  }

  const handleAddNewGitOpsServer = (): void => {
    setActiveProvider(null)
    setEditMode(false)
    addNewProviderModal()
  }

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal>
          <RbacButton
            variation={ButtonVariation.PRIMARY}
            text={getString('cd.newGitOpsServer')}
            permission={{
              permission: PermissionIdentifier.CREATE_PROJECT, // change to ADD_NEW_PROVIDER
              resource: {
                resourceType: ResourceType.ACCOUNT,
                resourceIdentifier: projectIdentifier
              }
            }}
            onClick={handleAddNewGitOpsServer}
            icon="plus"
            id="newGitOpsServerBtn"
            data-test="newGitOpsServerBtn"
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={300}
            placeholder={getString('cd.searchPlaceholder')}
            throttle={200}
            onChange={(query: string) => {
              setSearchTerm(query)
            }}
            className={css.expandSearch}
          />
        </Layout.Horizontal>
      </Page.SubHeader>

      <Page.Body className={css.pageBody}>
        <Layout.Vertical>
          <Page.Body>
            {loading || deleting ? (
              <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
                <PageSpinner />
              </div>
            ) : /* istanbul ignore next */ connectorFetchError && shouldShowError(connectorFetchError) ? (
              <div style={{ paddingTop: '200px' }}>
                <PageError
                  message={(connectorFetchError?.data as Error)?.message || connectorFetchError?.message}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
                    e.preventDefault()
                    e.stopPropagation()
                    reset()
                  }}
                />
              </div>
            ) : data?.content?.length ? (
              <GitOpsServersGridView
                onDelete={async (provider: V1Agent) => handleDelete(provider)}
                onEdit={async provider => handleEdit(provider)}
                data={data}
                loading={loading}
                gotoPage={(pageNumber: number) => setPage(pageNumber)}
              />
            ) : (
              <div className={css.noPipelineSection}>
                <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
                  <img src={noGitOpsServersIllustration} className={css.image} />

                  <Text className={css.noProviderText} margin={{ top: 'medium', bottom: 'small' }}>
                    {getString('cd.noGitOpsServerText')}
                  </Text>
                  <Text className={css.aboutProvider} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
                    {getString('cd.aboutGitOpsServer')}
                  </Text>

                  <RbacButton
                    variation={ButtonVariation.PRIMARY}
                    text={getString('cd.newGitOpsServer')}
                    permission={{
                      permission: PermissionIdentifier.CREATE_PROJECT, // change to ADD_NEW_PROVIDER
                      resource: {
                        resourceType: ResourceType.ACCOUNT,
                        resourceIdentifier: projectIdentifier
                      }
                    }}
                    onClick={handleAddNewGitOpsServer}
                    icon="plus"
                    id="newGitOpsServerBtn"
                    data-test="newGitOpsServerBtn"
                  />
                </Layout.Vertical>
              </div>
            )}
          </Page.Body>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default GitOpsServersList
