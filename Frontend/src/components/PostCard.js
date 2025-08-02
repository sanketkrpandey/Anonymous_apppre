import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom'; // If you want to link to user profiles

const PostCard = ({ post, onLike }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [commenting, setCommenting] = useState(false);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const response = await axios.post(`/comments/post/${post._id}`, {
        content: newComment,
        isAnonymous: true
      });

      // Add the new comment to the top of the comments list
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Create comment error:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Post Header */}
      <div className="flex items-center space-x-3 mb-3">
        {/* You can make this avatar/name link to a public profile if you implement one */}
        <img
          src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.anonymousName || 'A'}&background=0A70F2&color=fff&size=40`}
          alt="Author Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-gray-900">
            {post.author?.anonymousName || 'Anonymous'}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4">{post.content}</p>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Post content ${index + 1}`}
              className="w-full h-auto object-cover rounded-md max-h-96"
            />
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center space-x-6 text-gray-500 border-t pt-3">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center space-x-2 hover:text-red-500 ${
            post.isLiked ? 'text-red-500' : ''
          }`}
        >
          <span>❤️</span>
          <span>{post.likesCount || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 hover:text-blue-500"
        >
          <span>💬</span>
          <span>{post.commentsCount || 0}</span>
        </button>
        {/* You might add report/delete buttons here for the current user's posts */}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Comments</h4>
          <form onSubmit={handleComment} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (Anonymous)"
              className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              rows="2"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={commenting || !newComment.trim()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {commenting ? 'Adding...' : 'Comment'}
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <img
                      src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.anonymousName || 'A'}&background=D1D5DB&color=374151&size=24`}
                      alt="Comment Author Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium text-sm text-gray-800">
                      {comment.author?.anonymousName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;