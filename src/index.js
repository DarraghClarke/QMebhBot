
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
    // const login = owner.login
    // console.log('before')
    // eslint-disable-next-line no-useless-escape
    console.log(owner)
    // console.log('after')
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

  // eslint-disable-next-line no-unused-vars
  async function getLeaderboard () {
    const rankedLeaderboard = getLeaderBoardRanked()
    return rankedLeaderboard
  }

  async function getLeaderBoardRanked () {
    // const items = Object.keys(dict).map(function (key) {
    //  return [key, dict[key]]
    // })
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
    // Sort the array based on the second element
    // items.sort(function (first, second) {
    // return second[1] - first[1]
    // })
    // dict.sorte((a, b) => a.value - b.value)
    // console.log(dict)
    // return dict.join(', ')
    return arrayKeys.toString().concat(arrayValues.toString())
  }
}
