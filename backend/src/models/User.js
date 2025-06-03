import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return this.provider === 'local';
        }
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
    type: String,
    unique: true,
    sparse: true
    },
    avatar: { 
        type: String, 
        default: "default.jpg",
        get: function(v) {
          return v ? `${process.env.BACKEND_URL}/uploads/avatar/${v}` : null;
        }
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark'},
    highlightColor: { type: String, enum: ['pink', 'purple', 'green', 'blue'], default: 'pink' }
});

// Hashear la contraseña antes de guardar el usuario
userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Validar la contraseña al iniciar sesión
userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);