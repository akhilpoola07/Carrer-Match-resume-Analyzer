export interface ExperienceRequirement {
  years: number | null;
  level: string | null;
  rawText: string;
}

export interface ExperienceAnalysis {
  requiredYears: number | null;
  requiredLevel: string | null;
  resumeYearsDetected: number | null;
  resumeLevel: string | null;
  match: boolean;
  score: number;
  notes: string;
}

export function extractExperienceRequirements(jdText: string): ExperienceRequirement {
  const lower = jdText.toLowerCase();

  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?(?:work\s*)?(?:experience|exp)/,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?(?:industry\s*)?(?:experience|exp)/,
    /minimum\s*(?:of\s*)?(\d+)\s*years?/,
    /at\s*least\s*(\d+)\s*years?/,
    /(\d+)\s*to\s*(\d+)\s*years?/,
  ];

  for (const pattern of yearPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const years = parseInt(match[1], 10);
      return { years, level: null, rawText: match[0] };
    }
  }

  const levelPatterns: { pattern: RegExp; level: string }[] = [
    { pattern: /fresh\s*grad(?:uate)?|fresher|entry[\s-]*level|graduate level/i, level: 'Fresher' },
    { pattern: /intern(?:ship)?/i, level: 'Internship' },
    { pattern: /junior|jr\.?/i, level: 'Junior' },
    { pattern: /mid[\s-]*level|mid[\s-]*level/i, level: 'Mid-level' },
    { pattern: /senior|sr\.?/i, level: 'Senior' },
    { pattern: /lead|principal|staff/i, level: 'Lead' },
  ];

  for (const { pattern, level } of levelPatterns) {
    if (pattern.test(jdText)) {
      return { years: null, level, rawText: level };
    }
  }

  return { years: null, level: null, rawText: '' };
}

export function detectResumeExperience(resumeText: string): { years: number | null; level: string | null } {
  const lower = resumeText.toLowerCase();

  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?(?:work\s*)?(?:experience|exp)/,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?(?:industry\s*)?(?:experience|exp)/,
    /(\d+)\s*to\s*(\d+)\s*years?/,
    /(\d+)\s*years?\s*(?:of\s*)?experience/,
  ];

  for (const pattern of yearPatterns) {
    const match = lower.match(pattern);
    if (match) {
      return { years: parseInt(match[1], 10), level: null };
    }
  }

  const dateRanges = resumeText.match(/(\d{4})\s*[-–—to]+\s*(\d{4}|present|current|now)/gi);
  if (dateRanges && dateRanges.length > 0) {
    const currentYear = new Date().getFullYear();
    let totalYears = 0;
    for (const range of dateRanges) {
      const years = range.match(/(\d{4})/g);
      if (years && years.length >= 2) {
        const start = parseInt(years[0], 10);
        const end = years[1] === 'present' || years[1] === 'current' || years[1] === 'now'
          ? currentYear
          : parseInt(years[1], 10);
        if (end > start) totalYears += end - start;
      }
    }
    if (totalYears > 0) return { years: totalYears, level: null };
  }

  const levelPatterns: { pattern: RegExp; level: string }[] = [
    { pattern: /fresh\s*grad(?:uate)?|fresher|entry[\s-]*level/i, level: 'Fresher' },
    { pattern: /intern(?:ship)?/i, level: 'Internship' },
    { pattern: /junior|jr\.?/i, level: 'Junior' },
    { pattern: /senior|sr\.?/i, level: 'Senior' },
    { pattern: /lead|principal|staff/i, level: 'Lead' },
  ];

  for (const { pattern, level } of levelPatterns) {
    if (pattern.test(resumeText)) {
      return { years: null, level };
    }
  }

  return { years: null, level: null };
}

export function analyzeExperience(resumeText: string, jdText: string): ExperienceAnalysis {
  const req = extractExperienceRequirements(jdText);
  const resume = detectResumeExperience(resumeText);

  let match = false;
  let score = 0;
  let notes = '';

  if (req.years !== null) {
    if (resume.years !== null) {
      if (resume.years >= req.years) {
        match = true;
        score = 1;
        notes = `Required: ${req.years}+ years. Your resume indicates ${resume.years} years of experience. Requirement met.`;
      } else {
        score = Math.max(0, resume.years / req.years);
        notes = `Required: ${req.years}+ years. Your resume indicates ${resume.years} years. You are short by ${req.years - resume.years} year(s).`;
      }
    } else {
      score = 0.3;
      notes = `Required: ${req.years}+ years. Not enough information available in your resume to confirm experience level.`;
    }
  } else if (req.level !== null) {
    if (resume.level !== null) {
      const levelOrder = ['Internship', 'Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'];
      const reqIdx = levelOrder.indexOf(req.level);
      const resumeIdx = levelOrder.indexOf(resume.level);
      if (resumeIdx >= reqIdx) {
        match = true;
        score = 1;
        notes = `Required level: ${req.level}. Your resume indicates ${resume.level} level. Requirement met.`;
      } else {
        score = 0.5;
        notes = `Required level: ${req.level}. Your resume indicates ${resume.level} level. You may be below the required level.`;
      }
    } else if (resume.years !== null) {
      const levelFromYears = resume.years >= 5 ? 'Senior' : resume.years >= 3 ? 'Mid-level' : resume.years >= 1 ? 'Junior' : 'Fresher';
      const levelOrder = ['Internship', 'Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'];
      const reqIdx = levelOrder.indexOf(req.level);
      const resumeIdx = levelOrder.indexOf(levelFromYears);
      if (resumeIdx >= reqIdx) {
        match = true;
        score = 1;
        notes = `Required level: ${req.level}. Estimated from ${resume.years} years: ${levelFromYears}. Requirement likely met.`;
      } else {
        score = 0.5;
        notes = `Required level: ${req.level}. Estimated from ${resume.years} years: ${levelFromYears}. You may be below the required level.`;
      }
    } else {
      score = 0.3;
      notes = `Required level: ${req.level}. Not enough information available in your resume to confirm level.`;
    }
  } else {
    score = 0.7;
    notes = 'No specific experience requirement detected in the job description.';
  }

  return {
    requiredYears: req.years,
    requiredLevel: req.level,
    resumeYearsDetected: resume.years,
    resumeLevel: resume.level,
    match,
    score: Math.round(score * 100) / 100,
    notes,
  };
}
