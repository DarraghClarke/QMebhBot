# QMebh

> A GitHub hobby project built with [Probot](https://github.com/probot/probot), aims to gamify a project, for people who want that kind of thing

Currently it creates a leaderboard as a new Issue, and as people comment/open PR's/ create issues, it awards them points and places these points on the leaderboard. It also stores information as metadata on this leaderboard so if the bot goes offline it can get the metadata back when it relaunches. 

## Setup

```sh
# Install dependencies
npm install

#Create a config.yml file in the .github folder in the format
quietMode: {true/false}
createIssuePoints: {int value}
issueCommentPoints: {int value}
createPullRequestPoints: {int value}
pullRequestCommentPoints: {int value}
pullRequestMergedPoints: {int value}

# Run the bot
npm start
```

## Contributing

If you have suggestions for how Aine could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Darragh Clarke <darragh.clarke@ucdconnect.ie>
