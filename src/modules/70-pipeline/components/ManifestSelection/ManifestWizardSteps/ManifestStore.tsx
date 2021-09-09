import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Button,
  Text,
  Formik,
  Color,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ThumbnailSelect,
  IconName,
  ButtonVariation,
  FormikForm,
  ButtonSize
} from '@wings-software/uicore'
import * as Yup from 'yup'
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

  const [selectedStore, setSelectedStore] = useState(prevStepData?.store ?? initialValues.store)
  const [multitypeInputValue, setMultiTypeValue] = useState<MultiTypeInputType | undefined>(undefined)

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedStore && getString(ManifestToConnectorLabelMap[selectedStore as ManifestStores])
  } ${getString('connector')}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const submitFirstStep = async (formData: ManifestStepInitData): Promise<void> => {
    nextStep?.({ ...formData })
  }
  const handleOptionSelection = (formikData: any, storeSelected: ManifestStores): void => {
    if (
      getMultiTypeFromValue(formikData.connectorRef) !== MultiTypeInputType.FIXED &&
      formikData.store !== storeSelected
    ) {
      setMultiTypeValue(MultiTypeInputType.FIXED)
    } else if (multitypeInputValue !== undefined) {
      setMultiTypeValue(undefined)
    }
    handleStoreChange(storeSelected)
    setSelectedStore(storeSelected)
  }

  const getInitialValues = useCallback((): ManifestStepInitData => {
    const initValues = { ...initialValues }

    if (prevStepData?.connectorRef) {
      initValues.connectorRef = prevStepData?.connectorRef
      handleStoreChange(selectedStore)
    }
    if (selectedStore !== initValues.store) {
      initValues.connectorRef = ''
    }
    return { ...initValues, store: selectedStore }
  }, [selectedStore])

  const supportedManifestStores = useMemo(
    () =>
      manifestStoreTypes.map(store => ({
        label: getString(ManifestStoreTitle[store]),
        icon: ManifestIconByType[store] as IconName,
        value: store
      })),
    [manifestStoreTypes]
  )

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font="large" color={Color.GREY_1000} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="manifestStore"
        validationSchema={Yup.object().shape({
          connectorRef: Yup.string()
            .trim()
            .required(
              `${ManifestToConnectorMap[selectedStore]} ${getString(
                'pipelineSteps.build.create.connectorRequiredError'
              )}`
            )
        })}
        onSubmit={formData => {
          submitFirstStep({ ...formData })
        }}
        enableReinitialize={true}
      >
        {formik => (
          <FormikForm>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Vertical>
                <Layout.Horizontal spacing="large">
                  <ThumbnailSelect
                    className={css.thumbnailSelect}
                    name={'store'}
                    items={supportedManifestStores}
                    isReadonly={isReadonly}
                    onChange={storeSelected => {
                      handleOptionSelection(formik?.values, storeSelected as ManifestStores)
                    }}
                  />
                </Layout.Horizontal>

                {formik.values.store !== '' ? (
                  <Layout.Horizontal
                    spacing={'medium'}
                    flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                    className={css.connectorContainer}
                  >
                    <FormMultiTypeConnectorField
                      key={formik.values.store}
                      name="connectorRef"
                      label={`${getString(
                        ManifestToConnectorLabelMap[formik.values.store as ManifestStores]
                      )} ${getString('connector')}`}
                      placeholder={`${getString('select')} ${getString(
                        ManifestToConnectorLabelMap[formik.values.store as ManifestStores]
                      )} ${getString('connector')}`}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      width={400}
                      multiTypeProps={{ expressions }}
                      isNewConnectorLabelVisible={false}
                      type={ManifestToConnectorMap[formik.values.store]}
                      enableConfigureOptions={false}
                      multitypeInputValue={multitypeInputValue}
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME ? (
                      <ConfigureOptions
                        className={css.configureOptions}
                        value={formik.values.connectorRef as unknown as string}
                        type={ManifestToConnectorMap[formik.values.store]}
                        variableName="connectorRef"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('connectorRef', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    ) : (
                      <Button
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly || !canCreate}
                        id="new-manifest-connector"
                        text={newConnectorLabel}
                        className={css.addNewManifest}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={() => {
                          handleConnectorViewChange()
                          nextStep?.({ ...prevStepData, store: selectedStore })
                        }}
                      />
                    )}
                  </Layout.Horizontal>
                ) : null}
              </Layout.Vertical>

              <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  disabled={
                    !selectedStore ||
                    (getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.FIXED &&
                      !(formik.values.connectorRef as ConnectorSelectedValue)?.connector)
                  }
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ManifestStore
