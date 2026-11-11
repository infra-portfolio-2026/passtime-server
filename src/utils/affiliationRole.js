export const AFFILIATION_ROLES = {
  LEADER: "leader",
  EXECUTIVE: "executive",
  MEMBER: "member",
};

export const MAX_PRIVILEGED_COUNT = 3;

export const ROLE_LABELS = {
  leader: "소속장",
  executive: "임원",
  member: "일반",
};

export const normalizeRole = (affiliationRef) => {
  if (!affiliationRef) return AFFILIATION_ROLES.MEMBER;

  if (
    affiliationRef.role === AFFILIATION_ROLES.LEADER ||
    affiliationRef.role === AFFILIATION_ROLES.EXECUTIVE ||
    affiliationRef.role === AFFILIATION_ROLES.MEMBER
  ) {
    return affiliationRef.role;
  }

  if (affiliationRef.admin === true) {
    return AFFILIATION_ROLES.LEADER;
  }

  return AFFILIATION_ROLES.MEMBER;
};

export const hasHostPermission = (affiliationRef) => {
  const role = normalizeRole(affiliationRef);
  return (
    role === AFFILIATION_ROLES.LEADER || role === AFFILIATION_ROLES.EXECUTIVE
  );
};

export const isLeader = (affiliationRef) =>
  normalizeRole(affiliationRef) === AFFILIATION_ROLES.LEADER;

export const getAffiliationRefId = (affiliationRef) => {
  if (!affiliationRef) return "";
  return String(affiliationRef._id || affiliationRef.id || "");
};

export const matchAffiliationId = (affiliationRef, affiliationId) =>
  getAffiliationRefId(affiliationRef) === String(affiliationId);

export const findUserAffiliation = (user, affiliationId) =>
  (user?.affiliations || []).find((aff) => matchAffiliationId(aff, affiliationId));

export const findUserAffiliationByName = (user, affiliationName) =>
  (user?.affiliations || []).find((aff) => aff.name === affiliationName);

export const findMemberAffiliationRef = (member, affiliationId, affiliationName) =>
  (member?.affiliations || []).find(
    (aff) =>
      matchAffiliationId(aff, affiliationId) ||
      (affiliationName && aff.name === affiliationName)
  );

export const applyAffiliationRole = (affiliationRef, role) => {
  affiliationRef.role = role;
  affiliationRef.admin = hasHostPermission({ role });
};

export const formatRoleFields = (affiliationRef) => {
  const role = normalizeRole(affiliationRef);
  return {
    role,
    roleLabel: ROLE_LABELS[role],
    admin: hasHostPermission(affiliationRef),
  };
};

export const isSameAffiliation = (affiliationRef, { affiliationId, affiliationName }) =>
  (affiliationId && matchAffiliationId(affiliationRef, affiliationId)) ||
  (affiliationName && affiliationRef?.name === affiliationName);
