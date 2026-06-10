/** Shared robots metadata for Next.js Metadata API */

export const ROBOTS_INDEX = {
  index: true,
  follow: true,
};

export const ROBOTS_NOINDEX = {
  index: false,
  follow: false,
};

export function withRobots(metadata, robots = ROBOTS_INDEX) {
  return { ...metadata, robots };
}

export function noIndexMetadata(title = "AllExamQuestions") {
  return {
    title,
    robots: ROBOTS_NOINDEX,
  };
}
