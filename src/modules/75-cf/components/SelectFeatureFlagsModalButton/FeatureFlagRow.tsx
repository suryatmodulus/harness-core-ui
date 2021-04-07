import React, { useState } from 'react'
import { Container, Select, SelectOption } from '@wings-software/uicore'
import { SegmentItem } from '@cf/pages/target-details/segments/SegmentItem'
import { CFVariationColors } from '@cf/constants'
import type { Feature } from 'services/cf'
import { ItemContainer } from '../ItemContainer/ItemContainer'

export interface FeatureRowProps {
  feature: Feature
  checked: boolean
  onChecked: (checked: boolean, feature: Feature) => void
}

export const FeatureFlagRow: React.FC<FeatureRowProps> = ({ feature, checked, onChecked }) => {
  const [isChecked, setIsChecked] = useState(checked)
  const toggleCheck = (): void => {
    setIsChecked(previous => {
      onChecked(!previous, feature)
      return !previous
    })
  }
  const variationSelectItems = feature.variations.map<SelectOption>((elem, index) => ({
    label: elem.name as string,
    value: elem.identifier as string,
    icon: { name: 'full-circle', style: { color: CFVariationColors[index] } }
  }))

  const onSelectChanged = (_item: SelectOption): void => {
    // console.log({ item })
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
      <SegmentItem
        noAvatar
        name={feature.name}
        description={feature.description as string}
        style={{ boxShadow: 'none', flexGrow: 1, paddingLeft: 'var(--spacing-xsmall)' }}
        padding="none"
      />
      <Container width={175}>
        <Select items={variationSelectItems} onChange={onSelectChanged} />
      </Container>
    </ItemContainer>
  )
}
