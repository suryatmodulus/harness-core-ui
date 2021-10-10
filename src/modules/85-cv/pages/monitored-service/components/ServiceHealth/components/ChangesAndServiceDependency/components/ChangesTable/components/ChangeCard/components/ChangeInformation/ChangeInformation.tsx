import React from 'react'
import cx from 'classnames'
import { Text, Container, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './ChangeInformation.module.scss'

interface ChangeInfoData {
  triggerAt: string
  summary: {
    priority: string
    assignee: string
    urgency: string
    policy: string
  }
}

export default function ChangeInformation({ infoData }: { infoData: ChangeInfoData }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container>
      <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
        {getString('cv.changeSource.changeSourceCard.information')}
      </Text>
      <Container className={css.infoContainer}>
        <Text className={css.timeLabel} icon={'time'} iconProps={{ size: 13 }} font={{ size: 'small' }}>
          {`${getString('cv.changeSource.changeSourceCard.triggred')} ${infoData.triggerAt}`}
        </Text>
        <Text className={css.summaryTitle}>{'Summary'}</Text>
        <div className={css.summaryTable}>
          {Object.entries(infoData.summary).map(item => {
            return (
              <div key={item[0]} className={cx(css.summaryRow)}>
                <Container className={css.summaryCell}>
                  <Text className={cx(css.summaryKey)}>{item[0]}</Text>
                </Container>
                <Container className={css.summaryCell}>
                  <Text className={cx(css.summaryValue)}>{item[1]}</Text>
                </Container>
              </div>
            )
          })}
        </div>
      </Container>
    </Container>
  )
}
