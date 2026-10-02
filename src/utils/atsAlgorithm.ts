import { extractSkills, getSkillCategory } from './skillDictionary';
import { extractImportantKeywords } from './keywordExtractor';
import { analyzeExperience, type ExperienceAnalysis } from './experienceAnalyzer';
import { analyzeEducation, type EducationAnalysis } from './educationAnalyzer';
import { analyzeCompleteness, type CompletenessResult } from './completenessAnalyzer';

export interface ScoreBreakdown {
  skillsScore: number;
  keywordScore: number;
  experienceScore: number;
  educationScore: number;
  completenessScore: number;
}

export interface AnalysisResult {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordCoverage: number;
  experienceAnalysis: ExperienceAnalysis;
  educationAnalysis: EducationAnalysis;
  completenessResult: CompletenessResult;
}

const WEIGHTS = {
  skills: 50,
  keywords: 20,
  experience: 15,
  education: 10,
  completeness: 5,
};

export function runAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);

  const matchedSkills = jdSkills.filter((skill) =>
    resumeSkills.some((rs) => rs.toLowerCase() === skill.toLowerCase())
  );
  const missingSkills = jdSkills.filter(
    (skill) => !resumeSkills.some((rs) => rs.toLowerCase() === skill.toLowerCase())
  );

  const skillsScore =
    jdSkills.length > 0
      ? Math.round((matchedSkills.length / jdSkills.length) * WEIGHTS.skills)
      : WEIGHTS.skills;

  const jdKeywords = extractImportantKeywords(jobDescription, 30);
  const resumeLower = resumeText.toLowerCase();
  const matchedKeywords = jdKeywords.filter((kw) => resumeLower.includes(kw));
  const missingKeywords = jdKeywords.filter((kw) => !resumeLower.includes(kw));
  const keywordCoverage =
    jdKeywords.length > 0
      ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
      : 100;

  const keywordScore =
    jdKeywords.length > 0
      ? Math.round((matchedKeywords.length / jdKeywords.length) * WEIGHTS.keywords)
      : WEIGHTS.keywords;

  const experienceAnalysis = analyzeExperience(resumeText, jobDescription);
  const experienceScore = Math.round(experienceAnalysis.score * WEIGHTS.experience);

  const educationAnalysis = analyzeEducation(resumeText, jobDescription);
  const educationScore = Math.round(educationAnalysis.score * WEIGHTS.education);

  const completenessResult = analyzeCompleteness(resumeText);
  const completenessScore = Math.round(
    (completenessResult.percentage / 100) * WEIGHTS.completeness
  );

  const atsScore =
    skillsScore +
    keywordScore +
    experienceScore +
    educationScore +
    completenessScore;

  return {
    atsScore: Math.min(100, atsScore),
    scoreBreakdown: {
      skillsScore,
      keywordScore,
      experienceScore,
      educationScore,
      completenessScore,
    },
    matchedSkills,
    missingSkills,
    matchedKeywords,
    missingKeywords,
    keywordCoverage,
    experienceAnalysis,
    educationAnalysis,
    completenessResult,
  };
}

export function getSkillCategoryWrapper(skill: string): string {
  return getSkillCategory(skill);
}

export { WEIGHTS };
