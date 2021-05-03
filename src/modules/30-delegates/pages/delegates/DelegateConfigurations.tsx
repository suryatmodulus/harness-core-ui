import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Classes, Menu } from '@blueprintjs/core'
import { Card, Text, Layout, Container, Button, FlexExpander, Color, Heading, Utils } from '@wings-software/uicore'
import { useConfirmationDialog } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { ScopingRuleDetails } from 'services/portal'
import { useListDelegateProfilesNg, useDeleteDelegateProfileNg } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
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
  const { accountId } = useParams<Record<string, string>>()
  const { data, loading, error, refetch } = useListDelegateProfilesNg({ queryParams: { accountId } })
  const { showSuccess, showError } = useToaster()
  const profiles: Array<DelegateProfileDetails> = formatProfileList(data)
  const { mutate: deleteDelegateProfile } = useDeleteDelegateProfileNg({
    queryParams: { accountId: accountId }
  })

  const DelegateConfigItem = (profile: DelegateProfileDetails) => {
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
        routes.toResourcesEditDelegateConfigsDetails({
          accountId,
          delegateConfigId: profile.uuid as string
        })
      )
    }

    const gotoDetailPage = (): void => {
      history.push(
        routes.toResourcesDelegateConfigsDetails({
          accountId,
          delegateConfigId: profile.uuid as string
        })
      )
    }

    return (
      <Card elevation={2} interactive={true} onClick={() => gotoDetailPage()}>
        <Container width={250} style={{ borderRadius: '5px', margin: '-20px' }} padding="large">
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
                    <Menu.Item icon="edit" text={getString('edit')} onClick={() => gotoEditDetailPage()} />
                    {!profile.primary && (
                      <Menu.Item
                        icon="cross"
                        text={getString('delete')}
                        onClick={() => {
                          openDialog()
                        }}
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
          <Layout.Vertical spacing="small" style={{ marginBottom: '100px' }}>
            {profile.description && <Text>{profile.description}</Text>}
            <TagsViewer tags={profile.selectors} style={{ background: '#CDF4FE' }} />
          </Layout.Vertical>
          <Container
            flex
            style={{
              margin: '-20px',
              borderTop: '1px solid #D9DAE6',
              padding: 'var(--spacing-large) var(--spacing-xlarge) var(--spacing-large)'
            }}
          >
            <FlexExpander />
          </Container>
          <Container>
            <Text
              style={{ fontSize: '8px', color: '#6B6D85', letterSpacing: '0.285714px', fontWeight: 500 }}
              margin={{ bottom: 'small' }}
            >
              {getString('delegate.numberOfDelegates')}:{profile.numberOfDelegates}
            </Text>
          </Container>
        </Container>
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
    return (
      <Container style={fullSizeContentStyle}>
        <PageError message={error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  return (
    <Container background={Color.GREY_100}>
      <Layout.Horizontal className={css.header} background={Color.WHITE}>
        {/** TODO: Implement add configuration */}
        <Button intent="primary" text={getString('delegate.newConfiguration')} icon="plus" disabled />
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
        <Layout.Masonry
          center
          padding="xsmall"
          gutter={25}
          items={((data?.resource as unknown) as { response: DelegateProfileDetails[] })?.response || []}
          renderItem={(profile: DelegateProfileDetails) => DelegateConfigItem(profile)}
          keyOf={(profile: DelegateProfileDetails) => profile.uuid}
        />
      </Container>
    </Container>
  )
}
