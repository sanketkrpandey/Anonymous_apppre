import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { anonymousName } = useParams(); // Optional param to view other users
  const { user, login } = useAuth();

  const isViewingOwnProfile = !anonymousName || anonymousName === user?.anonymousName;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newAnonymousName, setNewAnonymousName] = useState('');
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = isViewingOwnProfile
          ? '/users/profile'
          : `/users/name/${anonymousName}`;
        const res = await axios.get(url);
        setProfileData(res.data.user);
        setNewAnonymousName(res.data.user.anonymousName);
        setAvatarPreview(res.data.user.avatar);
        if (!isViewingOwnProfile) {
          setIsFollowing(res.data.user.isFollowing); // Provided by backend
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [anonymousName, user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setNewAvatarFile(null);
      setAvatarPreview(profileData?.avatar || null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    let avatarBase64 = profileData.avatar;

    if (newAvatarFile) {
      const reader = new FileReader();
      const promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(newAvatarFile);
      });
      avatarBase64 = await promise;
    } else if (avatarPreview === null) {
      avatarBase64 = null;
    }

    try {
      const res = await axios.put('/users/profile', {
        anonymousName: newAnonymousName,
        avatar: avatarBase64,
      });

      setProfileData((prev) => ({ ...prev, ...res.data.user }));
      login({ ...user, ...res.data.user }, localStorage.getItem('token'));
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const toggleFollow = async () => {
    try {
      await axios.post(`/users/${profileData._id}/follow`);
      setIsFollowing((prev) => !prev);
      toast.success(isFollowing ? 'Unfollowed' : 'Followed');
    } catch (err) {
      toast.error('Failed to toggle follow');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;
  if (!profileData) return <div className="text-center text-gray-600">Profile not found.</div>;

  const avatarSrc =
    avatarPreview ||
    `https://ui-avatars.com/api/?name=${profileData.anonymousName}&background=0A70F2&color=fff&size=96`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        {isViewingOwnProfile ? 'Your Profile' : `${profileData.anonymousName}'s Profile`}
      </h2>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {!isEditing ? (
          <>
            <div className="flex flex-col items-center space-y-4 mb-4">
              <img
                src={avatarSrc}
                alt="User Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900">{profileData.anonymousName}</h3>
                <p className="text-gray-600">{profileData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mt-6">
              <div>
                <p className="text-xl font-bold">{profileData.postCount}</p>
                <p className="text-gray-600">Posts</p>
              </div>
              <div>
                <p className="text-xl font-bold">{profileData.followerCount}</p>
                <p className="text-gray-600">Followers</p>
              </div>
              <div>
                <p className="text-xl font-bold">{profileData.followingCount}</p>
                <p className="text-gray-600">Following</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              {isViewingOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={toggleFollow}
                  className={`px-6 py-2 rounded-md text-white ${
                    isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex flex-col items-center">
              <img
                src={avatarSrc}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 mb-4"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500"
              />
              <button
                type="button"
                onClick={() => {
                  setNewAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="mt-2 text-sm text-red-500 hover:underline"
              >
                Remove Avatar
              </button>
            </div>
            <div>
              <label htmlFor="editAnonymousName" className="block text-sm font-medium text-gray-700 mb-1">
                Anonymous Name
              </label>
              <input
                type="text"
                id="editAnonymousName"
                value={newAnonymousName}
                onChange={(e) => setNewAnonymousName(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Max 20 characters</p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
