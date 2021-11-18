import { CardSelect, CardSelectType, Color, Text, FontVariation } from '@wings-software/uicore'
import React from 'react'
import type { FilterCardProps } from './FilterCard.types'
import css from './FilterCard.module.scss'

const FilterCard: React.FC<FilterCardProps> = ({ data, cardClassName, selected, onChange }) => {
  return (
    <CardSelect
      type={CardSelectType.CardView}
      data={data}
      cardClassName={cardClassName}
      renderItem={({ title, icon, iconSize = 24, count }) => (
        <>
          <Text
            color={Color.GREY_900}
            font={{ variation: FontVariation.SMALL_SEMI }}
            rightIcon={icon}
            rightIconProps={{ color: Color.GREY_700, size: iconSize }}
            height={24}
          >
            {title}
          </Text>
          <Text color={Color.BLACK} font={{ variation: FontVariation.H2 }} className={css.lineHeight}>
            {count ?? 0}
          </Text>
        </>
      )}
      selected={selected}
      onChange={onChange}
    />
  )
}

export default FilterCard
