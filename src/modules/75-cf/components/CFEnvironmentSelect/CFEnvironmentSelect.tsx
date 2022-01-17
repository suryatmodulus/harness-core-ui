/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './CFEnvironmentSelect.module.scss'

export const CFEnvironmentSelect = ({ component }: { component: ReactElement }): ReactElement => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small" className={css.container}>
      <span className={css.label}>{getString('environment')}</span>
      {component}
    </Layout.Horizontal>
  )
}
