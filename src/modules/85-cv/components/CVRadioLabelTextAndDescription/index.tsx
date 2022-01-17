import React from 'react'
import { Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'

interface CVRadioLabelTextAndDescriptionProps {
  label: keyof StringsMap
  description: keyof StringsMap
}

const CVRadioLabelTextAndDescription: React.FC<CVRadioLabelTextAndDescriptionProps> = ({ label, description }) => {
  const { getString } = useStrings()

  return (
    <>
      <Text color={Color.GREY_700}>{getString(label)}</Text>
      <Text color={Color.GREY_350} font={{ size: 'small' }}>
        {getString(description)}
      </Text>
    </>
  )
}

export default CVRadioLabelTextAndDescription
