module.exports = ({ github, context }) => {
  const yaml = require("js-yaml");
  const body = context.issue.body;

  const lines = body.split("\n");
  const usernameTitleIndex = lines.findIndex((l) => l.includes("{}"));
  console.log(lines[usernameTitleIndex]);
  console.log(lines[usernameTitleIndex + 2]);

  return context.issue.body;
};
