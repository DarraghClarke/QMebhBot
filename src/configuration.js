let createIssuePoints = 2
let issueCommentPoints = 1
let createPullRequestPoints = 5
let pullRequestCommentPoints = 2
let pullRequestMergedPoints = 3
let quietMode = null

async function load (context) {
  const config = await context.config('config.yml')
  if (config.quietMode === false) {
    quietMode = config.quietMode
  }

  if (config.createIssuePoints) {
    createIssuePoints = config.createIssuePoints
  }
  if (config.issueCommentPoints) {
    issueCommentPoints = config.issueCommentPoints
  }
  if (config.createPullRequestPoints) {
    createPullRequestPoints = config.createPullRequestPoints
  }
  if (config.pullRequestCommentPoints) {
    pullRequestCommentPoints = config.pullRequestCommentPoints
  }
  if (config.pullRequestMergedPoints) {
    pullRequestMergedPoints = config.pullRequestMergedPoints
  }
}

module.exports.load = load
module.exports.createIssuePoints = createIssuePoints
module.exports.issueCommentPoints = issueCommentPoints
module.exports.createPullRequestPoints = createPullRequestPoints
module.exports.pullRequestCommentPoints = pullRequestCommentPoints
module.exports.pullRequestMergedPoints = pullRequestMergedPoints
module.exports.quietMode = quietMode
