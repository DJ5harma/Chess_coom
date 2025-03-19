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
				result: {
					type: String,
					enum: ["w", "b", "d"],
					required: [true, "result required"],
				},
				moveCount: {
					type: Number,
					required: [true, "move cnt required"]
				}
			},
			{ timestamps: true }
		)
	);
