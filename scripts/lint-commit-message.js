const COMMIT_MSG = process.argv[2]
const JIRA_TKT_CHECK= process.env.JIRA_TKT_CHECK==='true'
const COMMIT_REGEX = JIRA_TKT_CHECK ? /^(revert: )?(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:\s\[.*-\d*\]: .{1,50}/ :/^(revert: )?(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,50}/
const ERROR_MSG= JIRA_TKT_CHECK ? 'Commit messages must be "fix/feat/docs/style/refactor/perf/test/chore: [HAR-<ticket number>]: <changes>"':'Commit messages must be "fix/feat/docs/style/refactor/perf/test/chore: <changes>"'
if (!COMMIT_REGEX.test(COMMIT_MSG)) {
  console.log(ERROR_MSG)
  console.log(`But got: "${COMMIT_MSG}"`)
  process.exit(1)
}
