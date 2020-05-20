const metadata = require('probot-metadata')
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  const dict = {}
  const title = 'QMebh Leaderboard'
  // eslint-disable-next-line camelcase
  let issue_number = null

  app.log('Yay, the app was loaded!')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on('issue_comment.created', async context => {
    const owner = context.payload.sender.login
    console.log(owner)
    dict[owner] = (dict[owner] || 0) + 1
    const leaderboardStatus = await leaderboardExists(context)
    if (leaderboardStatus === true) {
      await updateLeaderboard(app, context)
    } else {
      await createLeaderboard(context)
    }
  })
  async function updateLeaderboard (app, ctx) {
    const body = await getLeaderBoardRanked()
    ctx.github.issues.update(ctx.repo({ issue_number, body: body.toString() }))
    await metadata(ctx).set(dict)
    const dictionary = await metadata(ctx).getAll()
    // eslint-disable-next-line no-array-constructor
    var arrayKeys = new Array()
    // eslint-disable-next-line no-array-constructor
    var arrayValues = new Array()
    for (var key in dictionary) {
      arrayKeys.push(key)
      arrayValues.push(dictionary[key])
    }

    console.log(arrayKeys.toString() + ' keys')
    console.log(arrayValues.toString() + ' values')
  }
  async function createLeaderboard (ctx) {
    return ctx.github.issues.create(ctx.repo({ title: title, body: 'new blank leadboderboard' }))
  }
  async function leaderboardExists (ctx) {
    const search = await ctx.github.search.issuesAndPullRequests({
      q: `${title} in:title repo:${ctx.payload.repository.full_name}`,
      per_page: 100
    })
    if (search.data.total_count !== 0) {
      // eslint-disable-next-line camelcase
      issue_number = search.data.items[0].number
      return true
    }
    return false
  }
  async function getLeaderBoardRanked () {
    // eslint-disable-next-line no-array-constructor
    var arrayKeys = new Array()
    // eslint-disable-next-line no-array-constructor
    var arrayValues = new Array()
    for (var key in dict) {
      arrayKeys.push(key)
      arrayValues.push(dict[key])
    }

    console.log(arrayKeys.toString())
    console.log(arrayValues.toString())
    return arrayKeys.toString().concat(arrayValues.toString())
  }
}
