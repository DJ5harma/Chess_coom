import mongoose, { Schema } from "mongoose";

export const GAME =
	mongoose.models.GAME ||
	mongoose.model(
		"GAME",
		new Schema(
			{
				pgn: {
					type: String,
					required: [true, "pgn required"],
				},
				white: { type: Schema.Types.ObjectId, ref: "USER" },
				black: { type: Schema.Types.ObjectId, ref: "USER" },
				white_won: { type: Boolean, required: [true, "white_won required"] },
			},
			{ timestamps: true }
		)
	);
