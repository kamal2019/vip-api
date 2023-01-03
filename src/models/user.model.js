const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phone: {
      type: String,
      trim: true,
      length: [10, 10],
      required: [true, 'Phone number is required'],
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      trim: true,
      default: `Hello, I'm new here!`,
      maxlength: 500,
    },
    profilePic: {
      type: String,
      trim: true,
      default: '',
    },
    cover: {
      type: String,
      trim: true,
      default: '',
    },
    coins: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Coins cannot be negative');
        }
        if (value % 1 !== 0) {
          throw new Error('Coins must be an integer');
        }
      },
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      validate(value) {
        if (value < 0) {
          throw new Error('Rating cannot be negative');
        }
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if phone is taken
 * @param {string} phone  - The user's phone
 * @param { ObjectId } [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.pre('remove', async function (next) {
  await this.model('Post').deleteMany({ authorId: this._id });
  await this.model('Notification').deleteMany({ author: this._id });
  await this.model('Certificate').deleteMany({ givenTo: this._id });
  await this.model('Participation').deleteMany({ userId: this._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
