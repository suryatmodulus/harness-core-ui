export enum UIType {
  Branch = 'branch',
  Tag = 'tag',
  PullRequest = 'pull-request'
}

export function getUIType(buildType: 'branch' | 'tag' | 'PR'): UIType {
  let type: UIType

  switch (buildType) {
    case 'branch':
      type = UIType.Branch
      break
    case 'tag':
      type = UIType.Tag
      break
    case 'PR':
      type = UIType.PullRequest
      break
  }

  return type
}
