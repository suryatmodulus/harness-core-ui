import React from 'react'
import { Layout, Text, Icon, Color } from '@wings-software/uicore'
import cx from 'classnames'
import Joyride from 'react-joyride'
import { String, useStrings } from 'framework/strings'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { SidecarArtifactWrapper } from 'services/cd-ng'
import { ArtifactIconByType } from '../ArtifactHelper'
import type { ArtifactListViewProps, ArtifactType } from '../ArtifactInterface'

import NeutralCard from '../../ManifestSelection/images/Neutral Card (1).png'
import css from '../ArtifactsSelection.module.scss'

export enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}

const ArtifactListView: React.FC<ArtifactListViewProps> = ({
  accountId,
  fetchedConnectorResponse,
  primaryArtifact,
  sideCarArtifact,
  isReadonly,
  editArtifact,
  overrideSetIdentifier,
  removePrimary,
  removeSidecar,
  addNewArtifact
}) => {
  const { getString } = useStrings()
  const { color: primaryConnectorColor } = getStatus(
    primaryArtifact?.spec?.connectorRef,
    fetchedConnectorResponse,
    accountId
  )
  const primaryConnectorName = getConnectorNameFromValue(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse)
  const steps = [
    {
      content: (
        <div style={{ display: 'flex' }}>
          <img src={NeutralCard}></img>
          <p style={{ marginTop: '35px' }}>
            A software artifact is a by-product produced during the development of software. It contains everything
            needed for a piece of software to be generated, including parts like dependencies, metadata, security and
            license, and more.
          </p>
        </div>
      ),
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      target: '.ArtifactsSelection-module_addArtifact_30UwHk'
    }
  ]
  return (
    <Layout.Vertical style={{ flexShrink: 'initial' }}>
      <Joyride
        // callback={handleJoyrideCallback}
        continuous={true}
        // getHelpers={this.getHelpers}
        run={true}
        scrollToFirstStep={true}
        // showProgress={true}
        showSkipButton={true}
        steps={steps}
        styles={{
          options: {
            zIndex: 10000
          }
        }}
      />
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
        {!!(sideCarArtifact?.length || primaryArtifact?.type) && (
          <div className={cx(css.artifactList, css.listHeader)}>
            <span></span>
            <span>{getString('artifactRepository')}</span>
            <span> {getString('location')}</span>
            <span></span>
            <span></span>
          </div>
        )}

        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>
            {primaryArtifact && (
              <section className={cx(css.artifactList, css.rowItem)} key={'Dockerhub'}>
                <div>
                  <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                    {getString('primary')}
                  </Text>
                </div>
                <div className={css.connectorNameField}>
                  <Icon padding={{ right: 'small' }} name={ArtifactIconByType[primaryArtifact.type]} size={18} />
                  <Text className={css.connectorName} lineClamp={1}>
                    {primaryConnectorName ?? primaryArtifact.spec?.connectorRef}
                  </Text>
                  <Icon name="full-circle" size={12} color={primaryConnectorColor} />
                </div>

                <div>
                  <Text width={400} lineClamp={1} style={{ color: Color.GREY_500 }}>
                    {primaryArtifact?.spec?.imagePath}
                  </Text>
                </div>
                {overrideSetIdentifier?.length === 0 && !isReadonly && (
                  <span>
                    <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                      <Icon
                        name="Edit"
                        size={16}
                        onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact.type)}
                      />
                      <Icon name="bin-main" size={25} onClick={removePrimary} />
                    </Layout.Horizontal>
                  </span>
                )}
              </section>
            )}
          </section>
          {sideCarArtifact && sideCarArtifact?.length > 0 && (
            <section>
              {sideCarArtifact?.map((data: SidecarArtifactWrapper, index: number) => {
                const { sidecar } = data
                const { color: sideCarConnectionColor } = getStatus(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse,
                  accountId
                )
                const sidecarConnectorName = getConnectorNameFromValue(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse
                )

                return (
                  <section className={cx(css.artifactList, css.rowItem)} key={`${sidecar?.identifier}-${index}`}>
                    <div>
                      <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                        {getString('sidecar')}
                        <Text lineClamp={1} className={css.artifactId}>
                          ({getString('common.ID')}: {sidecar?.identifier})
                        </Text>
                      </Text>
                    </div>

                    <div className={css.connectorNameField}>
                      <Icon
                        padding={{ right: 'small' }}
                        name={ArtifactIconByType[sidecar?.type as ArtifactType]}
                        size={18}
                      />
                      <Text className={css.connectorName} lineClamp={1}>
                        {sidecarConnectorName ?? sidecar?.spec?.connectorRef}
                      </Text>
                      <Icon name="full-circle" size={12} color={sideCarConnectionColor} />
                    </div>

                    <div>
                      <Text width={400} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {sidecar?.spec?.imagePath}
                      </Text>
                    </div>
                    {overrideSetIdentifier?.length === 0 && !isReadonly && (
                      <span>
                        <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                          <Icon
                            name="Edit"
                            size={16}
                            onClick={() => {
                              editArtifact(ModalViewFor.SIDECAR, sidecar?.type as ArtifactType, index)
                            }}
                          />
                          <Icon name="bin-main" size={25} onClick={() => removeSidecar(index)} />
                        </Layout.Horizontal>
                      </span>
                    )}
                  </section>
                )
              })}
            </section>
          )}
        </Layout.Vertical>
      </Layout.Vertical>

      <div>
        {!primaryArtifact && overrideSetIdentifier?.length === 0 && !isReadonly && (
          <div className={css.addArtifact}>
            <Text intent="primary" onClick={() => addNewArtifact(ModalViewFor.PRIMARY)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addPrimary" />
            </Text>
          </div>
        )}
        {!overrideSetIdentifier?.length && !isReadonly && (
          <div className={css.addArtifact}>
            <Text intent="primary" onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
            </Text>
          </div>
        )}
      </div>
    </Layout.Vertical>
  )
}

export default ArtifactListView
