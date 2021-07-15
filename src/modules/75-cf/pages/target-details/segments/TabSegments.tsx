import React from 'react'
import { useParams } from 'react-router'
import { Container, FlexExpander, Layout, Text } from '@wings-software/uicore'
import { SelectSegmentsModalButton } from '@cf/components/SelectSegmentsModalButton/SelectSegmentsModalButton'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { NoDataFoundRow } from '@cf/components/NoDataFoundRow/NoDataFoundRow'
import { useStrings } from 'framework/strings'
import { useAddTargetsToExcludeList, useAddTargetsToIncludeList } from '@cf/utils/SegmentUtils'
import {
  GetTargetSegmentsQueryParams,
  Segment,
  Target,
  /* TargetDetailSegment, */ useGetTargetSegments
} from 'services/cf'
// import { ItemBriefInfo } from '@cf/components/ItemBriefInfo/ItemBriefInfo'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { IncludeSegmentRow } from './IncludeSegmentRow'
import { ExcludeSegmentRow } from './ExcludeSegmentRow'

export const TabSegments: React.FC<{ target?: Target | null }> = ({ target }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, targetIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment } = useActiveEnvironment()
  const patchParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: activeEnvironment
  }
  const { loading, error, data, refetch } = useGetTargetSegments({
    identifier: targetIdentifier,
    queryParams: {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: activeEnvironment
    } as GetTargetSegmentsQueryParams
  })
  const _useAddTargetsToIncludeList = useAddTargetsToIncludeList(patchParams)
  const _useAddTargetsToExcludeList = useAddTargetsToExcludeList(patchParams)

  const addTargetToSegments = async (segments: Segment[]) => {
    // Note: Due to https://harness.atlassian.net/browse/FFM-603 not done, we make
    // multiple patch APIs instead of one
    return await Promise.all(
      segments.map(segment => _useAddTargetsToIncludeList(segment.identifier, [targetIdentifier]))
    ).then(() => {
      refetch()
    })
  }
  const excludeTargetFromSegments = async (segments: Segment[]): Promise<void> => {
    // Note: Due to https://harness.atlassian.net/browse/FFM-603 not done, we make
    // multiple patch APIs instead of one
    return await Promise.all(
      segments.map(segment => _useAddTargetsToExcludeList(segment.identifier, [targetIdentifier]))
    ).then(() => {
      refetch()
    })
  }

  if (error) {
    return (
      <Container padding={{ top: 'huge' }}>
        <PageError
          message={getErrorMessage(error)}
          width={450}
          onClick={() => {
            refetch()
          }}
        />
      </Container>
    )
  }

  if (loading) {
    return (
      <Container height="100%" width="100%" padding={{ top: 'huge' }}>
        <ContainerSpinner />
      </Container>
    )
  }

  return (
    <>
      {/* MANUALLY ADDED / INCLUDE LIST */}
      <Container padding={{ top: 'xsmall', right: 'xxlarge', left: 'xxlarge', bottom: 'xxlarge' }}>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <Text
            style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }}
            padding={{ left: 'small' }}
            data-tooltip-id="ff_targetTargetGroups_manuallyAdded"
          >
            {getString('cf.targetDetail.manuallyAdded')}
          </Text>
          <FlexExpander />
          <SelectSegmentsModalButton
            text={getString('cf.targetDetail.addToSegment')}
            minimal
            intent="primary"
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            environmentIdentifier={activeEnvironment}
            targetIdentifier={targetIdentifier}
            modalTitle={getString('cf.targetDetail.addTargetToSegment')}
            onSubmit={addTargetToSegments}
            style={{ paddingRight: 'var(--spacing-small)' }}
          />
        </Layout.Horizontal>
        {(!!data?.includedSegments?.length && (
          <Layout.Vertical spacing="small">
            {data.includedSegments.map(segment => (
              <IncludeSegmentRow
                key={segment.identifier}
                target={target}
                segment={segment}
                patchParams={patchParams}
                refetch={() => refetch()}
              />
            ))}
          </Layout.Vertical>
        )) || <NoDataFoundRow message={getString('cf.targetDetail.noSegmentAdded')} />}
      </Container>

      {/* AUTOMATICALLY ADDED THROUGH CONDITIONS */}
      {/* <Container padding={{ top: 'xsmall', right: 'xxlarge', left: 'xxlarge', bottom: 'xxlarge' }}>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <Text
            style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }}
            padding={{ left: 'small', bottom: 'small' }}
            data-tooltip-id="ff_targetTargetGroups_autoAdded"
          >
            {getString('cf.targetDetail.autoAdded')}
          </Text>
          <FlexExpander />
        </Layout.Horizontal>

        {(!!data?.ruleSegments?.length && (
          <Layout.Vertical spacing="small">
            {data.ruleSegments.map(segment => {
              const { identifier, name, description } = segment as TargetDetailSegment & { description: string }
              return <ItemBriefInfo key={identifier} name={name as string} description={description} />
            })}
          </Layout.Vertical>
        )) || <NoDataFoundRow message={getString('cf.targetDetail.noSegmentMatched')} />}
      </Container> */}

      {/* EXCLUSION LIST */}
      <Container padding={{ top: 'xsmall', right: 'xxlarge', left: 'xxlarge', bottom: 'xxlarge' }}>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <Text
            style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }}
            padding={{ left: 'small' }}
            data-tooltip-id="ff_targetTargetGroups_exclusionList"
          >
            {getString('cf.targetDetail.exclusionList')}
          </Text>
          <FlexExpander />
          <SelectSegmentsModalButton
            text={getString('cf.targetDetail.excludefromSegment')}
            minimal
            intent="primary"
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            environmentIdentifier={activeEnvironment}
            targetIdentifier={targetIdentifier}
            modalTitle={getString('cf.targetDetail.excludeTargetFromSegment')}
            submitButtonTitle={getString('cf.targetDetail.exclude')}
            onSubmit={excludeTargetFromSegments}
            style={{ paddingRight: 'var(--spacing-small)' }}
          />
        </Layout.Horizontal>
        {(!!data?.excludedSegments?.length && (
          <Layout.Vertical spacing="small">
            {data.excludedSegments.map(segment => (
              <ExcludeSegmentRow
                key={segment.identifier}
                target={target}
                segment={segment}
                patchParams={patchParams}
                refetch={() => refetch()}
              />
            ))}
          </Layout.Vertical>
        )) || <NoDataFoundRow message={getString('cf.targetDetail.noSegmentExcluded')} />}
      </Container>
    </>
  )
}
