import React, { FC } from 'react'
import { Color, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Clause } from 'services/cf'
import FormatClause from '@cf/components/FormatClause/FormatClause'

import css from './TargetGroupCriteriaConditionListing.module.scss'

export interface TargetGroupCriteriaConditionListingProps {
  rules?: Clause[]
}

const TargetGroupCriteriaConditionListing: FC<TargetGroupCriteriaConditionListingProps> = ({ rules = [] }) => {
  const { getString } = useStrings()

  if (!rules || rules.length < 1) {
    return <Text color={Color.GREY_400}>{getString('cf.segmentDetail.noConditionDefined')}</Text>
  }

  return (
    <ul className={css.listing}>
      {rules.map(clause => (
        <li key={clause.id}>
          <FormatClause clause={clause} />
        </li>
      ))}
    </ul>
  )
}

export default TargetGroupCriteriaConditionListing
