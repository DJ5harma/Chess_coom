import mongoose, { Schema } from "mongoose";

export const USER =
	mongoose.models.USER ||
	mongoose.model(
		"USER",
		new Schema(
			{
				username: {
					type: String,
					required: [true, "Username required"],
				},
				hashedPassword: {
					type: String,
					required: [true, "<hashedPassword> didn't reach"],
				},
			},
			{ timestamps: true }
		)
	);
