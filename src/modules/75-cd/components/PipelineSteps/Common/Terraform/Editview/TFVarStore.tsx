import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Card,
  Color,
  Formik,
  getMultiTypeFromValue,
  Heading,
  Icon,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@wings-software/uicore'

import { Form } from 'formik'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import css from './TerraformVarfile.module.scss'

const allowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket']

const tfVarIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket'
}

export const TFVarStore: React.FC<StepProps<any>> = ({ nextStep }) => {
  const [selectedType, setSelectedType] = React.useState('')
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { expressions } = useVariablesExpression()

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24 }} margin={{ bottom: 'large' }}>
        Specify Terraform Var File Store
      </Heading>

      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {allowedTypes.map(item => (
          <div key={item} className={css.squareCardContainer}>
            <Card
              className={css.manifestIcon}
              selected={item === selectedType}
              onClick={() => {
                setSelectedType(item)
              }}
            >
              <Icon name={tfVarIcons[item]} size={26} />
            </Card>
            <Text color={Color.BLACK_100}>{item}</Text>
          </div>
        ))}
      </Layout.Horizontal>

      <Formik
        initialValues={{
          varFile: {
            store: {
              spec: {
                connectorRef: ''
              }
            }
          }
        }}
        enableReinitialize={true}
        onSubmit={() => {
          setSelectedType('')
        }}
      >
        {formik => (
          <Form>
            <div className={css.formContainerStepOne}>
              {selectedType && (
                <FormMultiTypeConnectorField
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('connectors.title.gitConnector')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('connectors.title.gitConnector')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                  type={['Git', 'Github', 'Gitlab', 'Bitbucket']}
                  width={
                    getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.connectorRef) ===
                    MultiTypeInputType.RUNTIME
                      ? 200
                      : 260
                  }
                  name="varFile.store.spec.connectorRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions }}
                />
              )}
            </div>

            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
              <Button
                intent="primary"
                type="submit"
                text={getString('continue')}
                rightIcon="chevron-right"
                onClick={() => {
                  nextStep?.(formik.values)
                }}
                className={css.saveBtn}
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
