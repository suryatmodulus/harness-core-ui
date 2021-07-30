import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, Layout, StepProps, Heading, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { DelegateSetupDetails } from 'services/portal'
import { useToaster } from '@common/exports'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { useGenerateKubernetesYaml } from 'services/portal'
import type { StepK8Data } from '@delegates/DelegateInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../CreateK8sDelegate.module.scss'

const Stepk8ReviewScript: React.FC<StepProps<StepK8Data>> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showError } = useToaster()
  const { mutate: downloadYaml } = useGenerateKubernetesYaml({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier, fileFormat: 'text/plain' }
  })
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const [generatedYaml, setGeneratedYaml] = React.useState({})

  const onGenYaml = async (): Promise<void> => {
    const data = props?.prevStepData?.delegateYaml
    const response = await downloadYaml(data as DelegateSetupDetails)
    setGeneratedYaml(response)
  }

  React.useEffect(() => {
    onGenYaml()
  }, [])

  const onDownload = (data: DelegateSetupDetails | undefined): void => {
    downloadYaml(data as DelegateSetupDetails)
      .then((response: any) => {
        return new Response(response)
      })
      .then(response => response.blob())
      .then(blob => {
        if (linkRef?.current) {
          const content = new Blob([blob], { type: 'data:text/plain;charset=utf-8' })
          linkRef.current.href = window.URL.createObjectURL(content)
          linkRef.current.download = `harness-delegate.yaml`
        }
        linkRef?.current?.click()
      })
      .catch(err => {
        showError(err.message)
        throw err
      })
  }
  return (
    <>
      <Layout.Horizontal>
        <Layout.Vertical padding="xlarge" spacing="medium">
          <div className={css.collapseDiv}>
            <YamlBuilder
              entityType="Delegates"
              fileName={`harness-delegate.yaml`}
              isReadOnlyMode={true}
              isEditModeSupported={false}
              existingJSON={generatedYaml}
              showSnippetSection={false}
              width="568px"
              height="462px"
              theme="DARK"
            />
          </div>
          <Layout.Horizontal padding="small">
            <Button
              id="stepReviewScriptDownloadYAMLButton"
              icon="arrow-down"
              text={getString('delegates.downloadYAMLFile')}
              className={css.downloadButton}
              onClick={() => {
                onDownload(props?.prevStepData?.delegateYaml)
              }}
              outlined
            />
          </Layout.Horizontal>
          <Layout.Horizontal padding="small">
            <Button
              id="stepReviewScriptBackButton"
              text={getString('back')}
              icon="chevron-left"
              onClick={() => props.previousStep?.(props?.prevStepData)}
              margin={{ right: 'small' }}
            />
            <Button
              id="stepReviewScriptContinueButton"
              type="submit"
              intent="primary"
              text={getString('continue')}
              rightIcon="chevron-right"
              onClick={() => props.nextStep?.(props?.prevStepData)}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical spacing="medium">
          <Layout.Horizontal padding="medium">
            <Heading level={2} style={{ color: '#22272D', fontWeight: 600 }}>
              {getString('delegate.reviewScript.configProxySettings')}
            </Heading>
          </Layout.Horizontal>
          <Layout.Vertical padding="small">
            <Text lineClamp={3} width={514} font="small">
              {getString('delegate.reviewScript.descriptionProxySettings')}
            </Text>
            <Text lineClamp={3} width={514} font="small">
              {getString('delegates.reviewScript.docLinkBefore')}
              <a
                rel="noreferrer"
                href="https://docs.harness.io/article/pfim3oig7o-configure-delegate-proxy-settings"
                target="_blank"
              >
                {getString('delegates.reviewScript.docLink')}
              </a>
              {getString('delegates.reviewScript.docLinkAfter')}
            </Text>
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Horizontal>
      <a
        className="hide"
        ref={linkRef}
        // ref={hiddenRedirectLink => (this.hiddenRedirectLink = hiddenRedirectLink)}
        target={'_blank'}
      />
    </>
  )
}

export default Stepk8ReviewScript
