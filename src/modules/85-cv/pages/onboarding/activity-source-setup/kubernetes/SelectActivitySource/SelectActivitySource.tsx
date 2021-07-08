import React from 'react'
import { Color, Container, Formik, FormikForm, FormInput, Heading, Text } from '@wings-software/uicore'
import { object as yupObject, string as yupString } from 'yup'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { CVSelectionCard, CVSelectionCardProps } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { AddDescriptionAndTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import SyncStepDataValues from '@cv/utils/SyncStepDataValues'
import type { KubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import { buildKubernetesActivitySourceInfo } from '../KubernetesActivitySourceUtils'
import css from './SelectActivitySource.module.scss'

export interface SelectActivitySourceProps {
  data?: KubernetesActivitySourceInfo
  isEditMode?: boolean
  onSubmit?: (data: KubernetesActivitySourceInfo) => void
}

interface ActivitySourceConnectorSelectionProps {
  onCardSelect: (fieldName: string, value?: string) => void
  selectedCard?: string
}

export const KubernetesActivitySourceFieldNames = {
  ACTIVITY_SOURCE_NAME: 'name',
  CONNECTOR_TYPE: 'connectorType'
}

function getProductSelections(getString: UseStringsReturn['getString']): {
  category: string
  products: CVSelectionCardProps[]
} {
  return {
    category: getString('pipelineSteps.deploy.infrastructure.directConnection').toLocaleUpperCase(),
    products: [
      {
        iconProps: {
          name: 'service-kubernetes',
          size: 25
        },
        cardLabel: getString('kubernetesText'),
        className: css.productSelectionCard
      }
    ]
  }
}

function getValidationSchema(getString: UseStringsReturn['getString']) {
  return yupObject().shape({
    [KubernetesActivitySourceFieldNames.ACTIVITY_SOURCE_NAME]: yupString()
      .trim()
      .required(getString('cv.activitySources.kubernetes.selectKubernetesSource.nameActivitySourceValidation')),
    [KubernetesActivitySourceFieldNames.CONNECTOR_TYPE]: yupString()
      .trim()
      .required(getString('cv.activitySources.kubernetes.selectKubernetesSource.connectorTypeValidation'))
  })
}

function ActivitySourceConnectorSelection(props: ActivitySourceConnectorSelectionProps): JSX.Element {
  const { onCardSelect, selectedCard } = props
  const { getString } = useStrings()
  const { category, products } = getProductSelections(getString)
  return (
    <Container className={css.connectorSelection}>
      <Container>
        <Text className={css.category}>{category}</Text>
        {products.map(cardProps => {
          return (
            <CVSelectionCard
              key={cardProps.cardLabel}
              {...cardProps}
              isSelected={cardProps.cardLabel === selectedCard}
              onCardSelect={isSelected => {
                if (isSelected) {
                  onCardSelect(KubernetesActivitySourceFieldNames.CONNECTOR_TYPE, cardProps.cardLabel)
                } else {
                  onCardSelect(KubernetesActivitySourceFieldNames.CONNECTOR_TYPE, '')
                }
              }}
            />
          )
        })}
      </Container>
    </Container>
  )
}

export function SelectActivitySource(props: SelectActivitySourceProps): JSX.Element {
  const { onSubmit, data, isEditMode } = props
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  return (
    <Formik
      initialValues={data || buildKubernetesActivitySourceInfo()}
      onSubmit={values => onSubmit?.(values)}
      formName="activitySource"
      validationSchema={getValidationSchema(getString)}
    >
      {formik => (
        <FormikForm>
          <Container className={css.main}>
            <Heading level="3" color={Color.BLACK} font={{ size: 'medium' }} className={css.heading}>
              {getString('cv.activitySources.harnessCD.select')}
            </Heading>
            <AddDescriptionAndTagsWithIdentifier
              identifierProps={{
                inputLabel: getString('cv.activitySources.name'),
                isIdentifierEditable: !isEditMode
              }}
            />
            <Text color={Color.BLACK} className={css.infraSpecification}>
              {getString('cv.activitySources.kubernetes.selectKubernetesSource.infraSpecification')}
            </Text>
            <Text color={Color.BLACK} className={css.connectorOptionHeading}>
              {getString('cv.activitySources.kubernetes.selectKubernetesSource.connectorOptionHeading')}
            </Text>
            <FormInput.CustomRender
              name={KubernetesActivitySourceFieldNames.CONNECTOR_TYPE}
              render={formikProps => (
                <ActivitySourceConnectorSelection
                  onCardSelect={formikProps.setFieldValue}
                  selectedCard={formikProps.values?.[KubernetesActivitySourceFieldNames.CONNECTOR_TYPE]}
                />
              )}
            />
          </Container>
          <SubmitAndPreviousButtons
            onPreviousClick={() =>
              history.push(
                routes.toCVAdminSetup({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })
              )
            }
          />
          <SyncStepDataValues values={formik.values} listenToValues={data} onUpdate={formik.setValues} />
        </FormikForm>
      )}
    </Formik>
  )
}
