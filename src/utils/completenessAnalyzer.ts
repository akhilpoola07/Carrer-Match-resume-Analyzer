export interface CompletenessSection {
  name: string;
  present: boolean;
}

export interface CompletenessResult {
  sections: CompletenessSection[];
  percentage: number;
}

const SECTION_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  {
    name: 'Contact Information',
    patterns: [
      /(?:phone|tel|mobile|cell)\s*[:.]?\s*\+?\d[\d\s\-()]{8,}/i,
      /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/i,
      /linkedin\.com\/in\//i,
    ],
  },
  {
    name: 'Summary',
    patterns: [
      /(?:professional\s*)?summary/i,
      /(?:professional\s*)?profile/i,
      /(?:professional\s*)?objective/i,
      /about\s*me/i,
    ],
  },
  {
    name: 'Skills',
    patterns: [
      /(?:technical\s*)?skills/i,
      /(?:core\s*)?competencies/i,
      /technologies/i,
    ],
  },
  {
    name: 'Education',
    patterns: [
      /education/i,
      /academic/i,
      /qualification/i,
      /\b(?:b\.?\s?tech|m\.?\s?tech|b\.?\s?e|m\.?\s?e|b\.?\s?sc|m\.?\s?sc|mca|bca|mba|bba|ph\.?\s?d|bachelor|master)\b/i,
    ],
  },
  {
    name: 'Experience',
    patterns: [
      /(?:work\s*)?experience/i,
      /(?:professional\s*)?experience/i,
      /employment/i,
      /(?:work\s*)?history/i,
    ],
  },
  {
    name: 'Projects',
    patterns: [
      /projects/i,
      /(?:personal\s*)?projects/i,
      /(?:academic\s*)?projects/i,
    ],
  },
  {
    name: 'Certifications',
    patterns: [
      /certifications?/i,
      /certificates?/i,
      /licensed?/i,
    ],
  },
];

export function analyzeCompleteness(resumeText: string): CompletenessResult {
  const sections: CompletenessSection[] = [];

  for (const { name, patterns } of SECTION_PATTERNS) {
    const present = patterns.some((p) => p.test(resumeText));
    sections.push({ name, present });
  }

  const presentCount = sections.filter((s) => s.present).length;
  const percentage = Math.round((presentCount / sections.length) * 100);

  return { sections, percentage };
}
