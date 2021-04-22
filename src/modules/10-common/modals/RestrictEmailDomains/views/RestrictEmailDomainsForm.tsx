import React from 'react'
import * as yup from 'yup'
import { Layout, Heading, Color, Formik, FormikForm, FormInput, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'

interface Props {
  hideModal: () => void
}

const onSubmit = (): void => {
  // Submit logic
}

const RestrictEmailDomainsForm: React.FC<Props> = ({ hideModal }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Heading level={1} color={Color.BLACK} font={{ weight: 'bold' }} margin={{ bottom: 'xxlarge' }}>
        {getString('authenticationSettings.allowLoginFromTheseDomains')}
      </Heading>
      <Formik
        initialValues={{
          domains: []
        }}
        validationSchema={yup.object().shape({
          domains: yup.array().test({
            test: arr => arr.length !== 0,
            message: getString('authenticationSettings.domainNameRequired')
          })
        })}
        onSubmit={onSubmit}
      >
        {() => (
          <FormikForm>
            <FormInput.MultiInput name="domains" />
            <Layout.Horizontal margin={{ top: 'xxxlarge', bottom: 'xlarge' }}>
              <Button intent="primary" type="submit" margin={{ right: 'xsmall' }}>
                {getString('save')}
              </Button>
              <Button onClick={hideModal}>{getString('common.cancel')}</Button>
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default RestrictEmailDomainsForm
