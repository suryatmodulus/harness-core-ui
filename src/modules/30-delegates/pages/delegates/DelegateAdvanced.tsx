import React from 'react'
import { Button, Container, FlexExpander, Text, useToggle } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { DelegateGroupDetails, DelegateProfile } from 'services/portal'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { SectionContainer } from '@delegates/components/SectionContainer/SectionContainer'
import css from './DelegateDetails.module.scss'

interface DelegateAdvancedProps {
  delegate: DelegateGroupDetails
  delegateProfile: DelegateProfile
}

export const DelegateAdvanced: React.FC<DelegateAdvancedProps> = ({ delegate, delegateProfile }) => {
  const [expanded, toggleExpanded] = useToggle(true)
  const { getString } = useStrings()

  const tags = Object.entries(delegate?.groupImplicitSelectors || {})
    .filter(tag => tag[1] !== 'PROFILE_SELECTORS')
    .map(tag => tag[0])
  return (
    <SectionContainer style={{ paddingTop: 'var(--spacing-large)' }}>
      <Container flex>
        <Text style={{ color: '#4F4F4F', fontSize: 'var(--font-size-normal)' }}>{getString('advancedTitle')}</Text>
        <FlexExpander />
        <Button
          minimal
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          style={{ marginRight: '-5px' }}
          onClick={toggleExpanded}
        />
      </Container>

      {expanded && (
        <Container flex>
          <div className={css.addSpacing}>
            <Text style={{ margin: '0 0 var(--spacing-small) 0', color: '#4F4F4F', fontSize: '12px' }}>
              {getString('delegate.delegateTags')}
            </Text>
            <Text font="small" style={{ lineHeight: '16px' }}>
              {getString('delegate.delegateTagDescription')}
            </Text>
            <Text font="small" color="#4F4F4F" style={{ lineHeight: '16px', padding: 'var(--spacing-small) 0' }}>
              {getString('delegate.delegateSpecificTags')}
            </Text>
            <TagsViewer tags={tags} />
            {!!delegateProfile?.selectors?.length && (
              <Text font="small" color="#4F4F4F" style={{ lineHeight: '16px', padding: 'var(--spacing-small) 0' }}>
                {getString('delegate.tagsFromDelegateConfig')}
              </Text>
            )}
            <TagsViewer tags={delegateProfile?.selectors} />
          </div>
        </Container>
      )}
    </SectionContainer>
  )
}
