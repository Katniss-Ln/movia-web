(() => {
  const KEY = "movia.web.v1";
  const app = document.querySelector("#app");
  if (!app) return;

  const labels = {
    Running: "Course", Walking: "Marche", Hiking: "Randonnée", Cycling: "Vélo",
    Swimming: "Natation", Yoga: "Yoga", Pilates: "Pilates",
    TraditionalStrengthTraining: "Renforcement musculaire",
    FunctionalStrengthTraining: "Renforcement fonctionnel",
    CrossTraining: "Entraînement croisé", Dance: "Danse", Rowing: "Aviron",
    Elliptical: "Vélo elliptique", StairClimbing: "Escaliers",
    MindAndBody: "Corps et esprit", CoreTraining: "Renforcement du tronc",
    Cooldown: "Retour au calme", HighIntensityIntervalTraining: "Fractionné",
    Soccer: "Football", Tennis: "Tennis"
  };

  function showStatus(message, isError = false) {
    let status = document.querySelector("#health-import-status");
    if (!status) {
      status = document.createElement("p");
      status.id = "health-import-status";
      status.className = "muted";
      document.querySelector("#app .toolbar")?.after(status);
    }
    if (status) {
      status.textContent = message;
      status.classList.toggle("error", isError);
    }
  }

  function readAttributes(fragment) {
    const opening = fragment.match(/^<Workout\b([^>]*)>/);
    if (!opening) return null;
    const attrs = {};
    opening[1].replace(/([\w:-]+)=(?:"([^"]*)"|'([^']*)')/g, (_, key, double, single) => {
      attrs[key] = double ?? single ?? "";
      return _;
    });
    return attrs;
  }

  function parseDate(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/);
    return new Date(match ? match[1] + "T" + match[2] + match[3] + ":" + match[4] : raw);
  }

  function workoutFrom(fragment) {
    const attrs = readAttributes(fragment);
    if (!attrs) return null;
    const date = parseDate(attrs.startDate);
    const durationValue = Number(attrs.duration);
    const durationUnits = { s: 1 / 60, sec: 1 / 60, min: 1, hr: 60, h: 60 };
    const duration = Math.round(durationValue * (durationUnits[attrs.durationUnit || "min"] || 1));
    if (!Number.isFinite(date.getTime()) || !Number.isFinite(durationValue) || duration <= 0) return null;

    const rawType = String(attrs.workoutActivityType || "").replace(/^HKWorkoutActivityType/, "");
    const kind = labels[rawType] || rawType.replace(/([a-z])([A-Z])/g, "$1 $2") || "Séance";
    const metersPerUnit = { m: 1, km: 1000, mi: 1609.344, yd: 0.9144 };
    const rawDistance = Number(attrs.totalDistance);
    const unit = attrs.totalDistanceUnit || "m";
    const distance = Number.isFinite(rawDistance) && rawDistance > 0
      ? Number((rawDistance * (metersPerUnit[unit] || 1) / 1000).toFixed(3))
      : null;
    const sourceKey = [date.toISOString(), kind, duration, distance ?? ""].join("|");
    return {
      id: "health-" + crypto.randomUUID(),
      date: date.toISOString(),
      kind,
      title: kind,
      duration,
      distance,
      feeling: "Depuis Apple Santé",
      pain: false,
      sourceKey
    };
  }

  async function importFile(file) {
    try {
      if (!file || !file.name.toLowerCase().endsWith(".xml")) {
        throw new Error("Choisis export.xml, extrait de l’archive Apple Santé.");
      }
      const xml = await file.text();
      const matches = xml.match(/<Workout\b[^>]*\/>|<Workout\b[^>]*>[\s\S]*?<\/Workout\s*>/g) || [];
      if (!matches.length) throw new Error("Aucune séance trouvée. Choisis le fichier export.xml.");

      const imported = matches.map(workoutFrom).filter(Boolean);
      if (!imported.length) throw new Error("Aucune séance exploitable trouvée dans ce fichier.");
      const current = JSON.parse(localStorage.getItem(KEY) || "{}");
      const activities = Array.isArray(current.activities) ? current.activities : [];
      const known = new Set(activities.map(item => item.sourceKey).filter(Boolean));
      const fresh = imported.filter(item => {
        if (known.has(item.sourceKey)) return false;
        known.add(item.sourceKey);
        return true;
      });
      if (!fresh.length) {
        showStatus("Ces séances sont déjà dans l’historique.");
        return;
      }
      current.activities = [...fresh, ...activities];
      localStorage.setItem(KEY, JSON.stringify(current));
      showStatus(fresh.length + " séance(s) Apple Santé importée(s). Actualisation…");
      setTimeout(() => location.reload(), 700);
    } catch (error) {
      showStatus(error.message || "Import Apple Santé impossible.", true);
    }
  }

  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = ".xml,text/xml,application/xml";
  picker.hidden = true;
  picker.addEventListener("change", () => {
    if (picker.files?.[0]) importFile(picker.files[0]);
    picker.value = "";
  });
  document.body.append(picker);

  function addImportButton() {
    const heading = document.querySelector("#app .section-title h2");
    const toolbar = document.querySelector("#app .toolbar");
    if (heading?.textContent.trim() !== "Historique" || !toolbar || toolbar.querySelector("[data-health-import]")) return;
    const button = document.createElement("button");
    button.className = "button light";
    button.dataset.healthImport = "";
    button.textContent = "Importer Apple Santé (XML)";
    button.addEventListener("click", () => picker.click());
    toolbar.append(button);
    const help = document.createElement("p");
    help.className = "muted";
    help.textContent = "Dans Santé : Résumé → ta photo → Exporter toutes les données de santé. Décompresse l’archive dans Fichiers, puis choisis export.xml. Movia importe les séances et garde les données sur cet appareil.";
    toolbar.after(help);
  }

  new MutationObserver(addImportButton).observe(app, { childList: true, subtree: true });
  addImportButton();
})();
