/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Title is required'],
    },
    content: {
      type: String,
      trim: true,
      required: [true, 'Content is required'],
    },
    authorId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Author is required'],
      ref: 'User',
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    venue: {
      type: String,
      trim: true,
      required: [true, 'Venue is required'],
    },

    image: {
      type: String,
      trim: true,
      default: 'default-post.png',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Max participants is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
postSchema.plugin(toJSON);
postSchema.plugin(paginate);

// Make sure author is a admin
postSchema.pre('save', async function (next) {
  const user = await this.model('User').findById(this.authorId);
  if (!user.role === 'admin') {
    throw new Error('Only admins can create posts');
  }
  next();
});

// Create a notification after a post is created
postSchema.post('save', async function (doc, next) {
  await this.model('Notification').create({
    type: 'post',
    author: doc.authorId,
    post: doc._id,
  });
  next();
});

postSchema.methods.like = async function (userId) {
  const post = this;
  if (post.likes.includes(userId)) {
    throw new Error('User already liked this post');
  }
  post.likes.push(userId);
  post.countLikes();
  return post.save();
};

postSchema.methods.unlike = async function (userId) {
  const post = this;
  if (!post.likes.includes(userId)) {
    throw new Error('User has not liked this post');
  }
  post.likes.pop(userId);
  post.countLikes();
  return post.save();
};

postSchema.pre('find', function (next) {
  this.populate('author', 'name profilePic');
  next();
});

postSchema.post('find', async function (posts) {
  // increase view count for all posts that are found
  await Promise.all(
    posts.map(async (post) => {
      await post.updateOne({ $inc: { views: 1 } });
    })
  );
});

postSchema.post('findOne', async function (post) {
  // increase view count for this post
  if (post) {
    await post.updateOne({ $inc: { views: 1 } });
  }
});

// Count likes
postSchema.methods.countLikes = function () {
  this.likesCount = this.likes.length;
};

postSchema.pre('remove', async function (next) {
  // Delete image from filesystem
  const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', this.image);
  if (fs.existsSync(filePath) && this.image !== 'default-post.png') {
    fs.unlinkSync(filePath);
  }

  await this.model('Certificate').deleteMany({ givenFor: this._id });
  await this.model('Notification').deleteMany({ post: this._id });
  await this.model('Participation').deleteMany({ postId: this._id });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
