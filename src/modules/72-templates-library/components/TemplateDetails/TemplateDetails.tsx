import React from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  DropDown,
  Layout,
  SelectOption,
  Tab,
  Tabs,
  Tag,
  Text
} from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { PageSpinner, useToaster } from '@common/components'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetTemplateList, TemplateSummaryResponse } from 'services/template-ng'
import { TemplateInputs } from '../TemplateInputs/TemplateInputs'
import { TemplateYaml } from '../TemplateYaml/TemplateYaml'
import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  templateIdentifier: string
  versionLabel?: string
  setTemplate?: (template: TemplateSummaryResponse) => void
  onClose?: () => void
}

export const TemplateDetails: React.FC<TemplateDetailsProps> = props => {
  const { templateIdentifier, versionLabel = false, onClose, setTemplate } = props
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { showError } = useToaster()
  const [selectedVersion, setSelectedVersion] = React.useState<TemplateSummaryResponse>()

  const {
    data: templateData,
    loading,
    error: templatesError
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [templateIdentifier]
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      templateListType: TemplateListType.All
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const onChange = React.useCallback(
    (option: SelectOption): void => {
      const version = option.value?.toString() || ''
      const newSelectedVersion = templateData?.data?.content?.find(item => item.versionLabel === version)
      setSelectedVersion(newSelectedVersion)
    },
    [templateData?.data?.content]
  )

  React.useEffect(() => {
    if (selectedVersion) {
      setTemplate?.(selectedVersion)
    }
  }, [selectedVersion])

  React.useEffect(() => {
    if (!isEmpty(templateData?.data?.content)) {
      setSelectedVersion(
        templateData?.data?.content?.find(item => item.versionLabel === versionLabel) ||
          templateData?.data?.content?.[0]
      )
      const newVersionOptions = templateData?.data?.content?.map(item => {
        return {
          label: item.versionLabel,
          value: item.versionLabel
        } as SelectOption
      }) || [{ label: '', value: '' } as SelectOption]
      newVersionOptions.sort((a, b) => a.label.localeCompare(b.label))
      setVersionOptions(newVersionOptions)
    }
  }, [templateData?.data?.content, versionLabel])

  React.useEffect(() => {
    if (templatesError) {
      onClose?.()
      showError(templatesError.message, undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  const goToTemplateStudio = () => {
    if (selectedVersion) {
      history.push(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: selectedVersion.templateEntityType,
          templateIdentifier: selectedVersion.identifier,
          versionLabel: selectedVersion.versionLabel
        })
      )
    }
  }

  return (
    <Container
      height={'100%'}
      padding={{ top: 'huge', right: 'xxlarge', bottom: 'huge', left: 'xxlarge' }}
      background={Color.FORM_BG}
      className={css.main}
    >
      {loading && <PageSpinner />}
      {selectedVersion && (
        <Layout.Vertical spacing={'xxxlarge'} height={'100%'}>
          <Container>
            <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'huge'}>
              <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
                {selectedVersion.name}
              </Text>
              <Button className={css.openInStudio} onClick={goToTemplateStudio} variation={ButtonVariation.SECONDARY}>
                {getString('templatesLibrary.openInTemplateStudio')}
              </Button>
            </Layout.Horizontal>
          </Container>
          <Container>
            <Layout.Vertical spacing={'large'}>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small' }} color={Color.GREY_500}>
                    Version
                  </Text>
                  {selectedVersion.versionLabel && (
                    <DropDown
                      filterable={false}
                      items={versionOptions}
                      value={selectedVersion.versionLabel}
                      onChange={onChange}
                      width={300}
                    />
                  )}
                </Layout.Vertical>
              </Container>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small' }} color={Color.GREY_500}>
                    Description
                  </Text>
                  <Text color={Color.GREY_700}>{selectedVersion.description || '-'}</Text>
                </Layout.Vertical>
              </Container>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small' }} color={Color.GREY_500}>
                    Tags
                  </Text>
                  {selectedVersion.tags && !isEmpty(selectedVersion.tags) ? (
                    <TemplateTags tags={selectedVersion.tags} />
                  ) : (
                    <Text color={Color.GREY_700}>-</Text>
                  )}
                </Layout.Vertical>
              </Container>
            </Layout.Vertical>
          </Container>
          <div className={css.tabsContainer}>
            <Tabs id="template-details" selectedTabId={'template-yaml'}>
              <Tab
                id="template-input"
                disabled={true}
                title={getString('templatesLibrary.templateInputs')}
                panel={<TemplateInputs />}
              />
              <Tab
                id="template-yaml"
                title={getString('yaml')}
                panel={<TemplateYaml templateYaml={selectedVersion.yaml} />}
              />
              <Tab
                id="template-referenced-by"
                disabled={true}
                title={
                  <>
                    {getString('templatesLibrary.referencedBy')} &nbsp; <Tag>5</Tag>
                  </>
                }
                panel={<div>Referenced By</div>}
              />
              <Tab
                id="template-version-log"
                disabled={true}
                title={getString('templatesLibrary.versionLog')}
                panel={<div>Version Log</div>}
              />
            </Tabs>
          </div>
        </Layout.Vertical>
      )}
    </Container>
  )
}
