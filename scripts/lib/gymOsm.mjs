/** Filtros OSM y tipo de gimnasio para el catálogo de España. */

export const SPAIN_CCAA = [
  ["ES-AN", "Andalucía"],
  ["ES-AR", "Aragón"],
  ["ES-AS", "Asturias"],
  ["ES-CB", "Cantabria"],
  ["ES-CE", "Ceuta"],
  ["ES-CL", "Castilla y León"],
  ["ES-CM", "Castilla-La Mancha"],
  ["ES-CN", "Canarias"],
  ["ES-CT", "Cataluña"],
  ["ES-EX", "Extremadura"],
  ["ES-GA", "Galicia"],
  ["ES-IB", "Islas Baleares"],
  ["ES-MC", "Murcia"],
  ["ES-MD", "Madrid"],
  ["ES-ML", "Melilla"],
  ["ES-NC", "Navarra"],
  ["ES-PV", "País Vasco"],
  ["ES-RI", "La Rioja"],
  ["ES-VC", "Comunidad Valenciana"],
];

const CENTRE_NAME_RE =
  /polideportivo|poliesportiu|centro\s+deportivo|centre\s+esportiu|gimnasio|gimnas|fitness|musculaci/i;

const HALL_NAME_RE = /polideportivo|poliesportiu|gimnasio|gimnas|fitness/i;

const FITNESS_SPORT_RE = /fitness|weightlifting|bodybuilding/i;

const MUNICIPAL_NAME_RE =
  /polideportivo|poliesportiu|municipal|centro\s+deportivo|centre\s+esportiu|\bcem\b|\bcdm\b/i;

/**
 * @param {unknown} value
 * @returns {string}
 */
export function tagString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * @param {string} name
 */
export function sportsCentreNameMatches(name) {
  return CENTRE_NAME_RE.test(name);
}

/**
 * @param {string} name
 */
export function sportsHallNameMatches(name) {
  return HALL_NAME_RE.test(name);
}

/**
 * @param {string} sport
 */
export function fitnessSportMatches(sport) {
  return FITNESS_SPORT_RE.test(sport);
}

/**
 * @param {Record<string, string | undefined> | null | undefined} tags
 */
export function shouldImportOsmTags(tags) {
  if (!tags) return false;
  const leisure = tagString(tags.leisure);
  const amenity = tagString(tags.amenity);
  if (leisure === "fitness_centre" || amenity === "gym") return true;

  const name = tagString(tags.name) || tagString(tags.brand);
  const sport = tagString(tags.sport);

  if (leisure === "sports_centre") {
    return sportsCentreNameMatches(name) || fitnessSportMatches(sport);
  }
  if (leisure === "sports_hall") {
    return sportsHallNameMatches(name);
  }
  return false;
}

/**
 * @param {{ name?: string | null, brand?: string | null, operatorType?: string | null }} input
 * @returns {"municipal" | "private" | "unknown"}
 */
export function inferGymTipo(input) {
  const operatorType = tagString(input.operatorType).toLowerCase();
  const name = tagString(input.name);
  if (
    operatorType === "government" ||
    operatorType === "public" ||
    operatorType === "community" ||
    MUNICIPAL_NAME_RE.test(name)
  ) {
    return "municipal";
  }
  if (tagString(input.brand)) return "private";
  return "unknown";
}

/**
 * @param {string} iso3166_2
 */
export function ccaaOverpassQuery(iso3166_2) {
  return `[out:json][timeout:120];
area["ISO3166-2"="${iso3166_2}"]["admin_level"="4"]->.a;
(
  nwr["leisure"="fitness_centre"](area.a);
  nwr["amenity"="gym"](area.a);
  nwr["leisure"="sports_centre"]["name"~"polideportivo|poliesportiu|centro deportivo|centre esportiu|gimnasio|gimnàs|fitness|musculaci",i](area.a);
  nwr["leisure"="sports_centre"]["sport"~"fitness|weightlifting|bodybuilding"](area.a);
  nwr["leisure"="sports_hall"]["name"~"polideportivo|poliesportiu|gimnasio|gimnàs|fitness",i](area.a);
);
out center tags;
`;
}
