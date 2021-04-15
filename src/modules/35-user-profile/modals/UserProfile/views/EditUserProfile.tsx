import React, { useState } from 'react'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  Text,
  FormInput,
  Container,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useAppStore, useStrings } from 'framework/exports'
import { UserInfo, useUpdateUserInfo } from 'services/cd-ng'
import { useToaster } from '@common/exports'

interface UserProfileData {
  user: UserInfo
  onSubmit: () => void
  onClose: () => void
}

const EditUserProfile: React.FC<UserProfileData> = props => {
  const { user, onSubmit, onClose } = props
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: updateProfile, loading } = useUpdateUserInfo({})
  const { showError, showSuccess } = useToaster()
  const { updateAppStore } = useAppStore()

  const handleSubmit = async (values: UserInfo): Promise<void> => {
    try {
      const updated = await updateProfile(values)
      /* istanbul ignore else */ if (updated) {
        onSubmit()
        updateAppStore({ currentUserInfo: updated.data })
        showSuccess(getString('userProfile.userEditSuccess'))
      } /* istanbul ignore next */ else {
        showError(getString('userProfile.userEditFail'))
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('userProfile.editProfile')}
        </Text>
        <Formik<UserInfo>
          initialValues={{
            ...user
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('validation.nameRequired'))
          })}
          onSubmit={values => {
            handleSubmit(values)
          }}
        >
          {() => {
            return (
              <Form>
                <Container width={300}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <FormInput.Text name="name" label={getString('name')} />
                </Container>
                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button intent="primary" text={getString('save')} type="submit" disabled={loading} />
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
