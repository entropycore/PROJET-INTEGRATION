export const BADGE_ICONS = {
  "Web Developer": "terminal",
  "DevOps Explorer": "cloud_sync",
  "Hackathon Participant": "groups",
  "Full Stack Developer": "developer_mode",
  "Security Aware": "security",
  "AI / Data": "analytics",
};

export const getBadgeIcon = (badge = {}) => {
  return badge.icon || BADGE_ICONS[badge.name] || "workspace_premium";
};
