import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, Layout, Text, Avatar, Intent } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DeleteTargetQueryParams, GetTargetQueryParams, useDeleteTarget, useGetTarget } from 'services/cf'
import routes from '@common/RouteDefinitions'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import { OptionsMenuButton, PageSpinner, useToaster } from '@common/components'
import { DISABLE_AVATAR_PROPS, formatDate, formatTime, getErrorMessage, showToaster } from '@cf/utils/CFUtils'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import { useConfirmAction } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { DetailPageTemplate } from '@cf/components/DetailPageTemplate/DetailPageTemplate'
import { TargetSettings } from './target-settings/TargetSettings'
import { FlagSettings } from './flag-settings/FlagSettings'
import css from './TargetDetailPage.module.scss'

export const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

export const TargetDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier, targetIdentifier } = useParams<
    Record<string, string>
  >()
  const { data: target, loading: targetLoading, refetch, error: targetError } = useGetTarget({
    identifier: targetIdentifier,
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: environmentIdentifier
    } as GetTargetQueryParams
  })
  const { loading: envLoading, data: envData, error: envError, refetch: envRefetch } = useSyncedEnvironment({
    accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })
  const title = getString('pipeline.targets.title')
  const breadcrumbs = [
    {
      title,
      url: routes.toCFTargets({
        accountId,
        orgIdentifier,
        projectIdentifier
      })
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
        ></span>
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      clear()

      try {
        deleteTarget(target?.identifier as string)
          .then(() => {
            history.push(
              routes.toCFTargets({
                projectIdentifier,
                orgIdentifier,
                accountId
              })
            )
            showToaster(getString('cf.messages.targetDeleted'))
          })
          .catch(error => {
            showError(getErrorMessage(error), 0)
          })
      } catch (error) {
        showError(getErrorMessage(error), 0)
      }
    }
  })

  useDocumentTitle(title)

  const loading = targetLoading || envLoading
  const error = targetError || envError

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
          envRefetch()
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
      subTittle={getString('cf.targetDetail.createdOnDate', {
        date: formatDate(target?.createdAt as number),
        time: formatTime(target?.createdAt as number)
      })}
      headerExtras={
        <>
          <Container style={{ position: 'absolute', top: '15px', right: '25px' }}>
            <OptionsMenuButton
              items={[
                {
                  icon: 'cross',
                  text: getString('delete'),
                  onClick: deleteTargetConfirm
                }
              ]}
            />
          </Container>
          <Text style={{ position: 'absolute', top: '76px', right: '30px' }}>
            <span
              dangerouslySetInnerHTML={{
                __html: getString('cf.targetDetail.environmentLine', { name: envData?.data?.name })
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
