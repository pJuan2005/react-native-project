"use client";

import { useEffect, useState } from "react";
import { Globe, KeyRound, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { useAuth, type AuthUser } from "@/components/context/AuthContext";

interface AccountSettingsPanelProps {
  user: AuthUser;
  profileTitle?: string;
  passwordTitle?: string;
}

interface ProfileFormState {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  languages: string;
  bio: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function buildProfileState(user: AuthUser): ProfileFormState {
  return {
    fullName: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    website: user.website || "",
    languages: user.languages || "",
    bio: user.bio || "",
  };
}

function buildPasswordState(): PasswordFormState {
  return {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

export function AccountSettingsPanel({
  user,
  profileTitle = "Personal Information",
  passwordTitle = "Change Password",
}: AccountSettingsPanelProps) {
  const { updateProfile, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileFormState>(
    buildProfileState(user),
  );
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(
    buildPasswordState(),
  );
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setProfileForm(buildProfileState(user));
  }, [user]);

  function handleProfileFieldChange(
    field: keyof ProfileFormState,
    value: string,
  ) {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePasswordFieldChange(
    field: keyof PasswordFormState,
    value: string,
  ) {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    const result = await updateProfile({
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      location: profileForm.location.trim(),
      website: profileForm.website.trim(),
      languages: profileForm.languages.trim(),
      bio: profileForm.bio.trim(),
    });

    if (result.success) {
      setProfileMessage(result.message || "Profile updated successfully.");
    } else {
      setProfileError(result.error || "Unable to update profile right now.");
    }

    setIsSavingProfile(false);
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsChangingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    const result = await changePassword(passwordForm);

    if (result.success) {
      setPasswordMessage(result.message || "Password updated successfully.");
      setPasswordForm(buildPasswordState());
    } else {
      setPasswordError(result.error || "Unable to update password right now.");
    }

    setIsChangingPassword(false);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="hs-card" style={{ padding: "28px" }}>
        {profileError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: "0.84rem" }}>
            {profileError}
          </div>
        )}
        {profileMessage && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: "0.84rem", fontWeight: 600 }}>
            {profileMessage}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 20, fontSize: "1rem" }}>
            {profileTitle}
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="hs-form-label">
                <User size={13} style={{ marginRight: 5, verticalAlign: "middle", color: "#2563EB" }} />
                Full Name
              </label>
              <input
                className="hs-form-control"
                value={profileForm.fullName}
                onChange={(event) =>
                  handleProfileFieldChange("fullName", event.target.value)
                }
              />
            </div>
            <div className="col-md-6">
              <label className="hs-form-label">
                <Mail size={13} style={{ marginRight: 5, verticalAlign: "middle", color: "#2563EB" }} />
                Email Address
              </label>
              <input
                className="hs-form-control"
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  handleProfileFieldChange("email", event.target.value)
                }
              />
            </div>
            <div className="col-md-6">
              <label className="hs-form-label">
                <Phone size={13} style={{ marginRight: 5, verticalAlign: "middle", color: "#2563EB" }} />
                Phone Number
              </label>
              <input
                className="hs-form-control"
                value={profileForm.phone}
                onChange={(event) =>
                  handleProfileFieldChange("phone", event.target.value)
                }
              />
            </div>
            <div className="col-md-6">
              <label className="hs-form-label">
                <MapPin size={13} style={{ marginRight: 5, verticalAlign: "middle", color: "#2563EB" }} />
                Location
              </label>
              <input
                className="hs-form-control"
                value={profileForm.location}
                onChange={(event) =>
                  handleProfileFieldChange("location", event.target.value)
                }
              />
            </div>
            <div className="col-md-6">
              <label className="hs-form-label">
                <Globe size={13} style={{ marginRight: 5, verticalAlign: "middle", color: "#2563EB" }} />
                Website
              </label>
              <input
                className="hs-form-control"
                value={profileForm.website}
                onChange={(event) =>
                  handleProfileFieldChange("website", event.target.value)
                }
              />
            </div>
            <div className="col-md-6">
              <label className="hs-form-label">Languages</label>
              <input
                className="hs-form-control"
                value={profileForm.languages}
                onChange={(event) =>
                  handleProfileFieldChange("languages", event.target.value)
                }
              />
            </div>
            <div className="col-12">
              <label className="hs-form-label">Bio</label>
              <textarea
                className="hs-form-control"
                rows={4}
                value={profileForm.bio}
                onChange={(event) =>
                  handleProfileFieldChange("bio", event.target.value)
                }
                style={{ resize: "vertical" }}
              />
              <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
                {profileForm.bio.length} characters
              </div>
            </div>
            <div className="col-12">
              <button
                type="submit"
                className="btn-primary-hs"
                disabled={isSavingProfile}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Save size={15} />
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="hs-card" style={{ padding: "28px" }}>
        {passwordError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: "0.84rem" }}>
            {passwordError}
          </div>
        )}
        {passwordMessage && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: "0.84rem", fontWeight: 600 }}>
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <h3 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 20, fontSize: "1rem" }}>
            {passwordTitle}
          </h3>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="hs-form-label">
                <KeyRound size={13} style={{ marginRight: 5, verticalAlign: "middle", color: "#2563EB" }} />
                Current Password
              </label>
              <input
                className="hs-form-control"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  handlePasswordFieldChange("currentPassword", event.target.value)
                }
                placeholder="Enter current password"
              />
            </div>
            <div className="col-md-4">
              <label className="hs-form-label">New Password</label>
              <input
                className="hs-form-control"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  handlePasswordFieldChange("newPassword", event.target.value)
                }
                placeholder="At least 6 characters"
              />
            </div>
            <div className="col-md-4">
              <label className="hs-form-label">Confirm New Password</label>
              <input
                className="hs-form-control"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  handlePasswordFieldChange("confirmPassword", event.target.value)
                }
                placeholder="Repeat new password"
              />
            </div>
            <div className="col-12">
              <button
                type="submit"
                className="btn-outline-hs"
                disabled={isChangingPassword}
                style={{ fontSize: "0.87rem" }}
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
