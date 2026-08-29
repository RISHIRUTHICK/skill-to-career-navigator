const careerProfiles = {
  "Software Development": {
    career: "Software Developer",

    requiredSkills: [
      "JavaScript",
      "Java",
      "Python",
      "SQL",
      "C / C++",
    ],

    futureSkills: [
      "Git & GitHub",
      "REST APIs",
      "Backend Development",
      "Software Testing",
    ],
  },

  "Data & AI": {
    career: "Data / AI Engineer",

    requiredSkills: [
      "Python",
      "SQL",
      "Data Science",
      "Machine Learning",
    ],

    futureSkills: [
      "Statistics",
      "Data Visualization",
      "Deep Learning",
      "Model Deployment",
    ],
  },

  "Cloud & DevOps": {
    career: "Cloud / DevOps Engineer",

    requiredSkills: [
      "Cloud Computing",
      "Networking",
      "Python",
    ],

    futureSkills: [
      "Linux",
      "Docker",
      "CI/CD",
      "AWS / Azure",
    ],
  },

  Cybersecurity: {
    career: "Cybersecurity Analyst",

    requiredSkills: [
      "Cybersecurity",
      "Networking",
      "Python",
    ],

    futureSkills: [
      "Linux",
      "Network Security",
      "Security Tools",
      "Threat Analysis",
    ],
  },

  "Web Development": {
    career: "Web Developer",

    requiredSkills: [
      "HTML / CSS",
      "JavaScript",
      "React",
      "SQL",
    ],

    futureSkills: [
      "REST APIs",
      "Node.js",
      "Authentication",
      "Testing",
    ],
  },
};

const experienceScores = {
  "No experience yet": 0,
  "Internship experience": 6,
  "Less than 1 year": 8,
  "1–2 years": 12,
  "More than 2 years": 15,
};

const problemSolvingScores = {
  Beginner: 2,
  Basic: 4,
  Intermediate: 7,
  Advanced: 10,
  Expert: 12,
};

function findBestCareer(skills) {
  const profiles = Object.values(careerProfiles);

  let bestProfile =
    careerProfiles["Software Development"];

  let highestMatches = -1;

  profiles.forEach((profile) => {
    const matches =
      profile.requiredSkills.filter((skill) =>
        skills.includes(skill)
      ).length;

    if (matches > highestMatches) {
      highestMatches = matches;
      bestProfile = profile;
    }
  });

  return bestProfile;
}

function getCareerProfile(answers, skills) {
  const interest = answers?.careerInterest;

  if (
    interest &&
    interest !== "Not sure yet" &&
    careerProfiles[interest]
  ) {
    return careerProfiles[interest];
  }

  return findBestCareer(skills);
}

function calculateReadiness(
  answers,
  profile,
  skills
) {
  const matchedSkills =
    profile.requiredSkills.filter((skill) =>
      skills.includes(skill)
    );

  const totalRequiredSkills =
    profile.requiredSkills.length;

  const skillScore =
    totalRequiredSkills > 0
      ? (matchedSkills.length /
          totalRequiredSkills) *
        55
      : 0;

  const experienceScore =
    experienceScores[answers?.experience] || 0;

  const problemSolvingScore =
    problemSolvingScores[
      answers?.problemSolving
    ] || 0;

  const goalScore = answers?.goal ? 5 : 0;

  const interestScore =
    answers?.careerInterest ? 5 : 0;

  const totalScore =
    20 +
    skillScore +
    experienceScore +
    problemSolvingScore +
    goalScore +
    interestScore;

  return Math.min(
    95,
    Math.round(totalScore)
  );
}

export function analyzeCareer(answers) {
  if (!answers || typeof answers !== "object") {
    return null;
  }

  const skills = Array.isArray(
    answers.technicalSkills
  )
    ? answers.technicalSkills
    : [];

  const selectedProfile =
    getCareerProfile(answers, skills);

  const recommendedCareer =
    selectedProfile.career;

  const matchedSkills =
    selectedProfile.requiredSkills.filter(
      (skill) => skills.includes(skill)
    );

  const missingRequiredSkills =
    selectedProfile.requiredSkills.filter(
      (skill) => !skills.includes(skill)
    );

  const readinessScore =
    calculateReadiness(
      answers,
      selectedProfile,
      skills
    );

  const strengths = [
    ...matchedSkills,
  ];

  if (
    answers.problemSolving === "Advanced" ||
    answers.problemSolving === "Expert"
  ) {
    strengths.push("Problem Solving");
  }

  if (
    answers.experience &&
    answers.experience !==
      "No experience yet"
  ) {
    strengths.push(
      "Practical Experience"
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      skills[0] || "Learning Mindset",
      "Career Motivation"
    );
  }

  const uniqueStrengths = [
    ...new Set(strengths),
  ].slice(0, 5);

  const skillGaps = [
    ...new Set([
      ...missingRequiredSkills,
      ...selectedProfile.futureSkills,
    ]),
  ].slice(0, 5);

  return {
    recommendedCareer,
    readinessScore,
    skills,
    strengths: uniqueStrengths,
    skillGaps,
    matchedSkills,
    missingRequiredSkills,
    profile: selectedProfile,
  };
}

export { careerProfiles };