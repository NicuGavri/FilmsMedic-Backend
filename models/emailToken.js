const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt");

const emailTokenSchema = mongoose.Schema({
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now()
    }
})

emailTokenSchema.pre("save", async function (next) {
    if (this.isModified("token")) {
      const hashedToken = await bcrypt.hash(this.token, 10);
      this.token = hashedToken;
    }
    next();
  });

  emailTokenSchema.methods.compareToken = async function (token) {
  const result =  await bcrypt.compare(token, this.token)
  return result
  }

  module.exports = mongoose.model("EmailToken", emailTokenSchema);