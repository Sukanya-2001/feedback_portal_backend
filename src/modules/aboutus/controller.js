import aboutRepository from "./repositories.js";

export const aboutCreqate = async (req, res) => {
  try {
    if (!req.body.title.trim()) {
      return res.status(400).json({
        message: "Title is required.",
      });
    } else if (!req.body.description.trim()) {
      return res.status(400).json({
        message: "Description is required.",
      });
    } else {
      const newAbout = {
        title: req.body.title.trim(),
        description: req.body.description.trim(),
      };

      let data = await aboutRepository.create(newAbout);
      if (data || data._id) {
        return res.status(200).json({
          message: "Data saved successfully",
          data,
        });
      } else {
        return res.status(500).json({
          message: "Internal Server error",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
