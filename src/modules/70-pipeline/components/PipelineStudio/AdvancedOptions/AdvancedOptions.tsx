import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Card,
  Color,
  FontVariation,
  Formik,
  HarnessDocTooltip,
  Icon,
  Layout,
  Text
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { PipelineInfoConfig } from 'services/cd-ng'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '../PiplineHooks/useVariablesExpression'
import css from './AdvancedOptions.module.scss'

interface AdvancedOptionsProps {
  onApplyChanges: (data: PipelineInfoConfig) => void
  onDiscard: () => void
  pipeline: PipelineInfoConfig
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ onApplyChanges, onDiscard, pipeline }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<PipelineInfoConfig>
      formName="pipelineAdvancedOptions"
      validationSchema={Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' })
      })}
      initialValues={pipeline}
      onSubmit={data => onApplyChanges(data)}
    >
      {formikProps => (
        <>
          <Page.Header
            title={
              <Layout.Horizontal spacing="small" flex={{ justifyContent: 'center' }}>
                <Icon name="pipeline-advanced" color={Color.PRIMARY_7} size={24} />
                <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.advancedOptions')}</Text>
              </Layout.Horizontal>
            }
            toolbar={
              <Layout.Horizontal>
                <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} onClick={formikProps.submitForm}>
                  {getString('applyChanges')}
                </Button>
                <Button variation={ButtonVariation.LINK} size={ButtonSize.SMALL} onClick={() => onDiscard()}>
                  {getString('common.discard')}
                </Button>
              </Layout.Horizontal>
            }
          />
          <Page.Body className={css.body}>
            <Layout.Vertical spacing="small">
              <Text font={{ variation: FontVariation.H5 }} data-tooltip-id="pipelineCreate_timeout">
                {getString('pipeline.pipelineTimeoutSettings')}
                <HarnessDocTooltip useStandAlone={true} tooltipId="pipelineCreate_timeout" />
              </Text>
              <Card>
                <Layout.Vertical spacing="small">
                  <Text font={{ variation: FontVariation.SMALL_BOLD }}>
                    {getString('pipeline.pipelineTimeoutHelpText')}
                  </Text>
                  <FormMultiTypeDurationField
                    name="timeout"
                    isOptional
                    label={getString('pipelineSteps.timeoutLabel')}
                    multiTypeDurationProps={{ enableConfigureOptions: true, expressions }}
                  />
                </Layout.Vertical>
              </Card>
            </Layout.Vertical>
          </Page.Body>
        </>
      )}
    </Formik>
  )
}
