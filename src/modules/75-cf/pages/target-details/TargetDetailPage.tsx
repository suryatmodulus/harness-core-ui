import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Avatar, Container, Intent, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DeleteTargetQueryParams, GetTargetQueryParams, useDeleteTarget, useGetTarget } from 'services/cf'
import routes from '@common/RouteDefinitions'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner, useToaster } from '@common/components'
import { DISABLE_AVATAR_PROPS, formatDate, formatTime, getErrorMessage, showToaster } from '@cf/utils/CFUtils'
import { useConfirmAction } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useGetEnvironment } from 'services/cd-ng'
import { DetailPageTemplate } from '@cf/components/DetailPageTemplate/DetailPageTemplate'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { TargetSettings } from './target-settings/TargetSettings'
import { FlagSettings } from './flag-settings/FlagSettings'
import css from './TargetDetailPage.module.scss'

export const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '290px',
  width: 'calc(100% - 290px)',
  height: 'calc(100% - 135px)'
}

export const TargetDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, targetIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()
  const {
    data: target,
    loading,
    refetch,
    error
  } = useGetTarget({
    identifier: targetIdentifier,
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: activeEnvironment
    } as GetTargetQueryParams
  })
  const { data: environment } = useGetEnvironment({
    environmentIdentifier: activeEnvironment,
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })
  const title = `${getString('cf.shared.targetManagement')}: ${getString('pipeline.targets.title')}`
  const breadcrumbs = [
    {
      title,
      url: withActiveEnvironment(
        routes.toCFTargets({
          accountId,
          orgIdentifier,
          projectIdentifier
        })
      )
    }
  ]
  const history = useHistory()
  const { mutate: deleteTarget } = useDeleteTarget({
    queryParams: {
      project: projectIdentifier,
      environment: target?.environment as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as DeleteTargetQueryParams
  })
  const deleteTargetConfirm = useConfirmAction({
    title: getString('cf.targets.deleteTarget'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.targets.deleteTargetMessage', { name: target?.name })
          }}
        />
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      clear()

      try {
        deleteTarget(target?.identifier as string)
          .then(() => {
            history.push(
              withActiveEnvironment(
                routes.toCFTargets({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })
              )
            )
            showToaster(getString('cf.messages.targetDeleted'))
          })
          .catch(_error => {
            showError(getErrorMessage(_error), 0, 'cf.delete.target.error')
          })
      } catch (_error) {
        showError(getErrorMessage(_error), 0, 'cf.delete.target.error')
      }
    }
  })

  useDocumentTitle(title)

  if (loading) {
    if (!target) {
      return <PageSpinner />
    }

    return (
      <Container style={fullSizeContentStyle}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    const ErrorComponent = (
      <PageError
        message={getErrorMessage(error)}
        onClick={() => {
          refetch()
        }}
      />
    )

    if (!target) {
      return ErrorComponent
    }

    return <Container style={fullSizeContentStyle}>{ErrorComponent}</Container>
  }

  return (
    <DetailPageTemplate
      breadcrumbs={breadcrumbs}
      title={target?.name}
      titleIcon={<Avatar name={target?.name} size="medium" {...DISABLE_AVATAR_PROPS} className={css.avatar} />}
      subTitle={getString('cf.targetDetail.createdOnDate', {
        date: formatDate(target?.createdAt as number),
        time: formatTime(target?.createdAt as number)
      })}
      identifier={target?.identifier}
      headerExtras={
        <>
          <Container style={{ position: 'absolute', top: '15px', right: '25px' }}>
            <RbacOptionsMenuButton
              items={[
                {
                  icon: 'cross',
                  text: getString('delete'),
                  onClick: deleteTargetConfirm,
                  permission: {
                    resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
                    permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
                  }
                }
              ]}
            />
          </Container>
          <Text style={{ position: 'absolute', top: '76px', right: '30px' }}>
            <span
              dangerouslySetInnerHTML={{
                __html: getString('cf.targetDetail.environmentLine', {
                  name: environment?.data?.name || target?.environment
                })
              }}
            />
          </Text>
        </>
      }
    >
      <Layout.Vertical height="100%" style={{ flexGrow: 1, background: 'var(--white)' }}>
        <Layout.Horizontal height="100%">
          <TargetSettings target={target} />
          <FlagSettings target={target} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </DetailPageTemplate>
  )
}
