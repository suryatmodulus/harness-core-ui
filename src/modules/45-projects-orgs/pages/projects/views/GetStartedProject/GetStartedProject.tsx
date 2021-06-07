import React from 'react'

import { useHistory, useParams } from 'react-router-dom'
import { Button, Heading, Color, Layout } from '@wings-software/uicore'
import Joyride from 'react-joyride'
import routes from '@common/RouteDefinitions'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'

import { Page } from '@common/components/Page/Page'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import getStarted from './images/getStarted.png'
import css from './GetStartedProject.module.scss'

const GetStartedProject: React.FC = () => {
  // const [run, setRun] = useState(true)
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  useDocumentTitle(getString('getStarted'))

  const { openProjectModal } = useProjectModal({
    onSuccess: () => {
      history.push(routes.toProjects({ accountId }))
    }
  })
  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { status, type } = data
  //   const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

  //   if (finishedStatuses.includes(status)) {
  //     setRun({ false })
  //   }

  //   console.groupCollapsed(type)
  //   console.log(data)
  //   console.groupEnd()
  // }

  const steps = [
    {
      content: <h2>Let's begin our journey! </h2>,
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      target: '.bp3-button'
    }
  ]

  return (
    <>
      <Joyride
        // callback={handleJoyrideCallback}
        // continuous={true}
        // getHelpers={this.getHelpers}
        run={true}
        // scrollToFirstStep={true}
        // showProgress={true}
        // showSkipButton={true}
        steps={steps}
        styles={{
          options: {
            zIndex: 10000
          }
        }}
      />
      <Page.Header title={getString('getStarted')} />
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
          <Button
            intent="primary"
            text={getString('projectLabel')}
            icon="plus"
            onClick={() => openProjectModal()}
            className={css.tour}
          />
        </Layout.Vertical>
      </div>
    </>
  )
}
export default GetStartedProject
