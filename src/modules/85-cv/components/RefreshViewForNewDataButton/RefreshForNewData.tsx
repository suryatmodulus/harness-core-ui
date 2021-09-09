import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './RefreshForNewData.module.scss'

export interface RefreshViewForNewButtonProps {
  onClick: () => void
  className?: string
}

export function RefreshViewForNewData(props: RefreshViewForNewButtonProps): JSX.Element {
  const { onClick, className } = props
  const { getString } = useStrings()
  return (
    <Container onClick={() => onClick()} className={cx(css.main, className)}>
      <Text>{getString('pipeline.verification.refreshViewForNewData')}</Text>
      <Text intent="primary" icon="refresh" iconProps={{ size: 12 }}>
        {getString('common.refresh')}
      </Text>
      <Text>{getString('pipeline.verification.toGetLatest')}</Text>
    </Container>
  )
}
