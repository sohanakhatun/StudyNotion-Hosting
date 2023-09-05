const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// CREATE a new section
exports.createSection = async (req, res) => {
  try {
    // data fetch
    const { sectionName, courseId } = req.body;

    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }
    // create section
    const newSection = await Section.create({ sectionName });
    // update course with section ObjectID
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    // return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, sectionId, courseId } = req.body;
    //   validation
    if (!sectionName || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }
    //   update  section in  db
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    // update course in db
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
  
    res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    // fetch data
    const { sectionId, courseId } = req.body;
    //   delete section from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    //   select section from db
    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    //   validation
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }
    
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } });
    //    Now,Delete the section itself.
    await Section.findByIdAndDelete(sectionId);

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
