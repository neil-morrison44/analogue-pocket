const script = require("./index.js");

const context = {
  payload: {
    issue: {
      body: `
      ### Core Author username

      agg23

      ### Core .yml snippet

      \`\`\`yml
      display_name: SNES for Analogue Pocket
      repository: openfpga-SNES
      \`\`\`

      `,
    },
  },
};

const result = script({ context });
