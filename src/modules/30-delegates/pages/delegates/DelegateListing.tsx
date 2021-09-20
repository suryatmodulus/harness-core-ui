import React, { useEffect, useState } from 'react'
import { get, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, FlexExpander, ExpandingSearchInput, Color } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { PageError } from '@common/components/Page/PageError'
import { useStrings } from 'framework/strings'
import { GetDelegatesStatusV2QueryParams, useGetDelegateGroupsNGV2, DelegateGroupDetails } from 'services/portal'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import DelegateInstallationError from '@delegates/components/CreateDelegate/K8sDelegate/DelegateInstallationError/DelegateInstallationError'
import DelegatesEmptyState from '@delegates/images/DelegatesEmptyState.svg'
import { Page } from '@common/exports'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import DelegateListingItem, { DelegateListingHeader } from './DelegateListingItem'

import css from './DelegatesPage.module.scss'

const POLLING_INTERVAL = 10000

const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

export const DelegateListing: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<Record<string, string>>()
  const [searchParam, setSearchParam] = useState('')
  const [troubleshoterOpen, setOpenTroubleshoter] = useState<{ isConnected: boolean | undefined } | undefined>(
    undefined
  )

  const queryParams: GetDelegatesStatusV2QueryParams = {
    accountId,
    orgId: orgIdentifier,
    projectId: projectIdentifier,
    module
  } as GetDelegatesStatusV2QueryParams
  const { data, loading, error, refetch } = useGetDelegateGroupsNGV2({ queryParams })
  const { openDelegateModal } = useCreateDelegateModal()
  const delegates = get(data, 'resource.delegateGroupDetails', [])
  const filteredDelegates = searchParam
    ? delegates.filter((delegate: DelegateGroupDetails) => delegate.groupName?.includes(searchParam))
    : delegates

  filteredDelegates.forEach((delegateGroup: DelegateGroupDetails) => {
    const delegateName = `${get(delegateGroup, 'groupName', '')} ${getString('delegate.instancesCount', {
      count: delegateGroup?.delegateInstanceDetails?.length,
      total: ''
    })}`
    set(delegateGroup, 'delegateName', delegateName)
  })

  // Add polling
  useEffect(() => {
    let timeoutId = 0

    if (!loading && !error && data) {
      timeoutId = window.setTimeout(() => {
        refetch()
      }, POLLING_INTERVAL)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [loading, error, data, refetch])

  if (loading && !data) {
    return (
      <Container style={fullSizeContentStyle}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container style={fullSizeContentStyle}>
        <PageError message={error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  const permissionRequestNewDelegate = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE,
    resource: {
      resourceType: ResourceType.DELEGATE
    }
  }

  const newDelegateBtn = (
    <RbacButton
      intent="primary"
      text={getString('delegates.newDelegate')}
      icon="plus"
      permission={permissionRequestNewDelegate}
      onClick={() => openDelegateModal()}
      id="newDelegateBtn"
      data-test="newDelegateButton"
    />
  )

  return (
    <Container>
      <Dialog
        isOpen={!!troubleshoterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshoter(undefined)}
      >
        <DelegateInstallationError showDelegateInstalledMessage={false} />
      </Dialog>
      <Layout.Horizontal className={css.header}>
        {newDelegateBtn}
        <FlexExpander />
        <Layout.Horizontal spacing="xsmall">
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            placeholder={getString('delegates.searchDelegateName')}
            throttle={200}
            onChange={text => {
              setSearchParam(text.trim())
            }}
            className={css.search}
          />
          <Button minimal icon="settings" disabled />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Page.Body>
        {filteredDelegates.length ? (
          <Container className={css.delegateListContainer} background={Color.GREY_100}>
            <DelegateListingHeader />
            {filteredDelegates.map((delegate: DelegateGroupDetails) => (
              <DelegateListingItem
                key={delegate.delegateGroupIdentifier}
                delegate={delegate}
                setOpenTroubleshoter={setOpenTroubleshoter}
              />
            ))}
          </Container>
        ) : (
          <div className={css.emptyStateContainer}>
            <img src={DelegatesEmptyState} />
            <div className={css.emptyStateText}>
              {projectIdentifier
                ? getString('delegates.noDelegatesInProject')
                : orgIdentifier
                ? getString('delegates.noDelegatesInOrganization')
                : getString('delegates.noDelegatesInAccount')}
            </div>
            {newDelegateBtn}
          </div>
        )}
      </Page.Body>
    </Container>
  )
}
export default DelegateListing
