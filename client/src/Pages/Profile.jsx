import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  Pencil,
  Save,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";

import "../App.css";

import {
  clearAuthSession,
  getAuthToken,
  getSavedUser,
  logoutUser,
} from "../utils/auth";

import {
  analyzeCareer,
} from "../utils/careerAnalysis";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const TOTAL_ROADMAP_SKILLS = 16;

function Profile() {
  const [user, setUser] =
    useState(getSavedUser());

  // ======================================
  // PROFILE EDIT STATES
  // ======================================

  const [isEditing, setIsEditing] =
    useState(false);

  const [editedName, setEditedName] =
    useState(user?.name || "");

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState("");

  // ======================================
  // PASSWORD STATES
  // ======================================

  const [
    isPasswordEditing,
    setIsPasswordEditing,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isPasswordSaving,
    setIsPasswordSaving,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  // ======================================
  // DELETE ACCOUNT STATES
  // ======================================

  const [
    isDeleteOpen,
    setIsDeleteOpen,
  ] = useState(false);

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    showDeletePassword,
    setShowDeletePassword,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  let assessment = null;
  let roadmapProgress = [];

  // ======================================
  // LOAD CAREER DATA
  // ======================================

  try {
    const savedAssessment =
      localStorage.getItem(
        "skillPathAssessment"
      );

    if (savedAssessment) {
      assessment =
        JSON.parse(
          savedAssessment
        );
    }

    const savedRoadmap =
      localStorage.getItem(
        "skillPathRoadmapProgress"
      );

    if (savedRoadmap) {
      const parsedRoadmap =
        JSON.parse(
          savedRoadmap
        );

      if (
        Array.isArray(
          parsedRoadmap
        )
      ) {
        roadmapProgress =
          parsedRoadmap;
      }
    }
  } catch (error) {
    console.error(
      "Unable to load profile data:",
      error
    );
  }

  // ======================================
  // CAREER ANALYSIS
  // ======================================

  const analysis =
    assessment
      ? analyzeCareer(
          assessment
        )
      : null;

  const recommendedCareer =
    analysis?.recommendedCareer ||
    "Assessment not completed";

  const readinessScore =
    analysis?.readinessScore || 0;

  // ======================================
  // ROADMAP PROGRESS
  // ======================================

  const careerPrefix =
    analysis?.recommendedCareer
      ? `${analysis.recommendedCareer}-`
      : "";

  const completedRoadmapItems =
    careerPrefix
      ? roadmapProgress.filter(
          (item) =>
            typeof item ===
              "string" &&
            item.startsWith(
              careerPrefix
            )
        ).length
      : 0;

  const roadmapPercentage =
    TOTAL_ROADMAP_SKILLS === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (
              completedRoadmapItems /
              TOTAL_ROADMAP_SKILLS
            ) * 100
          )
        );

  // ======================================
  // PROFILE EDIT
  // ======================================

  const handleEdit = () => {
    setEditedName(
      user?.name || ""
    );

    setProfileError("");
    setProfileSuccess("");

    setIsPasswordEditing(false);
    setPasswordError("");
    setPasswordSuccess("");

    setIsDeleteOpen(false);
    setDeleteError("");

    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedName(
      user?.name || ""
    );

    setProfileError("");
    setIsEditing(false);
  };

  // ======================================
  // SAVE PROFILE
  // ======================================

  const handleSaveProfile =
    async () => {
      if (isSaving) {
        return;
      }

      setProfileError("");
      setProfileSuccess("");

      const cleanName =
        editedName.trim();

      if (
        cleanName.length < 2
      ) {
        setProfileError(
          "Name must contain at least 2 characters."
        );

        return;
      }

      if (
        cleanName.length > 60
      ) {
        setProfileError(
          "Name cannot contain more than 60 characters."
        );

        return;
      }

      if (
        cleanName === user?.name
      ) {
        setIsEditing(false);

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        clearAuthSession();

        window.location.replace(
          "/login"
        );

        return;
      }

      setIsSaving(true);

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/auth/profile`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  name: cleanName,
                }),
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401
        ) {
          clearAuthSession();

          window.location.replace(
            "/login"
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to update profile."
          );
        }

        if (!data?.user) {
          throw new Error(
            "Updated user data is missing."
          );
        }

        localStorage.setItem(
          "skillPathUser",
          JSON.stringify(
            data.user
          )
        );

        setUser(
          data.user
        );

        setEditedName(
          data.user.name
        );

        setIsEditing(false);

        setProfileSuccess(
          "Profile updated successfully."
        );
      } catch (error) {
        console.error(
          "Profile update failed:",
          error
        );

        setProfileError(
          error.message ||
            "Unable to update profile."
        );
      } finally {
        setIsSaving(false);
      }
    };

  // ======================================
  // START PASSWORD CHANGE
  // ======================================

  const handleStartPasswordEdit =
    () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordError("");
      setPasswordSuccess("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setIsEditing(false);
      setProfileError("");
      setProfileSuccess("");

      setIsDeleteOpen(false);
      setDeleteError("");

      setIsPasswordEditing(true);

      setTimeout(() => {
        document
          .getElementById(
            "account-security"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 50);
    };

  // ======================================
  // CANCEL PASSWORD CHANGE
  // ======================================

  const handleCancelPassword =
    () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordError("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setIsPasswordEditing(false);
    };

  // ======================================
  // CHANGE PASSWORD
  // ======================================

  const handleChangePassword =
    async () => {
      if (isPasswordSaving) {
        return;
      }

      setPasswordError("");
      setPasswordSuccess("");

      if (!currentPassword) {
        setPasswordError(
          "Please enter your current password."
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        setPasswordError(
          "New password must contain at least 8 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          "New password and confirm password do not match."
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setPasswordError(
          "New password must be different from your current password."
        );

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        clearAuthSession();

        window.location.replace(
          "/login"
        );

        return;
      }

      setIsPasswordSaving(true);

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/auth/change-password`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  currentPassword,
                  newPassword,
                }),
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401 &&
          data?.message ===
            "Current password is incorrect."
        ) {
          setPasswordError(
            data.message
          );

          return;
        }

        if (
          response.status === 401
        ) {
          clearAuthSession();

          window.location.replace(
            "/login"
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to change password."
          );
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        setIsPasswordEditing(false);

        setPasswordSuccess(
          data?.message ||
            "Password changed successfully."
        );
      } catch (error) {
        console.error(
          "Password change failed:",
          error
        );

        setPasswordError(
          error.message ||
            "Unable to change password."
        );
      } finally {
        setIsPasswordSaving(false);
      }
    };

  // ======================================
  // START DELETE ACCOUNT
  // ======================================

  const handleStartDeleteAccount =
    () => {
      setDeletePassword("");
      setDeleteConfirmation("");
      setDeleteError("");

      setShowDeletePassword(false);

      setIsEditing(false);
      setIsPasswordEditing(false);

      setProfileError("");
      setProfileSuccess("");

      setPasswordError("");
      setPasswordSuccess("");

      setIsDeleteOpen(true);

      setTimeout(() => {
        document
          .getElementById(
            "danger-zone"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 50);
    };

  // ======================================
  // CANCEL DELETE ACCOUNT
  // ======================================

  const handleCancelDeleteAccount =
    () => {
      if (isDeleting) {
        return;
      }

      setDeletePassword("");
      setDeleteConfirmation("");
      setDeleteError("");

      setShowDeletePassword(false);

      setIsDeleteOpen(false);
    };

  // ======================================
  // DELETE ACCOUNT
  // ======================================

  const handleDeleteAccount =
    async () => {
      if (isDeleting) {
        return;
      }

      setDeleteError("");

      if (!deletePassword) {
        setDeleteError(
          "Please enter your current password."
        );

        return;
      }

      if (
        deleteConfirmation
          .trim()
          .toUpperCase() !==
        "DELETE"
      ) {
        setDeleteError(
          "Type DELETE to confirm permanent account deletion."
        );

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        clearAuthSession();

        window.location.replace(
          "/login"
        );

        return;
      }

      setIsDeleting(true);

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/auth/account`,
            {
              method: "DELETE",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  currentPassword:
                    deletePassword,
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

        // ======================================
        // WRONG PASSWORD
        // DO NOT LOG OUT
        // ======================================

        if (
          response.status === 401 &&
          data?.message ===
            "Current password is incorrect."
        ) {
          setDeleteError(
            data.message
          );

          return;
        }

        // ======================================
        // EXPIRED / INVALID JWT
        // ======================================

        if (
          response.status === 401
        ) {
          clearAuthSession();

          window.location.replace(
            "/login"
          );

          return;
        }

        // ======================================
        // OTHER API ERROR
        // ======================================

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to delete account."
          );
        }

        // ======================================
        // CLEAR CAREER DATA
        // ======================================

        localStorage.removeItem(
          "skillPathAssessment"
        );

        localStorage.removeItem(
          "skillPathAssessmentId"
        );

        localStorage.removeItem(
          "skillPathRoadmapProgress"
        );

        localStorage.removeItem(
          "skillPathSyncPending"
        );

        localStorage.removeItem(
          "skillPathRoadmapSyncPending"
        );

        localStorage.removeItem(
          "skillPathLocalUserId"
        );

        // ======================================
        // CLEAR AUTH SESSION
        // ======================================

        clearAuthSession();

        // ======================================
        // REDIRECT
        // ======================================

        window.location.replace(
          "/register"
        );
      } catch (error) {
        console.error(
          "Account deletion failed:",
          error
        );

        setDeleteError(
          error.message ||
            "Unable to delete account."
        );
      } finally {
        setIsDeleting(false);
      }
    };

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* ======================================
            TOP BAR
        ====================================== */}

        <div className="dashboard-topbar">

          <button
            type="button"
            className="back-button"
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
          >
            <ArrowLeft
              size={17}
            />

            Dashboard
          </button>

          <button
            type="button"
            className="dashboard-logout-button"
            onClick={
              logoutUser
            }
          >
            <LogOut
              size={16}
            />

            Log Out
          </button>

        </div>

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="dashboard-header">

          <div className="dashboard-header-icon">

            <UserRound
              size={25}
            />

          </div>

          <span className="dashboard-label">
            YOUR SKILLPATH PROFILE
          </span>

          <h1>
            Welcome,
            <strong>
              {" "}
              {user?.name ||
                "SkillPath User"}
            </strong>
          </h1>

          <p>
            Manage your account,
            security, career
            assessment and roadmap
            progress in one place.
          </p>

        </div>

        {/* ======================================
            ACCOUNT INFORMATION
        ====================================== */}

        <div className="dashboard-career-card profile-account-card">

          <div className="profile-account-content">

            <span className="dashboard-small-label">
              ACCOUNT INFORMATION
            </span>

            {!isEditing ? (
              <>
                <h2>
                  {user?.name ||
                    "SkillPath User"}
                </h2>

                <p className="profile-email">

                  <Mail
                    size={16}
                  />

                  {user?.email ||
                    "Email unavailable"}

                </p>

                <div className="profile-edit-actions">

                  <button
                    type="button"
                    className="profile-edit-button"
                    onClick={
                      handleEdit
                    }
                  >
                    <Pencil
                      size={16}
                    />

                    Edit Profile
                  </button>

                  <button
                    type="button"
                    className="profile-edit-button"
                    onClick={
                      handleStartPasswordEdit
                    }
                  >
                    <KeyRound
                      size={16}
                    />

                    Change Password
                  </button>

                </div>
              </>
            ) : (
              <div className="profile-edit-form">

                <label
                  htmlFor="profileName"
                >
                  Full Name
                </label>

                <div className="auth-input-wrapper">

                  <UserRound
                    size={18}
                  />

                  <input
                    id="profileName"
                    type="text"
                    value={
                      editedName
                    }
                    maxLength={60}
                    disabled={
                      isSaving
                    }
                    autoComplete="name"
                    onChange={(
                      event
                    ) => {
                      setEditedName(
                        event.target
                          .value
                      );

                      setProfileError(
                        ""
                      );
                    }}
                  />

                </div>

                <div className="profile-edit-actions">

                  <button
                    type="button"
                    className="profile-cancel-button"
                    disabled={
                      isSaving
                    }
                    onClick={
                      handleCancel
                    }
                  >
                    <X
                      size={16}
                    />

                    Cancel
                  </button>

                  <button
                    type="button"
                    className="profile-save-button"
                    disabled={
                      isSaving ||
                      editedName
                        .trim()
                        .length < 2
                    }
                    onClick={
                      handleSaveProfile
                    }
                  >
                    <Save
                      size={16}
                    />

                    {isSaving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </div>
            )}

            {profileError && (
              <div className="auth-message auth-error profile-message">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="auth-message auth-success profile-message">
                {profileSuccess}
              </div>
            )}

          </div>

          <div className="dashboard-career-icon">

            <Compass
              size={28}
            />

          </div>

        </div>

        {/* ======================================
            ACCOUNT SECURITY
        ====================================== */}

        <div
          id="account-security"
          className="dashboard-career-card profile-security-card"
        >

          <div className="profile-account-content">

            <span className="dashboard-small-label">
              ACCOUNT SECURITY
            </span>

            <h2>
              Password
            </h2>

            <p>
              Keep your SkillPath
              account secure by using
              a strong password.
            </p>

            {!isPasswordEditing ? (
              <button
                type="button"
                className="profile-edit-button"
                onClick={
                  handleStartPasswordEdit
                }
              >
                <KeyRound
                  size={16}
                />

                Change Password
              </button>
            ) : (
              <div className="profile-password-form">

                {/* CURRENT PASSWORD */}

                <div className="profile-password-field">

                  <label
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>

                  <div className="profile-password-input-wrapper">

                    <KeyRound
                      size={18}
                    />

                    <input
                      id="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        currentPassword
                      }
                      disabled={
                        isPasswordSaving
                      }
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      onChange={(
                        event
                      ) => {
                        setCurrentPassword(
                          event.target
                            .value
                        );

                        setPasswordError(
                          ""
                        );
                      }}
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => {
                        setShowCurrentPassword(
                          (value) =>
                            !value
                        );
                      }}
                    >
                      {showCurrentPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>

                {/* NEW PASSWORD */}

                <div className="profile-password-field">

                  <label
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>

                  <div className="profile-password-input-wrapper">

                    <KeyRound
                      size={18}
                    />

                    <input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        newPassword
                      }
                      disabled={
                        isPasswordSaving
                      }
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      onChange={(
                        event
                      ) => {
                        setNewPassword(
                          event.target
                            .value
                        );

                        setPasswordError(
                          ""
                        );
                      }}
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => {
                        setShowNewPassword(
                          (value) =>
                            !value
                        );
                      }}
                    >
                      {showNewPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="profile-password-field">

                  <label
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>

                  <div className="profile-password-input-wrapper">

                    <KeyRound
                      size={18}
                    />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      disabled={
                        isPasswordSaving
                      }
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      onChange={(
                        event
                      ) => {
                        setConfirmPassword(
                          event.target
                            .value
                        );

                        setPasswordError(
                          ""
                        );
                      }}
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => {
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        );
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>

                <div className="profile-password-hint">
                  Password must contain
                  at least 8 characters
                  and must be different
                  from your current
                  password.
                </div>

                <div className="profile-edit-actions">

                  <button
                    type="button"
                    className="profile-cancel-button"
                    disabled={
                      isPasswordSaving
                    }
                    onClick={
                      handleCancelPassword
                    }
                  >
                    <X
                      size={16}
                    />

                    Cancel
                  </button>

                  <button
                    type="button"
                    className="profile-save-button"
                    disabled={
                      isPasswordSaving ||
                      !currentPassword ||
                      newPassword.length <
                        8 ||
                      confirmPassword.length <
                        8
                    }
                    onClick={
                      handleChangePassword
                    }
                  >
                    <Save
                      size={16}
                    />

                    {isPasswordSaving
                      ? "Changing..."
                      : "Save Password"}
                  </button>

                </div>

              </div>
            )}

            {passwordError && (
              <div className="auth-message auth-error profile-message">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="auth-message auth-success profile-message">
                {passwordSuccess}
              </div>
            )}

          </div>

          <div className="dashboard-career-icon">

            <ShieldCheck
              size={28}
            />

          </div>

        </div>

        {/* ======================================
            DANGER ZONE
        ====================================== */}

        <div
          id="danger-zone"
          className="dashboard-career-card profile-danger-card"
        >

          <div className="profile-account-content">

            <span className="profile-danger-label">
              DANGER ZONE
            </span>

            <h2>
              Delete Account
            </h2>

            <p>
              Permanently delete your
              SkillPath account,
              assessments and roadmap
              progress. This action
              cannot be undone.
            </p>

            {!isDeleteOpen ? (
              <button
                type="button"
                className="profile-danger-button"
                onClick={
                  handleStartDeleteAccount
                }
              >
                <Trash2
                  size={16}
                />

                Delete Account
              </button>
            ) : (
              <div className="profile-delete-form">

                <div className="profile-delete-warning">

                  <AlertTriangle
                    size={20}
                  />

                  <div>

                    <strong>
                      This action is permanent.
                    </strong>

                    <p>
                      Your account,
                      assessments and
                      roadmap progress
                      will be permanently
                      deleted.
                    </p>

                  </div>

                </div>

                {/* CURRENT PASSWORD */}

                <div className="profile-password-field">

                  <label
                    htmlFor="deletePassword"
                  >
                    Current Password
                  </label>

                  <div className="profile-password-input-wrapper">

                    <KeyRound
                      size={18}
                    />

                    <input
                      id="deletePassword"
                      type={
                        showDeletePassword
                          ? "text"
                          : "password"
                      }
                      value={
                        deletePassword
                      }
                      disabled={
                        isDeleting
                      }
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      onChange={(
                        event
                      ) => {
                        setDeletePassword(
                          event.target
                            .value
                        );

                        setDeleteError(
                          ""
                        );
                      }}
                    />

                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => {
                        setShowDeletePassword(
                          (value) =>
                            !value
                        );
                      }}
                    >
                      {showDeletePassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>

                {/* DELETE CONFIRMATION */}

                <div className="profile-password-field">

                  <label
                    htmlFor="deleteConfirmation"
                  >
                    Type DELETE to confirm
                  </label>

                  <input
                    id="deleteConfirmation"
                    type="text"
                    className="profile-delete-confirm-input"
                    value={
                      deleteConfirmation
                    }
                    disabled={
                      isDeleting
                    }
                    autoComplete="off"
                    placeholder="DELETE"
                    onChange={(
                      event
                    ) => {
                      setDeleteConfirmation(
                        event.target
                          .value
                      );

                      setDeleteError(
                        ""
                      );
                    }}
                  />

                </div>

                {deleteError && (
                  <div className="auth-message auth-error profile-message">
                    {deleteError}
                  </div>
                )}

                <div className="profile-delete-actions">

                  <button
                    type="button"
                    className="profile-cancel-button"
                    disabled={
                      isDeleting
                    }
                    onClick={
                      handleCancelDeleteAccount
                    }
                  >
                    <X
                      size={16}
                    />

                    Cancel
                  </button>

                  <button
                    type="button"
                    className="profile-danger-button"
                    disabled={
                      isDeleting ||
                      !deletePassword ||
                      deleteConfirmation
                        .trim()
                        .toUpperCase() !==
                        "DELETE"
                    }
                    onClick={
                      handleDeleteAccount
                    }
                  >
                    <Trash2
                      size={16}
                    />

                    {isDeleting
                      ? "Deleting..."
                      : "Delete Permanently"}
                  </button>

                </div>

              </div>
            )}

          </div>

          <div className="profile-danger-icon">

            <AlertTriangle
              size={28}
            />

          </div>

        </div>

        {/* ======================================
            CAREER STATS
        ====================================== */}

        <div className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-heading">

              <div>

                <span>
                  RECOMMENDED CAREER
                </span>

                <h2>
                  {recommendedCareer}
                </h2>

              </div>

              <Target
                size={24}
              />

            </div>

            <p>
              Your career
              recommendation based
              on your latest
              SkillPath assessment.
            </p>

          </div>

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-heading">

              <div>

                <span>
                  CAREER READINESS
                </span>

                <h2>
                  {readinessScore}%
                </h2>

              </div>

              <TrendingUp
                size={24}
              />

            </div>

            <div className="dashboard-progress">

              <div
                className="dashboard-progress-fill"
                style={{
                  width:
                    `${readinessScore}%`,
                }}
              />

            </div>

            <p>
              Your current readiness
              for your recommended
              career.
            </p>

          </div>

        </div>

        {/* ======================================
            PROFILE INFORMATION
        ====================================== */}

        <div className="dashboard-info-grid">

          <div className="dashboard-info-card">

            <CheckCircle2
              size={22}
            />

            <div>

              <span>
                ASSESSMENT
              </span>

              <strong>
                {assessment
                  ? "Completed"
                  : "Not completed"}
              </strong>

            </div>

          </div>

          <div className="dashboard-info-card">

            <Map
              size={22}
            />

            <div>

              <span>
                ROADMAP PROGRESS
              </span>

              <strong>
                {roadmapPercentage}%
              </strong>

            </div>

          </div>

          <div className="dashboard-info-card">

            <LayoutDashboard
              size={22}
            />

            <div>

              <span>
                COMPLETED ITEMS
              </span>

              <strong>
                {completedRoadmapItems}
                {" / "}
                {TOTAL_ROADMAP_SKILLS}
              </strong>

            </div>

          </div>

          <div className="dashboard-info-card">

            <Target
              size={22}
            />

            <div>

              <span>
                CAREER GOAL
              </span>

              <strong>
                {assessment?.goal ||
                  "Not selected"}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;