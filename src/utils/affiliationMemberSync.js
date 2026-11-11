import mongoose from "mongoose";
import User from "../models/userModel.js";
import { findMemberAffiliationRef } from "./affiliationRole.js";

/**
 * Affiliation.members 와 user.affiliations 를 합쳐 실제 소속 멤버 목록을 반환합니다.
 * sync=true 이면 누락된 사용자를 Affiliation.members 에 반영합니다.
 */
export const resolveAffiliationMemberUsers = async (
  affiliation,
  { sync = false } = {}
) => {
  const memberMap = new Map();

  if (Array.isArray(affiliation.members) && affiliation.members.length > 0) {
    const docMembers = await User.find({
      _id: { $in: affiliation.members },
    }).select("name studentId major affiliations");

    for (const member of docMembers) {
      memberMap.set(String(member._id), member);
    }
  }

  const refMembers = await User.find({
    $or: [
      { "affiliations._id": affiliation._id },
      { "affiliations.name": affiliation.name },
    ],
  }).select("name studentId major affiliations");

  for (const member of refMembers) {
    const affRef = findMemberAffiliationRef(
      member,
      affiliation._id,
      affiliation.name
    );
    if (affRef) {
      memberMap.set(String(member._id), member);
    }
  }

  if (sync) {
    const mergedIds = [...memberMap.keys()].map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const currentIdSet = new Set(
      (affiliation.members || []).map((memberId) => String(memberId))
    );
    const needsSync = mergedIds.some(
      (memberId) => !currentIdSet.has(String(memberId))
    );

    if (needsSync) {
      affiliation.members = mergedIds;
      affiliation.membersCount = mergedIds.length;
      await affiliation.save();
    }
  }

  return [...memberMap.values()];
};
