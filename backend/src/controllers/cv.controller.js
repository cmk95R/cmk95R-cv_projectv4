import CV from "../models/Cv.js";

// Usuario carga su CV
export const upsertMyCV = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cv = await CV.findOneAndUpdate(
      { user: userId },
      { ...req.body, user: userId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ cv });
  } catch (err) {
    next(err);
  }
};

// Admin ve todos los CVs
export const listAllCVs = async (_req, res, next) => {
  try {
    const cvs = await CV.find()
      .populate("user", "email nombre apellido rol");
    res.json({ cvs });
  } catch (err) {
    next(err);
  }
};

// Admin ve un CV
export const getCV = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id)
      .populate("user", "email nombre apellido rol");
    if (!cv) return res.status(404).json({ message: "CV no encontrado" });
    res.json({ cv });
  } catch (err) {
    next(err);
  }
};
// NUEVO: GET /cv/me
export const getMyCV = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cv = await CV.findOne({ user: userId }).populate("user", "email nombre apellido rol");
    res.json({ cv }); // si no existe, cv = null (200 OK)
  } catch (err) { next(err); }
};