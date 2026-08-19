/** Filtros OSM y tipo de gimnasio para el catálogo de España. */
import { fixMojibake } from "./fixMojibake.mjs";

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

/** Capitales de provincia (y ciudades autónomas), con Wikidata para acotar el municipio en Overpass. */
export const SPAIN_PROVINCIAL_CAPITALS = [
  { id: "vitoria", name: "Vitoria-Gasteiz", wikidata: "Q14318", ine: "01059" },
  { id: "albacete", name: "Albacete", wikidata: "Q9901", ine: "02003" },
  { id: "alicante", name: "Alicante", wikidata: "Q11959", ine: "03014" },
  { id: "almeria", name: "Almería", wikidata: "Q10400", ine: "04013" },
  { id: "oviedo", name: "Oviedo", wikidata: "Q14317", ine: "33044" },
  { id: "avila", name: "Ávila", wikidata: "Q15688", ine: "05019" },
  { id: "badajoz", name: "Badajoz", wikidata: "Q15679", ine: "06015" },
  { id: "palma", name: "Palma", wikidata: "Q8826", ine: "07040" },
  { id: "barcelona", name: "Barcelona", wikidata: "Q1492", ine: "08019" },
  { id: "bilbao", name: "Bilbao", wikidata: "Q8692", ine: "48020" },
  { id: "burgos", name: "Burgos", wikidata: "Q9580", ine: "09059" },
  { id: "caceres", name: "Cáceres", wikidata: "Q29180", ine: "10037" },
  { id: "cadiz", name: "Cádiz", wikidata: "Q15682", ine: "11012" },
  { id: "santander", name: "Santander", wikidata: "Q12233", ine: "39075" },
  { id: "castellon", name: "Castellón de la Plana", wikidata: "Q15495", ine: "12040" },
  { id: "ciudad-real", name: "Ciudad Real", wikidata: "Q10780", ine: "13034" },
  { id: "cordoba", name: "Córdoba", wikidata: "Q5818", ine: "14021" },
  { id: "coruna", name: "A Coruña", wikidata: "Q8757", ine: "15030" },
  { id: "cuenca", name: "Cuenca", wikidata: "Q32946", ine: "16078" },
  { id: "girona", name: "Girona", wikidata: "Q7038", ine: "17079" },
  { id: "granada", name: "Granada", wikidata: "Q8810", ine: "18087" },
  { id: "guadalajara", name: "Guadalajara", wikidata: "Q11900", ine: "19130" },
  { id: "donostia", name: "Donostia / San Sebastián", wikidata: "Q10313", ine: "20069" },
  { id: "huelva", name: "Huelva", wikidata: "Q12200", ine: "21041" },
  { id: "huesca", name: "Huesca", wikidata: "Q11967", ine: "22125" },
  { id: "jaen", name: "Jaén", wikidata: "Q15681", ine: "23050" },
  { id: "leon", name: "León", wikidata: "Q15699", ine: "24089" },
  { id: "lleida", name: "Lleida", wikidata: "Q15090", ine: "25120" },
  { id: "logrono", name: "Logroño", wikidata: "Q14325", ine: "26089" },
  { id: "lugo", name: "Lugo", wikidata: "Q11125", ine: "27028" },
  { id: "madrid", name: "Madrid", wikidata: "Q2807", ine: "28079" },
  { id: "malaga", name: "Málaga", wikidata: "Q8851", ine: "29067" },
  { id: "murcia", name: "Murcia", wikidata: "Q12209", ine: "30030" },
  { id: "pamplona", name: "Pamplona", wikidata: "Q10282", ine: "31201" },
  { id: "ourense", name: "Ourense", wikidata: "Q24012", ine: "32054" },
  { id: "palencia", name: "Palencia", wikidata: "Q8392", ine: "34120" },
  { id: "las-palmas", name: "Las Palmas de Gran Canaria", wikidata: "Q11974", ine: "35016" },
  { id: "pontevedra", name: "Pontevedra", wikidata: "Q43622", ine: "36038" },
  { id: "salamanca", name: "Salamanca", wikidata: "Q15695", ine: "37274" },
  { id: "santa-cruz", name: "Santa Cruz de Tenerife", wikidata: "Q14328", ine: "38038" },
  { id: "segovia", name: "Segovia", wikidata: "Q15684", ine: "40194" },
  { id: "sevilla", name: "Sevilla", wikidata: "Q8717", ine: "41091" },
  { id: "soria", name: "Soria", wikidata: "Q12159", ine: "42173" },
  { id: "tarragona", name: "Tarragona", wikidata: "Q15088", ine: "43148" },
  { id: "teruel", name: "Teruel", wikidata: "Q14336", ine: "44216" },
  { id: "toledo", name: "Toledo", wikidata: "Q5836", ine: "45168" },
  { id: "valencia", name: "Valencia", wikidata: "Q8818", ine: "46250" },
  { id: "valladolid", name: "Valladolid", wikidata: "Q8356", ine: "47186" },
  { id: "zamora", name: "Zamora", wikidata: "Q15687", ine: "49275" },
  { id: "zaragoza", name: "Zaragoza", wikidata: "Q10305", ine: "50297" },
  { id: "ceuta", name: "Ceuta", wikidata: "Q5823", ine: "51001" },
  { id: "melilla", name: "Melilla", wikidata: "Q5831", ine: "52001" },
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
  if (typeof value !== "string") return "";
  return fixMojibake(value.trim());
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

const OVERPASS_GYM_UNION = `nwr["leisure"="fitness_centre"](area.a);
  nwr["amenity"="gym"](area.a);
  nwr["leisure"="sports_centre"]["name"~"polideportivo|poliesportiu|centro deportivo|centre esportiu|gimnasio|gimnàs|fitness|musculaci",i](area.a);
  nwr["leisure"="sports_centre"]["sport"~"fitness|weightlifting|bodybuilding"](area.a);
  nwr["leisure"="sports_hall"]["name"~"polideportivo|poliesportiu|gimnasio|gimnàs|fitness",i](area.a);`;

/**
 * @param {string} iso3166_2
 */
export function ccaaOverpassQuery(iso3166_2) {
  return `[out:json][timeout:120];
area["ISO3166-2"="${iso3166_2}"]["admin_level"="4"]->.a;
(
  ${OVERPASS_GYM_UNION}
);
out center tags;
`;
}

/**
 * Municipio acotado por código INE (más estable en OSM que Wikidata).
 * @param {{ ine: string, wikidata: string }} capital
 */
export function capitalOverpassQuery(capital) {
  const ine = capital.ine;
  const wikidata = capital.wikidata;
  return `[out:json][timeout:90];
(
  rel["ine:municipio"="${ine}"]["boundary"="administrative"];
  rel["wikidata"="${wikidata}"]["boundary"="administrative"]["admin_level"~"^(4|8)$"];
);
map_to_area -> .a;
(
  ${OVERPASS_GYM_UNION}
);
out center tags;
`;
}
