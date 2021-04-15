import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Container, Layout } from '@wings-software/uicore'

import { useStrings } from 'framework/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'

import css from './ResourcesPage.module.scss'

const ResourcesPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
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
                to={
                  orgIdentifier && projectIdentifier
                    ? routes.toProjectResourcesConnectors({ accountId, orgIdentifier, projectIdentifier })
                    : orgIdentifier
                    ? routes.toOrgResourcesConnectors({ accountId, orgIdentifier })
                    : routes.toResourcesConnectors({ accountId })
                }
              >
                {getString('connectors.label')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={
                  orgIdentifier && projectIdentifier
                    ? routes.toProjectResourcesSecrets({ accountId, orgIdentifier, projectIdentifier })
                    : orgIdentifier
                    ? routes.toOrgResourcesSecretsListing({ accountId, orgIdentifier })
                    : routes.toResourcesSecretsListing({ accountId })
                }
              >
                {getString('common.secrets')}
              </NavLink>

              {CDNG_ENABLED && NG_SHOW_DELEGATE && !(projectIdentifier || orgIdentifier) ? (
                <NavLink
                  className={css.tags}
                  activeClassName={css.activeTag}
                  to={
                    orgIdentifier
                      ? routes.toOrgResourcesDelegates({ accountId, orgIdentifier })
                      : routes.toResourcesDelegates({ accountId })
                  }
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
