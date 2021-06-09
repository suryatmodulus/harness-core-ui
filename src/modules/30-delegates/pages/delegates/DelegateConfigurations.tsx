import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import get from 'lodash-es/get'
import { Classes, Menu } from '@blueprintjs/core'
import { Card, Text, Layout, Container, Button, FlexExpander, Color, Heading, Utils } from '@wings-software/uicore'
import { useConfirmationDialog } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/components/Toaster/useToaster'
import useCreateDelegateConfigModal from '@delegates/modals/DelegateModal/useCreateDelegateConfigModal'
import type {
  DelegateConfigProps,
  ProjectPathProps,
  ModulePathParams,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import type { ScopingRuleDetails } from 'services/portal'
import { useListDelegateProfilesNg, useDeleteDelegateProfileNg } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
/* RBAC */
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'

import css from './DelegatesPage.module.scss'

const formatProfileList = (data: any) => {
  const profiles: Array<DelegateProfileDetails> = data?.resource?.response
  return profiles
}

const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

interface DelegateProfileDetails {
  uuid?: string
  accountId?: string
  name?: string
  description?: string
  primary?: boolean
  approvalRequired?: boolean
  startupScript?: string
  scopingRules?: ScopingRuleDetails[]
  selectors?: string[]
  numberOfDelegates?: number
}

export default function DelegateConfigurations(): JSX.Element {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<DelegateConfigProps & ProjectPathProps & ModulePathParams> & AccountPathProps
  >()
  const { data, loading, error, refetch } = useListDelegateProfilesNg({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })
  const { showSuccess, showError } = useToaster()
  const profiles: Array<DelegateProfileDetails> = formatProfileList(data)
  const { openDelegateConfigModal } = useCreateDelegateConfigModal({
    onSuccess: () => {
      refetch()
    }
  })
  const { mutate: deleteDelegateProfile } = useDeleteDelegateProfileNg({
    queryParams: { accountId: accountId }
  })

  const DelegateConfigItem = ({ profile }: { profile: DelegateProfileDetails }) => {
    const { openDialog } = useConfirmationDialog({
      contentText: `${getString('delegate.deleteDelegateConfigurationQuestion')} ${profile.name}`,
      titleText: getString('delegate.deleteDelegateConfiguration'),
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async (isConfirmed: boolean) => {
        if (isConfirmed && profile && profile.uuid) {
          try {
            const deleted = await deleteDelegateProfile(profile?.uuid)

            if (deleted) {
              showSuccess(
                `${getString('delegate.deleteDelegateConfigurationSuccess', {
                  profileName: profile.name
                })}`
              )
              ;(profiles as any).reload?.()
              refetch()
            }
          } catch (e) {
            showError(e.message)
          }
        }
      }
    })
    const gotoEditDetailPage = (): void => {
      history.push(
        routes.toEditDelegateConfigsDetails({
          accountId,
          delegateConfigId: profile.uuid as string
        })
      )
    }

    const gotoDetailPage = (): void => {
      history.push(
        routes.toDelegateConfigsDetails({
          accountId,
          delegateConfigId: profile.uuid as string,
          orgIdentifier,
          projectIdentifier,
          module
        })
      )
    }

    const lastUpdatedAt = get(profile, 'lastUpdatedAt', 0)
    let timeAgo = moment().diff(lastUpdatedAt, 'days')
    let unitAgo = 'days'
    if (timeAgo < 1) {
      timeAgo = moment().diff(lastUpdatedAt, 'hours')
      unitAgo = 'hours'
      if (timeAgo < 1) {
        timeAgo = moment().diff(lastUpdatedAt, 'minutes')
        unitAgo = 'minutes'
      }
    }

    const [canAccessDelegateConfig] = usePermission(
      {
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        resource: {
          resourceType: ResourceType.DELEGATECONFIGURATION
        },
        permissions: [PermissionIdentifier.VIEW_DELEGATE_CONFIGURATION]
      },
      []
    )

    return (
      <Card
        elevation={2}
        interactive={true}
        onClick={() => canAccessDelegateConfig && gotoDetailPage()}
        className={css.delegateProfileElements}
      >
        <div
          style={{
            width: 250,
            height: 200,
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Layout.Horizontal>
            <Heading
              level={2}
              style={{ fontSize: '16px', fontWeight: 500, color: '#22222A' }}
              padding={{ bottom: 'medium' }}
            >
              {profile.name}
            </Heading>
            <FlexExpander />
            <Container style={{ transform: 'translate(12px, -10px)' }} onClick={Utils.stopEvent}>
              <Button
                minimal
                icon="more"
                tooltip={
                  <Menu style={{ minWidth: 'unset' }}>
                    <RbacMenuItem
                      permission={{
                        resourceScope: {
                          accountIdentifier: accountId
                        },
                        resource: {
                          resourceType: ResourceType.DELEGATECONFIGURATION
                        },
                        permission: PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION
                      }}
                      icon="edit"
                      text={getString('edit')}
                      onClick={() => gotoEditDetailPage()}
                    />
                    {!profile.primary && (
                      <RbacMenuItem
                        permission={{
                          resourceScope: {
                            accountIdentifier: accountId
                          },
                          resource: {
                            resourceType: ResourceType.DELEGATECONFIGURATION
                          },
                          permission: PermissionIdentifier.DELETE_DELEGATE_CONFIGURATION
                        }}
                        icon="cross"
                        text={getString('delete')}
                        onClick={() => openDialog()}
                        className={Classes.POPOVER_DISMISS}
                      />
                    )}
                  </Menu>
                }
                tooltipProps={{ isDark: true, interactionKind: 'click' }}
                style={{ color: 'var(--grey-400)', transform: 'rotate(90deg)' }}
              />
            </Container>
          </Layout.Horizontal>
          <Layout.Vertical spacing="small" style={{ flexGrow: 1 }}>
            {profile.description && <Text>{profile.description}</Text>}
            <TagsViewer tags={profile.selectors} style={{ background: '#CDF4FE' }} />
          </Layout.Vertical>
          <Container
            flex
            style={{
              borderTop: '1px solid #D9DAE6',
              padding: 'var(--spacing-small) var(--spacing-medium) var(--spacing-small)'
            }}
          >
            <FlexExpander />
          </Container>
          <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
            <Text
              style={{ fontSize: '8px', color: '#6B6D85', letterSpacing: '0.285714px', fontWeight: 500 }}
              margin={{ bottom: 'small' }}
            >
              <div>{getString('delegates.usedBy')}</div>
              <div>
                {profile.numberOfDelegates} {getString('delegate.delegates')}
              </div>
            </Text>
            <Text
              style={{ fontSize: '8px', color: '#6B6D85', letterSpacing: '0.285714px', fontWeight: 500 }}
              margin={{ bottom: 'small' }}
            >
              <div>{getString('delegates.lastUpdated')}</div>
              <div>
                {timeAgo} {unitAgo} ago
              </div>
            </Text>
          </Layout.Horizontal>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <Container style={fullSizeContentStyle}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    const message = get(error, 'data.message', error.message)
    return (
      <Container style={fullSizeContentStyle}>
        <PageError message={message} onClick={() => refetch()} />
      </Container>
    )
  }

  const permissionRequestNewConfiguration = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION,
    resource: {
      resourceType: ResourceType.DELEGATECONFIGURATION
    }
  }

  return (
    <Container background={Color.GREY_100}>
      <Layout.Horizontal className={css.header} background={Color.WHITE}>
        <RbacButton
          intent="primary"
          text={getString('delegate.newConfiguration')}
          icon="plus"
          permission={permissionRequestNewConfiguration}
          onClick={() => openDelegateConfigModal()}
          id="newDelegateConfigurationBtn"
          data-test="newDelegateConfigurationButton"
        />
        <FlexExpander />
        <Layout.Horizontal spacing="xsmall">
          <Button minimal icon="main-search" disabled />
          <Button minimal icon="settings" disabled />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container
        style={{ width: 'calc(100vw - 270px)', overflow: 'hidden', minHeight: 'calc(100vh - 205px)' }}
        padding="xxlarge"
      >
        <div className={css.delegateProfilesContainer}>
          {profiles.map(profile => (
            <DelegateConfigItem key={profile.uuid} profile={profile} />
          ))}
        </div>
      </Container>
    </Container>
  )
}
