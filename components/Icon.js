// components/Icon.js
const Icon = ({ name, className = "" }) => {
  const icons = {
    dashboard: "📊",
    task: "📝",
    history: "🕒",
    withdraw: "💰",
    refer: "👥",
    profile: "👤",
    contact: "📞",
    admin: "⚙️",
    telegram: "📱",
    wallet: "💳",
    users: "👥",
    trophy: "🏆",
    notification: "🔔",
    close: "✕",
    menu: "☰",
    user: "👤",
    share: "↗️",
    gift: "🎁",
    customer: "💁",
    email: "📧",
    time: "⏰",
    information: "ℹ️",
    external: "🔗",
    bank: "🏦",
    group: "👥",
    money: "💵",
    settings: "⚙️",
    logout: "🚪"
  };

  return <span className={className}>{icons[name] || "📄"}</span>;
};

export default Icon;
