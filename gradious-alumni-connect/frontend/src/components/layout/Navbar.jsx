import {Link, useLocation} from "react-router-dom";

function Sidebar({role}) {
    const location = useLocation();

    const menuItems =
        role === "admin"
            ? [
                  {name: "Dashboard", path: "/admin/dashboard"},
                  {name: "Users", path: "/admin/users"},
                  {name: "Alumni Requests", path: "/admin/requests"},
                  {name: "Reports", path: "/admin/reports"},
              ]
            : [
                  {name: "Dashboard", path: "/user/dashboard"},
                  {name: "Profile", path: "/user/profile"},
                  {name: "Connections", path: "/user/connections"},
                  {name: "Messages", path: "/user/messages"},
              ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white p-5">
            <h2 className="text-2xl font-bold mb-8">Alumni Portal</h2>

            {menuItems.map((item, index) => (
                <Link
                    key={index}
                    to={item.path}
                    className={`block p-3 rounded mb-2 transition ${
                        location.pathname === item.path ? "bg-blue-600" : "hover:bg-gray-700"
                    }`}
                >
                    {item.name}
                </Link>
            ))}
        </div>
    );
}

export default Sidebar;
