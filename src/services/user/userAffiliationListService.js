import User from "../../models/userModel.js";
import Affiliation from "../../models/affiliationModel.js";
import {
  formatRoleFields,
  hasHostPermission,
} from "../../utils/affiliationRole.js";

const formatAffiliation = (affiliationDoc, userAff) => ({
  affiliationId: affiliationDoc._id,
  name: affiliationDoc.name,
  introduction: affiliationDoc.introduction || "",
  membersCount: affiliationDoc.membersCount ?? 0,
  ...formatRoleFields(userAff || { role: "leader", admin: true }),
});

export const getAuthorizedAffiliationsByStudentId = async (studentId) => {
  const user = await User.findOne({ studentId }).select("root affiliations");

  if (!user) {
    const error = new Error("해당 유저를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  if (user.root === true) {
    const affiliations = await Affiliation.find({}).sort({ name: 1 });
    return {
      root: true,
      affiliations: affiliations.map((aff) =>
        formatAffiliation(aff, { role: "leader", admin: true })
      ),
    };
  }

  const authorizedAffiliations = (user.affiliations || []).filter((aff) =>
    hasHostPermission(aff)
  );

  if (!authorizedAffiliations.length) {
    return { root: false, affiliations: [] };
  }

  const affiliationNames = authorizedAffiliations.map((aff) => aff.name);
  const affiliationDocs = await Affiliation.find({
    name: { $in: affiliationNames },
  });

  return {
    root: false,
    affiliations: authorizedAffiliations.map((userAff) => {
      const doc = affiliationDocs.find((d) => d.name === userAff.name);

      if (doc) {
        return formatAffiliation(doc, userAff);
      }

      return {
        affiliationId: userAff._id || null,
        name: userAff.name,
        introduction: "",
        membersCount: 0,
        ...formatRoleFields(userAff),
      };
    }),
  };
};
