import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  price: { type: Number, required: true },
  seats: { type: Number, required: true },
  bookedSeats: { type: Number, default: 0 },
  tickets: [
    {
      seatNumber: Number,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: function (v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: props => `${props.value} is not a valid ObjectId!`
        }
      },
      qrCode: String
    }
  ],
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
