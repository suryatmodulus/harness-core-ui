import React, { FC } from 'react'
import { Color, Tag, Text } from '@wings-software/uicore'
import type { Target } from 'services/cf'
import { useStrings } from 'framework/strings'

import css from './TargetGroupCriteriaTargetListing.module.scss'

export interface TargetGroupCriteriaTargetListingProps {
  targets?: Target[]
}

const TargetGroupCriteriaTargetListing: FC<TargetGroupCriteriaTargetListingProps> = ({ targets = [] }) => {
  const { getString } = useStrings()

  if (!targets || targets.length < 1) {
    return <Text color={Color.GREY_400}>{getString('cf.segmentDetail.noTargetDefined')}</Text>
  }

  return (
    <ul className={css.listing}>
      {targets.map(({ name, identifier }) => (
        <li key={identifier}>
          <Tag>{name}</Tag>
        </li>
      ))}
    </ul>
  )
}

export default TargetGroupCriteriaTargetListing
