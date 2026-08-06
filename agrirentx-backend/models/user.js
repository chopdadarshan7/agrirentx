const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    is_farmer: {
      type: Boolean,
      default: true,
    },

    is_rentaler: {
      type: Boolean,
      default: false,
    },

    rentaler_status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    kyc_documents: {
      id_proof: {
        type: String,
        default: "",
      },

      address_proof: {
        type: String,
        default: "",
      },
    },

    bank_details: {
      account_holder: String,
      account_number: String,
      ifsc_code: String,
      bank_name: String,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
    },

    isDeleted: {
      type: Boolean,
    default: false,
},

deletedAt: {
    type: Date,
    default: null,

},
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }  
);

// Virtual field for role
userSchema.virtual("role").get(function () {
  if (this.isAdmin) return "admin";
  if (this.is_rentaler) return "rentaler";
  return "farmer";
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });


// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



module.exports = mongoose.model("User", userSchema);