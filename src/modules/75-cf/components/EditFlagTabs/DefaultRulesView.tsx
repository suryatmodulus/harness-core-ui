import React, { useEffect, useState } from 'react'
import { Container, FormInput, Layout, SelectOption, Text } from '@wings-software/uicore'
import cx from 'classnames'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import { useStrings } from 'framework/strings'
import type { Distribution, Variation, WeightedVariation } from 'services/cf'
import { CFVariationColors } from '@cf/constants'
import { VariationWithIcon } from '../VariationWithIcon/VariationWithIcon'
import PercentageRollout from './PercentageRollout'
import css from './TabTargeting.module.scss'

const ROLLOUT_PERCENTAGE_VALUE = 'percentage'

interface DefaultRulesProps {
  editing: boolean
  bucketBy?: string
  defaultOnVariation: string
  variations: Variation[]
  weightedVariations?: WeightedVariation[]
  formikProps: any
}

export const DefaultRulesView: React.FC<DefaultRulesProps> = ({
  editing,
  bucketBy,
  variations,
  weightedVariations,
  formikProps
}) => {
  const [percentageView, setPercentageView] = useState<boolean>(false)
  const { getString } = useStrings()

  const variationItems = variations.map<SelectOption>((elem, index) => ({
    label: elem.name as string,
    value: elem.identifier as string,
    icon: { name: 'full-circle', style: { color: CFVariationColors[index] } }
  }))

  const onDefaultONChange = (item: SelectOption) => {
    if (item.value === 'percentage') {
      setPercentageView(true)
    } else {
      setPercentageView(false)
    }
  }

  useEffect(() => {
    setPercentageView(formikProps.values.onVariation === 'percentage')
  }, [formikProps.values.onVariation])

  const onVariationIndex = variations.findIndex(variation => formikProps.values.onVariation === variation.identifier)
  const offVariationIndex = variations.findIndex(variation => formikProps.values.offVariation === variation.identifier)

  return (
    <>
      <Text className={css.ruleTitle}>
        <StringWithTooltip stringId="cf.featureFlags.rules.defaultRules" tooltipId="ff_ffDefaultRules_heading" />
      </Text>
      <Container className={css.rulesContainer}>
        <Layout.Horizontal margin={{ bottom: 'medium' }} style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: '14px',
              lineHeight: '24px',
              alignSelf: editing || percentageView ? 'baseline' : 'auto',
              paddingTop: editing ? 'var(--spacing-xsmall)' : 0
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.ifFlagOnServe') }} />
          </Text>
          <Container className={cx(css.defaultServe, editing && css.editing)}>
            {editing ? (
              <FormInput.Select
                name="onVariation"
                items={[
                  ...variationItems,
                  {
                    label: getString('cf.featureFlags.percentageRollout'),
                    value: ROLLOUT_PERCENTAGE_VALUE,
                    icon: { name: 'percentage' }
                  }
                ]}
                onChange={onDefaultONChange}
              />
            ) : (
              !percentageView && (
                <Layout.Horizontal
                  spacing="xsmall"
                  style={{ marginLeft: 'var(--spacing-xsmall)', alignItems: 'center' }}
                >
                  <VariationWithIcon
                    variation={variations[onVariationIndex]}
                    index={onVariationIndex}
                    textStyle={{ fontWeight: 600 }}
                  />
                </Layout.Horizontal>
              )
            )}

            {percentageView && (
              <PercentageRollout
                editing={editing}
                bucketBy={bucketBy}
                variations={variations}
                weightedVariations={weightedVariations || []}
                onSetPercentageValues={(value: Distribution) => {
                  formikProps.setFieldValue('defaultServe', { distribution: value })
                }}
              />
            )}
          </Container>
        </Layout.Horizontal>

        <Layout.Horizontal style={{ alignItems: 'baseline' }}>
          <Text style={{ fontSize: '14px', lineHeight: '24px' }}>
            <span dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.ifFlagOffServe') }} />
          </Text>
          <Container className={css.defaultServe}>
            {editing ? (
              <FormInput.Select name="offVariation" items={variationItems} onChange={formikProps.handleChange} />
            ) : (
              <Layout.Horizontal spacing="xsmall" style={{ marginLeft: 'var(--spacing-xsmall)', alignItems: 'center' }}>
                <VariationWithIcon
                  variation={variations[offVariationIndex]}
                  index={offVariationIndex}
                  textStyle={{ fontWeight: 600 }}
                />
              </Layout.Horizontal>
            )}
          </Container>
        </Layout.Horizontal>
      </Container>
    </>
  )
}
