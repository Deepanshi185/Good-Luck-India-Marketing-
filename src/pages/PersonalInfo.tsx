import { useState } from "react";
import { User, ChevronDown, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

function PersonalInfo() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-6">
        Personal Information
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold hover:bg-gray-100"
          >
            <div className="flex items-center gap-4">
              <User size={21} />
              <span>Personal Info</span>
            </div>

            {profileOpen ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>

          {profileOpen && (
            <div className="ml-10 mt-1 space-y-1">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg ${
                    isActive
                      ? "bg-gray-100 text-[#B8860B]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                View Profile
              </NavLink>

              <NavLink
                to="/edit-profile"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg ${
                    isActive
                      ? "bg-gray-100 text-[#B8860B]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                Edit Profile
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalInfo;