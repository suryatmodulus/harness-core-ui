import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Container, Layout } from '@wings-software/uicore'

import { Page } from '@common/exports'
import { useStrings } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import css from './AccessControlPage.module.scss'

const AccessControlPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams()
  const { getString } = useStrings()
  return (
    <>
      <Page.Header
        title={getString('accessControl')}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module })}
              >
                {getString('users')}
              </NavLink>
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toUserGroups({ accountId, orgIdentifier, projectIdentifier, module })}
              >
                {getString('common.userGroups')}
              </NavLink>
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toResourceGroups({ accountId, orgIdentifier, projectIdentifier, module })}
              >
                {getString('resourceGroups')}
              </NavLink>
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toRoles({ accountId, orgIdentifier, projectIdentifier, module })}
              >
                {getString('roles')}
              </NavLink>
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default AccessControlPage
