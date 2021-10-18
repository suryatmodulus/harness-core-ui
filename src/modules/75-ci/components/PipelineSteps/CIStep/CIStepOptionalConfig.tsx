import React from 'react'
import cx from 'classnames'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { Separator } from '@common/components/Separator/Separator'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CIStepOptionalConfigProps {
  readonly?: boolean
  enableFields: {
    [key: string]: { [key: string]: any }
  }
}

export const CIStepOptionalConfig: React.FC<CIStepOptionalConfigProps> = props => {
  const { readonly, enableFields } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.privileged') ? (
        <div className={cx(css.formGroup, css.sm)}>
          <FormMultiTypeCheckboxField
            name="spec.privileged"
            label={getString('ci.privileged')}
            multiTypeTextbox={{
              expressions
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.settings') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name="spec.settings"
            valueMultiTextInputProps={{ expressions }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_800} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('settingsLabel')}
                  </Text>
                  &nbsp;
                  <Text
                    tooltipProps={{ dataTooltipId: 'pluginSettings' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.reportPaths') ? (
        <Container className={cx(css.formGroup, css.lg)}>
          <MultiTypeList
            name="spec.reportPaths"
            placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
            multiTextInputProps={{ expressions }}
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
                  <Text
                    tooltipProps={{ dataTooltipId: 'reportPaths' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.reportPaths') ? <Separator topSeparation={16} /> : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.envVariables') ? (
        <Container className={css.formGroup}>
          <MultiTypeMap
            name="spec.envVariables"
            valueMultiTextInputProps={{ expressions }}
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
                  <Text
                    tooltipProps={{ dataTooltipId: enableFields['spec.envVariables'].tooltipId }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
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
        <Container className={cx(css.formGroup, css.lg)}>
          <MultiTypeList
            name="spec.outputVariables"
            multiTextInputProps={{ expressions }}
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
                  <Text
                    tooltipProps={{ dataTooltipId: 'outputVariables' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.outputVariables') ? (
        <Separator topSeparation={16} />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.entrypoint') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeList
            name="spec.entrypoint"
            multiTextInputProps={{ expressions }}
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
                  <Text
                    tooltipProps={{ dataTooltipId: 'dependencyEntryPoint' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.args') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeList
            name="spec.args"
            multiTextInputProps={{ expressions }}
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
                  <Text
                    tooltipProps={{ dataTooltipId: 'dependencyArgs' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
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
            name="spec.optimize"
            label={getString('ci.optimize')}
            multiTypeTextbox={{
              expressions
            }}
            tooltipProps={{ dataTooltipId: 'optimize' }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.dockerfile') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name="spec.dockerfile"
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
                <Text
                  tooltipProps={{ dataTooltipId: 'dockerfile' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.context') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name="spec.context"
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
                <Text
                  tooltipProps={{ dataTooltipId: 'context' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.labels') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name="spec.labels"
            valueMultiTextInputProps={{ expressions }}
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
                  <Text
                    tooltipProps={{ dataTooltipId: 'labels' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.buildArgs') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name="spec.buildArgs"
            valueMultiTextInputProps={{ expressions }}
            multiTypeFieldSelectorProps={{
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
                  <Text
                    tooltipProps={{ dataTooltipId: 'buildArgs' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.endpoint') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name="spec.endpoint"
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
              multiTextInputProps: { expressions },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.target') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name="spec.target"
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
                <Text
                  tooltipProps={{ dataTooltipId: enableFields['spec.target'].tooltipId }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              placeholder: getString('pipelineSteps.artifactsTargetPlaceholder'),
              multiTextInputProps: { expressions },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.remoteCacheImage') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name="spec.remoteCacheImage"
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
                <Text
                  tooltipProps={{ dataTooltipId: 'gcrRemoteCache' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions },
              disabled: readonly,
              placeholder: getString('ci.remoteCacheImage.placeholder')
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.archiveFormat') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name="spec.archiveFormat"
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
                <Text
                  tooltipProps={{ dataTooltipId: 'archiveFormat' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: ArchiveFormatOptions,
              multiTypeInputProps: { expressions },
              disabled: readonly
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.override') ? (
        <div className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
          <FormMultiTypeCheckboxField
            name="spec.override"
            label={getString('override')}
            multiTypeTextbox={{
              expressions,
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
            name="spec.pathStyle"
            label={getString('pathStyle')}
            multiTypeTextbox={{
              expressions,
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
            name="spec.failIfKeyNotFound"
            label={getString('failIfKeyNotFound')}
            multiTypeTextbox={{
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: 'failIfKeyNotFound' }}
          />
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.remoteCacheRepo') ? (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name="spec.remoteCacheRepo"
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
                <Text
                  tooltipProps={{ dataTooltipId: 'dockerHubRemoteCache' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions },
              disabled: readonly,
              placeholder: getString('ci.remoteCacheImage.placeholder')
            }}
          />
        </Container>
      ) : null}
    </>
  )
}
