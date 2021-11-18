import React from 'react'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import css from './GitOpsServersHomePage.module.scss'

const GitOpsServersPage: React.FC = ({ children }) => {
  const { getString } = useStrings()

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2> {getString('cd.gitOps')}</h2>
          </div>
        }
        className={css.header}
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />
      <div className={css.children}>{children}</div>
    </>
  )
}

export default GitOpsServersPage
