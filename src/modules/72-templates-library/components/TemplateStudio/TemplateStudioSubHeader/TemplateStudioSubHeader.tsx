import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import VisualYamlToggle, { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import {
  GetErrorResponse,
  SaveTemplatePopover
} from '@templates-library/components/TemplateStudio/SaveTemplatePopover/SaveTemplatePopover'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { TemplateStudioSubHeaderLeftView } from './views/TemplateStudioSubHeaderLeftView/TemplateStudioSubHeaderLeftView'
import css from './TemplateStudioSubHeader.module.scss'

export interface TemplateStudioSubHeaderProps {
  onViewChange: (view: SelectedView) => boolean
  getErrors?: () => Promise<GetErrorResponse>
}

export const TemplateStudioSubHeader: (props: TemplateStudioSubHeaderProps) => JSX.Element = ({
  onViewChange,
  getErrors
}) => {
  const { state, fetchTemplate, view, isReadonly } = React.useContext(TemplateContext)
  const { isUpdated } = state
  const { getString } = useStrings()
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()
  const isYaml = view === SelectedView.YAML

  return (
    <Container
      className={css.subHeader}
      height={52}
      padding={{ right: 'xlarge', left: 'xlarge' }}
      border={{ bottom: true, color: Color.GREY_100 }}
      background={Color.WHITE}
    >
      <Layout.Horizontal height={'100%'} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <TemplateStudioSubHeaderLeftView />
        <Container>
          <VisualYamlToggle
            className={css.visualYamlToggle}
            initialSelectedView={isYaml ? SelectedView.YAML : SelectedView.VISUAL}
            beforeOnChange={(nextMode, callback) => {
              const shouldSwitchMode = onViewChange(nextMode)
              shouldSwitchMode && callback(nextMode)
            }}
          />
        </Container>
        <Container>
          <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center' }}>
            {isReadonly && (
              <Container>
                <Layout.Horizontal spacing={'small'}>
                  <Icon name="eye-open" size={16} color={Color.ORANGE_800} />
                  <Text color={Color.ORANGE_800} font={{ size: 'small' }}>
                    {getString('common.readonlyPermissions')}
                  </Text>
                </Layout.Horizontal>
              </Container>
            )}
            {isUpdated && !isReadonly && (
              <Text color={Color.ORANGE_600} font={{ size: 'small' }} className={css.tagRender}>
                {getString('unsavedChanges')}
              </Text>
            )}
            {!isReadonly && (
              <Container>
                <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
                  <SaveTemplatePopover disabled={!isUpdated} getErrors={getErrors} />
                  {templateIdentifier !== DefaultNewTemplateId && (
                    <Button
                      disabled={!isUpdated}
                      onClick={() => {
                        fetchTemplate({ forceFetch: true, forceUpdate: true })
                      }}
                      variation={ButtonVariation.SECONDARY}
                      text={getString('common.discard')}
                    />
                  )}
                </Layout.Horizontal>
              </Container>
            )}
          </Layout.Horizontal>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}
