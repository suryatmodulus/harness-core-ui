import React from 'react'
import { Color, Container, Text } from '@wings-software/uicore'
import dataErrorImage from '@cv/assets/dataError.svg'

import type { ChangeSourceFetchingErrorProps } from './ChangesSourceFetchingErrorProps.types'
import css from './ChangesSourceFetchingError.module.scss'

export default function ChangeSourceFetchingError(props: ChangeSourceFetchingErrorProps): JSX.Element {
  const { errorMessage } = props
  return (
    <Container className={css.errorContainer}>
      <img src={dataErrorImage} />
      <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.errorText}>
        {errorMessage}
      </Text>
    </Container>
  )
}
