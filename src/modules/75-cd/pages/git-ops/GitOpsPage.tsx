import React from 'react'
// import { Button } from '@wings-software/uicore'
import css from './GitOps.module.scss'

const GitOpsPage: React.FC = () => {
  return (
    <div className={css.gitOpsPage}>
      <iframe id="argoCD" name="argoCD" className={css.argoCd} title="argoCD" src="http://localhost:8090/"></iframe>
      {/* <Button
        className={css.harnessMenu}
        intent="primary"
        icon="chevron-right"
        text="Harness Menu"
        iconProps={{ size: 18 }}
      /> */}
    </div>
  )
}

export default GitOpsPage
