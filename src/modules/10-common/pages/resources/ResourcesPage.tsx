import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Container, Layout } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from './ResourcesPage.module.scss'

const ResourcesPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { CDNG_ENABLED, NG_SHOW_DELEGATE } = useFeatureFlags()
  const { getString } = useStrings()

  return (
    <>
      <Page.Header
        title={getString('resources')}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toResourcesConnectors({ accountId, orgIdentifier, projectIdentifier, module })}
              >
                {getString('connectorsLabel')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toResourcesSecrets({ accountId, orgIdentifier, projectIdentifier, module })}
              >
                {getString('common.secrets')}
              </NavLink>

              {CDNG_ENABLED && NG_SHOW_DELEGATE && !(projectIdentifier || orgIdentifier) ? (
                <NavLink
                  className={css.tags}
                  activeClassName={css.activeTag}
                  to={routes.toResourcesDelegates({ accountId, orgIdentifier, projectIdentifier, module })}
                >
                  {getString('delegate.delegates')}
                </NavLink>
              ) : null}
              {/* TODO: ENABLE IT WHEN IMPLEMENTED */}
              {/* <NavLink className={css.tags} to="#TBD">
                {i18n.templates}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {i18n.fileStore}
              </NavLink> */}
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default ResourcesPage
