import React from 'react'
import cx from 'classnames'
import { first, isEmpty, isObject } from 'lodash-es'
import { Color, Icon, Link, Popover, Text } from '@wings-software/uicore'
import { Position } from '@blueprintjs/core'

import { useStrings } from 'framework/exports'
import type { CDStageModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'
import type { CIBuildResponseDTO } from '@pipeline/pages/pipeline-deployment-list/ExecutionsList/ExecutionCard/ExecutionDetails/Types/types'
import { BuildBranchBadge, BuildPullRequestBadge } from '@pipeline/exports'
import { TagsPopover } from '@common/components'
import { ServicePopoverCard } from '@pipeline/components/ServicePopoverCard/ServicePopoverCard'

import { useExecutionContext } from '../../ExecutionContext/ExecutionContext'
import ExecutionMetadataSection from './ExecutionMetadataSection/ExecutionMetadataSection'

import css from './ExecutionMetadata.module.scss'

//const DATE_FORMAT = 'MM/DD/YYYY hh:mm:ss a'

export default function ExecutionMetadata(): React.ReactElement {
  const { getString } = useStrings()

  const { pipelineExecutionDetail, pipelineStagesMap } = useExecutionContext()
  const { pipelineExecutionSummary } = pipelineExecutionDetail || {}

  const { services, environments } = React.useMemo(() => {
    // eslint-disable-next-line no-shadow
    const services: ServiceExecutionSummary[] = []
    // eslint-disable-next-line no-shadow
    const environments: string[] = []

    pipelineStagesMap.forEach(stage => {
      const stageInfo = stage.moduleInfo?.cd as CDStageModuleInfo
      if (stageInfo?.serviceInfo?.identifier && environments.indexOf(stageInfo.serviceInfo.identifier) === -1) {
        services.push(stageInfo.serviceInfo)
      }

      if (
        stageInfo?.infraExecutionSummary?.identifier &&
        environments.indexOf(stageInfo.infraExecutionSummary.identifier) === -1
      ) {
        environments.push(stageInfo.infraExecutionSummary.name || stageInfo.infraExecutionSummary.identifier)
      }
    })

    return { services, environments }
  }, [pipelineStagesMap])

  const HAS_CD = isObject(pipelineExecutionSummary?.moduleInfo?.cd)
  const HAS_CI = isObject(pipelineExecutionSummary?.moduleInfo?.ci)

  const ciBuildData = pipelineExecutionSummary?.moduleInfo?.ci?.ciExecutionInfoDTO as CIBuildResponseDTO
  // getting branch name (used if ciExecutionInfoDTO object in not present)
  const ciBranchName = (pipelineExecutionSummary?.moduleInfo?.ci?.branch as unknown) as string

  // CI entries
  const ciEntries: { label?: string; value: JSX.Element }[] = []
  if (HAS_CI) {
    switch (ciBuildData?.event) {
      case 'branch': {
        const lastCommit = first(ciBuildData?.branch?.commits)
        ciEntries.push({
          value: <BuildBranchBadge branchName={ciBuildData?.branch?.name} commitId={lastCommit?.id?.slice(0, 7)} />
        })
        ciEntries.push({
          label: 'Commit message',
          value: (
            <div className={css.commitMessageValue}>
              <Text className={cx(css.ellipsis, css.commitMessage)}>{lastCommit?.message}</Text>
              <Link tooltip={lastCommit?.message} withoutHref>
                <span className={css.moreBox}>
                  <Icon color={Color.GREY_500} name="more" size={10} />
                </span>
              </Link>
            </div>
          )
        })
        break
      }
      case 'pullRequest': {
        ciEntries.push({
          value: (
            <BuildPullRequestBadge
              sourceRepo={ciBuildData?.pullRequest?.sourceRepo}
              sourceBranch={ciBuildData?.pullRequest?.sourceBranch}
              targetBranch={ciBuildData?.pullRequest?.targetBranch}
            />
          )
        })
        ciEntries.push({
          label: 'Pull Request',
          value: (
            <div className={css.pullRequestValue}>
              <Text className={cx(css.ellipsis, css.pullRequestMessage)}>{ciBuildData?.pullRequest?.title}</Text>
              <Link tooltip={ciBuildData?.pullRequest?.title} withoutHref>
                <span className={css.moreBox}>
                  <Icon color={Color.GREY_500} name="more" size={10} />
                </span>
              </Link>
              <Link href={ciBuildData?.pullRequest?.link} target="_blank" className={css.pullRequestLink}>
                {getString('execution.prSymbol')}
                {typeof ciBuildData?.pullRequest?.id === 'string' || typeof ciBuildData?.pullRequest?.id === 'number'
                  ? ciBuildData?.pullRequest?.id
                  : ciBuildData?.pullRequest?.id?.['$numberLong']
                  ? ciBuildData?.pullRequest?.id?.['$numberLong']
                  : ''}
              </Link>
              <span className={css.pullRequestStatus}>{ciBuildData?.pullRequest?.state}</span>
            </div>
          )
        })
        break
      }
      default: {
        if (ciBranchName) {
          ciEntries.push({
            value: <BuildBranchBadge branchName={ciBranchName} />
          })
        }
        break
      }
    }
  }

  // CD entries
  const cdEntries: { label?: string; value: JSX.Element }[] = []
  if (HAS_CD) {
    cdEntries.push({
      label: getString('servicesWithCount', { count: services.length }),
      value: (
        <div className={css.servicesWrapper}>
          {services.slice(0, 2).map(service => {
            return (
              <Popover
                key={service.identifier}
                wrapperTagName="div"
                targetTagName="div"
                interactionKind="hover"
                position={Position.BOTTOM_RIGHT}
                className={css.services}
              >
                <div>{service.displayName}</div>
                <ServicePopoverCard service={service} />
              </Popover>
            )
          })}
          {services.length > 2 ? (
            <Popover
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.BOTTOM_RIGHT}
              className={css.services}
            >
              <div>(+{services.length - 2})</div>
              <div>Table will come here</div>
            </Popover>
          ) : null}
        </div>
      )
    })

    cdEntries.push({ label: `Environments (${services.length})`, value: <>{environments.join(', ')}</> })
  }
  // removed items from cdEntries
  //{ label: 'Trigger Type', value: <>{pipelineExecutionSummary?.executionTriggerInfo?.triggerType}</> },
  //{ label: 'Start Time', value: <>{moment(pipelineExecutionSummary?.startTs).format(DATE_FORMAT)}</> },
  //{ label: 'Triggered By', value: <>{pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.identifier || '-'}</> },
  //{ label: 'End Time', value: <>{moment(pipelineExecutionSummary?.endTs).format(DATE_FORMAT)}</> },

  // TRIGGER entries
  const triggerEntries: { label?: string; value: JSX.Element }[] = []
  const triggerName = pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.identifier
  if (triggerName) {
    triggerEntries.push({
      value: (
        <>
          {/*TODO: add right icon <Icon name="trigger-pipeline" margin={{ right: 'small' }} />*/}
          <Link withoutHref font={{ weight: 'bold' }}>
            {triggerName}
          </Link>
        </>
      )
    })
  }

  return (
    <div className={css.main}>
      {!isEmpty(pipelineExecutionSummary?.tags) ? (
        <TagsPopover
          tags={(pipelineExecutionSummary?.tags || []).reduce((val, tag) => {
            return Object.assign(val, { [tag.key]: tag.value })
          }, {} as { [key: string]: string })}
        />
      ) : null}
      {HAS_CI ? <ExecutionMetadataSection title="BUILD" entries={ciEntries} delimiter={true} /> : null}
      {HAS_CD ? <ExecutionMetadataSection title="DEPLOYMENT" entries={cdEntries} delimiter={true} /> : null}
      {/* TODO: hide TBD <ExecutionMetadataSection title="TRIGGER" entries={triggerEntries} />*/}
    </div>
  )
}
