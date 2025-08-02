import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Home as HomeIcon, User, Settings, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  Logo,
  LogoIcon,
  ThemeToggle,
} from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const links = [
    { label: 'Home', href: '#', icon: <HomeIcon className="h-5 w-5" /> },
    { label: 'Profile', href: '#profile', icon: <User className="h-5 w-5" /> },
    { label: 'Settings', href: '#settings', icon: <Settings className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/posts');
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && imageFiles.length === 0) {
      toast.error('Post must have content or images');
      return;
    }

    setPosting(true);
    try {
      const imagesBase64 = await Promise.all(
        imageFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await axios.post('/posts', {
        content: newPost,
        images: imagesBase64,
        isAnonymous: true,
      });

      setPosts([response.data.post, ...posts]);
      setNewPost('');
      setImageFiles([]);
      setPreviewImages([]);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: response.data.isLiked,
                likesCount: response.data.likesCount,
              }
            : post
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle like');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) return setSearchResults([]);

    try {
      const res = await axios.get(`/users/search?query=${value}`);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              <ThemeToggle />
              <SidebarLink
                link={{
                  label: 'Logout',
                  href: '#',
                  icon: <LogOut className="h-5 w-5" />,
                }}
                onClick={handleLogout}
              />
            </div>
          </div>
          <SidebarLink
            link={{
              label: 'Anonymous User',
              href: '#',
              icon: (
                <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              ),
            }}
          />
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Social Feed</h1>
            <Menu
              className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6">

            {/* 🔍 Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search anonymous name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-md mt-1 max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li
                      key={user.anonymousName}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        navigate(`/profile/${user.anonymousName}`);
                      }}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${user.anonymousName}&background=0A70F2&color=fff&size=32`
                        }
                        alt="avatar"
                        className="w-6 h-6 rounded-full mr-3"
                      />
                      <span>{user.anonymousName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 📝 Create Post */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? (Anonymous)"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows="3"
                maxLength={500}
              />
              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewImages.map((src, index) => (
                    <img key={index} src={src} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-3 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {newPost.length}/500 characters
                </span>
                <button
                  onClick={handleCreatePost}
                  disabled={posting || (!newPost.trim() && imageFiles.length === 0)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {posting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{posting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </div>

            {/* 📄 Posts */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No posts yet. Be the first to share something!
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handleLike}
                    onUserClick={(username) => navigate(`/profile/${username}`)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
