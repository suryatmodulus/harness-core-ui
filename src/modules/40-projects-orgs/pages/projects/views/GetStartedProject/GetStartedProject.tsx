import React from 'react'

import { useHistory, useParams, Link } from 'react-router-dom'
import { Button, Heading, Color, Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { Page } from '@common/components/Page/Page'
import { useStrings } from 'framework/exports'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import i18n from '../../ProjectsPage.i18n'
import getStarted from './images/getStarted.png'
import css from './GetStartedProject.module.scss'

const GetStartedProject: React.FC = () => {
  const { accountId }: any = useParams()
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
        title={i18n.getNewProjectStarted}
        content={<Link to={routes.toProjects({ accountId })}>{i18n.projects}</Link>}
      />
      <div className={css.getStartedMainContainer}>
        <Layout.Vertical spacing="xxxlarge" flex>
          <Layout.Vertical spacing="medium" flex>
            <img src={getStarted} className={css.image} />
            <Heading level={1} font={{ weight: 'bold' }} color={Color.BLACK}>
              {i18n.newProjectWizard.GetStartedProjectPage.welcome}
            </Heading>
            <Heading color={Color.GREY_600} level={2}>
              {i18n.newProjectWizard.GetStartedProjectPage.welcomeSecondLine}
            </Heading>
          </Layout.Vertical>
          <Button intent="primary" text={i18n.newProject} icon="plus" onClick={() => openProjectModal()} />
        </Layout.Vertical>
      </div>
    </>
  )
}
export default GetStartedProject
