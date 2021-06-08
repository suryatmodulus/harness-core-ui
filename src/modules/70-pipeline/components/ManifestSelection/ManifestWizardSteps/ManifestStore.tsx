import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  Layout,
  Button,
  Text,
  Formik,
  Color,
  StepProps,
  Card,
  Icon,
  Heading,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import Joyride from 'react-joyride'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import NeutralCard from '../images/Neutral Card (1).png'
import type { ManifestStepInitData, ManifestStores } from '../ManifestInterface'
import {
  ManifestIconByType,
  ManifestStoreTitle,
  ManifestToConnectorLabelMap,
  ManifestToConnectorMap
} from '../Manifesthelper'
import css from './ManifestWizardSteps.module.scss'

interface ManifestStorePropType {
  stepName: string
  expressions: string[]
  isReadonly: boolean
  manifestStoreTypes: Array<ManifestStores>
  initialValues: ManifestStepInitData
  handleConnectorViewChange: () => void
  handleStoreChange: (store: ManifestStores) => void
}

const ManifestStore: React.FC<StepProps<ConnectorConfigDTO> & ManifestStorePropType> = ({
  handleConnectorViewChange,
  handleStoreChange,
  stepName,
  isReadonly,
  manifestStoreTypes,
  initialValues,
  previousStep,
  expressions,
  prevStepData,
  nextStep
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  const [selectedManifest, setSelectedManifest] = React.useState(prevStepData?.store || initialValues.store)
  const newConnectorLabel = `${getString('newLabel')} ${ManifestToConnectorLabelMap[selectedManifest]} ${getString(
    'connector'
  )}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const submitFirstStep = async (formData: ManifestStepInitData): Promise<void> => {
    nextStep?.({ ...formData, store: selectedManifest })
  }
  const handleOptionSelection = (selected: ManifestStores): void => {
    if (selected === selectedManifest) {
      setSelectedManifest('')
      handleStoreChange('' as ManifestStores)
    } else {
      setSelectedManifest(selected)
      handleStoreChange(selected)
    }
  }

  const getInitialValues = useCallback((): ManifestStepInitData => {
    const initValues = { ...initialValues }

    if (prevStepData?.connectorRef) {
      initValues.connectorRef = prevStepData?.connectorRef
      handleStoreChange(selectedManifest)
    }
    if (selectedManifest !== initValues.store) {
      initValues.connectorRef = ''
    }
    return initValues
  }, [selectedManifest])
  const steps = [
    {
      content: (
        <div style={{ display: 'flex' }}>
          <img src={NeutralCard}></img>
          <p style={{ marginTop: '35px' }}>
            Harness will store your details which will be used for connecting to your repo.For now we will use a default
            connector for your feasibility.{' '}
          </p>
        </div>
      ),
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      target: '.ManifestWizardSteps-module_manifestStore_1F_sZD'
    }
  ]
  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Joyride
        // callback={handleJoyrideCallback}
        continuous={true}
        // getHelpers={this.getHelpers}
        run={true}
        scrollToFirstStep={true}
        // showProgress={true}
        showSkipButton={true}
        steps={steps}
        styles={{
          options: {
            zIndex: 10000
          }
        }}
      />
      <Heading level={2} style={{ color: Color.GREY_800, fontSize: 24 }} margin={{ bottom: 'large' }}>
        {stepName}
      </Heading>

      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {manifestStoreTypes.map(store => (
          <div key={store} className={css.squareCardContainer}>
            <Card
              disabled={selectedManifest !== '' && selectedManifest !== store}
              interactive={true}
              selected={store === selectedManifest}
              cornerSelected={store === selectedManifest}
              className={cx({ [css.disabled]: selectedManifest !== '' && selectedManifest !== store }, css.squareCard)}
              onClick={() => {
                if (selectedManifest === '' || selectedManifest === store) {
                  handleOptionSelection(store)
                }
              }}
            >
              <Icon name={ManifestIconByType[store]} size={26} />
            </Card>
            <Text
              className={css.sqaureCardTitle}
              style={{
                color: selectedManifest !== '' && selectedManifest !== store ? 'var(--grey-350)' : 'var(--grey-900)'
              }}
            >
              {getString(ManifestStoreTitle[store])}
            </Text>
          </div>
        ))}
      </Layout.Horizontal>
      <Formik
        initialValues={getInitialValues()}
        formName="manifestStore"
        validationSchema={Yup.object().shape({
          connectorRef: Yup.string()
            .trim()
            .required(
              `${ManifestToConnectorMap[selectedManifest]} ${getString(
                'pipelineSteps.build.create.connectorRequiredError'
              )}`
            )
        })}
        onSubmit={formData => {
          submitFirstStep({ ...formData, store: selectedManifest })
        }}
        enableReinitialize={true}
      >
        {formik => (
          <Form>
            <div className={css.formContainerStepOne}>
              {selectedManifest !== '' ? (
                <div className={css.connectorContainer}>
                  <FormMultiTypeConnectorField
                    name="connectorRef"
                    disabled={selectedManifest === ''}
                    label={
                      <Text style={{ marginBottom: '5px' }}>{`${
                        ManifestToConnectorLabelMap[selectedManifest]
                      } ${getString('connector')}`}</Text>
                    }
                    placeholder={`${getString('select')} ${ManifestToConnectorLabelMap[selectedManifest]} ${getString(
                      'connector'
                    )}`}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    width={400}
                    multiTypeProps={{ expressions }}
                    isNewConnectorLabelVisible={false}
                    type={ManifestToConnectorMap[selectedManifest]}
                    enableConfigureOptions={false}
                    gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  />
                  {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME ? (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={(formik.values.connectorRef as unknown) as string}
                        type={ManifestToConnectorMap[selectedManifest]}
                        variableName="connectorRef"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('connectoreRef', value)
                        }}
                      />
                    </div>
                  ) : (
                    <Button
                      intent="primary"
                      minimal
                      disabled={isReadonly || !canCreate}
                      id="new-manifest-connector"
                      text={newConnectorLabel}
                      className={css.addNewManifest}
                      icon="plus"
                      onClick={() => {
                        handleConnectorViewChange()
                        nextStep?.({ ...prevStepData, store: selectedManifest })
                      }}
                    />
                  )}
                </div>
              ) : null}
            </div>

            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button
                intent="primary"
                type="submit"
                text={getString('continue')}
                rightIcon="chevron-right"
                disabled={
                  !selectedManifest ||
                  (getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.FIXED &&
                    !(formik.values.connectorRef as ConnectorSelectedValue)?.connector)
                }
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ManifestStore
