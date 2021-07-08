import React from 'react'
import { useParams } from 'react-router'
import { Container, FlexExpander, Heading, Layout, Text } from '@wings-software/uicore'
import type { HeadingProps } from '@wings-software/uicore/dist/components/Heading/Heading'
import { useStrings } from 'framework/strings'
import { Segment, SegmentFlag, SegmentFlagsResponseResponse, useGetSegmentFlags, usePatchFeature } from 'services/cf'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getErrorMessage, EntityAddingMode } from '@cf/utils/CFUtils'
import { PageError } from '@common/components/Page/PageError'
import { OptionsMenuButton } from '@common/components'
import {
  SelectedFeatureFlag,
  SelectFeatureFlagsModalButton
} from '@cf/components/SelectFeatureFlagsModalButton/SelectFeatureFlagsModalButton'
import { ItemContainer, ItemContainerProps } from '@cf/components/ItemContainer/ItemContainer'
import { NoDataFoundRow } from '@cf/components/NoDataFoundRow/NoDataFoundRow'
import { useToaster } from '@common/components'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { DetailHeading } from '../DetailHeading'

export const FlagsUseSegment: React.FC<{ segment?: Segment | undefined | null }> = () => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, segmentIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment } = useActiveEnvironment()
  const queryParams = {
    account: accountId,
    accountIdentifier: accountId,
    org: orgIdentifier,
    project: projectIdentifier,
    environment: activeEnvironment
  }
  const {
    loading,
    error,
    data: flags,
    refetch: refetchFlags
  } = useGetSegmentFlags({
    identifier: segmentIdentifier,
    queryParams
  })
  const { mutate: patchFeature } = usePatchFeature({
    identifier: '',
    queryParams
  })
  const addSegmentToFlags = async (selectedFeatureFlags: SelectedFeatureFlag[]): Promise<void> => {
    // Note: Due to https://harness.atlassian.net/browse/FFM-713 not done, we make
    // multiple patch APIs instead of single one
    return await Promise.all(
      selectedFeatureFlags.map(({ feature, variationIdentifier }) =>
        patchFeature(
          {
            instructions: [
              {
                kind: 'addSegmentToVariationTargetMap',
                parameters: { variation: variationIdentifier, targetSegments: [segmentIdentifier] }
              }
            ]
          },
          { pathParams: { identifier: feature.identifier } }
        )
      )
    )
      .then(() => {
        refetchFlags()
      })
      .catch(exception => showError(getErrorMessage(exception), undefined, 'cf.path.feature.error'))
  }
  const removeSegmentToVariationTargetMap = async (
    featureFlagIdentifier: string,
    variationIdentifier: string
  ): Promise<void> => {
    patchFeature(
      {
        instructions: [
          {
            kind: 'removeSegmentToVariationTargetMap',
            parameters: { variation: variationIdentifier, targetSegments: [segmentIdentifier] }
          }
        ]
      },
      { pathParams: { identifier: featureFlagIdentifier } }
    )
      .then(() => {
        refetchFlags()
      })
      .catch(exception => showError(getErrorMessage(exception), undefined, 'cf.patch.feature.error'))
  }

  return (
    <Container width={480} height="100%" style={{ background: '#F8FAFB', overflow: 'auto', minWidth: '480px' }}>
      <Layout.Horizontal width="100%" height={55} style={{ alignItems: 'baseline' }} padding={{ right: 'small' }}>
        <DetailHeading style={{ paddingBottom: 0 }}>
          {getString(flags?.length ? 'cf.segments.usingSegmentWithCount' : 'cf.segments.usingSegment', {
            count: flags?.length || 0
          })}
        </DetailHeading>
        <FlexExpander />
        <SelectFeatureFlagsModalButton
          text={getString('cf.segmentDetail.addToFlag')}
          minimal
          intent="primary"
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          environmentIdentifier={activeEnvironment}
          modalTitle={getString('cf.segmentDetail.addSegmentToFlag')}
          submitButtonTitle={getString('add')}
          onSubmit={addSegmentToFlags}
          shouldDisableItem={feature =>
            (flags?.filter(flag => flag.type === EntityAddingMode.DIRECT) || [])
              .map(flag => flag.identifier)
              .includes(feature.identifier)
          }
        />
      </Layout.Horizontal>
      <Container
        width="100%"
        height="calc(100% - 55px)"
        style={{ overflow: 'auto', padding: '0 var(--spacing-xxlarge) var(--spacing-xxlarge)' }}
      >
        {error && <PageError message={getErrorMessage(error)} onClick={() => refetchFlags()} />}
        {!error && !loading && <FlagsList flags={flags} onRemoveVariationMapping={removeSegmentToVariationTargetMap} />}
        {loading && <ContainerSpinner />}
      </Container>
    </Container>
  )
}

