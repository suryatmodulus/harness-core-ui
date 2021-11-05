import React from 'react'
import cx from 'classnames'
import { Text, Container, Heading, Color, Button, Layout, ButtonVariation } from '@wings-software/uicore'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureWarningWithTooltip } from '@common/components/FeatureWarning/FeatureWarning'
import { useStrings } from 'framework/strings'
import css from './BuildTests.module.scss'

export interface TICallToActionProps {
  type?: string
}

export const TICallToAction: React.FC<TICallToActionProps> = () => {
  const { getString } = useStrings()
  const { featureDetail } = useFeature({ featureRequest: { featureName: FeatureIdentifier.TEST_INTELLIGENCE } })
  console.log(featureDetail)
  const canUseTI = true
  return (
    <div className={cx(css.widgetWrapper, css.tiCallToActionWrapper)}>
      <Container className={css.widget} height="100%">
        <Layout.Horizontal spacing="medium">
          <Container className={css.imageContainer}>test</Container>
          <Layout.Vertical style={{ justifyContent: 'space-between', height: '190px' }} width={378}>
            <Container width={314}>
              <Heading color={Color.BLACK} level={5}>
                {getString('pipeline.testsReports.tiCallToAction.header')}
              </Heading>
              <Text color={Color.BLACK} className={css.subText}>
                {canUseTI
                  ? getString('pipeline.testsReports.tiCallToAction.utilizeTISubText')
                  : getString('pipeline.testsReports.tiCallToAction.upsellSubText')}
              </Text>
              {canUseTI && <Text color={Color.GREY_500}>Support for .Net and Python coming soon!</Text>}
            </Container>
            <Layout.Horizontal spacing="medium" className={css.actionsContainer}>
              <Button className={css.findOutMoreBtn} variation={ButtonVariation.PRIMARY}>
                {getString('common.findOutMore')}
              </Button>
              {canUseTI ? (
                <Text style={{ fontSize: '13px' }} color={Color.PRIMARY_7}>
                  {getString('pipeline.testsReports.tiCallToAction.addRunTestsStep')}
                </Text>
              ) : (
                <Container className={css.upgradeRequiredWrapper}>
                  <FeatureWarningWithTooltip featureName={FeatureIdentifier.TEST_INTELLIGENCE} />
                </Container>
              )}
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>
    </div>
  )
}
