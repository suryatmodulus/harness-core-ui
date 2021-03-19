import React from 'react'
import { Container } from '@wings-software/uicore'

import SignupIllustration from './images/SignupIllustration.png'
import css from './AuthLayout.module.scss'

const AuthLayout: React.FC<React.PropsWithChildren<{}>> = props => {
  return (
    <div className={css.layout}>
      <div className={css.cardColumn}>
        <div className={css.card}>
          <Container>{props.children}</Container>
        </div>
      </div>
      <div className={css.imageColumn}>
        <img className={css.image} src={SignupIllustration} alt="" aria-hidden />
      </div>
    </div>
  )
}

export default AuthLayout
