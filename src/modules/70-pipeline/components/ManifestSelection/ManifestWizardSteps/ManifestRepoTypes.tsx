import React, { useMemo } from 'react'
import {
  Button,
  Color,
  Container,
  Formik,
  Text,
  IconName,
  Layout,
  StepProps,
  ThumbnailSelect
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { manifestTypeIcons, manifestTypeLabels } from '../Manifesthelper'
import type { ManifestStepInitData, ManifestTypes } from '../ManifestInterface'
import css from './ManifestWizardSteps.module.scss'

interface ManifestPropType {
  changeManifestType: (selected: ManifestTypes | null) => void
  manifestTypes: Array<ManifestTypes>
  selectedManifest: ManifestTypes | null
  stepName: string
  initialValues: ManifestStepInitData
}

export const ManifestRepoTypes: React.FC<StepProps<ConnectorConfigDTO> & ManifestPropType> = ({
  selectedManifest,
  manifestTypes,
  changeManifestType,
  stepName,
  prevStepData,
  nextStep,
  initialValues
}) => {
  const [selectedManifestType, setselectedManifestType] = React.useState(selectedManifest)

  const handleOptionSelection = (selected: ManifestTypes): void => {
    setselectedManifestType(selected)
    changeManifestType(selected)
  }

  const { getString } = useStrings()

  const supportedManifestTypes = useMemo(
    () =>
      manifestTypes.map(manifest => ({
        label: getString(manifestTypeLabels[manifest]),
        icon: manifestTypeIcons[manifest] as IconName,
        value: manifest
      })),
    [manifestTypes]
  )

  return (
    <Container className={css.optionsViewContainer}>
      <Text font="large" color={Color.GREY_1000} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{ manifestType: selectedManifestType }}
        formName="manifestType"
        validationSchema={Yup.object().shape({
          manifestType: Yup.string().required(getString('pipeline.manifestType.manifestTyperequired'))
        })}
        onSubmit={() => {
          changeManifestType(selectedManifestType)
          if (initialValues.selectedManifest !== selectedManifestType) {
            nextStep?.({ ...prevStepData, store: '' })
          } else {
            nextStep?.({ ...prevStepData })
          }
        }}
        enableReinitialize={true}
      >
        {() => (
          <Form>
            <div className={css.headerContainer}>
              <Layout.Horizontal spacing="large">
                <ThumbnailSelect
                  className={css.thumbnailSelect}
                  name={'manifestType'}
                  items={supportedManifestTypes}
                  onChange={handleOptionSelection}
                />
              </Layout.Horizontal>
            </div>
            <Layout.Horizontal>
              <Button
                intent="primary"
                type="submit"
                disabled={selectedManifestType === null}
                text={getString('continue')}
                rightIcon="chevron-right"
                className={css.saveBtn}
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Container>
  )
}
