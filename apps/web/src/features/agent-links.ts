export const CLI = "npx -y good-a11y@0.1.0";

export const AGENT_COMMAND = `${CLI} search "modal dialog"`;

export const SKILL_PATH = "/skills/good-a11y/SKILL.md";

export const SKILL_URL_PATH = "/skill.md";

export const agentPrompt = (origin: string): string =>
  `Use ${origin} for accessibility in this project: read ${origin}${SKILL_URL_PATH} and follow it.`;
