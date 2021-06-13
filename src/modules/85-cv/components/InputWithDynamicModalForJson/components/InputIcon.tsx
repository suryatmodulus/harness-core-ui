import React from 'react'
import { Button } from '@blueprintjs/core'
import type { InputIconType } from './types'
import css from './InputIcon.module.scss'

export const InputIcon = ({ isDisabled, onClick, testId }: InputIconType): React.ReactElement => (
  <Button
    minimal
    icon={'plus'}
    disabled={isDisabled}
    onClick={onClick}
    className={css.iconButton}
    data-testid={testId}
  />
)
