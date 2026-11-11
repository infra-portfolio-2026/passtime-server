import Affiliation from "../../models/affiliationModel.js";
import {
  findMemberAffiliationRef,
  formatRoleFields,
  hasHostPermission,
  isLeader,
} from "../../utils/affiliationRole.js";

export const getAllAffiliations = async () => {
  try {
    const affiliations = await Affiliation.find({})
      .populate("members", "name studentId major affiliations")
      .sort({ createdAt: -1 });

    const affiliationsWithAdmins = affiliations.map((aff) => {
      const privilegedMembers = aff.members.filter((member) => {
        const affData = findMemberAffiliationRef(member, aff._id, aff.name);
        return hasHostPermission(affData);
      });

      const leaders = aff.members.filter((member) => {
        const affData = findMemberAffiliationRef(member, aff._id, aff.name);
        return isLeader(affData);
      });

      const members = aff.members.map((member) => {
        const affData = findMemberAffiliationRef(member, aff._id, aff.name);
        return {
          _id: member._id,
          name: member.name,
          studentId: member.studentId,
          major: member.major || "",
          ...formatRoleFields(affData),
        };
      });

      return {
        _id: aff._id,
        name: aff.name,
        introduction: aff.introduction || "",
        membersCount: aff.membersCount,
        members,
        admins: privilegedMembers,
        leaders,
        privilegedCount: privilegedMembers.length,
        createdAt: aff.createdAt,
        updatedAt: aff.updatedAt,
      };
    });

    return {
      status: 200,
      code: "SUCCESS-0001",
      message: "소속 리스트 조회 성공",
      result: affiliationsWithAdmins,
    };
  } catch (error) {
    console.error("❌ 소속 리스트 조회 중 오류:", error);
    return {
      status: 500,
      code: "ERROR-0001",
      message: "서버 오류로 소속 리스트 조회 실패",
      result: [],
    };
  }
};
