import { Link } from 'react-router-dom';
import { MdNote } from 'react-icons/md';
import { MdTab } from 'react-icons/md';
import { MdLaunch } from 'react-icons/md';
import { MdCheckBox } from 'react-icons/md';
import { MdWbSunny } from 'react-icons/md';
import { MdAccessTime } from 'react-icons/md';

export default function Sidebar() {
    return (
        <nav style={{
            width: "220px",
            background: "#1e293b",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem 0",
            boxShadow: "2px 0 8px rgba(30,41,59,0.08)"
        }}>
            <h2 style={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                marginBottom: "3rem",
                letterSpacing: "1px"
            }}>
                VoxDesk
            </h2>
            <Link to="/notes" style={linkStyle}><MdNote size={24} />Notes</Link>
            <Link to="/tabs" style={linkStyle}><MdTab size={24} />Tabs</Link>
            <Link to="/quicklaunch" style={linkStyle}><MdLaunch size={24} />Quick Launch</Link>
            <Link to="/todo" style={linkStyle}><MdCheckBox size={24} />To-Do</Link>
            <Link to="/weather" style={linkStyle}><MdWbSunny size={24} />Weather</Link>
            <Link to="/clock" style={linkStyle}><MdAccessTime size={24} />Clock</Link>
        </nav>
    );
}

const linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#fff",
    textDecoration: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    background: "#334155",
    transition: "background 0.2s"
};