const metadata = require('probot-metadata')
// const createScheduler = require('probot-scheduler')
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = bot => {
  let dict = {}
  const title = 'QMebh Leaderboard'
  let issueNumber = null
  let leaderboardIssue = null
  let quietMode = null
  let createIssuePoints = 2
  let issueCommentPoints = 1
  let createPullRequestPoints = 5
  let pullRequestCommentPoints = 2
  let pullRequestMergedPoints = 3

  bot.log('Yay, the app was loaded!')

  bot.on('issues.opened', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'issues.opened')
  })

  bot.on('issue_comment.created', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'issue_comment.created')
  })

  bot.on('pull_request.opened', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'pull_request.opened')
  })

  bot.on('pull_request_review_comment.created', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'pull_request_review_comment.created')
  })

  bot.on('pull_request.merged', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'pull_request.merged')
  })

  async function handleUpdate (ctx, owner, type) {
    if (quietMode === null) {
      quietMode = true // set to true by default but check incase config says otherwise
      await loadConfig(ctx)
      if (await leaderboardExists(ctx) === true) {
        getLeaderboardFromMetadata(ctx)
      } else {
        createLeaderboard(ctx)
      }
    }
    switch (type) {
      case 'issue_comment.created':
        dict[owner] = (dict[owner] || 0) + issueCommentPoints
        break
      case 'issues.opened':
        dict[owner] = (dict[owner] || 0) + createIssuePoints
        break
      case 'pull_request.opened':
        dict[owner] = (dict[owner] || 0) + createPullRequestPoints
        break
      case 'pull_request.merged':
        dict[owner] = (dict[owner] || 0) + pullRequestMergedPoints
        break
      case 'pull_request_review_comment.created':
        dict[owner] = (dict[owner] || 0) + pullRequestCommentPoints
        break
    }

    const leaderboardStatus = await leaderboardExists(ctx, ctx.github)
    if (await leaderboardStatus === true) {
      await updateLeaderboard(bot, ctx)
    } else {
      await createLeaderboard(ctx)
    }
  }

  async function updateLeaderboard (bot, ctx) {
    const body = await getLeaderBoardRanked()
    if (quietMode === true || quietMode === null) {
      console.log('in silent mode, did not make changes, would have updated leaderboard issue with ' + body)
    } else {
      ctx.github.issues.update(ctx.repo({ issue_number: issueNumber, body: body.toString() }))
    }
  }

  async function createLeaderboard (ctx) {
    if (quietMode === true || quietMode === null) {
      console.log('in silent mode, did not make changes, would have created leaderboard issue ')
    } else {
      ctx.github.issues.create(ctx.repo({ title: title, body: 'new blank leadboderboard' }))
    }
  }

  async function getLeaderboardFromMetadata (ctx) {
    dict = await metadata(ctx, leaderboardIssue).getAll()
  }

  async function leaderboardExists (ctx) {
    const search = await ctx.github.search.issuesAndPullRequests({
      q: `${title} in:title repo:${ctx.payload.repository.full_name}`,
      per_page: 100
    })
    if (search.data.total_count !== 0) {
      leaderboardIssue = search.data.items[0]
      issueNumber = search.data.items[0].number
      return true
    }
    return false
  }

  async function getLeaderBoardRanked () {
    let formattedLeaderboard = 'Leaderboard\n'
    for (var key in dict) {
      formattedLeaderboard = formattedLeaderboard + key + ' - ' + dict[key] + ' points\n'
    }
    return formattedLeaderboard
  }

  async function loadConfig (context) {
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
}
