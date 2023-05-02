const USERNAME_REGEX = /### Core Author username\n\n(.+)/;
const SNIPPET_REGEX =
  /### Core \.yml snippet\s+(?:```yml\n)?([\s\S]*?)(?:\s*```)?\s*$/;

module.exports = ({ github, context }) => {
  const yaml = require("js-yaml");
  const fs = require("fs");
  const body = context.payload.issue.body;

  const usernameMatch = body.match(USERNAME_REGEX);
  const snippetMatch = body.match(SNIPPET_REGEX);

  if (usernameMatch && snippetMatch) {
    const username = usernameMatch[1].trim().replace("@", "");
    const snippet = snippetMatch[1]
      .replace("```yml", "")
      .replace("```", "")
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .join("\n");

    console.log("username", username);
    console.log("snippet", snippet);

    let yamlSnippet = null;

    try {
      yamlSnippet = yaml.load(snippet);
      console.log(yamlSnippet);
    } catch (err) {
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `Error processing the yaml snippet, sorry`,
      });

      return {};
    }

    const reposFile = yaml.load(
      fs.readFileSync("_data/repositories.yml", "utf8")
    );

    const knownAuthor = reposFile
      .map(({ username }) => username)
      .includes(username);

    if (!knownAuthor) {
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `Thanks for the submission!
        Looks like \`${username}\` doesn't have any cores in the inventory yet.
        So the PR'll require manual approval`,
      });
    }

    const currentCores = knownAuthor
      ? reposFile.find(({ username: u }) => u === username).cores
      : [];

    const existsAlready = Boolean(
      currentCores.find(
        // Can probably improve this comparison
        (c) => JSON.stringify(c) === JSON.stringify(yamlSnippet)
      )
    );

    if (existsAlready) {
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `Thanks for the submission!
        Looks like that core is in the inventory already`,
      });

      return { username, knownAuthor, existsAlready };
    }

    const newReposFile = [
      ...reposFile.filter(({ username: u }) => u !== username),
      { username, cores: [...currentCores, yamlSnippet] },
    ];

    newReposFile.sort((a, b) => a.username.localeCompare(b.username));

    fs.writeFileSync(
      "_data/repositories.yml",
      yaml.dump(newReposFile, { noRefs: true })
    );

    return { username, knownAuthor, existsAlready };
  }

  return {};
};
