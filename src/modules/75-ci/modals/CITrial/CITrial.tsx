import React, { useState } from 'react'
import { Text, Layout, Icon, Container, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { NgPipeline } from 'services/cd-ng'
import { SelectOrCreatePipelineForm } from '@pipeline/components/SelectOrCreatePipelineForm/SelectOrCreatePipelineForm'
import { CreatePipelineForm } from '@pipeline/components/CreatePipelineForm/CreatePipelineForm'
import ciImage from '../images/illustration.png'

interface CITrialModalData {
  handleSelectSubmit: (value: string) => void
  handleCreateSubmit: (value: NgPipeline) => void
  closeModal?: () => void
  isSelect: boolean
}

const CITrial: React.FC<CITrialModalData> = ({ isSelect, handleCreateSubmit, handleSelectSubmit, closeModal }) => {
  const { getString } = useStrings()

  const [select, setSelect] = useState(isSelect)

  return (
    <Layout.Vertical padding={{ top: 'large', left: 'xxxlarge' }}>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Icon name="ci-main" size={20} padding={{ right: 'small' }} />
        <Text style={{ color: Color.BLACK, fontSize: 'medium' }}>{getString('ci.continuous')}</Text>
      </Layout.Horizontal>
      <Layout.Horizontal>
        <Text
          style={{
            backgroundColor: 'var(--purple-500)',
            color: Color.WHITE,
            textAlign: 'center',
            width: 120,
            borderRadius: 3,
            marginLeft: 30,
            marginTop: 6,
            display: 'inline-block'
          }}
        >
          {getString('common.trialInProgress')}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="57%" padding={{ right: 'xxxlarge' }}>
          <Text style={{ fontSize: 'normal', width: 380, display: 'inline-block', marginLeft: 30, lineHeight: 2 }}>
            {select
              ? getString('pipeline.selectOrCreateForm.description')
              : getString('ci.ciTrialHomePage.startTrial.description')}
          </Text>
          <img src={ciImage} style={{ marginLeft: -40, marginTop: -30 }} width={800} height={400} />
        </Container>
        <Container width="30%" padding={{ left: 'xxxlarge' }} border={{ left: true }} height={400}>
          {select ? (
            <SelectOrCreatePipelineForm
              handleSubmit={handleSelectSubmit}
              openCreatPipeLineModal={() => {
                setSelect(false)
              }}
              closeModal={closeModal}
            />
          ) : (
            <CreatePipelineForm handleSubmit={handleCreateSubmit} closeModal={closeModal} />
          )}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default CITrial
