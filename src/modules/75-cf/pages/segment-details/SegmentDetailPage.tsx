import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, Layout, Text, Avatar, Intent } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DeleteSegmentQueryParams, GetSegmentQueryParams, useDeleteSegment, useGetSegment } from 'services/cf'
import routes from '@common/RouteDefinitions'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import { OptionsMenuButton, PageSpinner, useToaster } from '@common/components'
import { DISABLE_AVATAR_PROPS, formatDate, formatTime, getErrorMessage, showToaster } from '@cf/utils/CFUtils'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import { useConfirmAction } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { DetailPageTemplate } from '@cf/components/DetailPageTemplate/DetailPageTemplate'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { FlagsUseSegment } from './flags-use-segment/FlagsUseSegment'
import { SegmentSettings } from './segment-settings/SegmentSettings'
import css from './SegmentDetailPage.module.scss'

export const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '290px',
  width: 'calc(100% - 290px)',
  height: 'calc(100% - 135px)'
}

export const SegmentDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, segmentIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()
  const { data: segment, loading: segmentLoading, refetch, error: segmentError } = useGetSegment({
    identifier: segmentIdentifier,
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: activeEnvironment
    } as GetSegmentQueryParams
  })
  const { loading: envLoading, data: envData, error: envError, refetch: envRefetch } = useSyncedEnvironment({
    accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: activeEnvironment
  })
  const title = `${getString('cf.shared.targetManagement')}: ${getString('cf.shared.segments')}`
  const breadcrumbs = [
    {
      title,
      url: withActiveEnvironment(
        routes.toCFSegments({
          accountId,
          orgIdentifier,
          projectIdentifier
        })
      )
    }
  ]
  const history = useHistory()
  const { mutate: deleteSegment } = useDeleteSegment({
    queryParams: {
      project: projectIdentifier,
      environment: segment?.environment as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as DeleteSegmentQueryParams
  })
  const deleteSegmentConfirm = useConfirmAction({
    title: getString('cf.segments.delete.title'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.segments.delete.message', { segmentName: segment?.name })
          }}
        />
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      clear()

      try {
        deleteSegment(segment?.identifier as string)
          .then(() => {
            history.push(
              routes.toCFSegments({
                projectIdentifier,
                orgIdentifier,
                accountId
              })
            )
            showToaster(getString('cf.messages.segmentDeleted'))
          })
          .catch(error => {
            showError(getErrorMessage(error), 0, 'cf.delete.segment.error')
          })
      } catch (error) {
        showError(getErrorMessage(error), 0, 'cf.delete.segment.error')
      }
    }
  })

  useDocumentTitle(title)

  const loading = segmentLoading || envLoading
  const error = segmentError || envError

  if (loading) {
    if (!segment) {
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

    if (!segment) {
      return ErrorComponent
    }

    return <Container style={fullSizeContentStyle}>{ErrorComponent}</Container>
  }

  return (
    <DetailPageTemplate
      breadcrumbs={breadcrumbs}
      title={segment?.name}
      titleIcon={<Avatar name={segment?.name} size="medium" {...DISABLE_AVATAR_PROPS} className={css.avatar} />}
      subTittle={getString('cf.targetDetail.createdOnDate', {
        date: formatDate(segment?.createdAt as number),
        time: formatTime(segment?.createdAt as number)
      })}
      headerExtras={
        <>
          <Container style={{ position: 'absolute', top: '15px', right: '25px' }}>
            <OptionsMenuButton
              items={[
                {
                  icon: 'cross',
                  text: getString('delete'),
                  onClick: deleteSegmentConfirm
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
          <FlagsUseSegment segment={segment} />
          <SegmentSettings segment={segment} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </DetailPageTemplate>
  )
}
