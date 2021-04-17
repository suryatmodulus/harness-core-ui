import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Container, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import css from './ResourcesPage.module.scss'

const ResourcesPage: React.FC = ({ children }) => {
  const { orgIdentifier, accountId, projectIdentifier }: any = useParams()
  const { getString } = useStrings()
  return (
    <>
      <Page.Header
        title={getString('resourcePage.title')}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toCDResourcesConnectors({ accountId, projectIdentifier, orgIdentifier })}
              >
                {getString('resourcePage.connectors')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toCDResourcesSecretsListing({ accountId, projectIdentifier, orgIdentifier })}
              >
                {getString('resourcePage.secrets')}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {getString('resourcePage.delegates')}
              </NavLink>
              {/* TODO: ENABLE IT WHEN IMPLEMENTED */}
              {/* <NavLink className={css.tags} to="#TBD">
                {getString('resourcePage.templates')}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {getString('resourcePage.fileStore')}
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
