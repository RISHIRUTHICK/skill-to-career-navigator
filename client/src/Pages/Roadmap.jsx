import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Flag,
  FolderGit2,
  RotateCcw,
  Target,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import "../App.css";

import {
  clearAuthSession,
  getAuthToken,
} from "../utils/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ======================================
   ROADMAP PROFILES
====================================== */

const roadmapProfiles = {
  "Software Development": {
    career: "Software Developer",

    stages: [
      {
        title:
          "Strengthen Programming Foundations",
        description:
          "Build a strong programming and development foundation.",
        skills: [
          "JavaScript",
          "Python or Java",
          "SQL",
          "Git & GitHub",
        ],
      },

      {
        title:
          "Learn Backend Development",
        description:
          "Understand how modern applications communicate with servers and databases.",
        skills: [
          "REST APIs",
          "Node.js / Express",
          "Authentication",
          "Database Integration",
        ],
      },

      {
        title:
          "Build Real Projects",
        description:
          "Apply your skills by building complete applications.",
        skills: [
          "CRUD Application",
          "REST API Project",
          "Full-Stack Application",
          "GitHub Portfolio",
        ],
      },

      {
        title:
          "Prepare for Software Jobs",
        description:
          "Build the skills required to become job-ready.",
        skills: [
          "Data Structures & Algorithms",
          "Problem Solving",
          "Resume Preparation",
          "Interview Practice",
        ],
      },
    ],
  },

  "Web Development": {
    career: "Web Developer",

    stages: [
      {
        title:
          "Master Web Fundamentals",
        description:
          "Strengthen the core technologies used by modern websites.",
        skills: [
          "HTML",
          "CSS",
          "JavaScript",
          "Responsive Design",
        ],
      },

      {
        title:
          "Master React",
        description:
          "Build interactive and reusable frontend applications.",
        skills: [
          "React Components",
          "Hooks",
          "State Management",
          "React Router",
        ],
      },

      {
        title:
          "Learn Full-Stack Development",
        description:
          "Connect frontend applications with backend services.",
        skills: [
          "REST APIs",
          "Node.js",
          "Authentication",
          "SQL / MongoDB",
        ],
      },

      {
        title:
          "Build Your Portfolio",
        description:
          "Create projects that demonstrate your web-development ability.",
        skills: [
          "Portfolio Website",
          "Dashboard Project",
          "Full-Stack Project",
          "GitHub Deployment",
        ],
      },
    ],
  },

  "Data & AI": {
    career:
      "Data / AI Engineer",

    stages: [
      {
        title:
          "Build Data Foundations",
        description:
          "Strengthen your programming, mathematics, and data-handling skills.",
        skills: [
          "Python",
          "SQL",
          "Statistics",
          "Pandas & NumPy",
        ],
      },

      {
        title:
          "Learn Data Analysis",
        description:
          "Learn how to explore, clean, analyze, and visualize data.",
        skills: [
          "Data Cleaning",
          "Exploratory Data Analysis",
          "Matplotlib",
          "Data Visualization",
        ],
      },

      {
        title:
          "Master Machine Learning",
        description:
          "Learn how predictive models are built and evaluated.",
        skills: [
          "Scikit-learn",
          "Regression",
          "Classification",
          "Model Evaluation",
        ],
      },

      {
        title:
          "Build AI Projects",
        description:
          "Apply your knowledge through real-world machine-learning projects.",
        skills: [
          "Prediction Project",
          "Classification Project",
          "Model Deployment",
          "Machine Learning Portfolio",
        ],
      },
    ],
  },

  "Cloud & DevOps": {
    career:
      "Cloud / DevOps Engineer",

    stages: [
      {
        title:
          "Learn System Foundations",
        description:
          "Understand operating-system and networking concepts required for cloud engineering.",
        skills: [
          "Linux",
          "Networking",
          "Command Line",
          "Git & GitHub",
        ],
      },

      {
        title:
          "Learn Cloud Platforms",
        description:
          "Understand how applications and infrastructure operate in the cloud.",
        skills: [
          "AWS or Azure",
          "Cloud Storage",
          "Virtual Machines",
          "IAM",
        ],
      },

      {
        title:
          "Master DevOps Tools",
        description:
          "Learn modern deployment and infrastructure automation.",
        skills: [
          "Docker",
          "CI/CD",
          "GitHub Actions",
          "Infrastructure Basics",
        ],
      },

      {
        title:
          "Build Cloud Projects",
        description:
          "Deploy real applications and create practical cloud experience.",
        skills: [
          "Cloud Deployment",
          "Dockerized Application",
          "CI/CD Pipeline",
          "Cloud Portfolio",
        ],
      },
    ],
  },

  Cybersecurity: {
    career:
      "Cybersecurity Analyst",

    stages: [
      {
        title:
          "Build Security Foundations",
        description:
          "Learn the networking and system concepts required for cybersecurity.",
        skills: [
          "Networking",
          "Linux",
          "Operating Systems",
          "Security Fundamentals",
        ],
      },

      {
        title:
          "Learn Security Tools",
        description:
          "Become comfortable with tools used to analyze systems and networks.",
        skills: [
          "Wireshark",
          "Nmap",
          "Log Analysis",
          "Security Monitoring",
        ],
      },

      {
        title:
          "Learn Threat Analysis",
        description:
          "Understand common attacks and defensive techniques.",
        skills: [
          "Threat Detection",
          "Vulnerability Analysis",
          "Network Security",
          "Incident Response",
        ],
      },

      {
        title:
          "Build Security Projects",
        description:
          "Demonstrate your cybersecurity knowledge through practical projects.",
        skills: [
          "Network Analysis Project",
          "Security Audit",
          "Threat Detection Project",
          "Cybersecurity Portfolio",
        ],
      },
    ],
  },
};

