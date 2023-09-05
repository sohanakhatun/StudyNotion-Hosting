const mongoose = require("mongoose");

// course-section-model.
const sectionSchema = new mongoose.Schema({
	sectionName: {
		type: String,
	},
	subSection: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "SubSection",
		},
	],
});


module.exports = mongoose.model("Section", sectionSchema);
