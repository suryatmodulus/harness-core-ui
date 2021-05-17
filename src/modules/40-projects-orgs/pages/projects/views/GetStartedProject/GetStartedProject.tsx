import React from 'react'

import { useHistory, useParams, Link } from 'react-router-dom'
import { Button, Heading, Color, Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { Page } from '@common/components/Page/Page'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import getStarted from './images/getStarted.png'
import css from './GetStartedProject.module.scss'

const GetStartedProject: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  let projectCreated = false
  const history = useHistory()
  const { getString } = useStrings()
  useDocumentTitle(getString('getStarted'))

  const projectCreateSuccessHandler = (): void => {
    /* istanbul ignore next */
    projectCreated = true
  }
  const { openProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler,
    onCloseModal: () => {
      /*  istanbul ignore next  */ if (projectCreated) {
        history.push(routes.toProjects({ accountId }))
      }
    }
  })
  return (
    <>
      <Page.Header
        title={getString('getStarted')}
        content={<Link to={routes.toProjects({ accountId })}>{getString('projectsText')}</Link>}
      />
      <div className={css.getStartedMainContainer}>
        <Layout.Vertical spacing="xxxlarge" flex>
          <Layout.Vertical spacing="medium" flex>
            <img src={getStarted} className={css.image} />
            <Heading level={1} font={{ weight: 'bold' }} color={Color.BLACK}>
              {getString('projectsOrgs.welcome')}
            </Heading>
            <Heading color={Color.GREY_600} level={2}>
              {getString('projectsOrgs.welcomeSecondLine')}
            </Heading>
          </Layout.Vertical>
          <Button intent="primary" text={getString('projectLabel')} icon="plus" onClick={() => openProjectModal()} />
        </Layout.Vertical>
      </div>
    </>
  )
}
export default GetStartedProject
