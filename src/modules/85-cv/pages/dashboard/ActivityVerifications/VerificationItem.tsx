import React from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import { PopoverInteractionKind, Position, Tooltip, Spinner } from '@blueprintjs/core'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetVerificationsPopoverSummary,
  DeploymentActivityVerificationResultDTO,
  DeploymentPopoverSummary,
  VerificationResult
} from 'services/cv'
import CVProgressBar from '@cv/components/CVProgressBar/CVProgressBar'
import ActivityType from '../ActivityType/ActivityType'
import ActivityProgressIndicator from '../ActivityProgressIndicator/ActivityProgressIndicator'
import i18n from './ActivityVerifications.i18n'
import { InstancePhase } from '../deployment-drilldown/DeploymentDrilldownSideNav'
import css from './ActivityVerifications.module.scss'

export default function VerificationItem({
  item,
  onSelect
}: {
  item: DeploymentActivityVerificationResultDTO
  onSelect?(phase?: string): void
}): React.ReactElement {
  const { serviceName, tag, serviceIdentifier } = item
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data: tooltipData, loading, refetch: loadPopoverSummary } = useGetVerificationsPopoverSummary({
    deploymentTag: encodeURIComponent(tag as string),
    lazy: true
  })
  const onOpeningTooltip = (): void => {
    if (!tooltipData && !loading && serviceIdentifier) {
      loadPopoverSummary({
        queryParams: {
          accountId,
          projectIdentifier,
          orgIdentifier,
          serviceIdentifier
        }
      })
    }
  }

  const tooltipProps = {
    isLoading: loading,
    onOpening: onOpeningTooltip,
    tagName: tag,
    serviceName
  }

  return (
    <li className={css.dataRow} onClick={() => onSelect?.()}>
      <ActivityType buildName={tag!} serviceName={serviceName!} iconProps={{ name: 'cd-main' }} />
      <ItemTooltip
        {...tooltipProps}
        phase="PRE_PROD"
        contentData={tooltipData?.resource?.preProductionDeploymentSummary}
      >
        <ActivityProgressIndicator
          data={item.preProductionDeploymentSummary}
          className={css.dataColumn}
          onClick={e => {
            e.stopPropagation()
            onSelect?.(InstancePhase.PRE_PRODUCTION)
          }}
        />
      </ItemTooltip>
      <ItemTooltip {...tooltipProps} phase="PROD" contentData={tooltipData?.resource?.productionDeploymentSummary}>
        <ActivityProgressIndicator
          data={item.productionDeploymentSummary}
          className={css.dataColumn}
          onClick={e => {
            e.stopPropagation()
            onSelect?.(InstancePhase.PRODUCTION)
          }}
        />
      </ItemTooltip>
      <ItemTooltip {...tooltipProps} phase="POST_DEPLOY" contentData={tooltipData?.resource?.postDeploymentSummary}>
        <ActivityProgressIndicator
          data={item.postDeploymentSummary}
          className={css.dataColumn}
          onClick={e => {
            e.stopPropagation()
            onSelect?.(InstancePhase.POST_DEPLOYMENT)
          }}
        />
      </ItemTooltip>
    </li>
  )
}

function ItemTooltip(props: {
  tagName?: string
  serviceName?: string
  isLoading: boolean
  onOpening?(): void
  contentData?: DeploymentPopoverSummary
  phase: 'PRE_PROD' | 'PROD' | 'POST_DEPLOY'
  children: JSX.Element
}): React.ReactElement {
  const label =
    (props.phase === 'PRE_PROD' && i18n.verificationTooltip.preProdVerifications) ||
    (props.phase === 'PROD' && i18n.verificationTooltip.prodVerifications) ||
    i18n.verificationTooltip.postDeployVerifications
  return (
    <Tooltip
      className={css.tooltipTarget}
      onOpening={props.onOpening}
      lazy={true}
      position={Position.TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      content={
        <Container className={css.verificationTooltip}>
          {props.isLoading && <Spinner size={25} />}
          {!props.isLoading && (
            <>
              <Container className={css.tooltipHeader}>
                <Text color={Color.GREY_400} style={{ fontSize: 12 }}>
                  {props.tagName}
                </Text>
                <Text color={Color.GREY_400} style={{ fontSize: 12 }}>
                  {props.serviceName}
                </Text>
              </Container>
              <Container className={css.tooltipSubHeader}>
                <Text color={Color.GREY_400} style={{ fontSize: 12 }}>{`${
                  props.contentData?.total ?? 0
                } ${label}`}</Text>
                <Text color={Color.GREY_400} style={{ fontSize: 12 }}>
                  {i18n.verificationTooltip.risk}
                </Text>
              </Container>
              {props.contentData?.verificationResults?.map((item, index) => (
                <Container key={index} className={css.tooltipItem}>
                  <Container className={css.tooltipItemContent}>
                    <Container className={css.tooltipNameGroup}>
                      <Text color={Color.GREY_400} style={{ fontSize: 12 }}>
                        {item.jobName}
                      </Text>
                      <Text color={Color.GREY_400} style={{ fontSize: 12 }}>
                        {mapTooltipItemStatus(item.status, item.remainingTimeMs)}
                      </Text>
                    </Container>
                    <CVProgressBar status={item.status} value={item.progressPercentage} />
                    <Container className={css.tooltipDateGroup}>
                      <Text color={Color.GREY_400} style={{ fontSize: 12, marginRight: 2 }}>
                        {i18n.verificationTooltip.startedOn}:
                      </Text>
                      <Text color={Color.GREY_400} style={{ fontSize: 12 }}>
                        {moment(item.startTime).format('MMM D, h:mm:ss a')}
                      </Text>
                    </Container>
                  </Container>
                </Container>
              ))}
            </>
          )}
        </Container>
      }
    >
      {props.children}
    </Tooltip>
  )
}

export function mapTooltipItemStatus(status: VerificationResult['status'], remainingTimeMs?: number) {
  switch (status) {
    case 'ERROR':
      return i18n.verificationTooltip.statusError
    case 'IN_PROGRESS':
      return Math.floor(remainingTimeMs! / 60000) + i18n.verificationTooltip.minRemaining
    case 'NOT_STARTED':
      return i18n.verificationTooltip.statusNotStarted
    case 'VERIFICATION_FAILED':
      return i18n.verificationTooltip.statusFailed
    case 'VERIFICATION_PASSED':
      return i18n.verificationTooltip.statusPassed
  }
}
