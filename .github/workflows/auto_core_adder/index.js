const USERNAME_REGEX = /### Core Author username\n\n(.+)/;
const SNIPPET_REGEX =
  /### Core \.yml snippet\n(?:```yml\n)?([\s\S]*?)(?:\n```)?$/;

module.exports = ({ github, context }) => {
  // const yaml = require("js-yaml");
  console.log(context);
  const body = context.payload.issue.body;

  const usernameMatch = body.match(USERNAME_REGEX);
  const snippetMatch = body.match(SNIPPET_REGEX);

  if (usernameMatch && snippetMatch) {
    const username = usernameMatch[1];
    const snippet = snippetMatch[1];

    console.log(username);
    console.log(snippet);
  }

  return context.issue.body;
};
