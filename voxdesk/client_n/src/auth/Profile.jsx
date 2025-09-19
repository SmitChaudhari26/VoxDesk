import React from "react";

function Profile() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.email) return <div>Not logged in</div>;
    return (
        <div>
            {user.avatar && <img src={user.avatar} alt="avatar" width={64} height={64} style={{ borderRadius: 8 }} />}
            <h3>{user.name || user.email}</h3>
            <p>{user.email}</p>
        </div>
    );
}

export default Profile;