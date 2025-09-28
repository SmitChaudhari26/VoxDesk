import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user") || "{}");
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Authorization": `Bearer ${token}`
        };
    };

    // Handle input changes
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError("");
        setSuccess("");
    };

    // Handle profile picture upload
    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const uploadFormData = new FormData();
            uploadFormData.append('avatar', file);

            const response = await fetch('http://localhost:5000/api/profile/avatar', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: uploadFormData
            });

            const data = await response.json();

            if (response.ok) {
                const updatedUser = { ...user, avatar: data.avatarUrl };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setSuccess("Profile picture updated successfully!");
            } else {
                setError(data.message || "Failed to upload profile picture");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Network error while uploading image");
        } finally {
            setLoading(false);
        }
    };

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        // Validate passwords if trying to change
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setError("Current password is required to set a new password");
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError("New passwords don't match");
                return;
            }
            if (formData.newPassword.length < 6) {
                setError("New password must be at least 6 characters");
                return;
            }
        }

        try {
            setLoading(true);
            setError("");

            const updateData = {
                name: formData.name,
                email: formData.email
            };

            // Only include password fields if user wants to change password
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await fetch('http://localhost:5000/api/profile/update', {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                const updatedUser = { ...user, name: data.user.name, email: data.user.email };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setSuccess("Profile updated successfully!");
                setIsEditing(false);
                setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("Network error while updating profile");
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    if (!user?.email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Not logged in</h2>
                    <button 
                        onClick={() => navigate("/login")}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">My Profile</h1>
                        <button
                            onClick={() => navigate("/desktop")}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Back to Desktop
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                            {success}
                            <button onClick={() => setSuccess("")} className="ml-2 text-green-800">✕</button>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                            <button onClick={() => setError("")} className="ml-2 text-red-800">✕</button>
                        </div>
                    )}

                    {/* Profile Picture Section */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <img
                                src={user.avatar || "https://via.placeholder.com/150/4F46E5/ffffff?text=" + (user.name?.[0] || "U")}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:bg-blue-300"
                            >
                                📷
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                        />
                        <p className="text-sm text-gray-500 mt-2">Click camera icon to change picture</p>
                    </div>

                    {/* Profile Information */}
                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                <p className="text-lg font-semibold text-gray-800">{user.name || "No name set"}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <p className="text-lg text-gray-800">{user.email}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Account Type</label>
                                <p className="text-lg text-gray-800">
                                    {user.googleId ? "Google Account" : "Local Account"}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
                                <p className="text-lg text-gray-800">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                                >
                                    ✏️ Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Edit Form */
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email"
                                />
                            </div>

                            {/* Password Change Section */}
                            {!user.googleId && (
                                <>
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password (Optional)</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter new password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:bg-green-300"
                                >
                                    {loading ? "Updating..." : "💾 Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user.name || "",
                                            email: user.email || "",
                                            currentPassword: "",
                                            newPassword: "",
                                            confirmPassword: ""
                                        });
                                        setError("");
                                        setSuccess("");
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;