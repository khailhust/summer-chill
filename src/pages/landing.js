import { renderHero } from "../components/hero.js";
import { renderResortInfo } from "../components/resort-info.js";
import { renderMapSection } from "../components/map-section.js";
import { renderActivities } from "../components/activities.js";
import { renderFooter } from "../components/footer.js";

export function renderLandingPage() {
  const mount = document.getElementById('landing-mount');
  if (!mount) return;

  mount.innerHTML = `
    ${renderHero()}
    ${renderResortInfo()}
    ${renderMapSection()}
    ${renderActivities()}
    ${renderFooter()}
  `;

  // Scroll animations được quản lý bởi main.js
}
