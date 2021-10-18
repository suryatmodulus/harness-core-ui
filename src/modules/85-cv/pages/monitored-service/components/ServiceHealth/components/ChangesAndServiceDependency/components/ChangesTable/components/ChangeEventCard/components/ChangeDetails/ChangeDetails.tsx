import React from 'react'
import cx from 'classnames'
import { Text, Container, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { createDetailsTitle, getOnClickOptions, statusToColorMapping } from './ChangeDetails.utils'
import type { ChangeDetailsDataInterface } from '../../ChangeEventCard.types'
import StatusChip from './components/StatusChip/StatusChip'
import css from './ChangeDetails.module.scss'

export default function ChangeDetails({
  ChangeDetailsData
}: {
  ChangeDetailsData: ChangeDetailsDataInterface
}): JSX.Element {
  const { getString } = useStrings()
  const { type, category, details, status } = ChangeDetailsData
  const { color, backgroundColor } = statusToColorMapping(status) || {}

  return (
    <Container>
      {type && category ? (
        <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
          {createDetailsTitle(type, category)} {getString('details')}
        </Text>
      ) : null}
      <div className={css.gridContainer}>
        {Object.entries(details).map(item => {
          const value = typeof item[1] === 'string' ? item[1] : item[1]?.name
          return value ? (
            <>
              <Text className={css.gridItem} font={{ size: 'small' }}>
                {item[0]}
              </Text>
              <Text
                className={cx(typeof item[1] !== 'string' && item[1]?.url && css.isLink)}
                font={{ size: 'small' }}
                {...getOnClickOptions(item[1])}
              >
                {value}
              </Text>
            </>
          ) : null
        })}
      </div>
      {status ? <StatusChip status={status} color={color} backgroundColor={backgroundColor} /> : null}
    </Container>
  )
}