/* ======================================
   FIND ROADMAP FROM SKILLS
====================================== */

function findRoadmapFromSkills(
  skills
) {
  if (
    skills.includes(
      "Data Science"
    ) ||
    skills.includes(
      "Machine Learning"
    )
  ) {
    return roadmapProfiles[
      "Data & AI"
    ];
  }

  if (
    skills.includes(
      "Cybersecurity"
    )
  ) {
    return roadmapProfiles
      .Cybersecurity;
  }

  if (
    skills.includes(
      "Cloud Computing"
    ) ||
    skills.includes(
      "Networking"
    )
  ) {
    return roadmapProfiles[
      "Cloud & DevOps"
    ];
  }

  if (
    skills.includes("React") ||
    skills.includes(
      "HTML / CSS"
    ) ||
    skills.includes(
      "JavaScript"
    )
  ) {
    return roadmapProfiles[
      "Web Development"
    ];
  }

  return roadmapProfiles[
    "Software Development"
  ];
}

/* ======================================
   CHECK KNOWN SKILL
====================================== */

function isKnownSkill(
  skill,
  selectedSkills
) {
  if (
    selectedSkills.includes(
      skill
    )
  ) {
    return true;
  }

  if (
    skill ===
      "Python or Java" &&
    (
      selectedSkills.includes(
        "Python"
      ) ||
      selectedSkills.includes(
        "Java"
      )
    )
  ) {
    return true;
  }

  if (
    skill === "HTML" &&
    selectedSkills.includes(
      "HTML / CSS"
    )
  ) {
    return true;
  }

  if (
    skill === "CSS" &&
    selectedSkills.includes(
      "HTML / CSS"
    )
  ) {
    return true;
  }

  return false;
}

/* ======================================
   CLEAN COMPLETED ITEMS
====================================== */

function normalizeCompletedItems(
  items
) {
  if (!Array.isArray(items)) {
    return [];
  }

  return [
    ...new Set(
      items.filter(
        (item) =>
          typeof item ===
            "string" &&
          item.trim()
      )
    ),
  ];
}

