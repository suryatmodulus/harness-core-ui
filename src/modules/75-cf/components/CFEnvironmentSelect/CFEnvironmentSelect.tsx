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
