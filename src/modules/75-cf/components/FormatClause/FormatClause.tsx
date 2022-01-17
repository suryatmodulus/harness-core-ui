import React, { FC } from 'react'
import { FontVariation, Text } from '@wings-software/uicore'
import type { Clause } from 'services/cf'
import { useOperatorsFromYaml } from '@cf/constants'

export interface FormatClauseProps {
  clause: Clause
}

const FormatClause: FC<FormatClauseProps> = ({ clause }) => {
  const [operators] = useOperatorsFromYaml()

  const operation = operators.find(({ value }) => clause.op === value)?.label || 'NO_OP'

  return (
    <Text font={{ variation: FontVariation.FORM_LABEL }} lineClamp={1}>
      <strong>{clause.attribute}</strong> {operation} <strong>{clause.values.join(', ')}</strong>
    </Text>
  )
}

export default FormatClause
