/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@blueprintjs/core'
import type { InputIconType } from './types'
import css from './InputIcon.module.scss'

export const InputIcon = ({ isDisabled, onClick }: InputIconType): React.ReactElement => (
  <Button minimal icon={'plus'} disabled={isDisabled} onClick={onClick} className={css.iconButton} />
)
