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
    const username = usernameMatch[1].trim();
    const snippet = snippetMatch[1]
      .replace("```yml", "")
      .replace("```", "")
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .join("\n");

    console.log(username);
    console.log(snippet);

    const yamlSnippet = yaml.load(snippet);

    console.log(yamlSnippet);

    const reposFile = yaml.load(
      fs.readFileSync("_data/repositories.yml", "utf8")
    );

    console.log(reposFile);

    const knownAuthor = reposFile
      .map(({ username }) => username)
      .includes(username);

    console.log(knownAuthor);

    if (!knownAuthor) return;

    const currentCores = reposFile.find(
      ({ username: u }) => u === username
    ).cores;

    console.log(currentCores);

    const existsAlready = Boolean(
      currentCores.find(
        // Can probably improve this comparison
        (c) => JSON.stringify(c) === JSON.stringify(yamlSnippet)
      )
    );

    console.log(existsAlready);

    const newReposFile = [
      ...reposFile.filter(({ username: u }) => u !== username),
      { username, cores: [...currentCores, yamlSnippet] },
    ];

    fs.writeFileSync(
      "_data/repositories_new.yml",
      yaml.dump(newReposFile, { noRefs: true })
    );

    console.log("Have written file");
  }

  return context.payload.issue.body;
};