/* ======================================
   ROADMAP
====================================== */

function Roadmap() {
  const [
    answers,
    setAnswers,
  ] = useState(null);

  const [
    completedSkills,
    setCompletedSkills,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    progressReady,
    setProgressReady,
  ] = useState(false);

  /*
    Prevent our saving effect from
    immediately re-saving progress
    that was just loaded from MongoDB.
  */
  const skipNextSave =
    useRef(true);

  // ======================================
  // LOAD ASSESSMENT + ROADMAP PROGRESS
  // ======================================

  useEffect(() => {
    let isActive = true;

    const loadRoadmapData =
      async () => {
        let localProgress = [];

        // ------------------------------
        // LOAD LOCAL ASSESSMENT
        // ------------------------------

        try {
          const savedAssessment =
            localStorage.getItem(
              "skillPathAssessment"
            );

          if (
            savedAssessment
          ) {
            const parsedAssessment =
              JSON.parse(
                savedAssessment
              );

            if (isActive) {
              setAnswers(
                parsedAssessment
              );
            }
          }

          const savedProgress =
            localStorage.getItem(
              "skillPathRoadmapProgress"
            );

          if (savedProgress) {
            localProgress =
              normalizeCompletedItems(
                JSON.parse(
                  savedProgress
                )
              );
          }
        } catch (error) {
          console.error(
            "Unable to load local roadmap data:",
            error
          );
        }

        // ------------------------------
        // CHECK LOGIN
        // ------------------------------

        const token =
          getAuthToken();

        if (!token) {
          if (isActive) {
            setLoading(false);
          }

          window.location.replace(
            "/login"
          );

          return;
        }

        // ======================================
        // PENDING LOCAL PROGRESS
        // ======================================

        const syncPending =
          localStorage.getItem(
            "skillPathRoadmapSyncPending"
          ) === "true";

        /*
          If the browser has newer unsynced
          roadmap data, upload that first.

          This prevents older MongoDB data
          from overwriting recent local work.
        */

        if (syncPending) {
          try {
            const response =
              await fetch(
                `${API_BASE_URL}/api/roadmap-progress`,
                {
                  method:
                    "PUT",

                  headers: {
                    "Content-Type":
                      "application/json",

                    Authorization:
                      `Bearer ${token}`,
                  },

                  body:
                    JSON.stringify({
                      completedItems:
                        localProgress,
                    }),
                }
              );

            let data = null;

            try {
              data =
                await response.json();
            } catch {
              throw new Error(
                "The server returned an invalid response."
              );
            }

            if (
              response.status ===
              401
            ) {
              clearAuthSession();

              window.location.replace(
                "/login"
              );

              return;
            }

            if (
              !response.ok
            ) {
              throw new Error(
                data?.message ||
                  "Unable to synchronize roadmap progress."
              );
            }

            const syncedProgress =
              normalizeCompletedItems(
                data?.completedItems
              );

            localStorage.setItem(
              "skillPathRoadmapProgress",
              JSON.stringify(
                syncedProgress
              )
            );

            localStorage.removeItem(
              "skillPathRoadmapSyncPending"
            );

            if (isActive) {
              setCompletedSkills(
                syncedProgress
              );

              setProgressReady(
                true
              );

              setLoading(
                false
              );
            }

            console.log(
              "Pending roadmap progress synced successfully."
            );

            return;
          } catch (error) {
            console.warn(
              "Roadmap sync is still pending:",
              error.message
            );

            /*
              Server unavailable.

              Keep local progress and let
              the user continue working.
            */

            if (isActive) {
              setCompletedSkills(
                localProgress
              );

              setProgressReady(
                true
              );

              setLoading(
                false
              );
            }

            return;
          }
        }

        // ======================================
        // LOAD PROGRESS FROM MONGODB
        // ======================================

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/roadmap-progress`,
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          let data = null;

          try {
            data =
              await response.json();
          } catch {
            throw new Error(
              "The server returned an invalid response."
            );
          }

          // ------------------------------
          // INVALID / EXPIRED JWT
          // ------------------------------

          if (
            response.status ===
            401
          ) {
            clearAuthSession();

            window.location.replace(
              "/login"
            );

            return;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                "Unable to load roadmap progress."
            );
          }

          const serverProgress =
            normalizeCompletedItems(
              data?.completedItems
            );

          /*
            MIGRATE OLD LOCAL PROGRESS

            Before Phase 8J, progress existed
            only in localStorage.

            If MongoDB has never stored this
            user's progress but the browser
            already has completed items,
            migrate those items into MongoDB.
          */

          const noServerProgressYet =
            data?.message ===
            "No roadmap progress found yet.";

          if (
            noServerProgressYet &&
            localProgress.length >
              0
          ) {
            try {
              const migrateResponse =
                await fetch(
                  `${API_BASE_URL}/api/roadmap-progress`,
                  {
                    method:
                      "PUT",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization:
                        `Bearer ${token}`,
                    },

                    body:
                      JSON.stringify({
                        completedItems:
                          localProgress,
                      }),
                  }
                );

              const migrateData =
                await migrateResponse.json();

              if (
                migrateResponse.status ===
                401
              ) {
                clearAuthSession();

                window.location.replace(
                  "/login"
                );

                return;
              }

              if (
                migrateResponse.ok
              ) {
                const migratedProgress =
                  normalizeCompletedItems(
                    migrateData
                      ?.completedItems
                  );

                localStorage.setItem(
                  "skillPathRoadmapProgress",
                  JSON.stringify(
                    migratedProgress
                  )
                );

                localStorage.removeItem(
                  "skillPathRoadmapSyncPending"
                );

                if (isActive) {
                  setCompletedSkills(
                    migratedProgress
                  );

                  setProgressReady(
                    true
                  );

                  setLoading(
                    false
                  );
                }

                console.log(
                  "Existing local roadmap progress migrated to MongoDB."
                );

                return;
              }
            } catch (error) {
              console.warn(
                "Unable to migrate local roadmap progress:",
                error.message
              );

              localStorage.setItem(
                "skillPathRoadmapSyncPending",
                "true"
              );

              if (isActive) {
                setCompletedSkills(
                  localProgress
                );

                setProgressReady(
                  true
                );

                setLoading(
                  false
                );
              }

              return;
            }
          }

          // ------------------------------
          // MONGODB IS SOURCE OF TRUTH
          // ------------------------------

          localStorage.setItem(
            "skillPathRoadmapProgress",
            JSON.stringify(
              serverProgress
            )
          );

          localStorage.removeItem(
            "skillPathRoadmapSyncPending"
          );

          if (isActive) {
            setCompletedSkills(
              serverProgress
            );

            setProgressReady(
              true
            );

            setLoading(
              false
            );
          }

          console.log(
            "Roadmap progress loaded from MongoDB."
          );
        } catch (error) {
          console.warn(
            "Unable to load roadmap progress from server. Using local progress:",
            error.message
          );

          /*
            Offline fallback.
          */

          if (isActive) {
            setCompletedSkills(
              localProgress
            );

            setProgressReady(
              true
            );

            setLoading(
              false
            );
          }
        }
      };

    loadRoadmapData();

    return () => {
      isActive = false;
    };
  }, []);

  // ======================================
  // SAVE ROADMAP PROGRESS
  // LOCAL + MONGODB
  // ======================================

  useEffect(() => {
    if (
      !progressReady
    ) {
      return;
    }

    /*
      Skip the first effect after loading
      existing progress.
    */

    if (
      skipNextSave.current
    ) {
      skipNextSave.current =
        false;

      return;
    }

    const saveProgress =
      async () => {
        const cleanProgress =
          normalizeCompletedItems(
            completedSkills
          );

        // ------------------------------
        // ALWAYS SAVE LOCALLY FIRST
        // ------------------------------

        try {
          localStorage.setItem(
            "skillPathRoadmapProgress",
            JSON.stringify(
              cleanProgress
            )
          );
        } catch (error) {
          console.error(
            "Unable to save roadmap progress locally:",
            error
          );
        }

        const token =
          getAuthToken();

        if (!token) {
          localStorage.setItem(
            "skillPathRoadmapSyncPending",
            "true"
          );

          window.location.replace(
            "/login"
          );

          return;
        }

        // ------------------------------
        // SAVE TO MONGODB
        // ------------------------------

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/roadmap-progress`,
              {
                method:
                  "PUT",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify({
                    completedItems:
                      cleanProgress,
                  }),
              }
            );

          let data = null;

          try {
            data =
              await response.json();
          } catch {
            throw new Error(
              "The server returned an invalid response."
            );
          }

          // ------------------------------
          // EXPIRED LOGIN
          // ------------------------------

          if (
            response.status ===
            401
          ) {
            localStorage.setItem(
              "skillPathRoadmapSyncPending",
              "true"
            );

            clearAuthSession();

            window.location.replace(
              "/login"
            );

            return;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                "Unable to save roadmap progress."
            );
          }

          const savedProgress =
            normalizeCompletedItems(
              data?.completedItems
            );

          localStorage.setItem(
            "skillPathRoadmapProgress",
            JSON.stringify(
              savedProgress
            )
          );

          localStorage.removeItem(
            "skillPathRoadmapSyncPending"
          );

          console.log(
            "Roadmap progress saved to MongoDB successfully."
          );
        } catch (error) {
          /*
            Local data remains safe.

            Mark it for retry next time
            Roadmap loads.
          */

          localStorage.setItem(
            "skillPathRoadmapSyncPending",
            "true"
          );

          console.warn(
            "Roadmap progress saved locally. Server sync is pending:",
            error.message
          );
        }
      };

    saveProgress();
  }, [
    completedSkills,
    progressReady,
  ]);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="roadmap-page">

        <div className="roadmap-container">

          <div className="roadmap-empty">

            <h1>
              Loading your roadmap...
            </h1>

            <p>
              Loading your saved
              progress.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ======================================
  // NO ASSESSMENT
  // ======================================

  if (!answers) {
    return (
      <div className="roadmap-page">

        <div className="roadmap-container">

          <div className="roadmap-empty">

            <AlertTriangle
              size={45}
            />

            <h1>
              No career assessment found
            </h1>

            <p>
              Complete your SkillPath
              assessment before
              generating a personalized
              roadmap.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                window.location.href =
                  "/assessment";
              }}
            >
              Start Assessment
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ======================================
  // SELECT ROADMAP
  // ======================================

  const selectedSkills =
    Array.isArray(
      answers.technicalSkills
    )
      ? answers.technicalSkills
      : [];

  const roadmap =
    roadmapProfiles[
      answers.careerInterest
    ] ||
    findRoadmapFromSkills(
      selectedSkills
    );

  // ======================================
  // ROADMAP SKILL ID
  // ======================================

  const getSkillId = (
    stageIndex,
    skillIndex
  ) =>
    `${roadmap.career}-${stageIndex}-${skillIndex}`;

  // ======================================
  // TOGGLE SKILL
  // ======================================

  const toggleSkill = (
    stageIndex,
    skillIndex
  ) => {
    const skillId =
      getSkillId(
        stageIndex,
        skillIndex
      );

    setCompletedSkills(
      (previous) => {
        if (
          previous.includes(
            skillId
          )
        ) {
          return previous.filter(
            (item) =>
              item !== skillId
          );
        }

        return [
          ...previous,
          skillId,
        ];
      }
    );
  };

  // ======================================
  // ROADMAP IDS
  // ======================================

  const roadmapSkillIds =
    roadmap.stages.flatMap(
      (
        stage,
        stageIndex
      ) =>
        stage.skills.map(
          (
            _,
            skillIndex
          ) =>
            getSkillId(
              stageIndex,
              skillIndex
            )
        )
    );

  const totalSkills =
    roadmapSkillIds.length;

  const completedCount =
    roadmapSkillIds.filter(
      (id) =>
        completedSkills.includes(
          id
        )
    ).length;

  const overallProgress =
    totalSkills === 0
      ? 0
      : Math.round(
          (
            completedCount /
            totalSkills
          ) * 100
        );

  // ======================================
  // RESET PROGRESS
  // ======================================

  const resetProgress = () => {
    const confirmed =
      window.confirm(
        "Reset all roadmap progress?"
      );

    if (!confirmed) {
      return;
    }

    const roadmapIds =
      new Set(
        roadmapSkillIds
      );

    setCompletedSkills(
      (previous) =>
        previous.filter(
          (id) =>
            !roadmapIds.has(
              id
            )
        )
    );
  };

  return (
    <div className="roadmap-page">

      <div className="roadmap-container">

        {/* =========================
            NAVIGATION
        ========================= */}

        <div className="roadmap-topbar">

          <div className="roadmap-nav-actions">

            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href =
                  "/results";
              }}
            >
              <ArrowLeft
                size={17}
              />

              Results
            </button>

            <button
              type="button"
              className="dashboard-link-button"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
            >
              Dashboard

              <ArrowRight
                size={17}
              />
            </button>

          </div>

          {completedCount > 0 && (
            <button
              type="button"
              className="roadmap-reset-button"
              onClick={
                resetProgress
              }
            >
              <RotateCcw
                size={16}
              />

              Reset Progress
            </button>
          )}

        </div>

        {/* =========================
            HEADER
        ========================= */}

        <div className="roadmap-header">

          <div className="roadmap-header-icon">

            <Target
              size={26}
            />

          </div>

          <span>
            YOUR PERSONALIZED ROADMAP
          </span>

          <h1>
            Your path to becoming a

            <strong>
              {" "}
              {roadmap.career}
            </strong>
          </h1>

          <p>
            Follow these stages in
            order. Mark skills as
            completed as you progress
            through your learning
            journey.
          </p>

        </div>

        {/* =========================
            OVERALL PROGRESS
        ========================= */}

        <div className="roadmap-progress-card">

          <div className="roadmap-progress-header">

            <div>

              <span>
                ROADMAP PROGRESS
              </span>

              <h2>
                {overallProgress}%
              </h2>

            </div>

            <div className="roadmap-progress-count">
              {completedCount} of{" "}
              {totalSkills} completed
            </div>

          </div>

          <div className="roadmap-progress-bar">

            <div
              className="roadmap-progress-fill"
              style={{
                width:
                  `${overallProgress}%`,
              }}
            />

          </div>

          {overallProgress ===
            100 && (
            <div className="roadmap-complete-message">

              <CheckCircle2
                size={18}
              />

              Roadmap completed!
              Great work.

            </div>
          )}

        </div>

        {/* =========================
            ROADMAP TIMELINE
        ========================= */}

        <div className="roadmap-timeline">

          {roadmap.stages.map(
            (
              stage,
              stageIndex
            ) => {
              const phaseSkillIds =
                stage.skills.map(
                  (
                    _,
                    skillIndex
                  ) =>
                    getSkillId(
                      stageIndex,
                      skillIndex
                    )
                );

              const phaseCompleted =
                phaseSkillIds.filter(
                  (id) =>
                    completedSkills.includes(
                      id
                    )
                ).length;

              const phaseProgress =
                stage.skills
                  .length === 0
                  ? 0
                  : Math.round(
                      (
                        phaseCompleted /
                        stage.skills
                          .length
                      ) * 100
                    );

              const phaseIsComplete =
                phaseProgress ===
                100;

              return (
                <div
                  className="roadmap-stage"
                  key={
                    stage.title
                  }
                >

                  {/* PHASE MARKER */}

                  <div
                    className={`roadmap-marker ${
                      phaseIsComplete
                        ? "completed"
                        : ""
                    }`}
                  >
                    <span>

                      {phaseIsComplete ? (
                        <Check
                          size={20}
                        />
                      ) : (
                        stageIndex +
                        1
                      )}

                    </span>
                  </div>

                  {/* PHASE CARD */}

                  <div
                    className={`roadmap-stage-card ${
                      phaseIsComplete
                        ? "phase-completed"
                        : ""
                    }`}
                  >

                    <div className="roadmap-stage-header">

                      <div>

                        <span className="roadmap-stage-label">
                          PHASE{" "}
                          {stageIndex +
                            1}
                        </span>

                        <h2>
                          {stage.title}
                        </h2>

                      </div>

                      {stageIndex ===
                      0 ? (
                        <BookOpen
                          size={23}
                        />
                      ) : stageIndex ===
                        1 ? (
                        <Code2
                          size={23}
                        />
                      ) : stageIndex ===
                        2 ? (
                        <FolderGit2
                          size={23}
                        />
                      ) : (
                        <Flag
                          size={23}
                        />
                      )}

                    </div>

                    <p>
                      {
                        stage.description
                      }
                    </p>

                    {/* PHASE PROGRESS */}

                    <div className="phase-progress">

                      <div className="phase-progress-header">

                        <span>
                          {
                            phaseCompleted
                          }{" "}
                          of{" "}
                          {
                            stage.skills
                              .length
                          }{" "}
                          completed
                        </span>

                        <strong>
                          {
                            phaseProgress
                          }
                          %
                        </strong>

                      </div>

                      <div className="phase-progress-bar">

                        <div
                          className="phase-progress-fill"
                          style={{
                            width:
                              `${phaseProgress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {phaseIsComplete && (
                      <div className="phase-complete-label">

                        <CheckCircle2
                          size={16}
                        />

                        Phase complete

                      </div>
                    )}

                    {/* SKILLS */}

                    <div className="roadmap-skill-grid">

                      {stage.skills.map(
                        (
                          skill,
                          skillIndex
                        ) => {
                          const skillId =
                            getSkillId(
                              stageIndex,
                              skillIndex
                            );

                          const completed =
                            completedSkills.includes(
                              skillId
                            );

                          const alreadyKnown =
                            isKnownSkill(
                              skill,
                              selectedSkills
                            );

                          return (
                            <button
                              key={
                                skillId
                              }
                              type="button"
                              className={`roadmap-skill roadmap-skill-button ${
                                completed
                                  ? "completed"
                                  : ""
                              } ${
                                alreadyKnown
                                  ? "known"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleSkill(
                                  stageIndex,
                                  skillIndex
                                )
                              }
                            >

                              <span className="roadmap-skill-check">

                                {completed && (
                                  <Check
                                    size={15}
                                  />
                                )}

                              </span>

                              <span className="roadmap-skill-name">
                                {skill}
                              </span>

                              {alreadyKnown &&
                                !completed && (
                                  <small>
                                    Already
                                    known
                                  </small>
                                )}

                              {completed && (
                                <small>
                                  Completed
                                </small>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* =========================
            CAREER GOAL
        ========================= */}

        <div className="roadmap-goal">

          <Flag
            size={27}
          />

          <div>

            <span>
              YOUR GOAL
            </span>

            <h2>
              {answers.goal ||
                `Become job-ready as a ${roadmap.career}`}
            </h2>

            <p>
              Complete the roadmap,
              build practical projects,
              and continue
              strengthening your
              problem-solving ability.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Roadmap;