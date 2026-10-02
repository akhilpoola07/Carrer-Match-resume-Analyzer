export interface SkillEntry {
  name: string;
  aliases: string[];
  category: string;
}

export const SKILL_DICTIONARY: SkillEntry[] = [
  // Programming Languages
  { name: 'Python', aliases: ['python3', 'py'], category: 'Programming' },
  { name: 'Java', aliases: ['java se', 'java ee'], category: 'Programming' },
  { name: 'JavaScript', aliases: ['js', 'es6', 'ecmascript'], category: 'Programming' },
  { name: 'TypeScript', aliases: ['ts'], category: 'Programming' },
  { name: 'C', aliases: [], category: 'Programming' },
  { name: 'C++', aliases: ['cpp', 'c plus plus'], category: 'Programming' },
  { name: 'C#', aliases: ['csharp', 'c sharp', '.net'], category: 'Programming' },
  { name: 'Go', aliases: ['golang'], category: 'Programming' },
  { name: 'Rust', aliases: [], category: 'Programming' },
  { name: 'Ruby', aliases: [], category: 'Programming' },
  { name: 'PHP', aliases: [], category: 'Programming' },
  { name: 'Swift', aliases: [], category: 'Programming' },
  { name: 'Kotlin', aliases: [], category: 'Programming' },
  { name: 'R', aliases: [], category: 'Programming' },
  { name: 'Scala', aliases: [], category: 'Programming' },
  { name: 'MATLAB', aliases: [], category: 'Programming' },

  // Web Technologies
  { name: 'HTML', aliases: ['html5'], category: 'Web' },
  { name: 'CSS', aliases: ['css3', 'styling'], category: 'Web' },
  { name: 'React', aliases: ['reactjs', 'react.js', 'react js'], category: 'Web' },
  { name: 'Angular', aliases: ['angularjs', 'angular.js'], category: 'Web' },
  { name: 'Vue', aliases: ['vuejs', 'vue.js', 'vue js'], category: 'Web' },
  { name: 'Node.js', aliases: ['node', 'nodejs', 'node js'], category: 'Web' },
  { name: 'Express', aliases: ['expressjs', 'express.js'], category: 'Web' },
  { name: 'Django', aliases: [], category: 'Web' },
  { name: 'Flask', aliases: [], category: 'Web' },
  { name: 'FastAPI', aliases: ['fast api'], category: 'Web' },
  { name: 'Next.js', aliases: ['nextjs', 'next js'], category: 'Web' },
  { name: 'Redux', aliases: [], category: 'Web' },
  { name: 'GraphQL', aliases: [], category: 'Web' },
  { name: 'REST API', aliases: ['rest', 'restful', 'rest apis'], category: 'Web' },
  { name: 'Sass', aliases: ['scss'], category: 'Web' },
  { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'], category: 'Web' },
  { name: 'Bootstrap', aliases: [], category: 'Web' },
  { name: 'jQuery', aliases: [], category: 'Web' },

  // Databases
  { name: 'MySQL', aliases: ['mysql database'], category: 'Database' },
  { name: 'PostgreSQL', aliases: ['postgres', 'pg', 'psql'], category: 'Database' },
  { name: 'MongoDB', aliases: ['mongo'], category: 'Database' },
  { name: 'SQLite', aliases: [], category: 'Database' },
  { name: 'Redis', aliases: [], category: 'Database' },
  { name: 'Oracle', aliases: ['oracle db', 'oracle database'], category: 'Database' },
  { name: 'Firebase', aliases: ['firestore'], category: 'Database' },
  { name: 'Supabase', aliases: [], category: 'Database' },
  { name: 'Elasticsearch', aliases: ['elastic'], category: 'Database' },
  { name: 'Cassandra', aliases: [], category: 'Database' },

  // AI/ML
  { name: 'Machine Learning', aliases: ['ml', 'machine-learning'], category: 'AI/ML' },
  { name: 'Deep Learning', aliases: ['dl', 'deep-learning'], category: 'AI/ML' },
  { name: 'NLP', aliases: ['natural language processing', 'natural-language-processing'], category: 'AI/ML' },
  { name: 'Computer Vision', aliases: ['cv', 'computer-vision'], category: 'AI/ML' },
  { name: 'TensorFlow', aliases: ['tensorflow.js', 'tf.js'], category: 'AI/ML' },
  { name: 'PyTorch', aliases: [], category: 'AI/ML' },
  { name: 'Scikit-learn', aliases: ['sklearn', 'scikit learn'], category: 'AI/ML' },
  { name: 'Pandas', aliases: [], category: 'AI/ML' },
  { name: 'NumPy', aliases: [], category: 'AI/ML' },
  { name: 'Keras', aliases: [], category: 'AI/ML' },
  { name: 'OpenCV', aliases: [], category: 'AI/ML' },
  { name: 'Hugging Face', aliases: ['huggingface', 'transformers'], category: 'AI/ML' },
  { name: 'Data Science', aliases: ['data-science'], category: 'AI/ML' },
  { name: 'Data Analysis', aliases: ['data-analysis'], category: 'AI/ML' },
  { name: 'Data Visualization', aliases: ['data-visualization'], category: 'AI/ML' },
  { name: 'Generative AI', aliases: ['genai', 'gen ai', 'generative-ai'], category: 'AI/ML' },
  { name: 'LLM', aliases: ['large language models', 'large-language-models'], category: 'AI/ML' },

  // Cloud & DevOps
  { name: 'AWS', aliases: ['amazon web services'], category: 'Cloud' },
  { name: 'Azure', aliases: ['microsoft azure'], category: 'Cloud' },
  { name: 'GCP', aliases: ['google cloud', 'google cloud platform'], category: 'Cloud' },
  { name: 'Docker', aliases: [], category: 'Cloud' },
  { name: 'Kubernetes', aliases: ['k8s'], category: 'Cloud' },
  { name: 'Jenkins', aliases: [], category: 'Cloud' },
  { name: 'CI/CD', aliases: ['ci cd', 'continuous integration', 'continuous deployment'], category: 'Cloud' },
  { name: 'Terraform', aliases: [], category: 'Cloud' },
  { name: 'Ansible', aliases: [], category: 'Cloud' },
  { name: 'Linux', aliases: ['unix'], category: 'Cloud' },
  { name: 'Nginx', aliases: [], category: 'Cloud' },
  { name: 'Apache', aliases: [], category: 'Cloud' },

  // Tools & Others
  { name: 'Git', aliases: [], category: 'Tools' },
  { name: 'GitHub', aliases: ['github actions'], category: 'Tools' },
  { name: 'GitLab', aliases: [], category: 'Tools' },
  { name: 'Postman', aliases: [], category: 'Tools' },
  { name: 'Jira', aliases: [], category: 'Tools' },
  { name: 'Figma', aliases: [], category: 'Tools' },
  { name: 'Agile', aliases: ['scrum', 'kanban'], category: 'Tools' },
  { name: 'Unit Testing', aliases: ['unittest', 'pytest', 'jest'], category: 'Tools' },
  { name: 'Selenium', aliases: [], category: 'Tools' },
  { name: 'Tableau', aliases: [], category: 'Tools' },
  { name: 'Power BI', aliases: ['powerbi'], category: 'Tools' },
  { name: 'Excel', aliases: ['microsoft excel', 'spreadsheets'], category: 'Tools' },
  { name: 'Microservices', aliases: ['microservice'], category: 'Tools' },
  { name: 'OAuth', aliases: ['oauth2'], category: 'Tools' },
  { name: 'JWT', aliases: ['json web token', 'json-web-token'], category: 'Tools' },
  { name: 'WebSockets', aliases: ['websocket'], category: 'Tools' },
  { name: 'Webpack', aliases: [], category: 'Tools' },
  { name: 'Vite', aliases: [], category: 'Tools' },
];

const normalizedAliasMap: Map<string, string> = new Map();

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
}

for (const skill of SKILL_DICTIONARY) {
  normalizedAliasMap.set(normalizeText(skill.name), skill.name);
  for (const alias of skill.aliases) {
    normalizedAliasMap.set(normalizeText(alias), skill.name);
  }
}

export function extractSkills(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const lowerText = ' ' + text.toLowerCase() + ' ';

  for (const skill of SKILL_DICTIONARY) {
    const skillName = skill.name.toLowerCase();
    const allTerms = [skillName, ...skill.aliases.map((a) => a.toLowerCase())];

    for (const term of allTerms) {
      const termRegex = new RegExp(
        `(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`,
        'i'
      );
      if (termRegex.test(lowerText)) {
        found.add(skill.name);
        break;
      }
    }
  }

  return Array.from(found).sort();
}

export function getSkillCategory(skillName: string): string {
  const entry = SKILL_DICTIONARY.find(
    (s) => s.name.toLowerCase() === skillName.toLowerCase()
  );
  return entry ? entry.category : 'Other';
}

export function normalizeSkillName(raw: string): string | null {
  const normalized = normalizeText(raw);
  return normalizedAliasMap.get(normalized) || null;
}
