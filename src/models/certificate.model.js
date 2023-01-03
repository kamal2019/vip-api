/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const certificateSchema = mongoose.Schema(
  {
    givenTo: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'User is required'],
      ref: 'User',
    },
    givenBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Giver is required'],
    },
    givenDate: {
      type: Date,
      default: Date.now,
    },
    givenFor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
    },
    image: {
      type: String,
      trim: true,
      default: 'default-cert.png',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
certificateSchema.plugin(toJSON);
certificateSchema.plugin(paginate);

// Make sure only one certificate is given to a user for a post
certificateSchema.index({ givenTo: 1, givenFor: 1 }, { unique: true });

// Make sure author is a admin
certificateSchema.pre('save', async function (next) {
  const user = await this.model('User').findById(this.givenTo);
  const post = await this.model('Post').findById(this.givenFor);

  if (!post) {
    throw new Error('Post does not exist');
  }
  if (!user) {
    throw new Error('User does not exist');
  }
  if (!user.role === 'admin') {
    throw new Error('Only admins can award certificates');
  }

  next();
});

certificateSchema.pre('find', function () {
  this.populate('givenFor', 'title');
  this.populate('givenBy', 'name profilePic');
  this.populate('givenTo', 'name profilePic');
});

certificateSchema.pre('findOne', function () {
  this.populate('givenFor', 'title');
  this.populate('givenBy', 'name profilePic');
  this.populate('givenTo', 'name profilePic');
});

// Remove image from filesystem when certificate is removed
certificateSchema.pre('remove', async function (next) {
  // Delete image from filesystem
  const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', this.image);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  next();
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
