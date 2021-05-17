import React from 'react'
import { Layout, Text, Icon, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import { getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { SidecarArtifactWrapper } from 'services/cd-ng'
import { getArtifactIconByType } from '../ArtifactHelper'
import type { ArtifactListViewProps, CreationType } from '../ArtifactInterface'
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
  const { color } = getStatus(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse, accountId)
  return (
    <Layout.Vertical style={{ flexShrink: 'initial' }}>
      {/* {props.isForPredefinedSets && <PredefinedOverrideSets context="ARTIFACT" currentStage={props.stage} />} */}

      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
        <div className={cx(css.artifactList, css.listHeader)}>
          <span></span>
          <span>{getString('artifactRepository')}</span>
          <span> {getString('location')}</span>
          <span></span>
          <span></span>
        </div>

        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>
            {primaryArtifact && (
              <section className={cx(css.artifactList, css.rowItem)} key={'Dockerhub'}>
                <div>
                  <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                    Primary
                  </Text>
                </div>

                <div className={css.server}>
                  <Text
                    inline
                    icon={getArtifactIconByType(primaryArtifact.type)}
                    iconProps={{ size: 18 }}
                    width={180}
                    lineClamp={1}
                    style={{ color: Color.BLACK, fontWeight: 900 }}
                  >
                    {primaryArtifact.type}
                  </Text>

                  <Text width={200} icon="full-circle" iconProps={{ size: 10, color }} />
                </div>
                <div>
                  <Text width={400} lineClamp={1} style={{ color: Color.GREY_500 }}>
                    {primaryArtifact?.spec?.imagePath}
                  </Text>
                </div>
                <div>{/* WIP artifact validation */}</div>
                {overrideSetIdentifier?.length === 0 && !isReadonly && (
                  <span>
                    <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                      <Icon
                        name="Edit"
                        size={16}
                        onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact.type)}
                      />
                      {/* <Icon
                              name="main-clone"
                              size={16}
                              style={{ cursor: 'pointer' }}
                              className={css.cloneIcon}
                              // onClick={() => cloneArtifact(manifest)}
                            /> */}
                      <Icon name="bin-main" size={25} onClick={removePrimary} />
                    </Layout.Horizontal>
                  </span>
                )}
              </section>
            )}
          </section>
          {sideCarArtifact?.length > 0 && (
            <section>
              {sideCarArtifact?.map((data: SidecarArtifactWrapper, index: number) => {
                const { sidecar } = data
                const { color: sideCarConnectionColor } = getStatus(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse,
                  accountId
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
                    <div className={css.server}>
                      <Text
                        inline
                        icon={getArtifactIconByType(sidecar?.type as string)}
                        iconProps={{ size: 18 }}
                        width={180}
                        lineClamp={1}
                        style={{ color: Color.BLACK, fontWeight: 900 }}
                      >
                        {sidecar?.type}
                      </Text>

                      <Text width={200} icon="full-circle" iconProps={{ size: 10, color: sideCarConnectionColor }} />
                    </div>
                    <div>
                      <Text width={400} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {sidecar?.spec?.imagePath}
                      </Text>
                    </div>
                    <div>{/* WIP artifact validation */}</div>
                    {overrideSetIdentifier?.length === 0 && !isReadonly && (
                      <span>
                        <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                          <Icon
                            name="Edit"
                            size={16}
                            onClick={() => {
                              editArtifact(ModalViewFor.SIDECAR, sidecar?.type as CreationType, index)
                            }}
                          />
                          {/* <Icon
                                    name="main-clone"
                                    size={16}
                                    style={{ cursor: 'pointer' }}
                                    className={css.cloneIcon}
                                    // onClick={() => cloneArtifact(manifest)}
                                  /> */}
                          <Icon name="bin-main" size={25} onClick={() => removeSidecar(index)} />
                        </Layout.Horizontal>
                      </span>
                    )}
                  </section>
                )
              })}
            </section>
          )}
          {sideCarArtifact?.length > 0 && overrideSetIdentifier?.length === 0 && !isReadonly && (
            <div className={css.paddingVertical}>
              <Text intent="primary" style={{ cursor: 'pointer' }} onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}>
                <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
              </Text>
            </div>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical>
        {!primaryArtifact && overrideSetIdentifier?.length === 0 && !isReadonly && (
          <div className={css.rowItem}>
            <Text onClick={() => addNewArtifact(ModalViewFor.PRIMARY)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addPrimary" />
            </Text>
          </div>
        )}
        {(!sideCarArtifact || sideCarArtifact?.length === 0) && overrideSetIdentifier?.length === 0 && !isReadonly && (
          <div className={css.rowItem}>
            <Text onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
            </Text>
          </div>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ArtifactListView
