/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const participationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },

  image: {
    type: String,
    trim: true,
    required: [true, 'Image is required'],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// add plugin that converts mongoose to json
participationSchema.plugin(toJSON);
participationSchema.plugin(paginate);

// throw error if number of participants exceeds maxParticipants
participationSchema.pre('save', function (next) {
  // get number of participants for this post
  this.model('Participation').countDocuments({ postId: this.postId }, (err, count) => {
    if (err) return next(err);
    // get max participants for this post
    // eslint-disable-next-line no-shadow
    this.model('Post').findById(this.postId, (err, post) => {
      if (err) return next(err);
      if (count > post.maxParticipants) {
        return next(new Error('No more participants allowed'));
      }
      next();
    });
  });
});
// populate user and post
participationSchema.pre('find', function (next) {
  this.populate('userId', 'id name');
  this.populate('postId', 'id title');
  next();
});

// Remove image from filesystem when certificate is removed
participationSchema.pre('remove', async function (next) {
  // Delete image from filesystem
  const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', this.image);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  next();
});

// Combianation of userId and postId should be unique
participationSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Participation = mongoose.model('Participation', participationSchema);
module.exports = Participation;
