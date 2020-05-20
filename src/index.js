const metadata = require('probot-metadata')
const createScheduler = require('probot-scheduler')
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = bot => {
  let dict = {}
  const title = 'QMebh Leaderboard'
  let issueNumber = null
  let leaderboardIssue = null
  bot.log('Yay, the app was loaded!')

  createScheduler(bot, {
    delay: false
  })

  bot.on('schedule.repository', context => {
    // this is called on startup and can access context
    // if leaderboard exists, gets its info, if it doesn't, make it
    if (leaderboardExists(context) === true) {
      getLeaderboardFromMetadata(context)
    } else {
      createLeaderboard(context)
    }
  })

  bot.on('issues.opened', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'issues.opened')
  })

  bot.on('issue_comment.created', async context => {
    const owner = context.payload.sender.login
    handleUpdate(context, owner, 'issue_comment.created')
  })

  async function handleUpdate (ctx, owner, type) {
    switch (type) {
      case 'issue_comment.created':
        dict[owner] = (dict[owner] || 0) + 1
        break
      case 'issues.opened':
        dict[owner] = (dict[owner] || 0) + 2
        break
    }

    const leaderboardStatus = await leaderboardExists(ctx)
    if (leaderboardStatus === true) {
      await updateLeaderboard(bot, ctx)
    } else {
      await createLeaderboard(ctx)
    }
    await metadata(ctx).set(dict)
  }

  async function updateLeaderboard (bot, ctx) {
    const body = await getLeaderBoardRanked()
    ctx.github.issues.update(ctx.repo({ issue_number: issueNumber, body: body.toString() }))
  }

  async function createLeaderboard (ctx) {
    return ctx.github.issues.create(ctx.repo({ title: title, body: 'new blank leadboderboard' }))
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
}
