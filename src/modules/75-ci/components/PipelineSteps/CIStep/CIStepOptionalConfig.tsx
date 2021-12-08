import React from 'react'
import isEmpty from 'lodash/isEmpty'
import cx from 'classnames'
import { Color, Container, Layout, MultiTypeInputType, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { Separator } from '@common/components/Separator/Separator'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CIStepOptionalConfigProps {
  readonly?: boolean
  enableFields: {
    [key: string]: { [key: string]: any }
  }
  allowableTypes: MultiTypeInputType[]
  stepViewType: StepViewType
  path?: string
}

export const CIStepOptionalConfig: React.FC<CIStepOptionalConfigProps> = props => {
  const { readonly, enableFields, allowableTypes, stepViewType, path } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  const getOptionalSubLabel = React.useCallback((tooltip: string) => {
    return (
      <Text
        tooltipProps={{ dataTooltipId: tooltip }}
        className={css.inpLabel}
        color={Color.GREY_400}
        font={{ size: 'small', weight: 'semi-bold' }}
        style={{ textTransform: 'capitalize' }}
      >
        {getString('common.optionalLabel')}
      </Text>
    )
  }, [])

  const buildArgsRenderCommonProps = {
    name: `${prefix}spec.buildArgs`,
    valueMultiTextInputProps: { expressions, allowableTypes },
    multiTypeFieldSelectorProps: {
      label: (
        <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
          <Text
            style={{ display: 'flex', alignItems: 'center' }}
            className={css.inpLabel}
            color={Color.GREY_800}
            font={{ size: 'small', weight: 'semi-bold' }}
          >
            {getString('pipelineSteps.buildArgsLabel')}
          </Text>
          &nbsp;
          {getOptionalSubLabel('buildArgs')}
        </Layout.Horizontal>
      )
    },
    disabled: readonly
  }

  return (
    <>
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.privileged') ? (
        <div className={cx(css.formGroup, css.sm)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.privileged`}
            label={getString('ci.privileged')}
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.settings') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name={`${prefix}spec.settings`}
            valueMultiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_800} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('settingsLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('pluginSettings')}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.reportPaths') ? (
        <Container className={cx(css.formGroup, stepCss)}>
          <MultiTypeList
            name={`${prefix}spec.reportPaths`}
            placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
            multiTextInputProps={{
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('pipelineSteps.reportPathsLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('reportPaths')}
                </Layout.Horizontal>
              ),
              allowedTypes: allowableTypes.filter(type => type !== MultiTypeInputType.RUNTIME)
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.reportPaths') ? <Separator topSeparation={16} /> : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.envVariables') ? (
        <Container className={cx(css.formGroup, stepCss)}>
          <MultiTypeMap
            name={`${prefix}spec.envVariables`}
            valueMultiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('environmentVariables')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel(enableFields['spec.envVariables'].tooltipId)}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.envVariables') ? (
        <Separator topSeparation={24} />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.outputVariables') ? (
        <Container className={cx(css.formGroup, stepCss)}>
          <MultiTypeList
            name={`${prefix}spec.outputVariables`}
            multiTextInputProps={{
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('pipelineSteps.outputVariablesLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('outputVariables')}
                </Layout.Horizontal>
              ),
              allowedTypes: allowableTypes.filter(type => type !== MultiTypeInputType.RUNTIME)
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.outputVariables') ? (
        <Separator topSeparation={16} />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.entrypoint') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeList
            name={`${prefix}spec.entrypoint`}
            multiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('entryPointLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('dependencyEntryPoint')}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.args') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeList
            name={`${prefix}spec.args`}
            multiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('argsLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('dependencyArgs')}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.optimize') ? (
        <div className={cx(css.formGroup, css.sm)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.optimize`}
            label={getString('ci.optimize')}
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            tooltipProps={{ dataTooltipId: 'optimize' }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.dockerfile') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.dockerfile`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('pipelineSteps.dockerfileLabel')}
                </Text>
                &nbsp;
                {getOptionalSubLabel('dockerfile')}
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.context') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.context`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('pipelineSteps.contextLabel')}
                </Text>
                &nbsp;
                {getOptionalSubLabel('context')}
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.labels') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name={`${prefix}spec.labels`}
            valueMultiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('pipelineSteps.labelsLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('labels')}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.buildArgs') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          {stepViewType === StepViewType.Edit ? (
            <MultiTypeMap {...buildArgsRenderCommonProps} />
          ) : (
            <MultiTypeMapInputSet {...buildArgsRenderCommonProps} />
          )}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.endpoint') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.endpoint`}
            label={
              <Text
                tooltipProps={{ dataTooltipId: 'endpoint' }}
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
              >
                {getString('pipelineSteps.endpointLabel')}
              </Text>
            }
            multiTextInputProps={{
              placeholder: getString('pipelineSteps.endpointPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.target') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.target`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('pipelineSteps.targetLabel')}
                </Text>
                &nbsp;
                {getOptionalSubLabel(enableFields['spec.target'].tooltipId)}
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              placeholder: getString('pipelineSteps.artifactsTargetPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.remoteCacheImage') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.remoteCacheImage`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('ci.remoteCacheImage.label')}
                </Text>
                &nbsp;
                {getOptionalSubLabel('gcrRemoteCache')}
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly,
              placeholder: getString('ci.remoteCacheImage.placeholder')
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.archiveFormat') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeSelectField
            name={`${prefix}spec.archiveFormat`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('archiveFormat')}
                </Text>
                &nbsp;
                {getOptionalSubLabel('archiveFormat')}
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: ArchiveFormatOptions,
              multiTypeInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.override') ? (
        <div className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.override`}
            label={getString('override')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: 'saveCacheOverride' }}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.pathStyle') ? (
        <div className={cx(css.formGroup, css.sm)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.pathStyle`}
            label={getString('pathStyle')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: 'pathStyle' }}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.failIfKeyNotFound') ? (
        <div className={cx(css.formGroup, css.sm, css.bottomMargin1)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.failIfKeyNotFound`}
            label={getString('failIfKeyNotFound')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: 'failIfKeyNotFound' }}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.remoteCacheRepo') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.remoteCacheRepo`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('ci.remoteCacheRepository.label')}
                </Text>
                &nbsp;
                {getOptionalSubLabel('dockerHubRemoteCache')}
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly,
              placeholder: getString('ci.remoteCacheImage.placeholder')
            }}
          />
        </Container>
      ) : null}
    </>
  )
}
