import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  Code2,
  GraduationCap,
  Target,
} from "lucide-react";

import { useState } from "react";

import "../App.css";

import {
  analyzeCareer,
} from "../utils/careerAnalysis";

import {
  clearAuthSession,
  getAuthToken,
} from "../utils/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const educationOptions = [
  "Computer Science",
  "Information Technology",
  "Electronics / ECE",
  "Mechanical Engineering",
  "Other",
];

const technicalSkills = [
  "Python",
  "Java",
  "JavaScript",
  "React",
  "SQL",
  "HTML / CSS",
  "C / C++",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "Networking",
];

const experienceOptions = [
  "No experience yet",
  "Internship experience",
  "Less than 1 year",
  "1–2 years",
  "More than 2 years",
];

const problemSolvingOptions = [
  "Beginner",
  "Basic",
  "Intermediate",
  "Advanced",
  "Expert",
];

const careerInterestOptions = [
  "Software Development",
  "Data & AI",
  "Cloud & DevOps",
  "Cybersecurity",
  "Web Development",
  "Not sure yet",
];

const careerGoalOptions = [
  "Get my first job",
  "Prepare for placements",
  "Switch my career",
  "Improve my technical skills",
  "Build a strong portfolio",
];

function Assessment() {
  const [step, setStep] =
    useState(1);

  const [
    selectedEducation,
    setSelectedEducation,
  ] = useState("");

  const [
    selectedSkills,
    setSelectedSkills,
  ] = useState([]);

  const [
    selectedExperience,
    setSelectedExperience,
  ] = useState("");

  const [
    selectedProblemSolving,
    setSelectedProblemSolving,
  ] = useState("");

  const [
    selectedCareerInterest,
    setSelectedCareerInterest,
  ] = useState("");

  const [
    selectedCareerGoal,
    setSelectedCareerGoal,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  // ======================================
  // TECHNICAL SKILL SELECTION
  // ======================================

  const toggleSkill = (skill) => {
    if (isSubmitting) {
      return;
    }

    setSelectedSkills(
      (previousSkills) => {
        if (
          previousSkills.includes(
            skill
          )
        ) {
          return previousSkills.filter(
            (item) =>
              item !== skill
          );
        }

        return [
          ...previousSkills,
          skill,
        ];
      }
    );
  };

  // ======================================
  // STEP VALIDATION
  // ======================================

  const canContinue =
    step === 1
      ? Boolean(
          selectedEducation
        )
      : step === 2
      ? selectedSkills.length > 0
      : step === 3
      ? Boolean(
          selectedExperience
        )
      : step === 4
      ? Boolean(
          selectedProblemSolving
        )
      : step === 5
      ? Boolean(
          selectedCareerInterest
        )
      : step === 6
      ? Boolean(
          selectedCareerGoal
        )
      : false;

  // ======================================
  // SAVE ASSESSMENT
  // ======================================

  const saveAssessment =
    async () => {
      const assessmentData = {
        education:
          selectedEducation,

        technicalSkills:
          selectedSkills,

        experience:
          selectedExperience,

        problemSolving:
          selectedProblemSolving,

        careerInterest:
          selectedCareerInterest,

        goal:
          selectedCareerGoal,

        completedAt:
          new Date().toISOString(),
      };

      // ======================================
      // ANALYZE ASSESSMENT
      // ======================================

      const analysis =
        analyzeCareer(
          assessmentData
        );

      const serverAssessmentData = {
        education:
          assessmentData.education,

        technicalSkills:
          assessmentData.technicalSkills,

        experience:
          assessmentData.experience,

        problemSolving:
          assessmentData.problemSolving,

        careerInterest:
          assessmentData.careerInterest,

        goal:
          assessmentData.goal,

        recommendedCareer:
          analysis?.recommendedCareer ||
          "",

        readinessScore:
          analysis?.readinessScore ||
          0,
      };

      // ======================================
      // SAVE LOCALLY FIRST
      // ======================================

      localStorage.setItem(
        "skillPathAssessment",
        JSON.stringify(
          assessmentData
        )
      );

      // ======================================
      // GET LOGGED-IN USER TOKEN
      // ======================================

      const token =
        getAuthToken();

      /*
        If there is no login token,
        keep the assessment locally
        and mark it for later sync.

        After login, our automatic
        sync system can send it.
      */

      if (!token) {
        localStorage.setItem(
          "skillPathSyncPending",
          "true"
        );

        console.warn(
          "Assessment saved locally. Login is required before syncing."
        );

        window.location.href =
          "/login";

        return;
      }

      // ======================================
      // SEND TO BACKEND
      // ======================================

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/assessments`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  serverAssessmentData
                ),
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

        // ======================================
        // INVALID / EXPIRED LOGIN
        // ======================================

        if (
          response.status === 401
        ) {
          localStorage.setItem(
            "skillPathSyncPending",
            "true"
          );

          clearAuthSession();

          console.warn(
            "Your login session has expired."
          );

          window.location.href =
            "/login";

          return;
        }

        // ======================================
        // OTHER SERVER ERROR
        // ======================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to save assessment to server."
          );
        }

        // ======================================
        // SAVE MONGODB DOCUMENT ID
        // ======================================

        if (
          data?.assessment?._id
        ) {
          localStorage.setItem(
            "skillPathAssessmentId",
            data.assessment._id
          );
        }

        // ======================================
        // SYNC COMPLETE
        // ======================================

        localStorage.removeItem(
          "skillPathSyncPending"
        );

        console.log(
          "Assessment saved to MongoDB successfully."
        );
      } catch (error) {
        console.error(
          "Backend assessment save failed:",
          error
        );

        /*
          Assessment is already
          safely stored locally.

          Mark it so automatic sync
          can retry later.
        */

        localStorage.setItem(
          "skillPathSyncPending",
          "true"
        );
      }

      // ======================================
      // CONTINUE TO RESULTS
      // ======================================

      window.location.href =
        "/results";
    };

  // ======================================
  // CONTINUE / FINISH
  // ======================================

  const handleContinue =
    async () => {
      if (
        !canContinue ||
        isSubmitting
      ) {
        return;
      }

      setSaveError("");

      if (step < 6) {
        setStep(
          (currentStep) =>
            currentStep + 1
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      setIsSubmitting(true);

      try {
        await saveAssessment();
      } catch (error) {
        console.error(
          "Unable to complete assessment:",
          error
        );

        setSaveError(
          "We couldn't save your assessment. Please try again."
        );

        setIsSubmitting(false);
      }
    };

  // ======================================
  // BACK BUTTON
  // ======================================

  const handleBack = () => {
    if (isSubmitting) {
      return;
    }

    setSaveError("");

    if (step > 1) {
      setStep(
        (currentStep) =>
          currentStep - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    window.history.back();
  };

  // ======================================
  // HEADER ICON
  // ======================================

  const getHeaderIcon = () => {
    if (step === 1) {
      return (
        <GraduationCap
          size={20}
        />
      );
    }

    if (step === 2) {
      return (
        <Code2
          size={20}
        />
      );
    }

    if (step === 3) {
      return (
        <Briefcase
          size={20}
        />
      );
    }

    if (step === 4) {
      return (
        <Brain
          size={20}
        />
      );
    }

    return (
      <Target
        size={20}
      />
    );
  };

  // ======================================
  // HEADER TITLE
  // ======================================

  const getHeaderTitle = () => {
    if (step === 1) {
      return "Let's understand where you are.";
    }

    if (step === 2) {
      return "Which technical skills do you have?";
    }

    if (step === 3) {
      return "Tell us about your experience.";
    }

    if (step === 4) {
      return "How would you rate your problem-solving skills?";
    }

    if (step === 5) {
      return "Which career direction interests you?";
    }

    return "What do you want to achieve next?";
  };

  // ======================================
  // HEADER DESCRIPTION
  // ======================================

  const getHeaderDescription =
    () => {
      if (step === 1) {
        return "We'll use your answers to create a personalized career path based on your current skills and goals.";
      }

      if (step === 2) {
        return "Select all the technologies and technical areas you are comfortable with.";
      }

      if (step === 3) {
        return "Understanding your experience helps us recommend realistic career paths for you.";
      }

      if (step === 4) {
        return "Your problem-solving ability helps us understand your readiness for different career paths.";
      }

      if (step === 5) {
        return "Choose the career area that interests you the most right now.";
      }

      return "Your goal helps us personalize the next steps in your career roadmap.";
    };

  // ======================================
  // FOOTER MESSAGE
  // ======================================

  const getFooterMessage =
    () => {
      if (isSubmitting) {
        return "Saving your assessment...";
      }

      if (step === 1) {
        return selectedEducation
          ? "Selection saved"
          : "Select one option to continue";
      }

      if (step === 2) {
        return selectedSkills.length >
          0
          ? `${selectedSkills.length} ${
              selectedSkills.length ===
              1
                ? "skill"
                : "skills"
            } selected`
          : "Select at least one skill";
      }

      if (step === 3) {
        return selectedExperience
          ? "Selection saved"
          : "Select one option to continue";
      }

      if (step === 4) {
        return selectedProblemSolving
          ? "Selection saved"
          : "Select one option to continue";
      }

      if (step === 5) {
        return selectedCareerInterest
          ? "Selection saved"
          : "Select one career area to continue";
      }

      return selectedCareerGoal
        ? "Selection saved"
        : "Select your main career goal";
    };

  return (
    <div className="assessment-page">

      <div className="assessment-container">

        {/* =========================
            BACK BUTTON
        ========================= */}

        <button
          type="button"
          className="back-button"
          onClick={
            handleBack
          }
          disabled={
            isSubmitting
          }
        >
          <ArrowLeft
            size={17}
          />

          {step === 1
            ? "Back"
            : "Previous"}
        </button>

        {/* =========================
            HEADER
        ========================= */}

        <div className="assessment-header">

          <div className="assessment-badge">
            {getHeaderIcon()}
          </div>

          <span className="assessment-step">
            STEP {step} OF 6
          </span>

          <h1>
            {getHeaderTitle()}
          </h1>

          <p>
            {getHeaderDescription()}
          </p>

        </div>

        {/* =========================
            PROGRESS BAR
        ========================= */}

        <div className="assessment-progress">

          <div
            className="assessment-progress-fill"
            style={{
              width: `${
                (step / 6) *
                100
              }%`,
            }}
          />

        </div>

        {/* =========================
            QUESTION CARD
        ========================= */}

        <div className="question-card">

          <div className="question-number">
            Question {step}
          </div>

          {/* =========================
              STEP 1 - EDUCATION
          ========================= */}

          {step === 1 && (
            <>
              <h2>
                What are you currently
                studying?
              </h2>

              <p className="question-description">
                Choose the option that
                best describes your
                educational background.
              </p>

              <div className="options-list">

                {educationOptions.map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      className={`option ${
                        selectedEducation ===
                        option
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedEducation(
                          option
                        )
                      }
                    >

                      <span className="option-radio">

                        {selectedEducation ===
                          option && (
                          <span className="option-radio-dot" />
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  )
                )}

              </div>
            </>
          )}

          {/* =========================
              STEP 2 - TECHNICAL SKILLS
          ========================= */}

          {step === 2 && (
            <>
              <h2>
                Which technical skills
                do you have?
              </h2>

              <p className="question-description">
                Select all the
                technologies and
                technical areas you are
                comfortable with.
              </p>

              <div className="skills-grid">

                {technicalSkills.map(
                  (skill) => {
                    const isSelected =
                      selectedSkills.includes(
                        skill
                      );

                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={
                          isSubmitting
                        }
                        className={`skill-option ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleSkill(
                            skill
                          )
                        }
                      >

                        <span className="skill-check">
                          {isSelected
                            ? "✓"
                            : ""}
                        </span>

                        <span>
                          {skill}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>
            </>
          )}

          {/* =========================
              STEP 3 - EXPERIENCE
          ========================= */}

          {step === 3 && (
            <>
              <h2>
                What is your current
                experience level?
              </h2>

              <p className="question-description">
                Select the option that
                best describes your
                professional experience.
              </p>

              <div className="options-list">

                {experienceOptions.map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      className={`option ${
                        selectedExperience ===
                        option
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedExperience(
                          option
                        )
                      }
                    >

                      <span className="option-radio">

                        {selectedExperience ===
                          option && (
                          <span className="option-radio-dot" />
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  )
                )}

              </div>
            </>
          )}

          {/* =========================
              STEP 4 - PROBLEM SOLVING
          ========================= */}

          {step === 4 && (
            <>
              <h2>
                How would you rate your
                problem-solving skills?
              </h2>

              <p className="question-description">
                Choose the option that
                best describes your
                current problem-solving
                ability.
              </p>

              <div className="options-list">

                {problemSolvingOptions.map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      className={`option ${
                        selectedProblemSolving ===
                        option
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedProblemSolving(
                          option
                        )
                      }
                    >

                      <span className="option-radio">

                        {selectedProblemSolving ===
                          option && (
                          <span className="option-radio-dot" />
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  )
                )}

              </div>
            </>
          )}

          {/* =========================
              STEP 5 - CAREER INTEREST
          ========================= */}

          {step === 5 && (
            <>
              <h2>
                What type of career
                interests you?
              </h2>

              <p className="question-description">
                Choose the career area
                that currently interests
                you the most.
              </p>

              <div className="options-list">

                {careerInterestOptions.map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      className={`option ${
                        selectedCareerInterest ===
                        option
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedCareerInterest(
                          option
                        )
                      }
                    >

                      <span className="option-radio">

                        {selectedCareerInterest ===
                          option && (
                          <span className="option-radio-dot" />
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  )
                )}

              </div>
            </>
          )}

          {/* =========================
              STEP 6 - CAREER GOAL
          ========================= */}

          {step === 6 && (
            <>
              <h2>
                What is your main career
                goal?
              </h2>

              <p className="question-description">
                Choose what you would
                most like SkillPath to
                help you achieve.
              </p>

              <div className="options-list">

                {careerGoalOptions.map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      className={`option ${
                        selectedCareerGoal ===
                        option
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedCareerGoal(
                          option
                        )
                      }
                    >

                      <span className="option-radio">

                        {selectedCareerGoal ===
                          option && (
                          <span className="option-radio-dot" />
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  )
                )}

              </div>
            </>
          )}

          {/* =========================
              FOOTER
          ========================= */}

          <div className="question-footer">

            <span>
              {saveError ||
                getFooterMessage()}
            </span>

            <button
              type="button"
              className="continue-button"
              disabled={
                !canContinue ||
                isSubmitting
              }
              onClick={
                handleContinue
              }
            >
              {isSubmitting
                ? "Saving..."
                : step === 6
                ? "Finish Assessment"
                : "Continue"}

              {!isSubmitting && (
                <ArrowRight
                  size={18}
                />
              )}

            </button>

          </div>

        </div>

        {/* =========================
            TIP
        ========================= */}

        <div className="assessment-tip">

          <strong>
            💡 Your answers matter
          </strong>

          <span>
            We'll use your responses
            to identify suitable
            career paths, skill gaps,
            and the next steps you
            should focus on.
          </span>

        </div>

      </div>

    </div>
  );
}

export default Assessment;