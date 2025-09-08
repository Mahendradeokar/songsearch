import { Schema, model, Types } from "mongoose";

const PlaylistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    spotifyTrackIds: [
      {
        type: String,
      },
    ],
    sharedToken: {
      token: {
        type: String,
        required: false,
        default: null,
      },
      createdAt: {
        type: Date,
        required: false,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

export const PlaylistModel = model("Playlist", PlaylistSchema);
