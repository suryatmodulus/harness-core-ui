import type { TemplateContextInterface } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

const stateMock = {
  template: {
    name: 'Test Http Template',
    identifier: 'Test_Http_Template',
    versionLabel: 'v3',
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
    versionLabel: 'v3',
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
  stableVersion: false,
  versions: ['v3', 'v1', 'v2'],
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
  updateTemplate: () => new Promise<void>(() => undefined),
  updateTemplateView: jest.fn(),
  deleteTemplateCache: () => new Promise<void>(() => undefined),
  setLoading: () => void 0,
  updateGitDetails: () => new Promise<void>(() => undefined)
}

export default templateContextMock
