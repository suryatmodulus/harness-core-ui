import React from 'react'
import { FontVariation, Text } from '@wings-software/uicore'
import type { RiskCount } from 'services/cv'

interface SLOCardSelectProps extends RiskCount {
  displayColor: string
}

const SLOCardSelect: React.FC<SLOCardSelectProps> = ({ displayName, count, displayColor }) => {
  return (
    <>
      <Text font={{ variation: FontVariation.FORM_HELP }}>{displayName}</Text>
      <Text color={displayColor} font={{ variation: FontVariation.H2 }}>
        {count}
      </Text>
    </>
  )
}

export default SLOCardSelect
