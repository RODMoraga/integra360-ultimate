import { userRepository } from "./user.repository";

/**
 * Business layer for user-related read operations.
 */
class UserService {
  /**
   * Returns the users list scoped to a company.
   */
  listUsers(companyId: bigint) {
    return userRepository.list(companyId);
  }
}

export const userService = new UserService();