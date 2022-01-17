/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Color, Container, Layout, Icon } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../ModuleRenderer.module.scss'

interface CFRendererProps {
  data: Project
  isPreview?: boolean
}
const CFRenderer: React.FC<CFRendererProps> = ({ data, isPreview }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  return (
    <Container
      border={{ top: true, color: Color.GREY_250 }}
      padding={{ top: 'medium', bottom: 'medium' }}
      className={css.moduleContainer}
      onClick={() => {
        !isPreview &&
          history.push(
            routes.toCFFeatureFlags({
              orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
              projectIdentifier: data.identifier,
              accountId
            })
          )
      }}
    >
      <Layout.Horizontal>
        <Container width="30%" border={{ right: true, color: Color.GREY_250 }} flex={{ align: 'center-center' }}>
          <Icon name="cf-main" size={35} />
        </Container>
        <Container width="70%" flex={{ align: 'center-center' }}>
          <Layout.Vertical flex={{ align: 'center-center' }}>
            {/* <Layout.Horizontal flex={{ align: 'center-center' }} className={css.activityChart} spacing="xxlarge">
              <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} />
              <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                {'10'}
              </Text>
            </Layout.Horizontal> */}
            <Text color={Color.PRIMARY_7} font={{ size: 'xsmall' }} className={css.moduleText}>
              {getString('projectsOrgs.gotoFeatureFlags')}
            </Text>
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default CFRenderer
