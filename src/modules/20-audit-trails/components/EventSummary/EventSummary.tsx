import React, { ReactNode } from 'react'
import { Icon, Page, Card, Text, Layout, FontVariation, Color } from '@wings-software/uicore'
import { Drawer } from '@blueprintjs/core'
// import { useParams } from 'react-router-dom'
import type { AuditEventDTO } from 'services/audit'
// import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import AuditTrailFactory from '@audit-trails/factories/AuditTrailFactory'
import css from './EventSummary.module.scss'

interface EventSummaryProps {
  auditData: AuditEventDTO
  onClose: () => void
}

const EventSummary: React.FC<EventSummaryProps> = props => {
  // const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const { auditData } = props

  // const { data } = useGetYamlDiff({
  //   queryParams: {
  //     accountIdentifier: accountId,
  //     auditId: auditData.auditId || ''
  //   }
  // })

  const renderInfo = (title: string, value: string, separator?: boolean): ReactNode => {
    return (
      <>
        <Text margin={{ right: 'small' }} font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_400}>
          {`${title}: ${value}`}
        </Text>
        {separator ? (
          <Text margin={{ right: 'small' }} font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_400}>
            |
          </Text>
        ) : undefined}
      </>
    )
  }

  const requestMethod = auditData.httpRequestInfo?.requestMethod
  const clientIP = auditData.requestMetadata?.clientIP
  const {
    resourceScope: { projectIdentifier },
    resource: { type: resourceType },
    module,
    environment
  } = auditData
  return (
    <>
      <Drawer
        autoFocus={true}
        enforceFocus={true}
        hasBackdrop={true}
        usePortal={true}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        isOpen={true}
      >
        <Page.Header size="small" title="Event Summary" content={<Icon name="cross" onClick={props.onClose} />} />
        <Page.Body className={css.body}>
          <Card className={css.card}>
            <Layout.Vertical>
              <Text font={{ variation: FontVariation.H6 }}>
                {getReadableDateTime(auditData.timestamp, 'MMM DD, YYYY, hh:mm a')}
              </Text>
              <Layout.Horizontal padding={{ top: 'small' }}>
                {projectIdentifier
                  ? renderInfo(getString('projectLabel'), projectIdentifier, !!(module || environment?.type))
                  : undefined}
                {module ? renderInfo(getString('module'), module, !!environment?.type) : undefined}
                {environment?.type ? renderInfo(getString('environment'), environment.type) : undefined}
              </Layout.Horizontal>
              {AuditTrailFactory.getResourceHandler(resourceType)?.eventSummaryRenderer?.()}
            </Layout.Vertical>
          </Card>
          {requestMethod && clientIP ? (
            <Card className={css.card}>
              <Layout.Vertical>
                <Text margin={{ bottom: 'xlarge' }} font={{ variation: FontVariation.H5 }}>
                  {getString('auditTrails.supplementaryDetails')}
                </Text>
                <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.SMALL }}>
                  {getString('auditTrails.eventSource')}
                </Text>
                <Text font={{ variation: FontVariation.BODY2 }}>
                  {getString('auditTrails.http', { method: requestMethod, clientIP })}
                </Text>
              </Layout.Vertical>
            </Card>
          ) : undefined}
        </Page.Body>
      </Drawer>
    </>
  )
}

export default EventSummary
