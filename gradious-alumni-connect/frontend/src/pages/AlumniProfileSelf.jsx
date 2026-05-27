
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../services/api";

function AlumniProfileSelf() {
    const navigate = useNavigate();
const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    linkedin_url: "",
    address: "", // ✅ ADD
    bio: "", // ✅ ADD
});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("user"));

        if (!storedUser || storedUser.role !== "alumni") {
            navigate("/login");
            return;
        }

        fetchProfile(storedUser.id);
    }, []);

    const fetchProfile = async (id) => {
        try {
            const res = await API.get(`/users/profile/${id}`);

            setProfile(res.data.user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

   const handleSubmit = async (e) => {
       e.preventDefault();

       try {
           const storedUser = JSON.parse(sessionStorage.getItem("user"));

         const res = await API.put("/users/update-profile", {
             id: storedUser.id,
             name: profile.name,
             company: profile.company,
             position: profile.position,
             linkedin_url: profile.linkedin_url,
             address: profile.address, // ✅ ADD
             bio: profile.bio, // ✅ ADD
         });
sessionStorage.setItem("user", JSON.stringify(res.data.user));
           alert("Profile updated successfully");
           window.location.href = "/alumni/dashboard";
           sessionStorage.setItem("user", JSON.stringify(res.data.user));
           setProfile(res.data.user || profile);
       } catch (error) {
           console.error(error);

           alert(error.response?.data?.message || "Update failed");
       }
   };
    if (loading) {
        return <div className="flex justify-center items-center h-60">Loading profile...</div>;
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* PROFILE CARD */}

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg p-10 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-white text-indigo-600 flex items-center justify-center text-3xl font-bold mb-6">
                    {profile.name?.charAt(0)}
                </div>

                <h2 className="text-2xl font-semibold">{profile.name}</h2>

                <p className="opacity-90">{profile.email}</p>

                {profile.position && <p className="mt-4 text-sm">{profile.position}</p>}

                {profile.company && <p className="text-sm opacity-90">{profile.company}</p>}
                {profile.address && <p className="text-sm opacity-90 mt-2">📍 {profile.address}</p>}

                {profile.bio && <p className="text-sm opacity-80 mt-2">{profile.bio}</p>}
            </div>

            {/* EDIT FORM */}

            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <input
                        name="email"
                        value={profile.email}
                        disabled
                        className="w-full border rounded-lg px-4 py-2 bg-gray-100"
                    />

                    <input
                        name="company"
                        value={profile.company || ""}
                        onChange={handleChange}
                        placeholder="Company"
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <input
                        name="position"
                        value={profile.position || ""}
                        onChange={handleChange}
                        placeholder="Position"
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <input
                        name="linkedin_url"
                        value={profile.linkedin_url || ""}
                        onChange={handleChange}
                        placeholder="LinkedIn URL"
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    <input
                        name="address"
                        value={profile.address || ""}
                        onChange={handleChange}
                        placeholder="Address"
                        className="w-full border rounded-lg px-4 py-2"
                    />

                    <textarea
                        name="bio"
                        value={profile.bio || ""}
                        onChange={handleChange}
                        placeholder="Bio"
                        className="w-full border rounded-lg px-4 py-2"
                        rows="3"
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AlumniProfileSelf;