/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { templateStudioColorStyleMap } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import css from './TemplateStudioHeader.module.scss'

export interface TemplateStudioHeaderProps {
  templateType: TemplateType
}

export const TemplateStudioHeader: React.FC<TemplateStudioHeaderProps> = props => {
  const { templateType } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const studioTitle = templateFactory.getTemplateName(templateType) || 'Studio'
  const style = templateStudioColorStyleMap[templateType || 'Step']

  return (
    <Container>
      <Layout.Horizontal>
        <NGBreadcrumbs
          links={[
            {
              url: routes.toTemplates({ orgIdentifier, projectIdentifier, accountId, module }),
              label: getString('common.templates')
            }
          ]}
        />
      </Layout.Horizontal>
      <Container className={css.templateStudioTitle}>
        <svg width="210" height="26" viewBox="0 0 210 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20.3896 22.2945L1.10987 0.5H208.932L190.926 22.0853C189.121 24.2491 186.449 25.5 183.631 25.5H27.505C24.7836 25.5 22.1928 24.3328 20.3896 22.2945Z"
            fill={style.fill}
            stroke={style.stroke}
          />
        </svg>
        <Text font={{ size: 'xsmall', weight: 'bold' }} style={{ color: style.color }} className={css.title}>
          {studioTitle}
        </Text>
      </Container>
    </Container>
  )
}
