/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
