import React from 'react'
import { Color, Container } from '@wings-software/uicore'
import css from './PercentageBar.module.scss'

interface PercentageBar {
  width: number
}
const PercentageBar: React.FC<PercentageBar> = ({ width }) => {
  return (
    <Container
      background={Color.GREY_100}
      width="100%"
      height={10}
      border={{ radius: 4 }}
      margin={{ bottom: 'small' }}
      className={css.bar}
    >
      <Container height="100%" width={`${width}%`} background={Color.PRIMARY_6} border={{ radius: 4 }} />
    </Container>
  )
}

export default PercentageBar
