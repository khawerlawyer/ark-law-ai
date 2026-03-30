import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

var GOLD = "#C9A84C";
var NAVY = "#0D1B2A";
var NAVY_MID = "#162032";
var NAVY_SURFACE = "#1E2D40";
var NAVY_BORDER = "#2B3F57";
var TEXT_PRIMARY = "#FAF6EE";
var TEXT_SECONDARY = "#B8C4D0";
var TEXT_MUTED = "#6E8099";
var ACCENT_PK = "#3EB489";

export default function Onboarding() {
  var userInfo = useUser();
  var user = userInfo.user;
  var router = useRouter();

  var nameS = useState(""); var name = nameS[0]; var setName = nameS[1];
  var locationS = useState(""); var location = locationS[0]; var setLocation = locationS[1];
  var purposeS = useState(""); var purpose = purposeS[0]; var setPurpose = purposeS[1];
  var genderS = useState(""); var gender = genderS[0]; var setGender = genderS[1];
  var ageS = useState(""); var age = ageS[0]; var setAge = ageS[1];
  var professionS = useState(""); var profession = professionS[0]; var setProfession = professionS[1];
  var loadingS = useState(false); var loading = loadingS[0]; var setLoading = loadingS[1];
  var errorS = useState(""); var error = errorS[0]; var setError = errorS[1];

  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!location.trim()) { setError("Please enter your location."); return; }
    if (!purpose.trim()) { setError("Please select your purpose of usage."); return; }
    if (!profession.trim()) { setError("Please enter your profession."); return; }

    setLoading(true);
    setError("");

    try {
      await user.update({
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        unsafeMetadata: {
          fullName: name,
          location: location,
          purpose: purpose,
          gender: gender,
          age: age,
          profession: profession,
          onboardingComplete: true,
        }
      });
      router.push("/");
    } catch(err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  var inputStyle = {
    width: "100%",
    background: NAVY_SURFACE,
    border: "1px solid " + NAVY_BORDER,
    borderRadius: 8,
    padding: "10px 14px",
    color: TEXT_PRIMARY,
    fontFamily: "inherit",
    fontSize: 13,
    outline: "none",
    marginTop: 4,
  };

  var labelStyle = {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: 500,
    display: "block",
    marginBottom: 2,
  };

  var fieldStyle = {
    marginBottom: 16,
  };

  return (
    <div style={{ minHeight: "100vh", background: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: "20px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: GOLD }}>⚖️ ARK LAW AI</div>
        <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>The Legal Intelligence Engine</div>
        <div style={{ fontSize: 11, color: ACCENT_PK, marginTop: 2 }}>by Attorney & AI Innovator Khawer Rabbani</div>
      </div>

      {/* Form Card */}
      <div style={{ background: NAVY_MID, border: "1px solid " + NAVY_BORDER, borderRadius: 16, padding: "28px 24px", maxWidth: 480, width: "100%", boxShadow: "0 0 30px rgba(201,168,76,0.1)" }}>

        <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 4, textAlign: "center" }}>Welcome! Tell us about yourself</div>
        <div style={{ fontSize: 12, color: TEXT_MUTED, textAlign: "center", marginBottom: 24 }}>Help us personalise your legal research experience</div>

        {/* Full Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Full Name <span style={{ color: "#E05555" }}>*</span></label>
          <input type="text" value={name} onChange={function(e){setName(e.target.value);}} placeholder="e.g. Ahmed Khan" style={inputStyle} />
        </div>

        {/* Location */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Location (City, Country) <span style={{ color: "#E05555" }}>*</span></label>
          <input type="text" value={location} onChange={function(e){setLocation(e.target.value);}} placeholder="e.g. Lahore, Pakistan" style={inputStyle} />
        </div>

        {/* Purpose */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Purpose of Usage <span style={{ color: "#E05555" }}>*</span></label>
          <select value={purpose} onChange={function(e){setPurpose(e.target.value);}} style={Object.assign({}, inputStyle, { cursor: "pointer" })}>
            <option value="">-- Select purpose --</option>
            <option value="Legal Research">Legal Research</option>
            <option value="Case Preparation">Case Preparation</option>
            <option value="Academic Study">Academic Study</option>
            <option value="Business & Corporate">Business & Corporate</option>
            <option value="Personal Legal Matter">Personal Legal Matter</option>
            <option value="Immigration">Immigration</option>
            <option value="General Knowledge">General Knowledge</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Profession */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Profession <span style={{ color: "#E05555" }}>*</span></label>
          <select value={profession} onChange={function(e){setProfession(e.target.value);}} style={Object.assign({}, inputStyle, { cursor: "pointer" })}>
            <option value="">-- Select profession --</option>
            <option value="Lawyer / Advocate">Lawyer / Advocate</option>
            <option value="Judge">Judge</option>
            <option value="Law Student">Law Student</option>
            <option value="Legal Researcher">Legal Researcher</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Corporate Professional">Corporate Professional</option>
            <option value="Academic / Professor">Academic / Professor</option>
            <option value="Government Official">Government Official</option>
            <option value="Journalist">Journalist</option>
            <option value="General Public">General Public</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Gender — Optional */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Gender <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>(Optional)</span></label>
          <select value={gender} onChange={function(e){setGender(e.target.value);}} style={Object.assign({}, inputStyle, { cursor: "pointer" })}>
            <option value="">-- Prefer not to say --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Age — Optional */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Age <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>(Optional)</span></label>
          <select value={age} onChange={function(e){setAge(e.target.value);}} style={Object.assign({}, inputStyle, { cursor: "pointer" })}>
            <option value="">-- Prefer not to say --</option>
            <option value="Under 18">Under 18</option>
            <option value="18-24">18–24</option>
            <option value="25-34">25–34</option>
            <option value="35-44">35–44</option>
            <option value="45-54">45–54</option>
            <option value="55-64">55–64</option>
            <option value="65+">65+</option>
          </select>
        </div>

        {/* Error */}
        {error && <div style={{ fontSize: 12, color: "#E05555", marginBottom: 14, textAlign: "center" }}>❌ {error}</div>}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? NAVY_BORDER : "linear-gradient(135deg,#C9A84C,#8A6A1F)", border: "none", borderRadius: 10, padding: "12px", color: NAVY, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
          {loading ? "Saving..." : "Complete Registration →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: TEXT_MUTED }}>
          Fields marked <span style={{ color: "#E05555" }}>*</span> are required
        </div>

      </div>
    </div>
  );
}
