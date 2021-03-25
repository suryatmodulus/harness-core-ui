import React from 'react'
import { Button, Color, Formik, FormikForm as Form, Layout, Text, FormInput, Container } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/exports'
import type { User } from 'services/cd-ng'

interface UserProfileData {
  user?: User
  onSubmit: () => void
  onClose: () => void
}

const EditUserProfile: React.FC<UserProfileData> = props => {
  const { user, onSubmit, onClose } = props
  const { getString } = useStrings()

  const handleSubmit = async (): Promise<void> => {
    //Handle Submit
    onSubmit()
  }

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('userProfile.editProfile')}
        </Text>
        <Formik
          initialValues={{
            name: user?.name || ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('validation.nameRequired'))
          })}
          onSubmit={() => {
            handleSubmit()
          }}
        >
          {() => {
            return (
              <Form>
                <Container width={300}>
                  <FormInput.Text name="name" label={getString('name')} />
                </Container>
                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button intent="primary" text={getString('save')} type="submit" />
                  <Button text={getString('cancel')} onClick={onClose} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default EditUserProfile
