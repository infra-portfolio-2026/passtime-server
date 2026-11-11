import Affiliation from "../../models/affiliationModel.js";
import User from "../../models/userModel.js";
import {
  AFFILIATION_ROLES,
  MAX_PRIVILEGED_COUNT,
  applyAffiliationRole,
  findMemberAffiliationRef,
  findUserAffiliation,
  formatRoleFields,
  hasHostPermission,
  isLeader,
  matchAffiliationId,
  normalizeRole,
  isSameAffiliation,
} from "../../utils/affiliationRole.js";
import { resolveAffiliationMemberUsers } from "../../utils/affiliationMemberSync.js";

const createError = (message, status = 400, code = "PERMISSION_ERROR") => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

const getAffiliationOrThrow = async (affiliationId) => {
  const affiliation = await Affiliation.findById(affiliationId);
  if (!affiliation) {
    throw createError("소속을 찾을 수 없습니다.", 404, "AFFILIATION_NOT_FOUND");
  }
  return affiliation;
};

const assertLeader = async (studentId, affiliationId) => {
  const user = await User.findOne({ studentId });
  if (!user) {
    throw createError("해당 유저를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
  }

  if (user.root === true) {
    return { user, affiliation: await getAffiliationOrThrow(affiliationId) };
  }

  const affiliationRef = findUserAffiliation(user, affiliationId);
  if (!affiliationRef || !isLeader(affiliationRef)) {
    throw createError("소속장만 이 작업을 수행할 수 있습니다.", 403, "FORBIDDEN");
  }

  return { user, affiliation: await getAffiliationOrThrow(affiliationId) };
};

const assertHostPermission = async (studentId, affiliationId) => {
  const user = await User.findOne({ studentId });
  if (!user) {
    throw createError("해당 유저를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
  }

  const affiliation = await getAffiliationOrThrow(affiliationId);

  if (user.root === true) {
    return { user, affiliation };
  }

  const affiliationRef = findUserAffiliation(user, affiliationId);
  if (!affiliationRef || !hasHostPermission(affiliationRef)) {
    throw createError("해당 소속에 대한 권한이 없습니다.", 403, "FORBIDDEN");
  }

  return { user, affiliation };
};

export const countPrivilegedMembers = async (affiliationId, affiliationName) => {
  const affiliation = await Affiliation.findById(affiliationId);
  if (!affiliation) return 0;

  const members = await User.find({ _id: { $in: affiliation.members } });

  return members.filter((member) => {
    const affRef = findMemberAffiliationRef(
      member,
      affiliationId,
      affiliationName || affiliation.name
    );
    return hasHostPermission(affRef);
  }).length;
};

const ensureMemberOfAffiliation = async (targetStudentId, affiliation) => {
  const targetUser = await User.findOne({ studentId: targetStudentId });
  if (!targetUser) {
    throw createError("대상 사용자를 찾을 수 없습니다.", 404, "TARGET_NOT_FOUND");
  }

  if (!affiliation.members.some((memberId) => memberId.equals(targetUser._id))) {
    throw createError("해당 소속의 멤버가 아닙니다.", 400, "NOT_AFFILIATION_MEMBER");
  }

  return targetUser;
};

const upsertMemberAffiliationRef = (user, affiliation, role) => {
  if (!Array.isArray(user.affiliations)) {
    user.affiliations = [];
  }

  let affiliationRef = user.affiliations.find(
    (aff) =>
      matchAffiliationId(aff, affiliation._id) || aff.name === affiliation.name
  );

  if (!affiliationRef) {
    affiliationRef = {
      _id: affiliation._id,
      name: affiliation.name,
    };
    user.affiliations.push(affiliationRef);
  }

  applyAffiliationRole(affiliationRef, role);
  user.markModified("affiliations");
  return affiliationRef;
};

export const detachUserFromAffiliation = async (
  user,
  { affiliationId, affiliationName }
) => {
  const removedAffiliationRef = (user.affiliations || []).find((aff) =>
    isSameAffiliation(aff, { affiliationId, affiliationName })
  );
  const hadHostPermission = hasHostPermission(removedAffiliationRef);

  user.affiliations = (user.affiliations || []).filter(
    (aff) => !isSameAffiliation(aff, { affiliationId, affiliationName })
  );
  user.markModified("affiliations");

  const affiliation = await Affiliation.findOne({
    $or: [
      ...(affiliationId ? [{ _id: affiliationId }] : []),
      ...(affiliationName ? [{ name: affiliationName }] : []),
    ],
  });

  if (affiliation) {
    affiliation.members = affiliation.members.filter(
      (memberId) => !memberId.equals(user._id)
    );
    affiliation.membersCount = affiliation.members.length;
    await affiliation.save();
  }

  return {
    hadHostPermission,
    permissionsRevoked: hadHostPermission,
  };
};

export const grantExecutivePermission = async (
  leaderStudentId,
  affiliationId,
  targetStudentId
) => {
  const { affiliation } = await assertLeader(leaderStudentId, affiliationId);

  if (leaderStudentId === targetStudentId) {
    throw createError("본인에게 임원 권한을 부여할 수 없습니다.", 400);
  }

  const targetUser = await ensureMemberOfAffiliation(targetStudentId, affiliation);
  const targetAffRef = findMemberAffiliationRef(
    targetUser,
    affiliation._id,
    affiliation.name
  );

  if (isLeader(targetAffRef)) {
    throw createError("소속장에게는 임원 권한을 부여할 수 없습니다.", 400);
  }

  if (normalizeRole(targetAffRef) === AFFILIATION_ROLES.EXECUTIVE) {
    throw createError("이미 임원 권한을 보유하고 있습니다.", 400, "ALREADY_EXECUTIVE");
  }

  const privilegedCount = await countPrivilegedMembers(
    affiliation._id,
    affiliation.name
  );

  if (privilegedCount >= MAX_PRIVILEGED_COUNT) {
    throw createError(
      `소속 권한 인원은 최대 ${MAX_PRIVILEGED_COUNT}명까지 가능합니다.`,
      400,
      "MAX_PRIVILEGED_REACHED"
    );
  }

  upsertMemberAffiliationRef(targetUser, affiliation, AFFILIATION_ROLES.EXECUTIVE);
  await targetUser.save();

  return {
    affiliationId: affiliation._id,
    affiliationName: affiliation.name,
    targetStudentId,
    ...formatRoleFields(
      findMemberAffiliationRef(targetUser, affiliation._id, affiliation.name)
    ),
    privilegedCount: privilegedCount + 1,
    maxPrivilegedCount: MAX_PRIVILEGED_COUNT,
  };
};

export const revokeExecutivePermission = async (
  leaderStudentId,
  affiliationId,
  targetStudentId
) => {
  const { affiliation } = await assertLeader(leaderStudentId, affiliationId);

  if (leaderStudentId === targetStudentId) {
    throw createError("소속장 권한은 회수 API로 제거할 수 없습니다. 위임 API를 사용하세요.", 400);
  }

  const targetUser = await ensureMemberOfAffiliation(targetStudentId, affiliation);
  const targetAffRef = findMemberAffiliationRef(
    targetUser,
    affiliation._id,
    affiliation.name
  );

  if (normalizeRole(targetAffRef) !== AFFILIATION_ROLES.EXECUTIVE) {
    throw createError("임원 권한을 보유한 사용자가 아닙니다.", 400, "NOT_EXECUTIVE");
  }

  applyAffiliationRole(targetAffRef, AFFILIATION_ROLES.MEMBER);
  targetUser.markModified("affiliations");
  await targetUser.save();

  const privilegedCount = await countPrivilegedMembers(
    affiliation._id,
    affiliation.name
  );

  return {
    affiliationId: affiliation._id,
    affiliationName: affiliation.name,
    targetStudentId,
    ...formatRoleFields(targetAffRef),
    privilegedCount,
    maxPrivilegedCount: MAX_PRIVILEGED_COUNT,
  };
};

const demoteCurrentLeaders = async (affiliation, exceptUserId = null) => {
  const members = await User.find({ _id: { $in: affiliation.members } });
  const savePromises = [];

  for (const member of members) {
    if (exceptUserId && member._id.equals(exceptUserId)) continue;

    const affRef = findMemberAffiliationRef(
      member,
      affiliation._id,
      affiliation.name
    );

    if (!isLeader(affRef)) continue;

    applyAffiliationRole(affRef, AFFILIATION_ROLES.MEMBER);
    member.markModified("affiliations");
    savePromises.push(member.save());
  }

  await Promise.all(savePromises);
};

const ensureRootMemberOfAffiliation = async (rootUser, affiliation) => {
  if (!affiliation.members.some((memberId) => memberId.equals(rootUser._id))) {
    affiliation.members.push(rootUser._id);
    affiliation.membersCount = affiliation.members.length;
    await affiliation.save();
  }

  upsertMemberAffiliationRef(rootUser, affiliation, AFFILIATION_ROLES.MEMBER);
  rootUser.markModified("affiliations");
  await rootUser.save();

  return rootUser;
};

export const delegateLeadership = async (
  leaderStudentId,
  affiliationId,
  targetStudentId
) => {
  const { user: actorUser, affiliation } = await assertLeader(
    leaderStudentId,
    affiliationId
  );

  const isRootClaimingSelf =
    actorUser.root === true && leaderStudentId === targetStudentId;

  if (leaderStudentId === targetStudentId && !isRootClaimingSelf) {
    throw createError("본인에게 위임할 수 없습니다.", 400);
  }

  let targetUser;
  if (isRootClaimingSelf) {
    targetUser = await ensureRootMemberOfAffiliation(actorUser, affiliation);
  } else {
    targetUser = await ensureMemberOfAffiliation(targetStudentId, affiliation);
  }

  const targetAffRef = findMemberAffiliationRef(
    targetUser,
    affiliation._id,
    affiliation.name
  );

  if (isLeader(targetAffRef)) {
    throw createError("이미 소속장입니다.", 400, "ALREADY_LEADER");
  }

  let previousLeaderStudentId = leaderStudentId;

  if (actorUser.root === true) {
    const currentLeaders = await User.find({ _id: { $in: affiliation.members } });
    const currentLeader = currentLeaders.find((member) => {
      const affRef = findMemberAffiliationRef(
        member,
        affiliation._id,
        affiliation.name
      );
      return isLeader(affRef);
    });
    if (currentLeader) {
      previousLeaderStudentId = currentLeader.studentId;
    }

    await demoteCurrentLeaders(affiliation, targetUser._id);
  } else {
    const leaderAffRef = findMemberAffiliationRef(
      actorUser,
      affiliation._id,
      affiliation.name
    );
    applyAffiliationRole(leaderAffRef, AFFILIATION_ROLES.MEMBER);
    actorUser.markModified("affiliations");
    await actorUser.save();
  }

  applyAffiliationRole(targetAffRef, AFFILIATION_ROLES.LEADER);
  targetUser.markModified("affiliations");
  await targetUser.save();

  return {
    affiliationId: affiliation._id,
    affiliationName: affiliation.name,
    previousLeaderStudentId,
    newLeaderStudentId: targetStudentId,
    privilegedCount: await countPrivilegedMembers(affiliation._id, affiliation.name),
    maxPrivilegedCount: MAX_PRIVILEGED_COUNT,
  };
};

export const getAffiliationMembersWithRoles = async (studentId, affiliationId) => {
  const { user: viewerUser, affiliation } = await assertHostPermission(
    studentId,
    affiliationId
  );

  const members = await resolveAffiliationMemberUsers(affiliation, { sync: true });
  const viewerIsRoot = viewerUser.root === true;

  const memberList = members.map((member) => {
    const affRef = findMemberAffiliationRef(member, affiliation._id, affiliation.name);
    const roleFields = formatRoleFields(affRef);
    const memberIsRoot = member.root === true;

    return {
      userId: member._id,
      name: member.name,
      studentId: member.studentId,
      major: member.major || "",
      ...roleFields,
      isRoot: memberIsRoot,
    };
  });

  const privilegedCount = memberList.filter((member) => member.admin).length;

  const viewerInList = memberList.some(
    (member) => member.studentId === viewerUser.studentId
  );

  if (viewerIsRoot && !viewerInList) {
    const viewerAffRef = findMemberAffiliationRef(
      viewerUser,
      affiliation._id,
      affiliation.name
    );

    memberList.push({
      userId: viewerUser._id,
      name: viewerUser.name,
      studentId: viewerUser.studentId,
      major: viewerUser.major || "",
      ...formatRoleFields(viewerAffRef),
      isRoot: true,
    });
  }

  return {
    affiliationId: affiliation._id,
    affiliationName: affiliation.name,
    membersCount: memberList.length,
    privilegedCount,
    maxPrivilegedCount: MAX_PRIVILEGED_COUNT,
    viewerIsRoot,
    members: memberList.sort((a, b) => {
      const roleOrder = { leader: 0, executive: 2, member: 3 };
      const orderA = (roleOrder[a.role] ?? 4) - (a.isRoot ? 1 : 0);
      const orderB = (roleOrder[b.role] ?? 4) - (b.isRoot ? 1 : 0);
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    }),
  };
};

export const removeAffiliationMember = async (
  actorStudentId,
  affiliationId,
  targetStudentId
) => {
  const { affiliation } = await assertLeader(actorStudentId, affiliationId);

  if (actorStudentId === targetStudentId) {
    throw createError(
      "본인을 소속에서 삭제하려면 소속 설정에서 탈퇴해 주세요.",
      400
    );
  }

  const targetUser = await ensureMemberOfAffiliation(targetStudentId, affiliation);
  const detachResult = await detachUserFromAffiliation(targetUser, {
    affiliationId: affiliation._id,
    affiliationName: affiliation.name,
  });

  await targetUser.save();

  return {
    affiliationId: affiliation._id,
    affiliationName: affiliation.name,
    targetStudentId,
    ...detachResult,
    role: AFFILIATION_ROLES.MEMBER,
    roleLabel: "일반",
    admin: false,
  };
};
