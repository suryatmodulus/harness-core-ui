import React from 'react'
import { NavLink, useParams ,Link,useLocation} from 'react-router-dom'
import { Container, Layout ,Text,Color} from '@wings-software/uicore'

import { useStrings } from 'framework/exports'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import css from './SecretsDetailHomePage.module.scss'

const SecretsDetailHomePage: React.FC = ({ children }) => {
  
  const { accountId, projectIdentifier, orgIdentifier, secretId,module } = useParams()
  const { getString } = useStrings()
  const { pathname } = useLocation()
  
  
  return (
    <>
      <Page.Header
         className={css.header}
         title={
          <Layout.Vertical>
            <div>
              <Link to={`${pathname.substring(0, pathname.lastIndexOf('/secrets'))}`}>{getString('resources')}</Link> /{' '}
              <Link to={`${pathname.substring(0, pathname.lastIndexOf('/'+secretId))}`}>{getString('secrets')}</Link>
            </div>
            <Text font={{ size: 'medium' }} color={Color.BLACK}>
              {secretId}
            </Text>
          </Layout.Vertical>
        }
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toSecretDetailsOverview({accountId,projectIdentifier, orgIdentifier ,secretId,module})
                }
              >
                {getString('overview')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toSecretDetailsReferences({accountId,projectIdentifier, orgIdentifier ,secretId,module})
              }
              >
                {getString('references')}
              </NavLink>

              
                <NavLink
                  className={css.tags}
                  activeClassName={css.activeTag}
                  to={routes.toSecretDetailsActivity({accountId,projectIdentifier, orgIdentifier ,secretId,module})
                  }
                >
                  {getString('activity')}
                </NavLink>
              
              
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default SecretsDetailHomePage
