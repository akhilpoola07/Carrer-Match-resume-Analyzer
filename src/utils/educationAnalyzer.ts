export interface EducationRequirement {
  degree: string | null;
  field: string | null;
}

export interface EducationAnalysis {
  requiredDegree: string | null;
  requiredField: string | null;
  resumeDegrees: string[];
  match: boolean;
  score: number;
  notes: string;
}

const DEGREE_MAP: { pattern: RegExp; normalized: string }[] = [
  { pattern: /\bb\.?\s?tech\b/i, normalized: 'B.Tech' },
  { pattern: /\bb\.?\s?e\b/i, normalized: 'B.E' },
  { pattern: /\bb\.?\s?sc\b/i, normalized: 'B.Sc' },
  { pattern: /\bm\.?\s?tech\b/i, normalized: 'M.Tech' },
  { pattern: /\bm\.?\s?e\b/i, normalized: 'M.E' },
  { pattern: /\bm\.?\s?sc\b/i, normalized: 'M.Sc' },
  { pattern: /\bmca\b/i, normalized: 'MCA' },
  { pattern: /\bbca\b/i, normalized: 'BCA' },
  { pattern: /\bmba\b/i, normalized: 'MBA' },
  { pattern: /\bbba\b/i, normalized: 'BBA' },
  { pattern: /\bph\.?\s?d\b/i, normalized: 'PhD' },
  { pattern: /\bbachelor'?s?\s*(?:degree|of)?\b/i, normalized: 'Bachelor' },
  { pattern: /\bmaster'?s?\s*(?:degree|of)?\b/i, normalized: 'Master' },
  { pattern: /\bdoctorate\b/i, normalized: 'Doctorate' },
  { pattern: /\bdiploma\b/i, normalized: 'Diploma' },
  { pattern: /\bassociate'?s?\s*(?:degree)?\b/i, normalized: 'Associate' },
];

const DEGREE_LEVELS: Record<string, number> = {
  'Diploma': 1,
  'Associate': 2,
  'BCA': 3,
  'BBA': 3,
  'B.Sc': 3,
  'B.Tech': 4,
  'B.E': 4,
  'Bachelor': 4,
  'MCA': 5,
  'MBA': 5,
  'M.Sc': 5,
  'M.Tech': 6,
  'M.E': 6,
  'Master': 6,
  'PhD': 7,
  'Doctorate': 7,
};

export function extractEducationRequirements(jdText: string): EducationRequirement {
  const lower = jdText.toLowerCase();

  for (const { pattern, normalized } of DEGREE_MAP) {
    if (pattern.test(jdText)) {
      const fieldMatch = lower.match(/(?:degree|graduate|graduation)\s*(?:in|of)\s+([a-z\s]+)/i);
      return {
        degree: normalized,
        field: fieldMatch ? fieldMatch[1].trim() : null,
      };
    }
  }

  if (/\bgraduate\b/i.test(jdText) || /\bgraduation\b/i.test(jdText)) {
    return { degree: 'Bachelor', field: null };
  }

  if (/\bpost[\s-]*graduate\b/i.test(jdText) || /\bmaster'?s?\b/i.test(jdText)) {
    return { degree: 'Master', field: null };
  }

  return { degree: null, field: null };
}

export function detectResumeEducation(resumeText: string): string[] {
  const found = new Set<string>();

  for (const { pattern, normalized } of DEGREE_MAP) {
    if (pattern.test(resumeText)) {
      found.add(normalized);
    }
  }

  return Array.from(found);
}

export function analyzeEducation(resumeText: string, jdText: string): EducationAnalysis {
  const req = extractEducationRequirements(jdText);
  const resumeDegrees = detectResumeEducation(resumeText);

  let match = false;
  let score = 0;
  let notes = '';

  if (req.degree === null) {
    score = 0.7;
    notes = 'No specific education requirement detected in the job description.';
    return { requiredDegree: null, requiredField: null, resumeDegrees, match: false, score, notes };
  }

  const reqLevel = DEGREE_LEVELS[req.degree] || 0;
  let highestResumeLevel = 0;
  let bestMatch = '';

  for (const deg of resumeDegrees) {
    const level = DEGREE_LEVELS[deg] || 0;
    if (level > highestResumeLevel) {
      highestResumeLevel = level;
      bestMatch = deg;
    }
  }

  if (resumeDegrees.length === 0) {
    score = 0.3;
    notes = `Required: ${req.degree}. Not enough information available in your resume to confirm education level.`;
  } else if (highestResumeLevel >= reqLevel) {
    match = true;
    score = 1;
    notes = `Required: ${req.degree}. Your resume indicates ${bestMatch}. Education requirement met.`;
  } else {
    score = 0.5;
    notes = `Required: ${req.degree}. Your resume indicates ${bestMatch}, which may be below the required level.`;
  }

  return {
    requiredDegree: req.degree,
    requiredField: req.field,
    resumeDegrees,
    match,
    score: Math.round(score * 100) / 100,
    notes,
  };
}
