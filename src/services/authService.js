import { univAuthDelegator } from "@coffee-tree/univ-auth-delegator";

class AuthService {
  async login(userId, password) {
    if (!userId || !password) {
      throw new Error("User ID and Password are required");
    }

    try {
      const loginRequestDto = univAuthDelegator().createLoginRequestDto(
        userId,
        password
      );

      const userProfile = await univAuthDelegator().getUserProfile(
        loginRequestDto
      );

      if (!userProfile) {
        throw new Error("Failed to retrieve user profile");
      }

      return userProfile;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getSsotoken(userId, password) {
    if (!userId || !password) {
      throw new Error("User ID and Password are required");
    }

    try {
      const loginRequestDto = univAuthDelegator().createLoginRequestDto(
        userId,
        password
      );

      const ssotoken = await univAuthDelegator().getAuthenticatedSsotoken(
        loginRequestDto
      );

      if (!ssotoken) {
        throw new Error("Failed to retrieve SSO token");
      }

      return ssotoken;
    } catch (error) {
      throw new Error(`SSO token retrieval failed: ${error.message}`);
    }
  }
}

export default new AuthService();
