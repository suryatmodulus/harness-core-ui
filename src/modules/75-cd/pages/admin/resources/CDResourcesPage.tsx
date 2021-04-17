import { Container, Layout } from '@wings-software/uicore'
import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useStrings } from 'framework/exports'
import css from './CDResourcesPage.module.scss'

const CDResourcesPage: React.FC = ({ children }) => {
  const { orgIdentifier, projectIdentifier, accountId }: any = useParams()
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
                to={routes.toCDResourcesConnectors({ orgIdentifier, projectIdentifier, accountId })}
              >
                {getString('resourcePage.connectors')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toCDResourcesSecretsListing({ orgIdentifier, projectIdentifier, accountId })}
              >
                {getString('resourcePage.secrets')}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {getString('resourcePage.delegates')}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {getString('resourcePage.templates')}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {getString('resourcePage.fileStore')}
              </NavLink>
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default CDResourcesPage
