import React, { useState } from 'react'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  Text,
  FormInput,
  CardSelect,
  CardBody,
  IconName,
  Container
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/exports'
import { regexName } from '@common/utils/StringUtils'
import css from '@common/modals/SourceCodeManager/useSourceCodeManager.module.scss'

interface SourceCodeManagerData {
  onSubmit: () => void
  onClose: () => void
}

interface SourceCodeType {
  text: string
  value: string
  icon: IconName
}

export enum SourceCodeTypes {
  BITBUCKET = 'BITBUCKET',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  AZURE_DEVOPS = 'AZURE_DEVOPS',
  AWS_CODECOMMIT = 'AWS_CODECOMMIT'
}

const SourceCodeManagerForm: React.FC<SourceCodeManagerData> = props => {
  const { onSubmit, onClose } = props
  const { getString } = useStrings()
  const [selected, setSelected] = useState<SourceCodeType>()

  const sourceCodeManagers: SourceCodeType[] = [
    { text: getString('repo-provider.githubLabel'), value: SourceCodeTypes.GITHUB, icon: 'github' },
    {
      text: getString('repo-provider.bitbucketLabel'),
      value: SourceCodeTypes.BITBUCKET,
      icon: 'bitbucket'
    },
    { text: getString('repo-provider.gitlabLabel'), value: SourceCodeTypes.GITLAB, icon: 'service-gotlab' },
    {
      text: getString('repo-provider.awscodecommit'),
      value: SourceCodeTypes.AWS_CODECOMMIT,
      icon: 'service-aws-code-deploy'
    }
  ]

  const handleSubmit = async (): Promise<void> => {
    //Handle Submit
    onSubmit()
  }

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('userProfile.addSCM')}
        </Text>
        <Formik
          initialValues={{
            name: ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('validation.nameRequired'))
              .matches(regexName, getString('formValidation.name'))
          })}
          onSubmit={() => {
            handleSubmit()
          }}
        >
          {() => {
            return (
              <Form>
                <Layout.Vertical spacing="medium">
                  <Container width={300}>
                    <FormInput.Text name="name" label={getString('name')} />
                  </Container>
                  <Text color={Color.BLACK}>{getString('userProfile.selectSCM')}</Text>
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CardSelect
                      data={selected ? [selected] : sourceCodeManagers}
                      cornerSelected={true}
                      className={css.cardRow}
                      cardClassName={css.card}
                      renderItem={(item, selectedItem) => (
                        <CardBody.Icon icon={item.icon} iconSize={25}>
                          <Text
                            font={{
                              size: 'small',
                              align: 'center'
                            }}
                            flex={{ justifyContent: 'center' }}
                            color={selectedItem ? Color.GREY_900 : Color.GREY_350}
                          >
                            {item.text}
                          </Text>
                        </CardBody.Icon>
                      )}
                      onChange={value => setSelected(value)}
                      selected={selected}
                    />
                    {selected ? (
                      <Button
                        text={getString('change')}
                        minimal
                        intent="primary"
                        onClick={() => {
                          setSelected(undefined)
                        }}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Vertical>

                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button intent="primary" text={getString('add')} type="submit" />
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

export default SourceCodeManagerForm
