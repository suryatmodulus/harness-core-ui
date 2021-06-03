import React from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'

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
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'

import css from './TerraformVarfile.module.scss'

export type TFVarStores = 'Git' | 'Github' | 'GitLab' | 'Bitbucket'
export const TFConnectorMap: Record<TFVarStores | string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET
}

const allowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket']

const tfVarIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket'
}

interface TFVarStoreProps {
  initialValues: any
  isEditMode: boolean
}

export const TFVarStore: React.FC<StepProps<any> & TFVarStoreProps> = ({ nextStep, initialValues, isEditMode }) => {
  const [selectedType, setSelectedType] = React.useState('')
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { expressions } = useVariablesExpression()
  const iValues = {
    varFile: {
      store: {
        spec: {
          connectorRef: ''
        }
      }
    }
  }
  React.useEffect(() => {
    setSelectedType(initialValues?.varFile?.spec?.store?.type)
  }, [isEditMode])
  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24 }} margin={{ bottom: 'large' }}>
        {getString('cd.specifyTfVarStore')}
      </Heading>

      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {allowedTypes.map(item => (
          <div key={item} className={css.squareCardContainer}>
            <Card
              className={css.manifestIcon}
              selected={item === selectedType}
              data-testid={`varStore-${item}`}
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
        initialValues={isEditMode ? initialValues : iValues}
        enableReinitialize={true}
        onSubmit={() => {
          setSelectedType('')
        }}
        validationSchema={Yup.object().shape({
          varFile: Yup.object().shape({
            store: Yup.object().shape({
              spec: Yup.object().shape({
                connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError'))
              })
            })
          })
        })}
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
                  type={TFConnectorMap[selectedType]}
                  width={
                    getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.connectorRef) ===
                    MultiTypeInputType.RUNTIME
                      ? 200
                      : 260
                  }
                  name="varFile.spec.store.spec.connectorRef"
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
                disabled={
                  !selectedType ||
                  (getMultiTypeFromValue(formik.values.varFile?.spec?.store?.spec?.connectorRef) ===
                    MultiTypeInputType.FIXED &&
                    !(formik.values.varFile?.spec?.store?.spec?.connectorRef as ConnectorSelectedValue)?.connector)
                }
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
