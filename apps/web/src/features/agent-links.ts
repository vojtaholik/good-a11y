export const CLI = "npx -y github:vojtaholik/good-a11y";

export const AGENT_COMMAND = `${CLI} search "modal dialog"`;

export const SKILL_PATH = "/skills/good-a11y/SKILL.md";

export const SKILL_URL_PATH = "/skill.md";

export const agentPrompt = (origin: string): string =>
  `Use ${origin} for accessibility in this project: read ${origin}${SKILL_URL_PATH} and follow it. If your sandbox blocks the network, ask me to allow ${new URL(origin).host}.`;
