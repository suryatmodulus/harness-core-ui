import React from 'react'
import { Text, Layout, Icon, Container, Formik, FormikForm as Form, Button, Color } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import type { NgPipeline } from 'services/cd-ng'
import { NameIdDescriptionTags } from '@common/components'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/exports'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import cdImage from './images/illustration.png'

interface CDTrialModalData {
  handleSubmit: (values: NgPipeline) => void
  closeModal?: () => void
}

const CDTrial: React.FC<CDTrialModalData> = props => {
  const { getString } = useStrings()
  const { handleSubmit, closeModal } = props

  return (
    <Layout.Vertical padding={{ top: 'large', left: 'xxxlarge' }}>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Icon name="cd-main" size={20} padding={{ right: 'small' }} />
        <Text style={{ color: Color.BLACK, fontSize: 'medium' }}>{getString('cd.continuousIntegration')}</Text>
      </Layout.Horizontal>
      <Layout.Horizontal>
        <Text
          style={{
            backgroundColor: Color.ORANGE_500,
            color: Color.WHITE,
            textAlign: 'center',
            width: 120,
            borderRadius: 3,
            marginLeft: 30,
            marginTop: 6,
            display: 'inline-block'
          }}
        >
          {getString('cd.CDTrialModal.subheader')}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="57%" padding={{ right: 'xxxlarge' }}>
          <Text style={{ fontSize: 'normal', width: 380, display: 'inline-block', marginLeft: 30, lineHeight: 2 }}>
            {getString('cd.CDTrialModal.description')}
          </Text>
          <img src={cdImage} style={{ marginLeft: -40, marginTop: -30 }} width={800} height={400} />
        </Container>
        <Container width="30%" padding={{ left: 'xxxlarge' }} border={{ left: true }} height={400}>
          <Formik
            initialValues={{
              color: DEFAULT_COLOR,
              identifier: '',
              name: '',
              description: '',
              tags: {}
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(getString('createPipeline.pipelineNameRequired')),
              identifier: Yup.string().when('name', {
                is: val => val?.length,
                then: Yup.string()
                  .trim()
                  .required(getString('validation.identifierRequired'))
                  .matches(StringUtils.regexIdentifier, getString('validation.validIdRegex'))
                  .notOneOf(StringUtils.illegalIdentifiers)
              })
            })}
            enableReinitialize={true}
            onSubmit={values => {
              handleSubmit(values)
            }}
          >
            {formikProps => {
              return (
                <Form>
                  <Text style={{ color: Color.BLACK, paddingBottom: 8, fontWeight: 600, fontSize: 'large' }}>
                    {getString('cd.CDTrialModal.setupHeader')}
                  </Text>
                  <Text style={{ fontSize: 'normal', color: Color.BLACK, paddingBottom: 40 }}>
                    {getString('cd.CDTrialModal.setupSubtitle')}
                  </Text>
                  <NameIdDescriptionTags formikProps={formikProps} />
                  <Layout.Horizontal padding={{ top: 'large' }} spacing="medium">
                    <Button intent="primary" text={getString('start')} type="submit" />
                    <Button
                      intent="none"
                      text={getString('cd.CDTrialModal.setupLater')}
                      type="reset"
                      onClick={() => closeModal && closeModal()}
                    />
                  </Layout.Horizontal>
                  <Layout.Horizontal padding={{ top: 'large' }}>
                    <Link to={''}>
                      <Layout.Horizontal spacing="small">
                        <Text
                          color={Color.BLUE_700}
                          font="normal"
                          rightIcon="chevron-right"
                          rightIconProps={{ color: Color.BLUE_700 }}
                        >
                          {getString('cd.CDTrialModal.learnMore')}
                        </Text>
                      </Layout.Horizontal>
                    </Link>
                  </Layout.Horizontal>
                </Form>
              )
            }}
          </Formik>
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default CDTrial
