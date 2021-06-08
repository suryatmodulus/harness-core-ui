import React, { useEffect, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'
import { Button, Heading, Color, Layout, Container, Text, useModalHook } from '@wings-software/uicore'
import Joyride from 'react-joyride'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'

import { Page } from '@common/components/Page/Page'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import getStarted from './images/getStarted.png'
import NeutralCard from './images/Neutral Card (1).png'
import Boy from './images/Boy.png'
import GirlCard from './images/Girl Card.png'
import Frame from './images/Frame 4566.png'
import css from './GetStartedProject.module.scss'

const modalProps: IDialogProps = {
  isOpen: true,
  style: {
    width: 750,
    minHeight: 350,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}
const GetStartedProject: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  useDocumentTitle(getString('getStarted'))

  const { openProjectModal } = useProjectModal({
    onSuccess: () => {
      history.push(routes.toProjects({ accountId }))
    }
  })

  const [showModal, hideModal] = useModalHook(() => {
    // const closeHandler1 = (): void => {
    //   hideModal()
    // }
    const closeHandler = (): void => {
      hideModal()
      showModal2()
    }

    return (
      <Dialog {...modalProps}>
        <div style={{ display: 'flex' }}>
          <Container style={{ flex: 1, marginTop: '30px', alignItems: 'center' }}>
            <img src={Frame} style={{ height: '100%', width: '100%', marginTop: '10px' }} />
          </Container>
          <Container style={{ flex: 2, marginTop: '30px', alignItems: 'center', marginLeft: '35px' }}>
            <h2>You are ready to go ...</h2>
            <p>
              Kickstart your harness journey with our beginners crash course that will guide you through your first
              Kubernetes deployment!.
            </p>
            <Button intent="primary" text={'Start Crash Course'} style={{ marginTop: '55px' }} onClick={closeHandler} />
            <Text style={{ marginTop: '10px', color: 'blue' }}>Its okay , I already know to use Harness.</Text>
          </Container>
          )
        </div>
        {/* <Layout.Vertical spacing="large" padding="huge"> */}
        {/* <Layout.Horizontal width="25%">
            <Container
              style={{
                background: `transparent url(${imgSrc}) no-repeat`,
                backgroundSize: 'stretch',
                backgroundPositionX: '15%',
                backgroundPositionY: 'center',
                alignItems: 'center'
              }}
            ></Container>
          </Layout.Horizontal> */}
        {/* <Layout.Horizontal width="75%">
            <Container style={{ marginTop: '30px', alignItems: 'center', backgroundImage: `url(${imgSrc})` }}>
              <h2>You are ready to go ...</h2>
              <p>
                Kickstart your harness journey with our beginners crash course that will guide you through your first
                Kubernetes deployment!.
              </p>
              <Button
                intent="primary"
                text={'Start Crash Course'}
                style={{ marginTop: '55px' }}
                onClick={closeHandler}
              />
              <Text style={{ marginTop: '10px', color: 'blue' }}>Its okay , I already know to use Harness.</Text>
            </Container>
          </Layout.Horizontal>
        </Layout.Vertical> */}
        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
      </Dialog>
    )
  }, [])
  const [runFlag, setFlag] = useState(false)
  const [showModal2, hideModal2] = useModalHook(() => {
    const closeHandler = (): void => {
      setFlag(true)
      hideModal2()
    }

    return (
      <Dialog {...modalProps}>
        <div style={{ display: 'flex' }}>
          <Container style={{ flex: 1, marginTop: '30px', alignItems: 'center', background: 'azure' }}>
            <h3 style={{ fontStyle: 'Italic', margin: '30px' }}>It is the year 1284</h3>
            <Text style={{ margin: '25px' }}>
              Backstory here.You are in a small sand dune in a desert.Your goal is to cross the desert to the sea and
              release your ship from its dock so it can be deployed.The world is counting on you to get ship done.
            </Text>
          </Container>
          <Container style={{ flex: 2, marginTop: '30px', alignItems: 'center', marginRight: '35px' }}>
            <h2>Select your Avatar</h2>
            <img src={NeutralCard} style={{ margin: '10px', width: '100px' }} />
            <img src={Boy} style={{ margin: '10px', width: '100px' }} />
            <img src={GirlCard} style={{ margin: '10px', width: '100px' }} />
            <Button intent="primary" text={'Continue'} style={{ marginTop: '75px' }} onClick={closeHandler} />
          </Container>
          )
        </div>

        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
      </Dialog>
    )
  }, [])

  useEffect(() => {
    showModal()
  }, [])
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
      content: (
        <div style={{ display: 'flex' }}>
          <img src={NeutralCard}></img>
          <p>
            Let's begin our journey! Project in Harness is like your locker in a bank.You will create your pipelines
            inside a project after building your configurations inside it.Start creating your project by clicking on
            +Project button.{' '}
          </p>
        </div>
      ),
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      target: '.bp3-button',
      disableBeacon: true
    }
  ]

  return (
    <>
      <Joyride
        // callback={handleJoyrideCallback}
        hideBackButton={true}
        continuous={true}
        // getHelpers={this.getHelpers}
        run={runFlag}
        scrollToFirstStep={true}
        // showProgress={true}
        showSkipButton={true}
        steps={steps}
        styles={{
          options: {
            zIndex: 100
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
          <Button intent="primary" text={getString('projectLabel')} icon="plus" onClick={() => openProjectModal()} />
        </Layout.Vertical>
      </div>
    </>
  )
}

export default GetStartedProject
