/** DOM auto-translate must not mutate the tree until React hydration completes. */
let domAutoTranslateReady = false;

export function markDomAutoTranslateReady() {
  domAutoTranslateReady = true;
}

export function isDomAutoTranslateReady() {
  return domAutoTranslateReady;
}

export function resetDomAutoTranslateReady() {
  domAutoTranslateReady = false;
}
