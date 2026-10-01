export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const word = (id, term, part, meaning, translation, example, level, pronunciation = "") => ({
  id, term, part, meaning, translation, example, level, pronunciation,
});

export const languageCatalog = [
  { id: "german", name: "German", nativeName: "Deutsch", locale: "de-DE", color: "#d6a85f", defaultLevel: "A2" },
  { id: "english", name: "English", nativeName: "English", locale: "en-GB", color: "#8b7cff", defaultLevel: "B1" },
  { id: "french", name: "French", nativeName: "Français", locale: "fr-FR", color: "#76a8e8", defaultLevel: "A2" },
  { id: "spanish", name: "Spanish", nativeName: "Español", locale: "es-ES", color: "#dd8370", defaultLevel: "A2" },
];

export const vocabulary = {
  german: [
    word("de-behalten", "behalten", "verb", "to keep; to retain", "mantener", "Ich möchte dieses Buch behalten.", "A2", "behálten"),
    word("de-vermeiden", "vermeiden", "verb", "to avoid", "evitar", "Wir sollten unnötige Fehler vermeiden.", "A2", "fer-mái-den"),
    word("de-erfahrung", "die Erfahrung", "noun", "experience", "la experiencia", "Sie hat viel Erfahrung mit React.", "A2", "er-fá-rung"),
    word("de-ploetzlich", "plötzlich", "adverb", "suddenly", "de repente", "Plötzlich war der Bildschirm schwarz.", "A2", "plœt-slish"),
    word("de-verbessern", "verbessern", "verb", "to improve", "mejorar", "Ich möchte mein Deutsch verbessern.", "A2", "fer-bés-ern"),
    word("de-zuverlaessig", "zuverlässig", "adjective", "reliable", "fiable", "Die neue Version ist zuverlässig.", "B1", "tsu-fer-lés-ikh"),
    word("de-entscheidung", "die Entscheidung", "noun", "decision", "la decisión", "Das war eine schwierige Entscheidung.", "B1", "ent-shái-dung"),
    word("de-entwickeln", "entwickeln", "verb", "to develop", "desarrollar", "Wir entwickeln die Anwendung gemeinsam.", "A2", "ent-vík-eln"),
    word("de-umgebung", "die Umgebung", "noun", "environment; surroundings", "el entorno", "Die Entwicklungsumgebung ist schon eingerichtet.", "B1", "um-gé-bung"),
    word("de-vorschlagen", "vorschlagen", "verb", "to suggest", "proponer", "Kannst du eine bessere Lösung vorschlagen?", "B1", "fór-shla-gen"),
    word("de-geduldig", "geduldig", "adjective", "patient", "paciente", "Beim Lernen muss man geduldig sein.", "A2", "ge-dúl-dikh"),
    word("de-anfordern", "anfordern", "verb", "to request", "solicitar", "Die Seite fordert weitere Daten an.", "B1", "án-fór-dern"),
    word("de-herausforderung", "die Herausforderung", "noun", "challenge", "el desafío", "Das Projekt ist eine interessante Herausforderung.", "B1", "he-ráus-fór-de-rung"),
    word("de-erledigen", "erledigen", "verb", "to take care of; to finish", "terminar", "Ich erledige die letzte Aufgabe heute.", "A2", "er-lé-di-gen"),
    word("de-ueberblick", "der Überblick", "noun", "overview", "la visión general", "Die Notiz gibt einen guten Überblick.", "B1", "ü-ber-blík"),
    word("de-zufall", "der Zufall", "noun", "coincidence", "la casualidad", "Es war kein Zufall, dass der Test fehlschlug.", "B2", "tsú-fal"),
    word("de-nachhaltig", "nachhaltig", "adjective", "sustainable; lasting", "sostenible", "Kleine Gewohnheiten wirken nachhaltig.", "B2", "nákh-hál-tikh"),
    word("de-beruecksichtigen", "berücksichtigen", "verb", "to take into account", "tener en cuenta", "Wir müssen die mobile Ansicht berücksichtigen.", "B2", "be-rük-sikh-ti-gen"),
    word("de-anliegen", "das Anliegen", "noun", "concern; request", "la petición", "Das wichtigste Anliegen ist die Sicherheit.", "B2", "án-li-gen"),
    word("de-einschaetzen", "einschätzen", "verb", "to assess; to estimate", "evaluar", "Wie schätzt du den Aufwand ein?", "B2", "áin-shét-sen"),
  ],
  english: [
    word("en-refine", "refine", "verb", "to improve something by making small changes", "perfeccionar", "We can refine the interface after feedback.", "B1", "ri-fine"),
    word("en-reliable", "reliable", "adjective", "working well and able to be trusted", "fiable", "A reliable backup saves time later.", "B1", "ri-lai-uh-bul"),
    word("en-approach", "approach", "noun", "a way of dealing with something", "enfoque", "This approach keeps the state easy to follow.", "B1", "uh-prohch"),
    word("en-ensure", "ensure", "verb", "to make certain that something happens", "asegurar", "Add a check to ensure the form is valid.", "B1", "en-shoor"),
    word("en-constraint", "constraint", "noun", "a limit or restriction", "restricción", "Time is the main constraint for this release.", "B2", "kun-straynt"),
    word("en-maintain", "maintain", "verb", "to keep something in good condition", "mantener", "Small components are easier to maintain.", "B1", "main-tayn"),
    word("en-outcome", "outcome", "noun", "the result of an action or process", "resultado", "The outcome depends on the user's settings.", "B1", "out-kum"),
    word("en-consistent", "consistent", "adjective", "staying the same in quality or behavior", "coherente", "Keep the spacing consistent across pages.", "B1", "kun-sis-tunt"),
    word("en-highlight", "highlight", "verb", "to draw attention to something", "destacar", "The summary highlights what changed today.", "B1", "high-light"),
    word("en-anticipate", "anticipate", "verb", "to expect or prepare for something", "anticipar", "We should anticipate an empty response.", "B2", "an-tis-uh-payt"),
    word("en-subtle", "subtle", "adjective", "not obvious, but still noticeable", "sutil", "A subtle border separates the two panels.", "B2", "sut-ul"),
    word("en-prioritize", "prioritize", "verb", "to decide what is most important", "priorizar", "Prioritize the task that blocks the release.", "B1", "pry-or-uh-tize"),
    word("en-clarify", "clarify", "verb", "to make something easier to understand", "aclarar", "A short label can clarify the control.", "B1", "klair-uh-fy"),
    word("en-sustain", "sustain", "verb", "to continue something over time", "mantener", "A modest daily goal is easier to sustain.", "B2", "suh-stayn"),
    word("en-insight", "insight", "noun", "a clear understanding of a situation", "perspectiva", "The weekly review gave me useful insight.", "B2", "in-site"),
    word("en-feasible", "feasible", "adjective", "possible and practical to do", "viable", "Offline support is feasible in this version.", "B2", "fee-zuh-bul"),
    word("en-articulate", "articulate", "verb", "to express an idea clearly", "expresar", "She can articulate the trade-off clearly.", "C1", "ar-tik-yuh-layt"),
    word("en-deliberate", "deliberate", "adjective", "careful and intentional", "deliberado", "Use deliberate spacing to guide the eye.", "C1", "di-lib-er-it"),
    word("en-robust", "robust", "adjective", "strong and unlikely to fail", "sólido", "The import flow needs robust validation.", "B2", "roh-bust"),
    word("en-derive", "derive", "verb", "to get something from a source", "derivar", "Progress is derived from completed sessions.", "B2", "di-ryve"),
  ],
  french: [
    word("fr-améliorer", "améliorer", "verb", "to improve", "mejorar", "Je veux améliorer mon français.", "A2", "a-mé-lio-ré"),
    word("fr-choisir", "choisir", "verb", "to choose", "elegir", "Nous pouvons choisir une autre couleur.", "A2", "shwa-zir"),
    word("fr-besoin", "le besoin", "noun", "need", "la necesidad", "J'ai besoin de plus de temps.", "A2", "buh-zwan"),
    word("fr-ensemble", "ensemble", "adverb", "together", "juntos", "Nous travaillons ensemble sur ce projet.", "A2", "on-sombl"),
    word("fr-réussir", "réussir", "verb", "to succeed", "tener éxito", "Elle veut réussir son examen.", "A2", "ré-u-sir"),
    word("fr-pratique", "pratique", "adjective", "practical", "práctico", "Cette solution est simple et pratique.", "B1", "pra-tik"),
    word("fr-étape", "l'étape", "noun", "step; stage", "la etapa", "La première étape est terminée.", "B1", "é-tap"),
    word("fr-proposer", "proposer", "verb", "to suggest; to offer", "proponer", "Je peux proposer une autre idée.", "B1", "pro-po-zé"),
    word("fr-pourtant", "pourtant", "adverb", "however; yet", "sin embargo", "Le test échoue, pourtant le code semble correct.", "B1", "poor-ton"),
    word("fr-fiable", "fiable", "adjective", "reliable", "fiable", "Nous avons trouvé une source fiable.", "B1", "fi-abl"),
    word("fr-enjeu", "l'enjeu", "noun", "issue; stakes", "el reto", "La sécurité est un enjeu important.", "B2", "on-zhuh"),
    word("fr-pertinent", "pertinent", "adjective", "relevant", "relevante", "Ajoute seulement les détails pertinents.", "B2", "per-ti-non"),
  ],
  spanish: [
    word("es-aprovechar", "aprovechar", "verb", "to make the most of", "aprovechar", "Quiero aprovechar bien el tiempo.", "A2", "a-pro-ve-char"),
    word("es-plantear", "plantear", "verb", "to raise; to consider", "plantear", "Podemos plantear una solución diferente.", "B1", "plan-te-ar"),
    word("es-acuerdo", "el acuerdo", "noun", "agreement", "el acuerdo", "Llegamos a un acuerdo esta mañana.", "A2", "a-kwer-do"),
    word("es-entorno", "el entorno", "noun", "environment; surroundings", "el entorno", "El entorno de desarrollo ya funciona.", "B1", "en-tor-no"),
    word("es-mejorar", "mejorar", "verb", "to improve", "mejorar", "Quiero mejorar mi pronunciación.", "A2", "me-ho-rar"),
    word("es-pendiente", "pendiente", "adjective", "pending", "pendiente", "Hay dos tareas pendientes para hoy.", "A2", "pen-dyen-te"),
    word("es-evitar", "evitar", "verb", "to avoid", "evitar", "Debemos evitar repetir el mismo error.", "A2", "e-vi-tar"),
    word("es-enfoque", "el enfoque", "noun", "approach; focus", "el enfoque", "Este enfoque es más fácil de mantener.", "B1", "en-fo-ke"),
    word("es-lograr", "lograr", "verb", "to achieve", "lograr", "Logramos terminar la función a tiempo.", "B1", "lo-grar"),
    word("es-aunque", "aunque", "conjunction", "although; even though", "aunque", "Aunque es pequeño, el cambio ayuda mucho.", "B1", "aun-ke"),
    word("es-averiguar", "averiguar", "verb", "to find out", "averiguar", "Voy a averiguar por qué falla la prueba.", "B1", "a-ve-ri-guar"),
    word("es-sugerencia", "la sugerencia", "noun", "suggestion", "la sugerencia", "Gracias por tu sugerencia sobre el diseño.", "B1", "su-he-ren-sya"),
  ],
};

export function getWordSet(languageId) {
  return vocabulary[languageId] ?? [];
}

export function getDailyWordIds(language, dateKey) {
  const allWords = getWordSet(language.id);
  const goal = Math.max(1, Number(language.dailyWords) || 5);
  const currentOrder = cefrLevels.indexOf(language.level);
  const exactLevelWords = allWords.filter((entry) => entry.level === language.level);
  const words = exactLevelWords.length >= goal
    ? exactLevelWords
    : [...allWords].sort((left, right) => {
        const leftDistance = Math.abs(cefrLevels.indexOf(left.level) - currentOrder);
        const rightDistance = Math.abs(cefrLevels.indexOf(right.level) - currentOrder);
        return leftDistance - rightDistance;
      });
  if (!words.length) return [];
  const seed = `${dateKey}:${language.id}`;
  const start = [...seed].reduce((value, character) => (value * 33 + character.charCodeAt(0)) >>> 0, 5381) % words.length;
  const stride = words.length > 2 ? 7 : 1;
  const ids = [];
  let index = start;
  while (ids.length < Math.min(goal, words.length)) {
    const id = words[index % words.length].id;
    if (!ids.includes(id)) ids.push(id);
    index += stride;
  }
  return ids;
}
