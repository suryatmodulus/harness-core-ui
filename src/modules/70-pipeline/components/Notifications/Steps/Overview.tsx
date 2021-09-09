import {
  Button,
  ButtonVariation,
  Color,
  Container,
  Formik,
  FormInput,
  Layout,
  StepProps,
  Text
} from '@wings-software/uicore'
import React from 'react'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { NotificationRules } from 'services/pipeline-ng'
import { NameSchema } from '@common/utils/Validation'

interface OverviewProps {
  data?: NotificationRules
  existingNotificationNames?: string[]
}

const Overview: React.FC<StepProps<NotificationRules> & OverviewProps> = ({
  data,
  existingNotificationNames = [],
  nextStep,
  prevStepData
}) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="xxlarge" padding="small">
      <Text font="medium" color={Color.BLACK}>
        {getString('notifications.nameOftheRule')}
      </Text>
      <Formik
        initialValues={{ name: '', ...data, ...prevStepData }}
        formName="notificationsOverview"
        validationSchema={Yup.object().shape({
          name: (NameSchema() as Yup.StringSchema<string>).test(
            'isNameUnique',
            getString('validation.notificationNameDuplicate'),
            name => {
              return existingNotificationNames.indexOf(name) === -1
            }
          )
        })}
        onSubmit={values => {
          nextStep?.(values)
        }}
      >
        {() => {
          return (
            <Form>
              <Container height={400} width={400}>
                <FormInput.Text name="name" label={getString('notifications.notificationName')} />
              </Container>
              <Button
                type="submit"
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                text={getString('continue')}
              />
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default Overview