const SectionHeader: React.FC<HeadingProps> = ({ children, ...props }) => {
  const { getString } = useStrings()
  return (
    <>
      <Heading
        level={3}
        style={{
          color: '#4F5162',
          position: 'sticky',
          top: 0,
          padding: 'var(--spacing-xxlarge) 0 var(--spacing-large)',
          background: 'rgb(248, 250, 251)',
          fontSize: '14px',
          fontWeight: 500
        }}
        {...props}
      >
        {children}
      </Heading>
      <Layout.Horizontal style={{ alignItems: 'center' }} margin={{ bottom: 'small' }} padding={{ left: 'small' }}>
        <Text
          padding={{ left: 'small' }}
          style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold', flexGrow: 1 }}
        >
          {getString('cf.shared.flags').toLocaleUpperCase()}
        </Text>
        <Text
          width={150}
          style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }}
          padding={{ left: 'small' }}
        >
          {getString('cf.shared.variation').toLocaleUpperCase()}
        </Text>
      </Layout.Horizontal>
    </>
  )
}

const FlagsList: React.FC<{
  flags: SegmentFlagsResponseResponse | null
  onRemoveVariationMapping: (featureFlagIdentifier: string, variationIdentifier: string) => Promise<void>
}> = ({ flags, onRemoveVariationMapping }) => {
  const { getString } = useStrings()
  const directAddedFlags = flags?.filter(flag => flag.type === EntityAddingMode.DIRECT) || []
  const conditionalAddedFlags = flags?.filter(flag => flag.type === EntityAddingMode.CONDITION) || []

  if (!flags?.length) {
    return <NoDataFoundRow message={getString('cf.segmentDetail.noFlagsUseThisSegment')} margin={{ top: 'xxlarge' }} />
  }

  return (
    <>
      {!!directAddedFlags?.length && (
        <>
          {' '}
          <SectionHeader>{getString('cf.segmentDetail.directlyAdded')}</SectionHeader>
          <Layout.Vertical spacing="small" style={{ padding: '1px' }}>
            {directAddedFlags.map(_flag => (
              <FlagItem key={_flag.identifier} flag={_flag} onRemoveVariationMapping={onRemoveVariationMapping} />
            ))}
          </Layout.Vertical>
        </>
      )}
      {!!conditionalAddedFlags?.length && (
        <>
          <SectionHeader>{getString('cf.segmentDetail.autoAdded')}</SectionHeader>
          <Layout.Vertical spacing="small" style={{ padding: '1px' }}>
            {conditionalAddedFlags.map(_flag => (
              <FlagItem key={_flag.identifier} flag={_flag} />
            ))}
          </Layout.Vertical>
        </>
      )}
    </>
  )
}

interface FlagItemProps extends ItemContainerProps {
  flag: SegmentFlag
  onRemoveVariationMapping?: (featureFlagIdentifier: string, variationIdentifier: string) => void
}

const FlagItem: React.FC<FlagItemProps> = ({ flag, onRemoveVariationMapping, ...props }) => {
  const { name, description, variation } = flag
  const { getString } = useStrings()
  const variationTextWidth = onRemoveVariationMapping ? '88px' : '135px'

  return (
    <ItemContainer style={{ paddingRight: 'var(--spacing-xsmall)' }} {...props}>
      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
        <Container style={{ flexGrow: 1 }} padding={{ left: 'xsmall', right: 'small' }}>
          <Text
            margin={{ bottom: description?.length ? 'xsmall' : undefined }}
            style={{ color: '#22222A', fontSize: '12px', fontWeight: 600, lineHeight: '16px' }}
          >
            {name}
          </Text>
          {description && <Text style={{ color: '#22222ac7' }}>{description}</Text>}
        </Container>

        {/* NOTE: flag does not have enough info to render variation icon.
            Only identifier text for now. See: https://harness.atlassian.net/browse/FFM-699 */}
        <Text style={{ minWidth: variationTextWidth, maxWidth: variationTextWidth }}>{variation}</Text>

        {onRemoveVariationMapping && (
          <OptionsMenuButton
            items={[
              {
                text: getString('cf.segmentDetail.removeFomFlag'),
                icon: 'cross',
                onClick: () => {
                  onRemoveVariationMapping(flag.identifier, variation)
                }
              }
            ]}
          />
        )}
      </Layout.Horizontal>
    </ItemContainer>
  )
}
