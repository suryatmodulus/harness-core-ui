import React from 'react'
import { Icon } from '@wings-software/uicore'
import css from './GitOps.module.scss'

const GitOpsPage: React.FC = props => {
  const icon = props.showNavbar ? 'chevron-left' : 'chevron-right'

  return (
    <div className={css.gitOpsPage}>
      <iframe id="argoCD" name="argoCD" className={css.argoCd} title="argoCD" src="http://localhost:8090/"></iframe>

      <div className={css.backToHarness} onClick={props.onShowNavbar}>
        <Icon className={css.navControllerIcon} name={icon} size={30} />
      </div>
    </div>
  )
}

export default GitOpsPage
