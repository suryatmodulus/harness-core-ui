import React, { useState } from 'react'
import { Container } from '@wings-software/uicore'
import { ItemBriefInfo } from '@cf/components/ItemBriefInfo/ItemBriefInfo'
import type { Segment } from 'services/cf'
import { ItemContainer } from '../ItemContainer/ItemContainer'

export interface SegmentRowProps {
  segment: Segment
  checked: boolean
  onChecked: (checked: boolean, segment: Segment) => void
}

export const SegmentRow: React.FC<SegmentRowProps> = ({ segment, checked, onChecked }) => {
  // const { getString } = useStrings()
  // const tags: string[] = ((segment as unknown) as { tags: string[] })?.tags || []
  // const segmentHasFlags = !!segment?.included?.length
  const [isChecked, setIsChecked] = useState(checked)
  const toggleCheck = () => {
    setIsChecked(previous => {
      onChecked(!previous, segment)
      return !previous
    })
  }

  return (
    <ItemContainer
      clickable
      style={{
        flexGrow: 1,
        border: '1px solid rgba(40, 41, 61, 0.04)',
        marginRight: '1px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
      }}
      onClick={toggleCheck}
    >
      <Container flex style={{ alignItems: 'center', width: '25px', justifyContent: 'center' }}>
        <input type="checkbox" checked={isChecked} style={{ cursor: 'pointer' }} />
      </Container>
      <ItemBriefInfo
        name={segment.name}
        description={(segment as unknown as { desciption: string }).desciption} // cast util API supports it
        style={{ boxShadow: 'none', flexGrow: 1, paddingLeft: 'var(--spacing-xsmall)' }}
        padding="none"
      />
      {/* Disable since backend does not support this info yet
      <Container width={70}>
        <Text
          inline
          icon="main-tags"
          tooltip={
            tags.length ? (
              <Layout.Vertical padding="medium" spacing="medium" style={{ maxWidth: 400 }}>
                <Text>{getString('tagsLabel').toUpperCase()}</Text>
                <TagsViewer tags={tags} />
              </Layout.Vertical>
            ) : undefined
          }
        >
          {tags.length}
        </Text>
      </Container>
      <Text width={175} color={segmentHasFlags ? Color.BLUE_500 : undefined}>
        {getString('cf.selectSegmentModal.flagsUsingSegment', { counter: segment?.included?.length })}
      </Text> */}
    </ItemContainer>
  )
}
