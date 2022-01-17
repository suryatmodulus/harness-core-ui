/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  Button,
  Container,
  Text,
  StepProps,
  CardSelect,
  CardBody,
  CodeBlock
} from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import type { IconName } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { FlagTypeSdk, FlagTypeLanguage } from '../CreateFlagDialog/FlagDialogUtils'
import css from './FlagElemTest.module.scss'

interface CardData {
  text: string
  value: string
  icon: string
}

interface CardLanguageData {
  value: string
  icon: string
}

// FIXME: Need to change values because we need dynamic code samples
const selectClientLanguageData: CardLanguageData[] = [
  {
    value: 'jira',
    icon: 'service-jira'
  },
  {
    value: 'datadog',
    icon: 'service-datadog'
  }
]

// FIXME: Need to change values because we need dynamic code samples
const selectServerLanguageData: CardLanguageData[] = [
  {
    value: 'aws',
    icon: 'service-aws'
  },
  {
    value: 'github',
    icon: 'service-github'
  }
]

interface FlagElemTestProps {
  fromWizard: boolean
  hideModal?: () => void
}

// FIXME: Change any for StepProps
const FlagElemTest: React.FC<StepProps<any> & FlagElemTestProps> = props => {
  const { previousStep, prevStepData, fromWizard, hideModal } = props

  const [selectedCard, setSelectedCard] = useState<CardData | undefined>(undefined)
  const [isClient, setIsClient] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<CardLanguageData | undefined>(undefined)
  const [selectLanguageSdk, setSelectLanguageSdk] = useState('')
  const [btnPosition, setBtnPosition] = useState(true)
  const { getString } = useStrings()

  const renderInstallLanguage = (): string => {
    if (selectLanguageSdk === FlagTypeLanguage.jira) {
      return 'npm install harness-toolkit --save'
    }
    return 'npm install harness-client --save'
  }

  const renderInstallSdk = (): string => {
    if (selectLanguageSdk === FlagTypeLanguage.jira) {
      return 'npm install -global create-react-app'
    }
    return 'npm install -global yarn'
  }

  const renderCodeSample = (): string => {
    if (selectLanguageSdk === FlagTypeLanguage.jira) {
      // prettier-ignore
      return (
        `setTimeout(() => {
          if (harness.isEnabled('name') {
            console.log('Toggle enabled')
          } else {
            console.log('Toggle disabled')
          }
        }, 2000)`
      )
    }
    return (
      // prettier-ignore
      `setInterval(() => {
        if (harness.isEnabled('PrepopulateName') {
          console.log('Toggle enabled')
        } else {
          console.log('Toggle disabled')
        }
      }, 1000)`
    )
  }

  const onVerifyFlag = (): void => {
    setTimeout(() => {
      alert('To be implemented...')
    }, 500)
  }

  const onClickBack = (): void => {
    previousStep?.({ ...prevStepData })
  }

  const selectCardData: CardData[] = [
    {
      text: getString('cf.testTheFlag.sdkClient'),
      value: FlagTypeSdk.client,
      icon: 'desktop'
    },
    {
      text: getString('cf.testTheFlag.sdkServer'),
      value: FlagTypeSdk.server,
      icon: 'service-nexus'
    }
  ]

  return (
    <Formik
      formName="flagElemTestForm"
      initialValues={{ selectedIcon: '' }}
      onSubmit={() => {
        // TODO: Uncomment when back-end for SDK is done
        // if (fromWizard) {
        //   return nextStep?.({ ...prevStepData, ...vals })
        // }
        // TODO: When the user is on edit targeting page only submit the Formik from this step

        if (confirm(getString('cf.testTheFlag.confirmClose'))) {
          hideModal?.()
        }
      }}
    >
      {formikProps => (
        <Form>
          <Layout.Vertical className={css.testFlagContainer}>
            <Text
              color={Color.BLACK}
              font={{ size: 'medium', weight: 'bold' }}
              margin={{ bottom: 'medium' }}
              className={cx(css.testFfHeadline, !btnPosition && css.borderBottom)}
            >
              {fromWizard
                ? getString('cf.testTheFlag.testFlagHeading').toUpperCase()
                : getString('cf.testTheFlag.testFlagTargetHeading').toUpperCase()}
            </Text>
            <Container>
              <Text color={Color.BLACK} margin={{ top: 'large', bottom: 'large' }}>
                {getString('cf.testTheFlag.setupAppText')}
              </Text>
              <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
                {getString('cf.testTheFlag.selectSdk')}
              </Text>
              <CardSelect
                data={selectCardData}
                selected={selectedCard}
                className={css.selectOptionsCard}
                onChange={item => {
                  setSelectedCard(item)
                  setSelectedLanguage(undefined)
                  setSelectLanguageSdk('')
                  setBtnPosition(true)
                  setIsClient(item.value === FlagTypeSdk.client)
                  formikProps.setFieldValue('selectedIcon', item.value)
                }}
                renderItem={(item, selected) => (
                  <CardBody.Icon icon={item.icon as IconName} iconSize={20}>
                    <Text
                      font={{ size: 'small', align: 'center' }}
                      style={{
                        color: selected ? Color.GREY_900 : Color.GREY_350
                      }}
                    >
                      {item.text}
                    </Text>
                  </CardBody.Icon>
                )}
              ></CardSelect>
            </Container>
            {/* FIXME: Check the setSelectedCard useState method */}
            {isEmpty(selectedCard) ? null : (
              <Container>
                <Text margin={{ top: 'medium', bottom: 'small' }}>{getString('cf.testTheFlag.selectSdkLanguage')}</Text>
                <CardSelect
                  data={isClient ? selectClientLanguageData : selectServerLanguageData}
                  selected={selectedLanguage}
                  className={css.selectOptionsCard}
                  onChange={item => {
                    setSelectedLanguage(item)
                    setSelectLanguageSdk(item.value)
                    setBtnPosition(false)
                    formikProps.setFieldValue('selectedIcon', item.value)
                  }}
                  renderItem={item => <CardBody.Icon icon={item.icon as IconName} iconSize={20} />}
                ></CardSelect>
              </Container>
            )}
            {isEmpty(selectedLanguage) ? null : (
              <>
                <Layout.Vertical>
                  <Container margin={{ top: 'large', bottom: 'large' }} className={css.testCodeBlock}>
                    <Text color={Color.BLACK} font={{ weight: 'bold' }}>
                      1. {getString('cf.testTheFlag.installNode')}
                    </Text>
                    <CodeBlock allowCopy format="pre" snippet={renderInstallLanguage()} />
                  </Container>
                  <Container margin={{ top: 'large', bottom: 'large' }} className={css.testCodeBlock}>
                    <Text color={Color.BLACK} font={{ weight: 'bold' }}>
                      2. {getString('cf.testTheFlag.initClient')}
                    </Text>
                    <CodeBlock allowCopy format="pre" snippet={renderInstallSdk()} />
                  </Container>
                  <Container margin={{ top: 'large', bottom: 'large' }} className={css.testCodeBlock}>
                    <Text color={Color.BLACK} font={{ weight: 'bold' }}>
                      3. {getString('cf.testTheFlag.codeSample')}
                    </Text>
                    <CodeBlock allowCopy format="pre" snippet={renderCodeSample()} />
                    <Text margin={{ top: 'large' }}>{getString('cf.testTheFlag.codeSampleNote')}</Text>
                  </Container>
                </Layout.Vertical>
                <Container margin={{ top: 'large', bottom: 'large' }}>
                  <Text font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
                    {getString('cf.testTheFlag.verifyText')}
                  </Text>
                  <Button intent="primary" text={getString('cf.testTheFlag.verify')} onClick={onVerifyFlag} />
                </Container>
              </>
            )}
            <Layout.Horizontal
              className={cx(css.btnsGroup, btnPosition && css.btnsGroupPosa, !btnPosition && css.borderTop)}
            >
              {fromWizard && <Button text={getString('back')} onClick={onClickBack} margin={{ right: 'small' }} />}
              <Button text={getString('close')} type="submit" />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Form>
      )}
    </Formik>
  )
}

export default FlagElemTest
