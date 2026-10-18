import api from "../../api/client";
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Loading from "../loading/Loading";
import PasswordInput from "../signupin/PasswordInput";
import { useAuth } from "../../context/AuthContext";

const toForm = (data) => ({
  name: data.name || "",
  pnum: data.pnum || "",
  address: data.address || "",
  city: data.city || "",
  pincode: data.pincode || "",
});

function Notice({ notice }) {
  if (!notice) return null;
  return (
    <p className={notice.type === "error" ? "field-error" : "text-sm text-green-700"} role={notice.type === "error" ? "alert" : "status"}>
      {notice.text}
    </p>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(toForm({}));
  const [saving, setSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    api
      .get("/profile")
      .then((response) => {
        setProfile(response.data);
        setForm(toForm(response.data));
      })
      .catch(() => setProfileNotice({ type: "error", text: "Could not load your profile, please try again." }));
  }, []);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileNotice(null);
    setSaving(true);
    try {
      const response = await api.patch("/profile", form);
      setProfile(response.data);
      setForm(toForm(response.data));
      setProfileNotice({ type: "success", text: "Your details have been saved." });
    } catch (err) {
      setProfileNotice({ type: "error", text: err.response?.data?.error || "Could not save your details." });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordNotice(null);
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordNotice({ type: "error", text: "New passwords do not match." });
      return;
    }
    setChanging(true);
    try {
      await api.patch("/profile/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setPasswordNotice({ type: "success", text: "Your password has been changed." });
    } catch (err) {
      setPasswordNotice({ type: "error", text: err.response?.data?.error || "Could not change your password." });
    } finally {
      setChanging(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!profile && !profileNotice) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }

  return (
    <div className="page my-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My Account</p>
          <h1 className="page-title mt-1">{profile?.name ? `Hello, ${profile.name.split(" ")[0]}` : "Your account"}</h1>
          {profile && <p className="muted mt-1">{profile.email}</p>}
        </div>
        <div className="flex gap-3">
          <Link to="/orders" className="btn btn-secondary">My Orders</Link>
          <button className="btn btn-secondary" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form className="card flex flex-col gap-6 p-6" onSubmit={saveProfile} noValidate>
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Personal details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="label">Full name</label>
                <input id="profile-name" name="name" className="input" autoComplete="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="profile-phone" className="label">Phone number</label>
                <input id="profile-phone" name="pnum" type="tel" inputMode="numeric" className="input" autoComplete="tel" value={form.pnum} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="profile-email" className="label">Email</label>
                <input id="profile-email" className="input bg-gray-50 text-gray-500" value={profile?.email || ""} disabled />
                <p className="mt-1 text-xs text-gray-500">Your email is used to log in and cannot be changed.</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-gray-200 pt-6">
            <div>
              <h2 className="text-lg font-semibold">Default delivery address</h2>
              <p className="muted text-sm">Filled in for you at checkout.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="profile-address" className="label">Address</label>
                <input id="profile-address" name="address" className="input" autoComplete="street-address" placeholder="House no, street, area" value={form.address} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="profile-city" className="label">City</label>
                <input id="profile-city" name="city" className="input" autoComplete="address-level2" value={form.city} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="profile-pincode" className="label">Pincode</label>
                <input id="profile-pincode" name="pincode" inputMode="numeric" className="input" autoComplete="postal-code" value={form.pincode} onChange={handleChange} />
              </div>
            </div>
          </section>

          <Notice notice={profileNotice} />
          <div>
            <button type="submit" className="btn btn-primary" disabled={saving || !profile}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <form className="card flex h-fit flex-col gap-4 p-6" onSubmit={changePassword} noValidate>
          <h2 className="text-lg font-semibold">Change password</h2>
          <PasswordInput
            id="current-password"
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
          />
          <PasswordInput
            id="new-password"
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
          />
          <PasswordInput
            id="confirm-new-password"
            name="confirm"
            label="Confirm new password"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
          />
          <Notice notice={passwordNotice} />
          <button type="submit" className="btn btn-dark" disabled={changing}>
            {changing ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
