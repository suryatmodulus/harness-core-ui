import React, { useState } from 'react'
import { Layout, StepProps, Button, Color, Text, Container, Link } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { DelegateInfoDTO, DelegateConfigDTO } from '@delegates/DelegateInterface'
import Delegates4Ways from '../../Delegates4Ways/Delegates4Ways'
import harnessDelegate from './images/harness-delegate.svg'
import css from './DelegateDetailsStep.module.scss'

interface DelegateDetailsStepProps extends StepProps<DelegateConfigDTO> {
  type: string
  name: string
  delegateInfo?: DelegateConfigDTO | void
  detailsData?: string
  onClick?: any
}
export interface CardData {
  text: string
  value: string
  icon: string
  name: string
  type: string
}

const DelegateDetailsStep: React.FC<StepProps<DelegateInfoDTO> & DelegateDetailsStepProps> = props => {
  const { getString } = useStrings()
  const [selectedCard, setSelectedCard] = useState<CardData | undefined>()
  const handleOnSelect = (value: CardData): void => {
    /* istanbul ignore next */
    setSelectedCard(value)
  }

  return (
    <>
      <Layout.Horizontal spacing="large">
        <Container flex style={{ justifyContent: 'center', height: '220px', flexGrow: 1, background: '#0A3364' }}>
          <img src={harnessDelegate} alt="" aria-hidden />
        </Container>
      </Layout.Horizontal>
      <Container className={css.delegateDetailStep}>
        <Layout.Vertical className={css.section1}>
          <Text color={Color.GREY_800} font={{ size: 'normal', align: 'left' }} className={css.detailsSectionRow}>
            {getString('delegate.delegates_4_ways_title')}
          </Text>
          <Delegates4Ways onSelect={handleOnSelect} selectedCard={selectedCard} />
        </Layout.Vertical>
        <div className={css.verticalLine}></div>
        <Layout.Vertical spacing="large" className={css.section2}>
          <Text color={Color.BLACK} font={{ weight: 'bold' }} style={{ marginBottom: '18px' }} className={css.prereq}>
            {getString('delegate.kubernetes.prerequisites')}
          </Text>
          <Container
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '568px',
              height: '340px',
              fontSize: '13px',
              lineHeight: '20px',
              /* or 154% */

              letterSpacing: '0.233333px'
            }}
          >
            <Text font={{ size: 'normal' }} className={css.preReqContent}>
              {getString('delegate.kubernetes.prerequisites_info1')}
            </Text>

            <Container>
              <Text className={css.preReqContent}>
                {getString('delegate.kubernetes.prerequisites_info2')}
                <Link color={Color.BLUE_600} href="https://app.harness.io" target="_blank">
                  https://app.harness.io
                </Link>
              </Text>
            </Container>
            <Text className={css.preReqContent}>{getString('delegate.kubernetes.prerequisites_info3')}</Text>
            <Container>
              <Layout.Horizontal>
                <Text inline className={css.preReqContent} icon="arrow-right" iconProps={{ size: 8 }}>
                  {getString('delegate.kubernetes.prerequisites_worload1')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Text inline className={css.preReqContent} icon="arrow-right" iconProps={{ size: 8 }}>
                  {getString('delegate.kubernetes.prerequisites_worload2')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Text className={css.preReqContent} icon="arrow-right" iconProps={{ size: 8 }}>
                  {getString('delegate.kubernetes.prerequisites_worload3')}
                </Text>
              </Layout.Horizontal>
            </Container>
            <Text className={css.preReqContent}>{getString('delegate.kubernetes.permissions_title')}</Text>
            <Container>
              <Layout.Horizontal>
                <Text className={css.preReqContent} icon="arrow-right" iconProps={{ size: 8 }}>
                  {getString('delegate.kubernetes.permissions_info1')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Text className={css.preReqContent} icon="arrow-right" iconProps={{ size: 8 }}>
                  {getString('delegate.kubernetes.permissions_info2')}
                </Text>
              </Layout.Horizontal>
            </Container>
          </Container>
          <Container>
            <Button
              id="step1ContinueButton"
              intent="primary"
              text="Continue"
              style={{ fontSize: '14px' }}
              className={css.continueBtn}
              rightIcon="chevron-right"
              onClick={() => {
                /* istanbul ignore next */
                props?.onClick(selectedCard)
              }}
              disabled={selectedCard ? false : true}
            />
          </Container>
        </Layout.Vertical>
      </Container>
    </>
  )
}

export default DelegateDetailsStep
