import type { TemplateContextInterface } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

const stateMock = {
  template: {
    name: 'Test Http Template',
    identifier: 'Test_Http_Template',
    versionLabel: 'v1',
    type: 'Step',
    projectIdentifier: 'Yogesh_Test',
    orgIdentifier: 'default',
    description: null,
    tags: {},
    spec: {
      type: 'Http',
      timeout: '1m 40s',
      spec: { url: '<+input>', method: 'GET', headers: [], outputVariables: [], requestBody: '<+input>' }
    }
  },
  originalTemplate: {
    name: 'Test Http Template',
    identifier: 'Test_Http_Template',
    versionLabel: 'v1',
    type: 'Step',
    projectIdentifier: 'Yogesh_Test',
    orgIdentifier: 'default',
    description: null,
    tags: {},
    spec: {
      type: 'Http',
      timeout: '1m 40s',
      spec: { url: '<+input>', method: 'GET', headers: [], outputVariables: [], requestBody: '<+input>' }
    }
  },
  stableVersion: 'v2',
  versions: ['v1', 'v2', 'v3'],
  templateIdentifier: 'Test_Http_Template',
  templateView: { isDrawerOpened: false, isYamlEditable: false, drawerData: { type: 'AddCommand' } },
  isLoading: false,
  isBETemplateUpdated: false,
  isDBInitialized: true,
  isUpdated: false,
  isInitialized: true,
  gitDetails: {},
  error: ''
}

const templateContextMock: TemplateContextInterface = {
  state: stateMock as any,
  view: 'VISUAL',
  isReadonly: false,
  setView: () => void 0,
  fetchTemplate: () => new Promise<void>(() => undefined),
  setYamlHandler: () => undefined,
  updateTemplate: jest.fn(),
  updateTemplateView: jest.fn(),
  deleteTemplateCache: () => new Promise<void>(() => undefined),
  setLoading: () => void 0,
  updateGitDetails: () => new Promise<void>(() => undefined)
}

export default templateContextMock
